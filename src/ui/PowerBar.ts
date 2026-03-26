import Phaser from 'phaser';

export class PowerBar {
  private gfx: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private w: number;
  private h: number;

  constructor(scene: Phaser.Scene, canvasW: number, canvasH: number) {
    this.w = canvasW;
    this.h = canvasH;
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(95);
    this.label = scene.add.text(canvasW / 2, canvasH - 21, '', {
      fontSize: '10px',
      color: '#fff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(96);
  }

  draw(magicProgress: number, treacleProgress: number, frame: number) {
    this.gfx.clear();
    this.label.setText('');

    const barW = this.w * 0.5;
    const barH = 8;
    const barX = (this.w - barW) / 2;
    const barY = this.h - 18;

    if (magicProgress > 0) {
      // Background
      this.gfx.fillStyle(0x000000, 0.3);
      this.gfx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      // Rainbow bar
      const segments = 20;
      const fillW = barW * magicProgress;
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        if (t > magicProgress) break;
        const hue = ((frame * 10) + t * 360) % 360;
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.55);
        const segW = fillW / segments;
        this.gfx.fillStyle(color.color);
        this.gfx.fillRect(barX + i * segW, barY, segW + 1, barH);
      }

      this.label.setText('MAGIC');
      this.label.setY(barY - 5);
    } else if (treacleProgress > 0) {
      this.gfx.fillStyle(0x000000, 0.3);
      this.gfx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      this.gfx.fillStyle(0xd4a017, 0.5 + treacleProgress * 0.5);
      this.gfx.fillRect(barX, barY, barW * treacleProgress, barH);

      this.label.setText('TREACLE');
      this.label.setY(barY - 5);
    }
  }
}
