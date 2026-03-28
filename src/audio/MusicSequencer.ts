import * as Tone from 'tone';
import { AudioManager } from './AudioManager';
import { BPM } from '@/config';
import {
  MELODY_NORMAL, MELODY_MAGIC, MELODY_TREACLE,
  BASS_LINE, TREACLE_BASS_LINE, PERC_PATTERN,
  PAD_CHORDS, TREACLE_PAD_CHORDS,
} from './noteFrequencies';

export type MusicMode = 'normal' | 'magic' | 'treacle';

class MusicSequencerSingleton {
  private melodySynth!: Tone.Synth;
  private melodyVibrato!: Tone.Vibrato;
  private bassSynth!: Tone.Synth;
  private padSynths: Tone.Synth[] = [];
  private kickSynth!: Tone.MembraneSynth;
  private snareSynth!: Tone.NoiseSynth;
  private hihatSynth!: Tone.NoiseSynth;
  private snareBody!: Tone.Synth;
  private loop!: Tone.Loop;
  private step = 0;
  private _mode: MusicMode = 'normal';
  private _started = false;

  get mode() { return this._mode; }

  init() {
    if (this._started) return;

    Tone.getTransport().bpm.value = BPM;

    // Melody — fat square with vibrato (SNES-era thick lead)
    this.melodyVibrato = new Tone.Vibrato({ frequency: 5.5, depth: 0.06 }).connect(AudioManager.musicBus);
    this.melodySynth = new Tone.Synth({
      oscillator: { type: 'fatsquare', count: 3, spread: 15 } as any,
      envelope: { attack: 0.008, decay: 0.15, sustain: 0.04, release: 0.12 },
      volume: -17,
    }).connect(this.melodyVibrato);

    // Bass — warm filtered sawtooth
    const bassFilter = new Tone.Filter({ frequency: 900, type: 'lowpass', Q: 1.5 });
    bassFilter.connect(AudioManager.musicBus);
    this.bassSynth = new Tone.Synth({
      oscillator: { type: 'fatsawtooth', count: 2, spread: 15 } as any,
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.12, release: 0.2 },
      volume: -14,
    }).connect(bassFilter);

    // Pad voices — detuned sawtooth through chorus
    const padChorus = new Tone.Chorus({ frequency: 1.2, delayTime: 2.5, depth: 0.35 }).connect(AudioManager.musicBus);
    padChorus.start();
    for (let i = 0; i < 3; i++) {
      const synth = new Tone.Synth({
        oscillator: { type: 'fatsawtooth', count: 2, spread: 25 } as any,
        envelope: { attack: 0.35, decay: 0.7, sustain: 0.55, release: 1.4 },
        volume: -29,
      });
      const filter = new Tone.Filter({ frequency: 550, type: 'lowpass', Q: 0.7 });
      synth.connect(filter);
      filter.connect(padChorus);
      this.padSynths.push(synth);
    }

    // Kick — punchy with sub rumble
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.12,
      octaves: 5,
      envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1 },
      volume: -8,
    }).connect(AudioManager.musicBus);

    // Snare — noise filtered to mid band
    this.snareSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 },
      volume: -14,
    });
    const snareFilter = new Tone.Filter({ frequency: 600, type: 'bandpass', Q: 0.8 });
    this.snareSynth.connect(snareFilter);
    snareFilter.connect(AudioManager.musicBus);

    // Snare body (tonal crack)
    this.snareBody = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
      volume: -22,
    }).connect(AudioManager.musicBus);

    // Hihat — crisp and high-passed
    this.hihatSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.025, sustain: 0, release: 0.008 },
      volume: -24,
    });
    const hihatFilter = new Tone.Filter({ frequency: 9000, type: 'highpass' });
    this.hihatSynth.connect(hihatFilter);
    hihatFilter.connect(AudioManager.musicBus);

    // Step loop (8th notes)
    this.loop = new Tone.Loop((time) => {
      this.tick(time);
    }, '8n');
  }

  private tick(time: number) {
    if (AudioManager.muted) return;

    const melodies = {
      normal: MELODY_NORMAL,
      magic: MELODY_MAGIC,
      treacle: MELODY_TREACLE,
    };

    // Melody
    const melArr = melodies[this._mode];
    const melNote = melArr[this.step % melArr.length];
    if (melNote) {
      this.melodySynth.oscillator.type = (this._mode === 'treacle' ? 'fattriangle' : 'fatsquare') as any;
      let freq = melNote;
      if (this._mode === 'magic') freq *= Math.pow(2, 5 / 1200);
      this.melodySynth.triggerAttackRelease(freq, '16n', time);
    }

    // Bass
    const bassArr = this._mode === 'treacle' ? TREACLE_BASS_LINE : BASS_LINE;
    const bassNote = bassArr[this.step % bassArr.length];
    if (bassNote) {
      this.bassSynth.triggerAttackRelease(bassNote, '16n', time);
    }

    // Percussion
    const perc = PERC_PATTERN[this.step % PERC_PATTERN.length];
    if (perc === 'K') {
      this.kickSynth.triggerAttackRelease('C1', '8n', time);
    } else if (perc === 'S') {
      this.snareSynth.triggerAttackRelease('16n', time);
      this.snareBody.triggerAttackRelease(180, '32n', time);
    } else if (perc === 'H') {
      this.hihatSynth.triggerAttackRelease('32n', time);
    }

    // Pad chord changes (every 2 steps)
    const padChords = this._mode === 'treacle' ? TREACLE_PAD_CHORDS : PAD_CHORDS;
    const chordIdx = Math.floor((this.step % 16) / 2);
    const chord = padChords[chordIdx];
    if (this.step % 2 === 0) {
      for (let i = 0; i < 3; i++) {
        this.padSynths[i].triggerAttackRelease(chord[i], '4n', time);
      }
    }

    this.step++;
  }

  setMode(mode: MusicMode) {
    this._mode = mode;
    const targetBpm = mode === 'treacle' ? 100 : BPM;
    Tone.getTransport().bpm.rampTo(targetBpm, 1.2);
    if (this.melodyVibrato) {
      this.melodyVibrato.depth.rampTo(
        mode === 'treacle' ? 0.02 : mode === 'magic' ? 0.14 : 0.06, 0.5,
      );
    }
  }

  async start() {
    await AudioManager.init();
    if (!this._started) {
      this.init();
      this._started = true;
    }
    this.step = 0;
    Tone.getTransport().bpm.value = BPM;
    this.loop.start(0);
    Tone.getTransport().start();
  }

  stop() {
    this.loop.stop();
    Tone.getTransport().stop();
  }

  dispose() {
    this.stop();
    this._started = false;
  }
}

export const MusicSequencer = new MusicSequencerSingleton();
