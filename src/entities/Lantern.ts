import Phaser from 'phaser';
import { LANTERN_DURATION, LANTERN_BEAM_WIDTH } from '@/config';

export class Lantern extends Phaser.GameObjects.Container {
  public timer: number = LANTERN_DURATION;
  private gfx: Phaser.GameObjects.Graphics;
  private beamGfx: Phaser.GameObjects.Graphics;
  private canvasW: number;
  private canvasH: number;

  constructor(scene: Phaser.Scene, x: number, y: number, canvasW: number, canvasH: number) {
    super(scene, x, y);
    this.canvasW = canvasW;
    this.canvasH = canvasH;

    this.beamGfx = scene.add.graphics();
    this.beamGfx.setDepth(6);

    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(9);
  }

  isExpired(): boolean {
    return this.timer <= 0;
  }

  isOnBeam(px: number, py: number): boolean {
    return Math.abs(px - this.x) < LANTERN_BEAM_WIDTH || Math.abs(py - this.y) < LANTERN_BEAM_WIDTH;
  }

  update() {
    this.timer--;
  }

  draw(frame: number) {
    const g = this.gfx;
    const bg = this.beamGfx;
    g.clear();
    bg.clear();

    const progress  = 1 - this.timer / LANTERN_DURATION;
    const pulse     = 0.7 + Math.sin(frame * 0.10) * 0.30;
    const flickerA  = 0.85 + Math.sin(frame * 0.23) * 0.15;
    const flickerB  = 0.90 + Math.sin(frame * 0.31 + 1.2) * 0.10;
    const beamAlpha = progress > 0.65 ? (1 - progress) / 0.35 : 1;

    // ── GLOW HALOS ────────────────────────────────────────────────────────────
    g.fillStyle(0x00f0ff, 0.022 * pulse);
    g.fillCircle(0, 0, 100);
    g.fillStyle(0x00dcf0, 0.042 * pulse);
    g.fillCircle(0, 0, 65);
    g.fillStyle(0x00dcf0, 0.07 * pulse);
    g.fillCircle(0, 0, 45);

    // ── BEAMS ────────────────────────────────────────────────────────────────
    bg.lineStyle(18, 0x00dcf0, 0.04 * beamAlpha * pulse);
    bg.beginPath();
    bg.moveTo(this.x, 0);       bg.lineTo(this.x, this.canvasH);
    bg.moveTo(0, this.y);       bg.lineTo(this.canvasW, this.y);
    bg.strokePath();

    bg.lineStyle(8, 0x00dcf0, 0.10 * beamAlpha * pulse);
    bg.beginPath();
    bg.moveTo(this.x, 0);       bg.lineTo(this.x, this.canvasH);
    bg.moveTo(0, this.y);       bg.lineTo(this.canvasW, this.y);
    bg.strokePath();

    bg.lineStyle(2, 0x00f8ff, 0.50 * beamAlpha * pulse * flickerA);
    bg.beginPath();
    bg.moveTo(this.x, 0);       bg.lineTo(this.x, this.canvasH);
    bg.moveTo(0, this.y);       bg.lineTo(this.canvasW, this.y);
    bg.strokePath();

    // ── LANTERN BODY ─────────────────────────────────────────────────────────

    // Hanging chain
    g.lineStyle(1, 0xbbbbbb, 0.65);
    g.lineBetween(0, -14, 0, -19);
    g.fillStyle(0xcccccc, 0.75);
    g.fillCircle(0, -20, 2.2);

    // Top ornate cap
    g.fillStyle(0xe8c010);
    g.fillEllipse(0, -12, 11, 4);
    g.fillStyle(0xffd700);
    g.fillRect(-3, -13, 6, 2);
    g.fillEllipse(0, -13, 8, 3);

    // Frame outer body
    g.fillStyle(0x145e5e);
    g.fillRect(-6, -10, 12, 16);

    // Vertical frame bars (structural detail)
    g.fillStyle(0x0e4848);
    g.fillRect(-6, -10, 2, 16);
    g.fillRect( 4, -10, 2, 16);

    // Horizontal frame bars
    g.fillRect(-6, -10, 12, 2);
    g.fillRect(-6,   4, 12, 2);

    // Corner rivets
    g.fillStyle(0xffd700, 0.7);
    g.fillCircle(-5, -9, 1.2);
    g.fillCircle( 5, -9, 1.2);
    g.fillCircle(-5,  5, 1.2);
    g.fillCircle( 5,  5, 1.2);

    // Glass panels
    const glowAlpha = 0.42 + Math.sin(frame * 0.15) * 0.25;
    g.fillStyle(0x00dcf0, glowAlpha * flickerA);
    g.fillRect(-4, -8, 8, 12);

    // Inner flame core
    g.fillStyle(0x60f0ff, 0.65 * flickerB);
    g.fillEllipse(0, -3, 5, 9);
    g.fillStyle(0xb0f8ff, 0.45 * flickerA);
    g.fillEllipse(0, -5, 3, 5);
    g.fillStyle(0xffffff, 0.30 * flickerB);
    g.fillEllipse(0, -6, 2, 3);

    // Bottom ornate cap
    g.fillStyle(0xffd700);
    g.fillRect(-3,  6, 6, 3);
    g.fillEllipse(0, 10, 11, 4);
    // Pole
    g.fillStyle(0xbbaa20);
    g.fillRect(-1.5, 10, 3, 5);
    g.fillStyle(0xffd700);
    g.fillEllipse(0, 16, 6, 3);

    // ── COUNTDOWN RING ────────────────────────────────────────────────────────
    if (progress > 0.65) {
      const angle = Phaser.Math.PI2 * ((progress - 0.65) / 0.35);
      g.lineStyle(5, 0xff0000, 0.18);
      g.beginPath();
      g.arc(0, 0, 21, -Math.PI / 2, -Math.PI / 2 + angle, false);
      g.strokePath();
      g.lineStyle(2, 0xff3030, 0.90);
      g.beginPath();
      g.arc(0, 0, 20, -Math.PI / 2, -Math.PI / 2 + angle, false);
      g.strokePath();
    }
  }

  destroy(fromScene?: boolean) {
    this.beamGfx.destroy();
    super.destroy(fromScene);
  }
}
