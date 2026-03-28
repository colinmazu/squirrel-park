import Phaser from 'phaser';

export class Fox extends Phaser.GameObjects.Container {
  public stunTimer = 0;
  public spawnAnim = 15;
  private gfx: Phaser.GameObjects.Graphics;

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
    const g = this.gfx;
    g.clear();

    // Spawn warning
    if (this.spawnAnim > 0) {
      const warnPulse = 0.5 + Math.sin(frame * 0.4) * 0.3;
      g.fillStyle(0xff4757, warnPulse);
      g.fillCircle(0, -22, 8);
      g.fillStyle(0xffffff, 0.95);
      g.fillRect(-1.5, -27, 3, 8);
      g.fillCircle(0, -17, 2);
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
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(3, 21, 34, 12);

    // ── HAUNCHES / LEGS ───────────────────────────────────────────────────────
    g.fillStyle(0xb85420);
    g.fillEllipse(-8, 14, 11, 9);
    g.fillEllipse( 8, 14, 11, 9);
    // Paws
    g.fillStyle(0xf0c090);
    g.fillEllipse(-9, 19, 9, 5);
    g.fillEllipse( 9, 19, 9, 5);
    // Paw claws
    g.lineStyle(0.8, 0x3a1a0a, 0.7);
    for (let c = -1; c <= 1; c++) {
      g.lineBetween(-9 + c * 2, 21, -9.5 + c * 2.5, 24);
      g.lineBetween( 9 + c * 2, 21,  9.5 + c * 2.5, 24);
    }

    // ── BODY ─────────────────────────────────────────────────────────────────
    g.fillStyle(0xb85020, 0.5);
    g.fillEllipse(2, 1, 29, 22);  // shadow layer
    g.fillStyle(0xd4652b);
    g.fillEllipse(0, 0, 27, 20);
    g.fillStyle(0xe87840, 0.30);
    g.fillEllipse(-4, -4, 16, 12); // top highlight

    // Belly
    g.fillStyle(0xf0c090);
    g.fillEllipse(0, 3, 17, 12);
    g.fillStyle(0xffd8a0, 0.45);
    g.fillEllipse(-1, 1, 10, 7);

    // Dorsal darker marking
    g.fillStyle(0xa04018, 0.30);
    g.fillEllipse(0, -5, 13, 6);

    // ── TAIL ─────────────────────────────────────────────────────────────────
    g.lineStyle(6, 0xd4652b, 0.9);
    g.beginPath();
    g.moveTo(0, 8); g.lineTo(-4, 12); g.lineTo(-9, 13);
    g.lineTo(-14, 9); g.lineTo(-16, 4); g.lineTo(-15, 0);
    g.strokePath();

    g.fillStyle(0xd4652b);
    g.fillCircle(-16, 1, 8);
    g.fillStyle(0xe87840, 0.55);
    g.fillCircle(-16, 0, 5.5);
    g.fillStyle(0xffffff);
    g.fillCircle(-17, -1, 4);
    g.fillStyle(0xfff0e0, 0.7);
    g.fillCircle(-17, -0.5, 2.2);

    // ── HEAD ─────────────────────────────────────────────────────────────────
    const headY = -14;
    g.fillStyle(0xb85028, 0.5);
    g.fillEllipse(1, headY + 1, 22, 20);
    g.fillStyle(0xe8803c);
    g.fillEllipse(0, headY, 21, 19);
    g.fillStyle(0xffa050, 0.22);
    g.fillEllipse(-4, headY - 4, 12, 9);

    // Snout
    g.fillStyle(0xf0c090);
    g.fillEllipse(0, headY + 5, 12, 10);
    g.fillStyle(0xd0a070, 0.35);
    g.fillEllipse(2, headY + 7, 9, 5);

    // Nose
    g.fillStyle(0x2a1a0a);
    g.fillEllipse(0, headY + 2, 6, 4);
    g.fillStyle(0xffffff, 0.45);
    g.fillCircle(-1, headY + 1, 1.2);

    // ── EARS ─────────────────────────────────────────────────────────────────
    for (let side = -1; side <= 1; side += 2) {
      g.fillStyle(0x333030);
      g.fillTriangle(side * 7, headY - 8, side * 14, headY - 22, side * 2, headY - 10);
      g.fillStyle(0xd4652b);
      g.fillTriangle(side * 6, headY - 7, side * 12, headY - 19, side * 2, headY - 9);
      g.fillStyle(0xff9090, 0.60);
      g.fillTriangle(side * 7, headY - 9, side * 10, headY - 17, side * 4, headY - 11);
    }

    // ── EYES ─────────────────────────────────────────────────────────────────
    g.fillStyle(0xffffff);
    g.fillEllipse(-4, headY - 1, 7, 8);
    g.fillEllipse( 4, headY - 1, 7, 8);
    g.fillStyle(isMagicMode ? 0xff0000 : 0x1a1a1a);
    g.fillCircle(-4, headY - 1, 2.2);
    g.fillCircle( 4, headY - 1, 2.2);
    // Eye shine
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(-3, headY - 3, 1.2);
    g.fillCircle( 5, headY - 3, 1.2);

    // Whiskers
    g.lineStyle(0.7, 0xffffff, 0.50);
    for (let side = -1; side <= 1; side += 2) {
      for (let wi = 0; wi < 3; wi++) {
        const wy = headY + 3 + (wi - 1) * 2.5;
        g.lineBetween(side * 2, wy, side * 15, wy + (wi - 1) * 1.5);
      }
    }

    // ── STUN STARS ───────────────────────────────────────────────────────────
    if (this.stunTimer > 0) {
      for (let i = 0; i < 4; i++) {
        const sa = frame * 0.15 + i * (Math.PI * 2 / 4);
        const sx = Math.cos(sa) * 17;
        const sy = headY - 25 + Math.sin(sa) * 5;
        g.fillStyle(0xffd700);
        g.fillCircle(sx, sy, 3.5);
        g.fillStyle(0xffee00);
        g.fillCircle(sx, sy, 2.2);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(sx, sy, 1.0);
        g.lineStyle(1, 0xffd700, 0.8);
        for (let r = 0; r < 4; r++) {
          const ra = sa + r * Math.PI / 2;
          g.lineBetween(sx, sy, sx + Math.cos(ra) * 5.5, sy + Math.sin(ra) * 5.5);
        }
      }
    }
  }

  getHitRadius(): number {
    return 15;
  }
}
