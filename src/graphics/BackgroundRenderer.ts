import Phaser from 'phaser';
import { TREE_DEFS, FLOWER_COLORS, TAU } from '@/config';

export class BackgroundRenderer {
  private scene: Phaser.Scene;
  private rt!: Phaser.GameObjects.RenderTexture;
  private gfx!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(w: number, h: number): Phaser.GameObjects.RenderTexture {
    this.gfx = this.scene.add.graphics();
    this.rt = this.scene.add.renderTexture(0, 0, w, h);
    this.rt.setDepth(-100);

    this.drawBackground(w, h);

    this.gfx.destroy();
    return this.rt;
  }

  private drawBackground(w: number, h: number) {
    const g = this.gfx;

    // Solid bright green base - no gradient (avoids WebGL quadrant artifacts)
    g.fillStyle(0x5a9e4a);
    g.fillRect(0, 0, w, h);

    // Subtle vertical shading via horizontal bands (many thin bands = smooth)
    const bands = 40;
    for (let i = 0; i < bands; i++) {
      const t = i / bands;
      // Slightly darker toward bottom
      const r = Math.round(90 - t * 12);
      const gr = Math.round(158 - t * 18);
      const b = Math.round(74 - t * 10);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      const bandH = Math.ceil(h / bands) + 1;
      g.fillRect(0, Math.floor((h / bands) * i), w, bandH);
    }

    // Warm sunlit glow patches
    g.fillStyle(0xfff8d0, 0.06);
    g.fillCircle(w * 0.3, h * 0.3, 120);
    g.fillStyle(0xfff8d0, 0.04);
    g.fillCircle(w * 0.7, h * 0.5, 100);

    // Grass patches (bright greens)
    for (let i = 0; i < 30; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const rx = 20 + Math.random() * 45;
      const ry = 12 + Math.random() * 28;
      const bright = Math.random() > 0.5;
      g.fillStyle(bright ? 0x6db858 : 0x4d8c3a, bright ? 0.25 : 0.2);
      g.fillEllipse(px, py, rx * 2, ry * 2);
    }

    // Winding path
    const pathCurve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(0, h * 0.5),
      new Phaser.Math.Vector2(w * 0.2, h * 0.3),
      new Phaser.Math.Vector2(w * 0.65, h * 0.2),
      new Phaser.Math.Vector2(w * 0.5, h * 0.45),
    );
    const pathCurve2 = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(w * 0.5, h * 0.45),
      new Phaser.Math.Vector2(w * 0.65, h * 0.2),
      new Phaser.Math.Vector2(w * 0.8, h * 0.6),
      new Phaser.Math.Vector2(w, h * 0.4),
    );

    // Path edge
    g.lineStyle(28, 0xc4a870);
    const edgePts = [...pathCurve.getPoints(30), ...pathCurve2.getPoints(30)];
    g.beginPath();
    g.moveTo(edgePts[0].x, edgePts[0].y);
    for (const pt of edgePts) g.lineTo(pt.x, pt.y);
    g.strokePath();

    // Path inner
    g.lineStyle(20, 0xd4bc82);
    g.beginPath();
    g.moveTo(edgePts[0].x, edgePts[0].y);
    for (const pt of edgePts) g.lineTo(pt.x, pt.y);
    g.strokePath();

    // Pond
    const pondX = w * 0.75, pondY = h * 0.65;
    g.fillStyle(0x4a9ec8);
    g.fillEllipse(pondX, pondY, 84, 56);
    g.fillStyle(0x6ec8e8, 0.7);
    g.fillEllipse(pondX, pondY, 60, 40);
    g.lineStyle(2, 0x7a6838, 0.3);
    g.strokeEllipse(pondX, pondY, 84, 56);

    // Flowers
    for (let i = 0; i < 35; i++) {
      const fx = Math.random() * w;
      const fy = Math.random() * h;
      const color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
      const colorNum = Phaser.Display.Color.HexStringToColor(color).color;
      const r = 2 + Math.random() * 2.5;
      const petals = 4 + Math.floor(Math.random() * 3);

      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * TAU;
        g.fillStyle(colorNum, 0.85);
        g.fillEllipse(fx + Math.cos(a) * r, fy + Math.sin(a) * r, r * 1.4, r * 0.8);
      }
      g.fillStyle(0xfdcb6e);
      g.fillCircle(fx, fy, r * 0.4);
    }

    // Tree shadows
    for (const td of TREE_DEFS) {
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(td.x * w + 5, td.y * h + 30 * td.s, 50 * td.s, 20 * td.s);
    }

    // Stamp the graphics onto the render texture
    this.rt.draw(g);
  }
}
