import Phaser from 'phaser';
import { TAU } from '@/config';

export type NutType = 'normal' | 'magic' | 'treacle' | 'lantern';

export class Nut extends Phaser.GameObjects.Container {
  public nutType: NutType;
  public phase: number;
  public collected = false;
  private gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, type: NutType) {
    super(scene, x, y);
    this.nutType = type;
    this.phase = Math.random() * TAU;
    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(8);
  }

  draw(frame: number) {
    if (this.collected) { this.setVisible(false); return; }

    const g = this.gfx;
    g.clear();

    switch (this.nutType) {
      case 'normal': this.drawNormal(g, frame); break;
      case 'magic': this.drawMagic(g, frame); break;
      case 'treacle': this.drawTreacle(g, frame); break;
      case 'lantern': this.drawLantern(g, frame); break;
    }
  }

  private drawNormal(g: Phaser.GameObjects.Graphics, frame: number) {
    const bob = Math.sin(frame * 0.06 + this.phase) * 3;
    g.setPosition(0, bob);

    // Shadow
    g.fillStyle(0x000000, 0.1);
    g.fillEllipse(1, 8 - bob, 14, 6);
    // Body
    g.fillStyle(0xa67c2e);
    g.fillEllipse(0, 2, 12, 16);
    // Cap
    g.fillStyle(0x7a5a1e);
    g.fillEllipse(0, -5, 14, 8);
    // Cap band
    g.fillStyle(0x6b4e18);
    g.fillRect(-7, -5, 14, 2);
    // Highlight
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(-2, -1, 4, 6);
  }

  private drawMagic(g: Phaser.GameObjects.Graphics, frame: number) {
    const bob = Math.sin(frame * 0.08 + this.phase) * 4;
    g.setPosition(0, bob);

    const hue = (frame * 6 + this.phase * 100) % 360;
    const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.55);

    // Body - rainbow
    g.fillStyle(color.color);
    g.fillEllipse(0, 0, 18, 22);

    // Inner glow
    const hue2 = (hue + 60) % 360;
    const color2 = Phaser.Display.Color.HSLToColor(hue2 / 360, 1, 0.75);
    g.fillStyle(color2.color, 0.5);
    g.fillEllipse(0, 0, 10, 14);

    // Orbiting sparkles
    for (let i = 0; i < 4; i++) {
      const a = frame * 0.08 + i * TAU / 4;
      const sx = Math.cos(a) * 15;
      const sy = Math.sin(a) * 15;
      const sh = (hue + i * 90) % 360;
      const sc = Phaser.Display.Color.HSLToColor(sh / 360, 1, 0.8);
      g.fillStyle(sc.color);
      g.fillCircle(sx, sy, 2 + Math.sin(frame * 0.2 + i) * 0.8);
    }

    // Inner sparkle
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(-2, -2, 3);
  }

  private drawTreacle(g: Phaser.GameObjects.Graphics, frame: number) {
    const bob = Math.sin(frame * 0.05 + this.phase) * 2;
    g.setPosition(0, bob);

    // Body
    g.fillStyle(0xd4a017);
    g.fillEllipse(0, 0, 16, 20);
    g.fillStyle(0xe8c030, 0.7);
    g.fillEllipse(-1, -1, 10, 14);

    // Drip
    g.fillStyle(0xb8860b);
    g.fillEllipse(0, 10, 8, 10 + Math.sin(frame * 0.04) * 4);

    // Gloss
    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(-2, -3, 6, 8);
  }

  private drawLantern(g: Phaser.GameObjects.Graphics, frame: number) {
    const bob = Math.sin(frame * 0.07 + this.phase) * 3;
    const pulse = 0.5 + Math.sin(frame * 0.12) * 0.3;
    g.setPosition(0, bob);

    // Cross-hair lines
    g.lineStyle(1, 0x00ced1, 0.15);
    g.beginPath();
    g.moveTo(0, -20); g.lineTo(0, 20);
    g.moveTo(-20, 0); g.lineTo(20, 0);
    g.strokePath();

    // Top cap
    g.fillStyle(0xffd700);
    g.fillRect(-3, -8, 6, 2);
    // Frame
    g.fillStyle(0x1a8a8a);
    g.fillRect(-4, -6, 8, 10);
    // Glass
    g.fillStyle(0x00dcf0, 0.5 + pulse * 0.3);
    g.fillRect(-3, -5, 6, 8);
    // Bottom cap
    g.fillStyle(0xffd700);
    g.fillRect(-3, 4, 6, 2);
    // Pole
    g.fillRect(-1, 6, 2, 4);
  }

  getPoints(): number {
    switch (this.nutType) {
      case 'normal': return 10;
      case 'magic': return 25;
      case 'treacle': return 5;
      case 'lantern': return 15;
    }
  }

  getHitRadius(): number {
    return this.nutType === 'magic' ? 12 : 10;
  }
}
