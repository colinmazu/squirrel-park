import Phaser from 'phaser';
import { WORMHOLE_DURATION, WORMHOLE_RADIUS } from '@/config';

/**
 * A wormhole — entrance and exit pair created by Gloria.  When the squirrel
 * walks into one, it teleports to the partner.  Hole becomes "active" only
 * once Gloria has dug it.
 */
export class Wormhole extends Phaser.GameObjects.Container {
  public timer: number;
  public active: boolean = false;
  public cooldown: number = 0; // brief cooldown after a teleport so we don't ping-pong
  private gfx: Phaser.GameObjects.Graphics;
  private frameCount = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.timer = WORMHOLE_DURATION;
    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(2); // below entities, above background
  }

  isExpired(): boolean {
    return this.timer <= 0;
  }

  contains(px: number, py: number): boolean {
    if (!this.active || this.cooldown > 0) return false;
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy < WORMHOLE_RADIUS * WORMHOLE_RADIUS;
  }

  update() {
    this.timer--;
    if (this.cooldown > 0) this.cooldown--;
    this.frameCount++;
  }

  draw() {
    const g = this.gfx;
    g.clear();
    if (!this.active) return;

    const f = this.frameCount;
    const fadeIn  = Math.min(this.frameCount / 30, 1);
    const fadeOut = Math.min(this.timer / 60, 1);
    const a = fadeIn * fadeOut;
    const pulse = 0.7 + Math.sin(f * 0.12) * 0.3;

    // Dirt mound around hole
    g.fillStyle(0x6b4828, 0.65 * a);
    g.fillEllipse(0, 2, 32, 12);
    g.fillStyle(0x8a6038, 0.5 * a);
    g.fillEllipse(-2, 1, 26, 9);

    // Dirt clods around the rim
    for (let i = 0; i < 7; i++) {
      const ang = i * (Math.PI * 2 / 7) + Math.sin(f * 0.01 + i) * 0.1;
      const rr = 14;
      g.fillStyle(0x4a3018, 0.7 * a);
      g.fillCircle(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.4 + 1, 2.5 + Math.sin(i * 1.7) * 0.8);
    }

    // Hole interior — dark void with mystic swirl
    g.fillStyle(0x000000, 0.95 * a);
    g.fillEllipse(0, 0, WORMHOLE_RADIUS * 2, WORMHOLE_RADIUS);

    // Inner gradient rings
    g.fillStyle(0x1a0a2a, 0.85 * a);
    g.fillEllipse(0, 0, WORMHOLE_RADIUS * 1.7, WORMHOLE_RADIUS * 0.85);
    g.fillStyle(0x2a1040, 0.7 * a);
    g.fillEllipse(0, 0, WORMHOLE_RADIUS * 1.4, WORMHOLE_RADIUS * 0.7);

    // Swirling mystic energy
    for (let r = 0; r < 3; r++) {
      const ang = f * 0.06 - r * 0.6;
      const rr = (WORMHOLE_RADIUS - 3) * (1 - r * 0.25);
      g.lineStyle(1.2, 0xa060ff, 0.45 * a * pulse);
      g.beginPath();
      const segs = 24;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sa = ang + t * Math.PI * 2;
        const sx = Math.cos(sa) * rr;
        const sy = Math.sin(sa) * rr * 0.5;
        if (s === 0) g.moveTo(sx, sy);
        else g.lineTo(sx, sy);
      }
      g.strokePath();
    }

    // Particle sparkles inside
    for (let i = 0; i < 5; i++) {
      const sa = f * 0.1 + i * 1.3;
      const sr = (WORMHOLE_RADIUS - 4) * (0.4 + ((f + i * 30) % 60) / 60 * 0.6);
      g.fillStyle(0xc080ff, 0.7 * a);
      g.fillCircle(Math.cos(sa) * sr, Math.sin(sa) * sr * 0.5, 1.5);
    }

    // Outer glow ring (active hint)
    g.lineStyle(2.5, 0xa060ff, 0.4 * a * pulse);
    g.strokeEllipse(0, 0, WORMHOLE_RADIUS * 2, WORMHOLE_RADIUS);
    g.lineStyle(1, 0xff80ff, 0.6 * a * pulse);
    g.strokeEllipse(0, 0, WORMHOLE_RADIUS * 2 + 3, WORMHOLE_RADIUS + 1);
  }
}
