import * as Tone from 'tone';
import { AudioManager } from './AudioManager';

class AmbientSoundsSingleton {
  private wind: Tone.Noise | null = null;
  private insects: Tone.Noise | null = null;
  private birdLoop: number | null = null;
  private rustleLoop: number | null = null;
  private _started = false;

  start() {
    if (this._started || !AudioManager.initialized) return;
    this._started = true;

    // Wind ambience — layered low-pass filtered noise with slow LFO
    this.wind = new Tone.Noise('pink');
    const windFilter = new Tone.Filter({ frequency: 380, type: 'lowpass', Q: 0.6 });
    const windFilter2 = new Tone.Filter({ frequency: 800, type: 'lowpass', Q: 0.4 });
    const windLfo = new Tone.LFO({ frequency: 0.08, min: 200, max: 600 });
    const windLfo2 = new Tone.LFO({ frequency: 0.13, min: 0.008, max: 0.022 });
    const windGain = new Tone.Gain(0.015);

    windLfo.connect(windFilter.frequency);
    windLfo2.connect(windGain.gain);
    this.wind.connect(windFilter);
    windFilter.connect(windFilter2);
    windFilter2.connect(windGain);
    windGain.toDestination();
    this.wind.start();
    windLfo.start();
    windLfo2.start();

    // High insect drone — very quiet continuous texture
    this.insects = new Tone.Noise('white');
    const insectFilter = new Tone.Filter({ frequency: 5500, type: 'bandpass', Q: 2.5 });
    const insectLfo = new Tone.LFO({ frequency: 0.35, min: 4800, max: 6200 });
    const insectGain = new Tone.Gain(0.004);
    insectLfo.connect(insectFilter.frequency);
    this.insects.connect(insectFilter);
    insectFilter.connect(insectGain);
    insectGain.toDestination();
    this.insects.start();
    insectLfo.start();

    this.scheduleBird();
    this.scheduleRustle();
  }

  private scheduleBird() {
    const delay = 2500 + Math.random() * 6000;
    this.birdLoop = window.setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBird();
    }, delay);
  }

  private scheduleRustle() {
    const delay = 4000 + Math.random() * 8000;
    this.rustleLoop = window.setTimeout(() => {
      this.playLeafRustle();
      this.scheduleRustle();
    }, delay);
  }

  private playBirdChirp() {
    if (AudioManager.muted || !AudioManager.initialized) return;

    const type = Math.random();
    if (type < 0.5) {
      // Short trill
      const base = 2400 + Math.random() * 1600;
      const count = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const s = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.008, decay: 0.07, sustain: 0, release: 0.02 },
          volume: -33,
        }).toDestination();
        const t = Tone.now() + i * 0.06;
        const f = base + (Math.random() > 0.5 ? 300 : -200);
        s.triggerAttackRelease(f, '0.07', t);
        setTimeout(() => s.dispose(), 500 + i * 60);
      }
    } else if (type < 0.8) {
      // Ascending two-tone call
      const base = 2800 + Math.random() * 1200;
      const s1 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.04 },
        volume: -31,
      }).toDestination();
      s1.triggerAttackRelease(base, '0.1');
      s1.frequency.rampTo(base + 450, 0.08);
      setTimeout(() => s1.dispose(), 600);

      const s2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.10, sustain: 0, release: 0.03 },
        volume: -33,
      }).toDestination();
      const t2 = Tone.now() + 0.18;
      s2.triggerAttackRelease(base + 600, '0.09', t2);
      s2.frequency.rampTo(base + 300, 0.07);
      setTimeout(() => s2.dispose(), 800);
    } else {
      // Warble — longer undulating note
      const base = 1800 + Math.random() * 800;
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.015, decay: 0.35, sustain: 0.2, release: 0.1 },
        volume: -36,
      }).toDestination();
      const lfo = new Tone.LFO({ frequency: 8, min: base - 80, max: base + 80 });
      lfo.connect(synth.frequency);
      synth.triggerAttackRelease(base, '0.4');
      lfo.start();
      setTimeout(() => { synth.dispose(); lfo.dispose(); }, 1000);
    }
  }

  private playLeafRustle() {
    if (AudioManager.muted || !AudioManager.initialized) return;
    const noise = new Tone.Noise('white');
    const filt = new Tone.Filter({ frequency: 3500, type: 'lowpass', Q: 1.2 });
    const gain = new Tone.Gain(0);
    const amp = new Tone.AmplitudeEnvelope({ attack: 0.08, decay: 0.35, sustain: 0, release: 0.2 });
    noise.connect(filt);
    filt.connect(amp);
    amp.connect(gain);
    gain.gain.value = 0.03;
    gain.toDestination();
    noise.start();
    amp.triggerAttackRelease('0.4');
    setTimeout(() => { noise.dispose(); filt.dispose(); amp.dispose(); gain.dispose(); }, 1200);
  }

  stop() {
    if (this.wind) { this.wind.stop(); this.wind.dispose(); this.wind = null; }
    if (this.insects) { this.insects.stop(); this.insects.dispose(); this.insects = null; }
    if (this.birdLoop) { clearTimeout(this.birdLoop); this.birdLoop = null; }
    if (this.rustleLoop) { clearTimeout(this.rustleLoop); this.rustleLoop = null; }
    this._started = false;
  }
}

export const AmbientSounds = new AmbientSoundsSingleton();
