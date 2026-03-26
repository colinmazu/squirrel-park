import Phaser from 'phaser';
import { COLORS, TAU, PLAYER_SPEED, MAGIC_SPEED_MULT, TREACLE_SPEED_MULT } from '@/config';

export type SquirrelMode = 'normal' | 'magic' | 'treacle';

export class Squirrel extends Phaser.GameObjects.Container {
  public vx = 0;
  public vy = 0;
  public facing = 1;
  public moving = false;
  public mode: SquirrelMode = 'normal';
  public invincible = false;
  private gfx: Phaser.GameObjects.Graphics;
  private frame = 0;
  private bodyW = 18;
  private bodyH = 24;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(10);
  }

  getSpeed(): number {
    let speed = PLAYER_SPEED;
    if (this.mode === 'magic') speed *= MAGIC_SPEED_MULT;
    else if (this.mode === 'treacle') speed *= TREACLE_SPEED_MULT;
    return speed;
  }

  move(mx: number, my: number) {
    const speed = this.getSpeed();
    this.vx = mx * speed;
    this.vy = my * speed;
    this.x += this.vx;
    this.y += this.vy;
    this.moving = Math.abs(mx) > 0.1 || Math.abs(my) > 0.1;
    if (mx !== 0) this.facing = mx > 0 ? 1 : -1;
  }

  clamp(w: number, h: number) {
    this.x = Phaser.Math.Clamp(this.x, this.bodyW, w - this.bodyW);
    this.y = Phaser.Math.Clamp(this.y, this.bodyH, h - this.bodyH);
  }

  draw(frame: number) {
    this.frame = frame;
    const g = this.gfx;
    g.clear();

    if (this.invincible && (frame % 8) < 4) return;

    const { bodyW: bw, bodyH: bh } = this;
    const isMagic = this.mode === 'magic';
    const isTreacle = this.mode === 'treacle';

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(2, bh * 0.5, bw * 1.8, 10);

    // Tail
    const tailWag = isTreacle ? Math.sin(frame * 0.03) * 0.15 :
                    isMagic ? Math.sin(frame * 0.3) * 0.6 :
                    Math.sin(frame * 0.12) * 0.4;
    const tailColor = isMagic ? this.rainbowColor(frame * 10) :
                      isTreacle ? 0xb8860b : 0x7a5230;
    const tf = this.facing;

    g.lineStyle(4, tailColor);
    g.beginPath();
    g.moveTo(tf * -2, -2);
    // Approximate bezier with line segments
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const cx1 = tf * (-12 + tailWag * 10);
      const cy1 = -10;
      const cx2 = tf * (-18 + tailWag * 15);
      const cy2 = -25;
      const ex = tf * (-10 + tailWag * 12);
      const ey = -30;
      const mt = 1 - t;
      const px = mt * mt * mt * (tf * -2) + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * ex;
      const py = mt * mt * mt * (-2) + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * ey;
      g.lineTo(px, py);
    }
    g.strokePath();

    // Tail fluff
    g.fillStyle(tailColor);
    g.fillCircle(tf * (-10 + tailWag * 12), -30, 4);

    // Body
    const bodyColor = isMagic ? this.rainbowColor(frame * 8) :
                      isTreacle ? 0xb8860b : 0x8b5e3c;
    g.fillStyle(bodyColor);
    g.fillEllipse(0, 0, bw * 1.1, bh * 0.9);

    // Belly
    const bellyColor = isMagic ? this.rainbowColor(frame * 8 + 40) :
                       isTreacle ? 0xd4a017 : 0xc4956a;
    g.fillStyle(bellyColor);
    g.fillEllipse(0, bh * 0.08, bw * 0.7, bh * 0.56);

    // Head
    const headColor = isMagic ? this.rainbowColor(frame * 8 + 20) :
                      isTreacle ? 0xc49a12 : 0xa0704e;
    g.fillStyle(headColor);
    g.fillEllipse(0, -bh * 0.52, bw * 0.8, bh * 0.6);

    // Ears
    const earColor = isMagic ? this.rainbowColor(frame * 8 + 60) :
                     isTreacle ? 0xa08010 : 0x6b4423;
    g.fillStyle(earColor);
    for (let side = -1; side <= 1; side += 2) {
      g.fillTriangle(
        side * bw * 0.25, -bh * 0.65,
        side * bw * 0.4, -bh * 0.9,
        side * bw * 0.1, -bh * 0.7,
      );
    }

    // Eyes
    const lookX = this.vx * 0.3;
    const lookY = this.vy * 0.3;
    g.fillStyle(0xffffff);
    g.fillEllipse(-5 + lookX * 0.2, -bh * 0.52, 7, 8);
    g.fillEllipse(5 + lookX * 0.2, -bh * 0.52, 7, 8);
    g.fillStyle(0x1a1a1a);
    g.fillCircle(-5 + lookX, -bh * 0.52 + lookY * 0.5, 1.8);
    g.fillCircle(5 + lookX, -bh * 0.52 + lookY * 0.5, 1.8);

    // Nose
    g.fillStyle(0x3a2010);
    g.fillEllipse(0, -bh * 0.4, 4, 3);

    // Treacle drips
    if (isTreacle) {
      g.fillStyle(0xb48210, 0.6);
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 6;
        const dy = bh * 0.35 + Math.sin(frame * 0.05 + i) * 3;
        g.fillEllipse(dx, dy, 5, 8 + Math.sin(frame * 0.08 + i) * 4);
      }
    }

    // Feet
    const footColor = isTreacle ? 0x8a6a10 : 0x6b4423;
    const footBob = this.moving ? Math.sin(frame * 0.3) * 2 : 0;
    g.fillStyle(footColor);
    g.fillEllipse(-6, bh * 0.4 + footBob, 8, 6);
    g.fillEllipse(6, bh * 0.4 - footBob, 8, 6);
  }

  private rainbowColor(hueOffset: number): number {
    const hue = hueOffset % 360;
    const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.5);
    return color.color;
  }

  getHitRadius(): number {
    return 15;
  }
}
