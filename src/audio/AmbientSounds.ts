import * as Tone from 'tone';
import { AudioManager } from './AudioManager';

class AmbientSoundsSingleton {
  private wind: Tone.Noise | null = null;
  private birdLoop: number | null = null;
  private _started = false;

  start() {
    if (this._started || !AudioManager.initialized) return;
    this._started = true;

    // Wind ambience
    this.wind = new Tone.Noise('white');
    const windFilter = new Tone.Filter({
      frequency: 350,
      type: 'lowpass',
      Q: 0.8,
    });
    const windLfo = new Tone.LFO({
      frequency: 0.12,
      min: 200,
      max: 550,
    });
    windLfo.connect(windFilter.frequency);
    const windGain = new Tone.Gain(0.018);

    this.wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.toDestination();

    this.wind.start();
    windLfo.start();

    // Bird chirps on random interval
    this.scheduleBird();
  }

  private scheduleBird() {
    const delay = 3000 + Math.random() * 5000; // 3-8 seconds
    this.birdLoop = window.setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBird();
    }, delay);
  }

  private playBirdChirp() {
    if (AudioManager.muted || !AudioManager.initialized) return;

    const baseFreq = 2200 + Math.random() * 1800;

    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.02 },
      volume: -32,
    }).toDestination();

    synth.triggerAttackRelease(baseFreq, '0.1');
    synth.frequency.rampTo(baseFreq + (Math.random() > 0.5 ? 400 : -300), 0.06);

    setTimeout(() => synth.dispose(), 500);

    // Optional second chirp
    if (Math.random() > 0.5) {
      const f2 = baseFreq + 300 + Math.random() * 500;
      const synth2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.08, sustain: 0, release: 0.02 },
        volume: -34,
      }).toDestination();
      setTimeout(() => {
        synth2.triggerAttackRelease(f2, '0.08');
        synth2.frequency.rampTo(f2 - 200, 0.06);
        setTimeout(() => synth2.dispose(), 500);
      }, 120);
    }
  }

  stop() {
    if (this.wind) { this.wind.stop(); this.wind.dispose(); this.wind = null; }
    if (this.birdLoop) { clearTimeout(this.birdLoop); this.birdLoop = null; }
    this._started = false;
  }
}

export const AmbientSounds = new AmbientSoundsSingleton();
