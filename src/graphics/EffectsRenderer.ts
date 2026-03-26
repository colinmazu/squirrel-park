import Phaser from 'phaser';
import { TREE_DEFS, TAU, BASE_W, BASE_H } from '@/config';

export class EffectsRenderer {
  private scene: Phaser.Scene;
  private vignetteGfx: Phaser.GameObjects.Graphics;
  private sunlightGfx: Phaser.GameObjects.Graphics;
  private rippleGfx: Phaser.GameObjects.Graphics;
  private treacleOverlay: Phaser.GameObjects.Rectangle;
  private frame = 0;
  private w: number;
  private h: number;

  constructor(scene: Phaser.Scene, w: number, h: number) {
    this.scene = scene;
    this.w = w;
    this.h = h;

    // Vignette (static, drawn once)
    this.vignetteGfx = scene.add.graphics();
    this.vignetteGfx.setDepth(90);
    this.drawVignette();

    // Sunlight dapples (animated)
    this.sunlightGfx = scene.add.graphics();
    this.sunlightGfx.setDepth(5);
    this.sunlightGfx.setBlendMode(Phaser.BlendModes.ADD);

    // Pond ripples (animated)
    this.rippleGfx = scene.add.graphics();
    this.rippleGfx.setDepth(1);

    // Treacle tint overlay
    this.treacleOverlay = scene.add.rectangle(w / 2, h / 2, w, h, 0xb48c14, 0);
    this.treacleOverlay.setDepth(85);
  }

  private drawVignette() {
    // Subtle edge darkening only (top/bottom/left/right strips)
    // Avoids concentric circle quadrant artifacts in WebGL
    const g = this.vignetteGfx;
    const fade = 60; // pixels of fade

    // Top edge
    for (let i = 0; i < fade; i++) {
      const alpha = (1 - i / fade) * 0.12;
      g.fillStyle(0x000000, alpha);
      g.fillRect(0, i, this.w, 1);
    }
    // Bottom edge
    for (let i = 0; i < fade; i++) {
      const alpha = (1 - i / fade) * 0.12;
      g.fillStyle(0x000000, alpha);
      g.fillRect(0, this.h - 1 - i, this.w, 1);
    }
    // Left edge
    for (let i = 0; i < fade; i++) {
      const alpha = (1 - i / fade) * 0.08;
      g.fillStyle(0x000000, alpha);
      g.fillRect(i, 0, 1, this.h);
    }
    // Right edge
    for (let i = 0; i < fade; i++) {
      const alpha = (1 - i / fade) * 0.08;
      g.fillStyle(0x000000, alpha);
      g.fillRect(this.w - 1 - i, 0, 1, this.h);
    }
  }

  update(frame: number) {
    this.frame = frame;
    this.drawSunlight();
    this.drawRipples();
  }

  private drawSunlight() {
    this.sunlightGfx.clear();
    for (let i = 0; i < 6; i++) {
      const td = TREE_DEFS[i];
      const sx = td.x * this.w + Math.sin(this.frame * 0.008 + i) * 15;
      const sy = td.y * this.h + 30 + Math.cos(this.frame * 0.006 + i * 2) * 10;
      const sr = 20 + Math.sin(this.frame * 0.01 + i * 3) * 5;
      this.sunlightGfx.fillStyle(0xffffd8, 0.07);
      this.sunlightGfx.fillCircle(sx, sy, sr);
      this.sunlightGfx.fillStyle(0xffffd8, 0.035);
      this.sunlightGfx.fillCircle(sx, sy, sr * 1.5);
    }
  }

  private drawRipples() {
    this.rippleGfx.clear();
    const pondX = this.w * 0.75, pondY = this.h * 0.65;
    for (let r = 0; r < 3; r++) {
      const ripR = 15 + r * 10 + Math.sin(this.frame * 0.03 + r) * 5;
      this.rippleGfx.lineStyle(1, 0x78c8e6, 0.12 - r * 0.03);
      this.rippleGfx.strokeEllipse(pondX, pondY, ripR * 2, ripR * 1.3);
    }
  }

  setTreacleAlpha(alpha: number) {
    this.treacleOverlay.setAlpha(alpha);
  }
}
