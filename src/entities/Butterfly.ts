import Phaser from 'phaser';
import { TAU, BUTTERFLY_COLORS } from '@/config';

export class Butterfly extends Phaser.GameObjects.Container {
  public vx: number;
  public vy: number;
  private wingPhase: number;
  private color: number;
  private turnTimer: number;
  private gfx: Phaser.GameObjects.Graphics;
  private boundW: number;
  private boundH: number;

  constructor(scene: Phaser.Scene, x: number, y: number, index: number, w: number, h: number) {
    super(scene, x, y);
    this.boundW = w;
    this.boundH = h;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.wingPhase = Math.random() * TAU;
    const hexColor = BUTTERFLY_COLORS[index % BUTTERFLY_COLORS.length];
    this.color = Phaser.Display.Color.HexStringToColor(hexColor).color;
    this.turnTimer = 60 + Math.random() * 120;
    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(50);
  }

  updateMovement(frame: number) {
    this.wingPhase += 0.25;
    this.x += this.vx;
    this.y += this.vy + Math.sin(frame * 0.02 + this.wingPhase) * 0.15;

    this.turnTimer--;
    if (this.turnTimer <= 0) {
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.turnTimer = 60 + Math.random() * 120;
    }

    // Wrap
    if (this.x < -10) this.x = this.boundW + 10;
    if (this.x > this.boundW + 10) this.x = -10;
    if (this.y < 10) this.vy = Math.abs(this.vy);
    if (this.y > this.boundH - 30) this.vy = -Math.abs(this.vy);
  }

  draw() {
    const g = this.gfx;
    g.clear();
    const wingSpread = Math.sin(this.wingPhase) * 0.8;

    g.setAlpha(0.7);
    g.fillStyle(this.color);
    // Left wing
    g.fillEllipse(-3, 0, 8 * Math.abs(wingSpread), 6);
    // Right wing
    g.fillEllipse(3, 0, 8 * Math.abs(wingSpread), 6);
    // Body
    g.setAlpha(0.8);
    g.fillStyle(0x333333);
    g.fillEllipse(0, 0, 2, 6);
    g.setAlpha(1);
  }
}
