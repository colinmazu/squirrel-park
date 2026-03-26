export const TAU = Math.PI * 2;

// Canvas / scaling
export const BASE_W = 750;
export const BASE_H = Math.round(750 / (16 / 9)); // ≈422

// Player
export const PLAYER_SPEED = 3.5;
export const MAGIC_SPEED_MULT = 2.2;
export const TREACLE_SPEED_MULT = 0.38;

// Power-up durations (frames at 60fps)
export const MAGIC_DURATION = 300;   // 5 seconds
export const TREACLE_DURATION = 360; // 6 seconds
export const INVINCIBILITY_DURATION = 120; // 2 seconds

// Lanterns
export const LANTERN_DURATION = 480; // 8 seconds
export const MAX_LANTERNS = 3;
export const LANTERN_BEAM_WIDTH = 8;
export const LANTERN_STUN_FRAMES = 50;
export const LANTERN_BOUNCE_DIST = 20;

// Particles
export const MAX_PARTICLES = 400;
export const MAX_FLOAT_TEXTS = 30;

// Combo
export const COMBO_WINDOW = 120; // 2 seconds
export const MAX_COMBO_MULT = 5;

// Fox spawning
export const FOX_BASE_SPEED = 1.2;
export const FOX_SPEED_PER_LEVEL = 0.3;
export const FOX_TREACLE_SPEED_MULT = 0.45;
export const FOX_SPAWN_BASE_MS = 2500;
export const FOX_SPAWN_REDUCTION_PER_LEVEL = 200;
export const FOX_SPAWN_MIN_MS = 800;
export const FOX_BASE_MAX = 2; // max foxes = FOX_BASE_MAX + level

// Nut spawning
export const NUT_BASE_COUNT = 5;
export const NUTS_PER_LEVEL = 2;
export const NUT_COLLECT_RADIUS = 18;
export const NUT_MAGNET_RADIUS = 40;
export const NUT_MAGNET_STRENGTH = 1.5;

// Nut type probabilities (cumulative)
export const NUT_PROB_LANTERN = 0.07;
export const NUT_PROB_TREACLE = 0.20;
export const NUT_PROB_MAGIC = 0.34;
// remainder = normal

// Collision
export const SQUIRREL_FOX_HIT_DIST_SQ = 400; // 20px radius squared

// Colors
export const COLORS = {
  // Park
  grassBase: '#5a9e4a',
  grassDark: '#4d8c3a',
  grassLight: '#6db858',
  path: '#d4bc82',
  pathEdge: '#c4a870',
  pondCenter: '#6ec8e8',
  pondEdge: '#4a9ec8',
  pageBg: '#2a4a1e',

  // Squirrel
  sqBody: '#8b5e3c',
  sqHead: '#a0704e',
  sqBelly: '#c4956a',
  sqEar: '#6b4423',
  sqTail: '#7a5230',
  sqTreacleBody: '#b8860b',
  sqTreacleHead: '#c49a12',

  // Fox
  foxBody: '#d4652b',
  foxHead: '#e8803c',
  foxBelly: '#f0c090',
  foxNose: '#2a1a0a',

  // Nuts
  nutBody: '#a67c2e',
  nutCap: '#7a5a1e',
  nutCapBand: '#6b4e18',
  treacleLight: '#e8c030',
  treacleBase: '#d4a017',
  treacleDark: '#b8860b',
  lanternGlow: '#00ced1',
  lanternGold: '#ffd700',
  lanternFrame: '#1a8a8a',

  // UI
  hurtRed: '#ff4757',
  scoreGold: '#ffd700',
  levelBlue: '#7fdbff',
  magicGlow: (frame: number) => `hsl(${(frame * 8) % 360},100%,60%)`,
} as const;

// Tree definitions (normalized 0-1 coordinates)
export const TREE_DEFS = [
  { x: 0.08, y: 0.10, s: 1.1 },
  { x: 0.47, y: 0.06, s: 1.3 },
  { x: 0.88, y: 0.08, s: 1.0 },
  { x: 0.05, y: 0.80, s: 1.2 },
  { x: 0.92, y: 0.82, s: 0.9 },
  { x: 0.25, y: 0.05, s: 0.8 },
  { x: 0.72, y: 0.88, s: 1.1 },
  { x: 0.14, y: 0.45, s: 0.7 },
];

// Flower colors
export const FLOWER_COLORS = ['#e84393', '#fd79a8', '#fdcb6e', '#e17055', '#a29bfe', '#fff'];

// Butterfly colors
export const BUTTERFLY_COLORS = ['#e84393', '#fd79a8', '#a29bfe', '#fdcb6e', '#74b9ff'];

// Audio
export const BPM = 160;
export const STEP_DURATION = 60 / BPM / 2; // 8th note in seconds = 0.1875
