import * as Tone from 'tone';
import { AudioManager } from './AudioManager';
import { N } from './noteFrequencies';

function quickSynth(freq: number, type: OscillatorType, dur: string, vol: number, delay: number = 0) {
  if (AudioManager.muted || !AudioManager.initialized) return;
  const synth = new Tone.Synth({
    oscillator: { type },
    envelope: { attack: 0.005, decay: parseFloat(dur) || 0.1, sustain: 0, release: 0.03 },
    volume: Tone.gainToDb(vol),
  }).connect(AudioManager.sfxBus);
  const now = Tone.now() + delay;
  synth.triggerAttackRelease(freq, dur, now);
  // Auto-dispose
  setTimeout(() => synth.dispose(), (delay + 1) * 1000);
}

export const SfxPlayer = {
  nutCollect() {
    quickSynth(N.E5, 'square', '0.1', 0.15);
    quickSynth(N.G5, 'square', '0.12', 0.15, 0.06);
  },

  magicCollect() {
    const notes = [N.C5, N.E5, N.G5, N.C6, N.E6];
    notes.forEach((f, i) => {
      quickSynth(f, 'square', '0.15', 0.12, i * 0.06);
      quickSynth(f * 2, 'triangle', '0.12', 0.06, i * 0.06);
    });
  },

  treacleCollect() {
    const notes = [N.G4, N.E4, N.C4, N.A3];
    notes.forEach((f, i) => quickSynth(f, 'triangle', '0.18', 0.12, i * 0.08));
    // Low glorp
    if (!AudioManager.initialized) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.05 },
      volume: -20,
    }).connect(AudioManager.sfxBus);
    synth.triggerAttackRelease(80, '0.4');
    synth.frequency.rampTo(45, 0.4);
    setTimeout(() => synth.dispose(), 1500);
  },

  lanternDeploy() {
    if (!AudioManager.initialized) return;
    // Rising zap
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.02 },
      volume: -18,
    }).connect(AudioManager.sfxBus);
    synth.triggerAttackRelease(200, '0.2');
    synth.frequency.rampTo(1800, 0.18);
    setTimeout(() => synth.dispose(), 1000);
    // Sparkle tail
    quickSynth(N.E6, 'square', '0.08', 0.06, 0.15);
    quickSynth(N.G6, 'square', '0.08', 0.06, 0.2);
    quickSynth(N.C7, 'square', '0.1', 0.06, 0.25);
  },

  foxBeamHit() {
    if (!AudioManager.initialized) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.02 },
      volume: -18,
    }).connect(AudioManager.sfxBus);
    synth.triggerAttackRelease(1200, '0.18');
    synth.frequency.rampTo(150, 0.15);
    setTimeout(() => synth.dispose(), 1000);
    // Noise
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
      volume: -22,
    });
    const filt = new Tone.Filter({ frequency: 3000, type: 'highpass' });
    noise.connect(filt);
    filt.connect(AudioManager.sfxBus);
    noise.triggerAttackRelease('0.05');
    setTimeout(() => { noise.dispose(); filt.dispose(); }, 500);
  },

  lanternPickup() {
    [N.D5, N.F5, N.A5, N.D6].forEach((f, i) =>
      quickSynth(f, 'square', '0.12', 0.1, i * 0.07)
    );
  },

  hurt() {
    [N.A3, N.G3, N.F3].forEach((f, i) =>
      quickSynth(f, 'square', '0.15', 0.15, i * 0.08)
    );
    if (!AudioManager.initialized) return;
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 },
      volume: -18,
    }).connect(AudioManager.sfxBus);
    noise.triggerAttackRelease('0.1');
    setTimeout(() => noise.dispose(), 500);
  },

  levelUp() {
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => {
      quickSynth(f, 'square', '0.18', 0.12, i * 0.08);
      quickSynth(f * 2, 'triangle', '0.15', 0.06, i * 0.08);
    });
  },

  gameOver() {
    [N.G4, N.E4, N.C4, N.G3].forEach((f, i) =>
      quickSynth(f, 'square', '0.25', 0.15, i * 0.12)
    );
    quickSynth(N.C3, 'square', '1.2', 0.1, 0.5);
  },

  combo(level: number) {
    const freq = N.C6 * Math.pow(2, Math.min(level, 5) / 12);
    quickSynth(freq, 'square', '0.06', 0.08);
    quickSynth(freq * 1.5, 'triangle', '0.05', 0.04, 0.03);
  },
};
