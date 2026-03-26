import Phaser from 'phaser';
import { LANTERN_DURATION, LANTERN_BEAM_WIDTH, TAU } from '@/config';

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

    // Beams drawn on a separate graphics at scene level (not in container)
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

    const progress = 1 - this.timer / LANTERN_DURATION;
    const pulse = 0.7 + Math.sin(frame * 0.1) * 0.3;
    const beamAlpha = progress > 0.65 ? (1 - progress) / 0.35 : 1;

    // Light pool (drawn in container coords, so relative)
    g.fillStyle(0x00dcf0, 0.06 * pulse);
    g.fillCircle(0, 0, 50);
    g.fillStyle(0x00dcf0, 0.03 * pulse);
    g.fillCircle(0, 0, 80);

    // Beams (drawn in scene coords)
    bg.lineStyle(8, 0x00dcf0, 0.1 * beamAlpha * pulse);
    bg.beginPath();
    bg.moveTo(this.x, 0); bg.lineTo(this.x, this.canvasH);
    bg.moveTo(0, this.y); bg.lineTo(this.canvasW, this.y);
    bg.strokePath();

    bg.lineStyle(2, 0x00f0ff, 0.35 * beamAlpha * pulse);
    bg.beginPath();
    bg.moveTo(this.x, 0); bg.lineTo(this.x, this.canvasH);
    bg.moveTo(0, this.y); bg.lineTo(this.canvasW, this.y);
    bg.strokePath();

    // Lantern body
    g.fillStyle(0xffd700);
    g.fillRect(-4, -10, 8, 3); // top cap
    g.fillStyle(0x1a8a8a);
    g.fillRect(-5, -7, 10, 12); // frame
    g.fillStyle(0x00dcf0, 0.5 + Math.sin(frame * 0.15) * 0.3);
    g.fillRect(-4, -6, 8, 10); // glass
    g.fillStyle(0xffd700);
    g.fillRect(-4, 5, 8, 3); // bottom cap
    g.fillRect(-1.5, 8, 3, 5); // pole

    // Countdown ring
    if (progress > 0.65) {
      const angle = Phaser.Math.PI2 * ((progress - 0.65) / 0.35);
      g.lineStyle(2.5, 0xff3030);
      g.beginPath();
      g.arc(0, 0, 16, -Math.PI / 2, -Math.PI / 2 + angle, false);
      g.strokePath();
    }
  }

  destroy(fromScene?: boolean) {
    this.beamGfx.destroy();
    super.destroy(fromScene);
  }
}
