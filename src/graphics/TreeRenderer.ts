import Phaser from 'phaser';

export function drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number) {
  // Trunk side shadow
  g.fillStyle(0x3e2410, 0.55);
  g.fillRect(x + 3 * s, y - 5 * s, 4 * s, 30 * s);

  // Trunk main
  g.fillStyle(0x6b4828);
  g.fillRect(x - 4 * s, y - 5 * s, 9 * s, 30 * s);

  // Bark texture — lighter centre strip + dark accent
  g.fillStyle(0x7d5830, 0.70);
  g.fillRect(x - 2 * s, y - 4 * s, 3 * s, 28 * s);
  g.fillStyle(0x4e3218, 0.40);
  g.fillRect(x + 1 * s, y - 3 * s, 1 * s, 26 * s);

  // Root flare
  g.fillStyle(0x4e3218, 0.45);
  g.fillEllipse(x, y + 24 * s, 18 * s, 9 * s);

  // Foliage cast shadow (offset right/down)
  g.fillStyle(0x193e10, 0.45);
  g.fillEllipse(x + 5 * s, y - 4 * s, 40 * s, 34 * s);

  // Foliage — 5 depth layers, darkest back to brightest front
  g.fillStyle(0x1e5010);
  g.fillEllipse(x - 2 * s, y -  6 * s, 36 * s, 30 * s);
  g.fillStyle(0x287020);
  g.fillEllipse(x + 3 * s, y - 10 * s, 38 * s, 32 * s);
  g.fillStyle(0x349030);
  g.fillEllipse(x - 4 * s, y - 13 * s, 32 * s, 26 * s);
  g.fillStyle(0x3a9030);
  g.fillEllipse(x + 5 * s, y - 19 * s, 26 * s, 24 * s);
  g.fillStyle(0x44aa38);
  g.fillEllipse(x - 2 * s, y - 21 * s, 22 * s, 20 * s);

  // Top cluster (brightest)
  g.fillStyle(0x58c840, 0.65);
  g.fillEllipse(x, y - 23 * s, 19 * s, 15 * s);

  // Sunlit specular highlight
  g.fillStyle(0x90e860, 0.28);
  g.fillEllipse(x - 5 * s, y - 24 * s, 13 * s, 9 * s);
  g.fillStyle(0xffffff, 0.07);
  g.fillEllipse(x - 6 * s, y - 25 * s, 7 * s, 5 * s);
}
