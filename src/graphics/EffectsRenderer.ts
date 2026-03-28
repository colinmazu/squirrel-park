import Phaser from 'phaser';
import { TREE_DEFS } from '@/config';

export class EffectsRenderer {
  private vignetteGfx: Phaser.GameObjects.Graphics;
  private sunlightGfx: Phaser.GameObjects.Graphics;
  private rippleGfx: Phaser.GameObjects.Graphics;
  private dustGfx: Phaser.GameObjects.Graphics;
  private treacleOverlay: Phaser.GameObjects.Rectangle;
  private frame = 0;
  private w: number;
  private h: number;

  constructor(scene: Phaser.Scene, w: number, h: number) {
    this.w = w;
    this.h = h;

    // Vignette (static, drawn once)
    this.vignetteGfx = scene.add.graphics();
    this.vignetteGfx.setDepth(90);
    this.drawVignette();

    // Sunlight dapples (animated, additive blend)
    this.sunlightGfx = scene.add.graphics();
    this.sunlightGfx.setDepth(5);
    this.sunlightGfx.setBlendMode(Phaser.BlendModes.ADD);

    // Pond ripples (animated)
    this.rippleGfx = scene.add.graphics();
    this.rippleGfx.setDepth(1);

    // Floating dust motes (animated, additive)
    this.dustGfx = scene.add.graphics();
    this.dustGfx.setDepth(4);
    this.dustGfx.setBlendMode(Phaser.BlendModes.ADD);

    // Treacle tint overlay
    this.treacleOverlay = scene.add.rectangle(w / 2, h / 2, w, h, 0xb48c14, 0);
    this.treacleOverlay.setDepth(85);
  }

  private drawVignette() {
    const g = this.vignetteGfx;
    const fade = 80;

    for (let i = 0; i < fade; i++) {
      const a = (1 - i / fade);
      // Top
      g.fillStyle(0x000000, a * 0.15);
      g.fillRect(0, i, this.w, 1);
      // Bottom
      g.fillStyle(0x000000, a * 0.15);
      g.fillRect(0, this.h - 1 - i, this.w, 1);
      // Left
      g.fillStyle(0x000000, a * 0.10);
      g.fillRect(i, 0, 1, this.h);
      // Right
      g.fillStyle(0x000000, a * 0.10);
      g.fillRect(this.w - 1 - i, 0, 1, this.h);
    }

    // Corner darkening passes
    for (let i = 0; i < 40; i++) {
      const a = (1 - i / 40) * 0.06;
      g.fillStyle(0x000000, a);
      g.fillRect(0, 0, i, this.h);
      g.fillRect(this.w - i, 0, i, this.h);
    }
  }

  update(frame: number) {
    this.frame = frame;
    this.drawSunlight();
    this.drawRipples();
    this.drawDustMotes();
  }

  private drawSunlight() {
    this.sunlightGfx.clear();

    // Primary dapple per tree
    for (let i = 0; i < Math.min(TREE_DEFS.length, 8); i++) {
      const td = TREE_DEFS[i];
      const sx = td.x * this.w + Math.sin(this.frame * 0.008 + i) * 18;
      const sy = td.y * this.h + 30 + Math.cos(this.frame * 0.006 + i * 2) * 12;
      const sr = 18 + Math.sin(this.frame * 0.01 + i * 3) * 6;

      this.sunlightGfx.fillStyle(0xffffd8, 0.08);
      this.sunlightGfx.fillCircle(sx, sy, sr);
      this.sunlightGfx.fillStyle(0xffffd8, 0.04);
      this.sunlightGfx.fillCircle(sx, sy, sr * 1.6);
    }

    // Secondary smaller dapples
    for (let i = 0; i < 5; i++) {
      const sx = this.w * (0.15 + i * 0.18) + Math.sin(this.frame * 0.005 + i * 1.7) * 12;
      const sy = this.h * (0.35 + Math.sin(i * 2.1) * 0.25) + Math.cos(this.frame * 0.007 + i) * 8;
      this.sunlightGfx.fillStyle(0xfffff0, 0.04);
      this.sunlightGfx.fillCircle(sx, sy, 10 + Math.sin(this.frame * 0.012 + i * 2) * 4);
    }
  }

  private drawRipples() {
    this.rippleGfx.clear();
    const pondX = this.w * 0.75, pondY = this.h * 0.65;

    for (let r = 0; r < 4; r++) {
      const phase = (this.frame * 0.025 + r * 0.8) % 1;
      const ripR  = 8 + phase * 30 + r * 6;
      const alpha = (1 - phase) * (0.14 - r * 0.025);
      this.rippleGfx.lineStyle(1, 0x78c8e6, Math.max(0, alpha));
      this.rippleGfx.strokeEllipse(pondX, pondY, ripR * 2, ripR * 1.3);
    }

    // Occasional glint at pond surface
    if ((this.frame % 45) < 8) {
      const glintA = Math.sin((this.frame % 45) / 45 * Math.PI) * 0.35;
      this.rippleGfx.fillStyle(0xffffff, glintA);
      this.rippleGfx.fillEllipse(pondX - 10, pondY - 8, 12, 6);
    }
  }

  private drawDustMotes() {
    this.dustGfx.clear();
    // 8 floating dust particles drifting slowly
    for (let i = 0; i < 8; i++) {
      const t   = (this.frame * 0.003 + i * 0.125) % 1;
      const x   = this.w * (0.1 + ((i * 0.137 + 0.05) % 0.85)) + Math.sin(this.frame * 0.004 + i * 1.8) * 20;
      const y   = this.h * (0.1 + t * 0.85);
      const a   = Math.sin(t * Math.PI) * 0.06;
      this.dustGfx.fillStyle(0xffffd8, a);
      this.dustGfx.fillCircle(x, y, 1.5 + Math.sin(this.frame * 0.02 + i) * 0.5);
    }
  }

  setTreacleAlpha(alpha: number) {
    this.treacleOverlay.setAlpha(alpha);
  }
}
