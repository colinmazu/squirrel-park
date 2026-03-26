import Phaser from 'phaser';

export class Fox extends Phaser.GameObjects.Container {
  public stunTimer = 0;
  public spawnAnim = 15;
  private gfx: Phaser.GameObjects.Graphics;
  private frame = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(10);
  }

  chase(targetX: number, targetY: number, speed: number) {
    if (this.spawnAnim > 0) { this.spawnAnim--; return; }
    if (this.stunTimer > 0) { this.stunTimer--; return; }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
  }

  stun(duration: number) {
    this.stunTimer = duration;
  }

  bounceFrom(lx: number, ly: number, distance: number) {
    const dx = this.x - lx;
    const dy = this.y - ly;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.x += (dx / dist) * distance;
    this.y += (dy / dist) * distance;
  }

  draw(frame: number, isMagicMode: boolean) {
    this.frame = frame;
    const g = this.gfx;
    g.clear();

    // Spawn warning
    if (this.spawnAnim > 0) {
      g.fillStyle(0xff4757, 0.5 + Math.sin(frame * 0.4) * 0.3);
      // Just draw a "!" indicator
      const style = { fontSize: '18px', color: '#ff4757', fontStyle: 'bold' };
      // We'll use graphics for the warning dot instead
      g.fillCircle(0, -20, 6);
      g.fillStyle(0xffffff);
      g.fillRect(-1.5, -25, 3, 7);
      g.fillCircle(0, -15, 1.5);
      return;
    }

    if (isMagicMode) {
      g.setAlpha(0.55);
      if (frame % 3 === 0) {
        g.setPosition((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
      }
    } else {
      g.setAlpha(1);
      g.setPosition(0, 0);
    }

    if (this.stunTimer > 0) {
      g.setPosition((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    }

    // Shadow
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(2, 18, 28, 10);

    // Body
    g.fillStyle(0xd4652b);
    g.fillEllipse(0, 0, 26, 20);
    // Belly
    g.fillStyle(0xf0c090);
    g.fillEllipse(0, 3, 16, 10);

    // Head
    const headY = -14;
    g.fillStyle(0xe8803c);
    g.fillEllipse(0, headY, 20, 18);
    // Snout
    g.fillStyle(0xf0c090);
    g.fillEllipse(0, headY + 5, 10, 8);
    // Nose
    g.fillStyle(0x2a1a0a);
    g.fillCircle(0, headY + 2, 2);

    // Ears
    for (let side = -1; side <= 1; side += 2) {
      g.fillStyle(0xffffff);
      g.fillTriangle(side * 6, headY - 7, side * 11, headY - 18, side * 2, headY - 9);
      g.fillStyle(0xd4652b);
      g.fillTriangle(side * 7, headY - 9, side * 10, headY - 16, side * 4, headY - 10);
    }

    // Eyes
    g.fillStyle(0xffffff);
    g.fillEllipse(-4, headY - 1, 6, 7);
    g.fillEllipse(4, headY - 1, 6, 7);
    g.fillStyle(isMagicMode ? 0xff0000 : 0x1a1a1a);
    g.fillCircle(-4, headY - 1, 1.5);
    g.fillCircle(4, headY - 1, 1.5);

    // Tail
    g.lineStyle(4, 0xd4652b);
    g.beginPath();
    g.moveTo(0, 8);
    // Approximate bezier
    g.lineTo(-4, 11);
    g.lineTo(-9, 12);
    g.lineTo(-13, 8);
    g.lineTo(-12, 4);
    g.lineTo(-12, 2);
    g.strokePath();
    g.fillStyle(0xffffff);
    g.fillCircle(-12, 2, 3);

    // Stun stars
    if (this.stunTimer > 0) {
      for (let i = 0; i < 3; i++) {
        const sa = frame * 0.15 + i * (Math.PI * 2) / 3;
        const sx = Math.cos(sa) * 14;
        const sy = headY - 22 + Math.sin(sa) * 4;
        g.fillStyle(0xffd700);
        // Simple star shape
        g.fillCircle(sx, sy, 3);
        g.fillStyle(0xffee00);
        g.fillCircle(sx, sy, 1.5);
      }
    }
  }

  getHitRadius(): number {
    return 15;
  }
}
