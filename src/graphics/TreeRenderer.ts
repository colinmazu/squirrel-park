import Phaser from 'phaser';

export function drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number) {
  // Trunk
  g.fillStyle(0x6b4828);
  g.fillRect(x - 4 * s, y - 5 * s, 8 * s, 30 * s);
  // Trunk highlight
  g.fillStyle(0x7d5830);
  g.fillRect(x - 2 * s, y - 5 * s, 4 * s, 30 * s);
  // Foliage layers (brighter greens)
  const cols = [0x2e7a22, 0x3a9030, 0x338828];
  for (let i = 0; i < 3; i++) {
    g.fillStyle(cols[i]);
    g.fillEllipse(x + (i - 1) * 6 * s, y + (-10 - i * 8) * s, 36 * s, 30 * s);
  }
  // Foliage highlight
  g.fillStyle(0x8ad860, 0.25);
  g.fillEllipse(x - 5 * s, y - 22 * s, 20 * s, 16 * s);
}
