// Generate note frequencies for C1-B7
const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SEMITONES = [0, 2, 4, 5, 7, 9, 11];

export const N: Record<string, number> = {};

NOTE_NAMES.forEach((name, i) => {
  const semitone = SEMITONES[i];
  for (let octave = 1; octave <= 7; octave++) {
    N[name + octave] = 440 * Math.pow(2, (semitone - 9) / 12 + (octave - 4));
  }
});

// Melody patterns - 32 steps each
export const MELODY_NORMAL = [
  N.C5, 0, N.E5, N.G5, N.A5, N.G5, N.E5, 0,
  N.F5, 0, N.A5, N.C6, N.B5, N.A5, N.G5, 0,
  N.E5, 0, N.G5, N.C6, N.D6, N.C6, N.B5, N.A5,
  N.G5, N.F5, N.E5, N.D5, N.E5, 0, N.C5, 0,
];

export const MELODY_MAGIC = [
  N.C6, N.E6, N.G6, N.E6, N.C6, N.G5, N.E6, N.G6,
  N.A5, N.C6, N.E6, N.A5, N.G6, N.E6, N.C6, N.E6,
  N.F6, N.A5, N.C6, N.A5, N.G5, N.E6, N.D6, N.E6,
  N.G6, N.E6, N.C6, N.G5, N.D6, N.C6, N.E6, N.C6,
];

export const MELODY_TREACLE = [
  N.C3, 0, 0, 0, N.E3, 0, 0, 0,
  N.G3, 0, 0, 0, N.F3, 0, 0, 0,
  N.E3, 0, 0, 0, N.D3, 0, 0, 0,
  N.C3, 0, 0, 0, 0, 0, 0, 0,
];

// Bass - 16 steps
export const BASS_LINE = [
  N.C2, 0, N.C3, 0, N.G2, 0, N.G3, 0,
  N.F2, 0, N.F3, 0, N.G2, 0, N.G3, 0,
];

// Percussion - 16 steps ('K'=kick, 'S'=snare, 'H'=hihat, 0=rest)
export const PERC_PATTERN: (string | 0)[] = [
  'K', 'H', 0, 'H', 'S', 'H', 0, 'H',
  'K', 'H', 'K', 'H', 'S', 'H', 0, 'H',
];

// Pad chords (I-V-IV-V in C), each lasts 2 steps
export const PAD_CHORDS = [
  [N.C3, N.E3, N.G3],
  [N.C3, N.E3, N.G3],
  [N.G2, N.B2, N.D3],
  [N.G2, N.B2, N.D3],
  [N.F2, N.A2, N.C3],
  [N.F2, N.A2, N.C3],
  [N.G2, N.B2, N.D3],
  [N.G2, N.B2, N.D3],
];
