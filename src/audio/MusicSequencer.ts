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

    // Melody voice
    this.melodySynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.05 },
      volume: -18,
    }).connect(AudioManager.musicBus);

    // Bass voice
    this.bassSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
      volume: -17,
    }).connect(AudioManager.musicBus);

    // Pad voices (3 oscillators for chord)
    for (let i = 0; i < 3; i++) {
      const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.6, release: 0.8 },
        volume: -30,
      });
      const filter = new Tone.Filter({ frequency: 600, type: 'lowpass', Q: 0.5 });
      synth.connect(filter);
      filter.connect(AudioManager.musicBus);
      this.padSynths.push(synth);
    }

    // Kick
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
      volume: -9,
    }).connect(AudioManager.musicBus);

    // Snare (noise)
    this.snareSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
      volume: -15,
    });
    const snareFilter = new Tone.Filter({ frequency: 400, type: 'highpass' });
    this.snareSynth.connect(snareFilter);
    snareFilter.connect(AudioManager.musicBus);

    // Snare body
    this.snareBody = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
      volume: -24,
    }).connect(AudioManager.musicBus);

    // Hihat
    this.hihatSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 },
      volume: -23,
    });
    const hihatFilter = new Tone.Filter({ frequency: 7000, type: 'highpass' });
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
      this.melodySynth.oscillator.type = this._mode === 'treacle' ? 'triangle' : 'square';
      let freq = melNote;
      if (this._mode === 'magic') freq *= Math.pow(2, 5 / 1200); // +5 cents detune
      this.melodySynth.triggerAttackRelease(freq, '16n', time);
    }

    // Bass (treacle uses its own bass line following chord roots)
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

    // Pad chord changes (every 2 steps) - treacle uses I-vi-IV-V
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
    // Ramp BPM: treacle slows everything down to feel thick and sticky
    const targetBpm = mode === 'treacle' ? 100 : BPM;
    Tone.getTransport().bpm.rampTo(targetBpm, 1.2);
  }

  start() {
    if (!this._started) {
      this.init();
      this._started = true;
    }
    this.step = 0;
    Tone.getTransport().bpm.value = BPM; // reset before any ramps
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
