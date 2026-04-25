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

// "Gloria the Rabbit" theme — Laura-Branigan-inspired 80s anthem.
// Distinctive features:
//  - Iconic vocal-style "GLO-RI-AAAAH!" hook: low → high → held descent
//  - Heavy syncopation with strong off-beat accents
//  - Two iterations: Bar 1+2 in lower register, Bar 3+4 octave up for euphoria
//  - Descending chromatic tail mirroring "you're always on the run now"
export const MELODY_GLORIA = [
  // Bar 1: GLO-RI-AAAAH!  (E up to A then held descent A→G→A→G)
  N.E5, 0,    N.A5, N.A5, N.G5, N.A5, N.G5, 0,
  // Bar 2: "you're always on the run now" — chromatic-ish descent
  N.E5, N.F5, N.E5, N.D5, N.E5, N.C5, N.D5, 0,
  // Bar 3: GLO-RI-AAAAH! octave up — euphoric peak
  N.E6, 0,    N.A6, N.A6, N.G6, N.A6, N.G6, 0,
  // Bar 4: anthemic descending finale
  N.A5, N.G5, N.A5, N.F5, N.E5, N.D5, N.C5, 0,
];

// Gloria bass — pumping straight 8th-note Am-F-C-G with octave bounce.
// This is the SIGNATURE 80s pop anthem bass: every 8th-note feels like a heartbeat.
export const GLORIA_BASS_LINE = [
  N.A2, N.A3, N.A2, N.A3, N.A2, N.A3, N.E2, N.E3,
  N.F2, N.F3, N.F2, N.F3, N.G2, N.G3, N.G2, N.G3,
];

// Gloria perc — driving 80s rock beat (kick on 1+3+offbeats, snare on 2+4, busy hihats)
export const GLORIA_PERC_PATTERN: (string | 0)[] = [
  'K', 'H', 'H', 'K', 'S', 'H', 'K', 'H',
  'K', 'H', 'H', 'K', 'S', 'H', 'K', 'S',
];

// Gloria pad chords — Am - F - C - G (vi-IV-I-V, the "axis" progression)
export const GLORIA_PAD_CHORDS = [
  [N.A2, N.C3, N.E3], [N.A2, N.C3, N.E3], // Am
  [N.F2, N.A2, N.C3], [N.F2, N.A2, N.C3], // F
  [N.C3, N.E3, N.G3], [N.C3, N.E3, N.G3], // C
  [N.G2, N.B2, N.D3], [N.G2, N.B2, N.D3], // G
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
