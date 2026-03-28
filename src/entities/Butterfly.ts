import Phaser from 'phaser';
import { TAU, BUTTERFLY_COLORS } from '@/config';

export class Butterfly extends Phaser.GameObjects.Container {
  public vx: number;
  public vy: number;
  private wingPhase: number;
  private color: number;
  private darkColor: number;
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
    // Slightly darker variant for wing markings
    const c = Phaser.Display.Color.IntegerToColor(this.color);
    this.darkColor = Phaser.Display.Color.GetColor(
      Math.max(0, c.red - 40), Math.max(0, c.green - 40), Math.max(0, c.blue - 40),
    );
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

    if (this.x < -10) this.x = this.boundW + 10;
    if (this.x > this.boundW + 10) this.x = -10;
    if (this.y < 10) this.vy = Math.abs(this.vy);
    if (this.y > this.boundH - 30) this.vy = -Math.abs(this.vy);
  }

  draw() {
    const g = this.gfx;
    g.clear();

    const wingSpread = Math.sin(this.wingPhase);
    const ww = Math.abs(wingSpread);  // wing width scale

    // Wing glow aura
    g.fillStyle(this.color, 0.10);
    g.fillEllipse(-7 * ww, -2, 22 * ww, 15);
    g.fillEllipse( 7 * ww, -2, 22 * ww, 15);

    // Upper wings
    g.setAlpha(0.78);
    g.fillStyle(this.color);
    g.fillEllipse(-5.5 * ww, -3, 13 * ww, 11);
    g.fillEllipse( 5.5 * ww, -3, 13 * ww, 11);

    // Wing marking band (darker)
    g.fillStyle(this.darkColor, 0.45);
    g.fillEllipse(-5 * ww, -2, 7 * ww, 6);
    g.fillEllipse( 5 * ww, -2, 7 * ww, 6);

    // Wing spots (white)
    g.fillStyle(0xffffff, 0.28);
    g.fillEllipse(-7 * ww, -2, 4 * ww, 3);
    g.fillEllipse( 7 * ww, -2, 4 * ww, 3);

    // Lower wings
    g.fillStyle(this.color, 0.82);
    g.fillEllipse(-4 * ww, 3, 9 * ww, 7);
    g.fillEllipse( 4 * ww, 3, 9 * ww, 7);

    // Wing outline
    g.setAlpha(0.78);
    g.lineStyle(0.5, 0x000000, 0.18);
    g.strokeEllipse(-5.5 * ww, -3, 13 * ww, 11);
    g.strokeEllipse( 5.5 * ww, -3, 13 * ww, 11);

    // Body shadow
    g.setAlpha(0.6);
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(1, 1, 3, 10);

    // Body (segmented)
    g.setAlpha(0.92);
    g.fillStyle(0x2a2020);
    g.fillEllipse(0, 0, 3, 10);
    g.fillStyle(0x4a3838, 0.55);
    g.fillEllipse(-0.5, -1, 1.8, 7);

    // Head
    g.fillStyle(0x1a1a1a);
    g.fillCircle(0, -5.5, 2);
    g.fillStyle(0x303030, 0.5);
    g.fillCircle(-0.5, -6, 1);

    // Antennae
    const antWag = Math.sin(this.wingPhase * 0.5) * 0.4;
    g.lineStyle(0.7, 0x1a1a1a, 0.80);
    g.lineBetween(0, -5, -4.5, -13 + antWag * 3);
    g.lineBetween(0, -5,  4.5, -13 - antWag * 3);
    // Knobs
    g.fillStyle(0x222222);
    g.fillCircle(-4.5, -13 + antWag * 3, 1.4);
    g.fillCircle( 4.5, -13 - antWag * 3, 1.4);

    g.setAlpha(1);
  }
}
