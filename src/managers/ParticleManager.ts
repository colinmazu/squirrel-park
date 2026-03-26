import Phaser from 'phaser';
import { MAX_PARTICLES, TAU } from '@/config';

interface Particle {
  active: boolean;
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: number; alpha: number;
  r: number;
  grav: number;
}

export class ParticleManager {
  private pool: Particle[] = [];
  private gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(80);
    // Pre-allocate pool
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push({
        active: false, x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 1, color: 0xffffff, alpha: 1, r: 2, grav: 0,
      });
    }
  }

  emit(x: number, y: number, vx: number, vy: number, life: number, color: number, r = 2, grav = 0.05) {
    for (const p of this.pool) {
      if (!p.active) {
        p.active = true;
        p.x = x; p.y = y;
        p.vx = vx; p.vy = vy;
        p.life = life; p.maxLife = life;
        p.color = color; p.r = r; p.grav = grav;
        return;
      }
    }
    // Pool full - recycle first
    const p = this.pool[0];
    p.active = true;
    p.x = x; p.y = y;
    p.vx = vx; p.vy = vy;
    p.life = life; p.maxLife = life;
    p.color = color; p.r = r; p.grav = grav;
  }

  burst(x: number, y: number, count: number, color: number, speed = 3, life = 30, r = 2) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const s = Math.random() * speed;
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, life, color, r, 0.05);
    }
  }

  rainbowBurst(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const s = 1 + Math.random() * 3;
      const hue = (i / count) * 360;
      const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.65);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, 50, color.color, 2.5, 0.03);
    }
  }

  update() {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.grav;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life--;
      if (p.life <= 0) p.active = false;
    }
  }

  draw() {
    this.gfx.clear();
    for (const p of this.pool) {
      if (!p.active) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      this.gfx.fillStyle(p.color, alpha);
      this.gfx.fillCircle(p.x, p.y, p.r * alpha);
    }
  }

  reset() {
    for (const p of this.pool) p.active = false;
  }
}
