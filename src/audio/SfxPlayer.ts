import * as Tone from 'tone';
import { AudioManager } from './AudioManager';
import { N } from './noteFrequencies';

function quickSynth(freq: number, type: OscillatorType, dur: string, vol: number, delay: number = 0) {
  if (AudioManager.muted || !AudioManager.initialized) return;
  const synth = new Tone.Synth({
    oscillator: { type },
    envelope: { attack: 0.005, decay: parseFloat(dur) || 0.1, sustain: 0, release: 0.05 },
    volume: Tone.gainToDb(vol),
  }).connect(AudioManager.sfxBus);
  const now = Tone.now() + delay;
  synth.triggerAttackRelease(freq, dur, now);
  setTimeout(() => synth.dispose(), (delay + 1.2) * 1000);
}

function fatSynth(freq: number, dur: string, vol: number, delay: number = 0) {
  if (AudioManager.muted || !AudioManager.initialized) return;
  const synth = new Tone.Synth({
    oscillator: { type: 'fatsquare', count: 3, spread: 20 } as any,
    envelope: { attack: 0.008, decay: parseFloat(dur) || 0.12, sustain: 0.04, release: 0.08 },
    volume: Tone.gainToDb(vol),
  }).connect(AudioManager.sfxBus);
  const now = Tone.now() + delay;
  synth.triggerAttackRelease(freq, dur, now);
  setTimeout(() => synth.dispose(), (delay + 1.2) * 1000);
}

export const SfxPlayer = {
  nutCollect() {
    fatSynth(N.E5, '0.08', 0.16);
    fatSynth(N.G5, '0.10', 0.16, 0.05);
    quickSynth(N.C6, 'triangle', '0.12', 0.09, 0.10);
  },

  magicCollect() {
    const notes = [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6];
    notes.forEach((f, i) => {
      fatSynth(f, '0.12', 0.11, i * 0.05);
      quickSynth(f * 2, 'triangle', '0.10', 0.05, i * 0.05 + 0.02);
    });
  },

  treacleCollect() {
    const notes = [N.G4, N.E4, N.C4, N.A3];
    notes.forEach((f, i) => quickSynth(f, 'triangle', '0.22', 0.13, i * 0.09));
    if (!AudioManager.initialized) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.06 },
      volume: -18,
    }).connect(AudioManager.sfxBus);
    synth.triggerAttackRelease(100, '0.5');
    synth.frequency.rampTo(50, 0.45);
    setTimeout(() => synth.dispose(), 1800);
  },

  lanternDeploy() {
    if (!AudioManager.initialized) return;
    // Rising power-up zap
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.22, sustain: 0, release: 0.04 },
      volume: -16,
    }).connect(AudioManager.sfxBus);
    synth.triggerAttackRelease(180, '0.25');
    synth.frequency.rampTo(2800, 0.22);
    setTimeout(() => synth.dispose(), 1200);
    // Harmonic layer
    const synth2 = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.03 },
      volume: -22,
    }).connect(AudioManager.sfxBus);
    const t2 = Tone.now() + 0.02;
    synth2.triggerAttackRelease(360, '0.20', t2);
    synth2.frequency.rampTo(5600, 0.18);
    setTimeout(() => synth2.dispose(), 1200);
    // Sparkle cascade
    [N.E6, N.G6, N.C7, N.E7].forEach((f, i) =>
      quickSynth(f, 'triangle', '0.08', 0.07, 0.2 + i * 0.06),
    );
  },

  foxBeamHit() {
    if (!AudioManager.initialized) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.03 },
      volume: -16,
    }).connect(AudioManager.sfxBus);
    synth.triggerAttackRelease(1400, '0.2');
    synth.frequency.rampTo(130, 0.18);
    setTimeout(() => synth.dispose(), 1200);
    // Impact noise burst
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
      volume: -20,
    });
    const filt = new Tone.Filter({ frequency: 4000, type: 'bandpass', Q: 0.6 });
    noise.connect(filt);
    filt.connect(AudioManager.sfxBus);
    noise.triggerAttackRelease('0.06');
    setTimeout(() => { noise.dispose(); filt.dispose(); }, 600);
    // Harmonic zap
    quickSynth(N.A5, 'square', '0.06', 0.06, 0.02);
    quickSynth(N.D5, 'triangle', '0.08', 0.05, 0.05);
  },

  lanternPickup() {
    [N.D5, N.F5, N.A5, N.D6, N.F6].forEach((f, i) =>
      fatSynth(f, '0.12', 0.11, i * 0.07),
    );
    quickSynth(N.A6, 'triangle', '0.1', 0.06, 0.3);
  },

  firstAidPickup() {
    // Warm, reassuring ascending phrase
    [N.G4, N.C5, N.E5, N.G5, N.C6].forEach((f, i) =>
      fatSynth(f, '0.15', 0.12, i * 0.07),
    );
    quickSynth(N.E6, 'sine', '0.2', 0.07, 0.36);
  },

  hurt() {
    [N.A3, N.G3, N.F3, N.D3].forEach((f, i) =>
      fatSynth(f, '0.18', 0.18, i * 0.07),
    );
    if (!AudioManager.initialized) return;
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.03 },
      volume: -17,
    }).connect(AudioManager.sfxBus);
    noise.triggerAttackRelease('0.1');
    setTimeout(() => noise.dispose(), 600);
  },

  levelUp() {
    // Chord stab
    [N.C5, N.E5, N.G5].forEach(f => fatSynth(f, '0.3', 0.12));
    // Ascending fanfare arp
    [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6, N.C7].forEach((f, i) =>
      fatSynth(f, '0.16', 0.10, 0.05 + i * 0.07),
    );
    // Harmony arp offset
    [N.E5, N.G5, N.C6, N.E6, N.G6, N.C7, N.E7].forEach((f, i) =>
      quickSynth(f, 'triangle', '0.12', 0.06, 0.08 + i * 0.07),
    );
  },

  gameOver() {
    [N.G4, N.F4, N.E4, N.D4, N.C4, N.B3, N.A3, N.G3].forEach((f, i) =>
      fatSynth(f, '0.22', 0.14, i * 0.1),
    );
    if (!AudioManager.initialized) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 1.6, sustain: 0, release: 0.1 },
      volume: -16,
    }).connect(AudioManager.sfxBus);
    const t = Tone.now() + 0.85;
    synth.triggerAttackRelease(N.C3, '1.5', t);
    synth.frequency.rampTo(N.G2, 1.4);
    setTimeout(() => synth.dispose(), 3000);
  },

  combo(level: number) {
    const freq = N.C6 * Math.pow(2, Math.min(level, 5) / 12);
    fatSynth(freq, '0.06', 0.09);
    quickSynth(freq * 1.5, 'triangle', '0.05', 0.05, 0.03);
    if (level >= 3) quickSynth(freq * 2, 'sine', '0.08', 0.04, 0.06);
  },
};
