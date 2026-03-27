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

// "Lights On Curtains Closed" by Colin — concert pitch from MusicXML Alto Sax part
// (written A major, transposed down 9 semitones to concert C major)
// m1: C5 B4 — A4 G4 | m2: A4 B4 — C5 B4 | m3: — D5 D5 D5 G4 — | m4: ascending fill
export const MELODY_TREACLE = [
  // Bar 1 (Cmaj7 - Em7): descending from C
  N.C5, 0,    N.B4, 0,    0,    0,    N.A4, N.G4,
  // Bar 2 (Am7 - Fmaj7): climbing back
  N.A4, N.B4, 0,    0,    N.C5, 0,    N.B4, 0,
  // Bar 3 (Dm7 - G7): D motif dropping to G
  0,    0,    N.D5, N.D5, N.D5, N.G4, 0,    0,
  // Bar 4 (Cmaj7 - G7sus4): ascending fill back to top
  0,    0,   0, 0, 0, 0, 0,    0,
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

// Treacle bass line — follows Cmaj7-Em7-Am7-Fmaj7-Dm7-G7-Cmaj7-G7sus4 roots (16 steps)
export const TREACLE_BASS_LINE = [
  N.C2, 0, N.E2, 0, N.A2, 0, N.F2, 0,
  N.D3, 0, N.G2, 0, N.C2, 0, N.G2, 0,
];

// Treacle pad chords: Cmaj7 - Em7 - Am7 - Fmaj7 - Dm7 - G7 - Cmaj7 - G7sus4
// 7th chords throughout; G7 has the tritone B-F for tension; ii-V-I at slots 4-6
export const TREACLE_PAD_CHORDS = [
  [N.C3, N.E3, N.B3],   // Cmaj7  — root+3rd+maj7, open and dreamy
  [N.G2, N.D3, N.E3],   // Em7   — root+7th+3rd, gentle colour shift
  [N.A2, N.E3, N.G3],   // Am7   — root+5th+b7, open voicing
  [N.F2, N.A2, N.E3],   // Fmaj7 — root+3rd+maj7 (E is the maj7 of F)
  [N.D3, N.F3, N.C3],   // Dm7   — ii chord: root+3rd+b7
  [N.G2, N.B2, N.F3],   // G7    — tritone B↔F, strong dominant pull
  [N.C3, N.E3, N.B3],   // Cmaj7 — resolution home
  [N.G2, N.C3, N.F3],   // G7sus4 — suspended, leans back into the loop
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
