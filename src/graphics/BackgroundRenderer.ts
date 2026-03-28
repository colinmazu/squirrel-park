import Phaser from 'phaser';
import { TREE_DEFS, FLOWER_COLORS, TAU } from '@/config';

export class BackgroundRenderer {
  private scene: Phaser.Scene;
  private gfx!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(w: number, h: number): Phaser.GameObjects.Graphics {
    this.gfx = this.scene.add.graphics();
    this.gfx.setDepth(-100);
    this.drawBackground(w, h);
    return this.gfx;
  }

  private drawBackground(w: number, h: number) {
    const g = this.gfx;

    // ── BASE GRASS ────────────────────────────────────────────────────────────
    g.fillStyle(0x5a9e4a);
    g.fillRect(0, 0, w, h);

    // Vertical shading bands (darker at bottom)
    const bands = 50;
    for (let i = 0; i < bands; i++) {
      const t = i / bands;
      const r  = Math.round(90  - t * 14);
      const gr = Math.round(158 - t * 22);
      const b  = Math.round(74  - t * 12);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      const bandH = Math.ceil(h / bands) + 1;
      g.fillRect(0, Math.floor((h / bands) * i), w, bandH);
    }

    // ── SUNLIT GLOW PATCHES ───────────────────────────────────────────────────
    g.fillStyle(0xfff8d0, 0.07);
    g.fillCircle(w * 0.28, h * 0.28, 140);
    g.fillStyle(0xfff8c8, 0.05);
    g.fillCircle(w * 0.28, h * 0.28, 220);
    g.fillStyle(0xfff8d0, 0.04);
    g.fillCircle(w * 0.70, h * 0.50, 110);
    g.fillStyle(0xfff8c0, 0.025);
    g.fillCircle(w * 0.50, h * 0.75, 90);

    // ── GRASS TEXTURE ─────────────────────────────────────────────────────────
    // Large soft patches
    for (let i = 0; i < 32; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const rx = 22 + Math.random() * 48;
      const ry = 13 + Math.random() * 30;
      const bright = Math.random() > 0.5;
      g.fillStyle(bright ? 0x72c45e : 0x4e8e3c, bright ? 0.22 : 0.18);
      g.fillEllipse(px, py, rx * 2, ry * 2);
    }
    // Fine detail patches
    for (let i = 0; i < 48; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      g.fillStyle(Math.random() > 0.6 ? 0x7ad860 : 0x3e7a2c, 0.10);
      g.fillEllipse(px, py, 14 + Math.random() * 24, 8 + Math.random() * 16);
    }

    // ── WINDING PATH ─────────────────────────────────────────────────────────
    const pathCurve  = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(0,        h * 0.50),
      new Phaser.Math.Vector2(w * 0.20, h * 0.30),
      new Phaser.Math.Vector2(w * 0.65, h * 0.20),
      new Phaser.Math.Vector2(w * 0.50, h * 0.45),
    );
    const pathCurve2 = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(w * 0.50, h * 0.45),
      new Phaser.Math.Vector2(w * 0.65, h * 0.20),
      new Phaser.Math.Vector2(w * 0.80, h * 0.60),
      new Phaser.Math.Vector2(w,        h * 0.40),
    );

    const edgePts = [...pathCurve.getPoints(32), ...pathCurve2.getPoints(32)];
    const pathLine = () => {
      g.beginPath();
      g.moveTo(edgePts[0].x, edgePts[0].y);
      for (const pt of edgePts) g.lineTo(pt.x, pt.y);
      g.strokePath();
    };

    // Path shadow
    g.lineStyle(36, 0x9a7040, 0.35);
    pathLine();
    // Path base
    g.lineStyle(28, 0xc4a870);
    pathLine();
    // Path lighter centre
    g.lineStyle(18, 0xd4bc82);
    pathLine();
    // Path highlight
    g.lineStyle(6, 0xe0cca0, 0.55);
    pathLine();

    // Pebble texture dots along path
    for (let i = 0; i < 80; i++) {
      const t   = i / 80;
      const seg = t < 0.5 ? pathCurve : pathCurve2;
      const pt  = seg.getPoint(t < 0.5 ? t * 2 : (t - 0.5) * 2);
      const ox  = (Math.random() - 0.5) * 22;
      const oy  = (Math.random() - 0.5) * 10;
      g.fillStyle(Math.random() > 0.5 ? 0xd8c090 : 0xb8a070, 0.45);
      g.fillEllipse(pt.x + ox, pt.y + oy, 3 + Math.random() * 4, 2 + Math.random() * 3);
    }

    // ── POND ─────────────────────────────────────────────────────────────────
    const pondX = w * 0.75, pondY = h * 0.65;

    // Shore / muddy edge
    g.fillStyle(0x7a8a4a, 0.55);
    g.fillEllipse(pondX, pondY, 96, 64);

    // Water main
    g.fillStyle(0x4a9ec8);
    g.fillEllipse(pondX, pondY, 84, 56);

    // Water sheen layers
    g.fillStyle(0x5ab4d8, 0.65);
    g.fillEllipse(pondX - 6, pondY - 6, 62, 38);
    g.fillStyle(0x7ad0ec, 0.35);
    g.fillEllipse(pondX - 8, pondY - 10, 40, 22);

    // Sun glint
    g.fillStyle(0xffffff, 0.18);
    g.fillEllipse(pondX - 12, pondY - 12, 18, 10);

    // Shore outline
    g.lineStyle(1.5, 0x7a6838, 0.28);
    g.strokeEllipse(pondX, pondY, 84, 56);

    // Lily pads
    for (let i = 0; i < 4; i++) {
      const lx = pondX + (Math.random() - 0.5) * 50;
      const ly = pondY + (Math.random() - 0.5) * 28;
      g.fillStyle(0x3a8830, 0.80);
      g.fillEllipse(lx, ly, 10, 7);
      g.fillStyle(0x50aa40, 0.50);
      g.fillEllipse(lx - 1, ly - 1, 6, 4);
    }

    // ── FLOWERS ───────────────────────────────────────────────────────────────
    for (let i = 0; i < 48; i++) {
      const fx = Math.random() * w;
      const fy = Math.random() * h;
      const color    = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
      const colorNum = Phaser.Display.Color.HexStringToColor(color).color;
      const r      = 2.2 + Math.random() * 2.8;
      const petals = 4 + Math.floor(Math.random() * 4);

      // Stem
      g.lineStyle(0.8, 0x3a7a28, 0.60);
      g.lineBetween(fx, fy, fx + (Math.random() - 0.5) * 4, fy + 6 + Math.random() * 4);

      // Leaf
      g.fillStyle(0x4a9838, 0.55);
      g.fillEllipse(fx + 3, fy + 4, 6, 3);

      // Petals
      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * TAU;
        g.fillStyle(colorNum, 0.88);
        g.fillEllipse(fx + Math.cos(a) * r, fy + Math.sin(a) * r, r * 1.5, r * 0.9);
      }
      // Centre
      g.fillStyle(0xfdcb6e);
      g.fillCircle(fx, fy, r * 0.42);
      g.fillStyle(0xffffff, 0.30);
      g.fillCircle(fx - 0.4, fy - 0.4, r * 0.18);
    }

    // ── TREE SHADOWS ─────────────────────────────────────────────────────────
    for (const td of TREE_DEFS) {
      g.fillStyle(0x000000, 0.07);
      g.fillEllipse(td.x * w + 6, td.y * h + 32 * td.s, 56 * td.s, 22 * td.s);
      g.fillStyle(0x000000, 0.04);
      g.fillEllipse(td.x * w + 8, td.y * h + 38 * td.s, 40 * td.s, 14 * td.s);
    }
  }
}
