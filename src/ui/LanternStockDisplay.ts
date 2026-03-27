import Phaser from 'phaser';
import { MAX_LANTERNS } from '@/config';

export class LanternStockDisplay {
  private icons: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, canvasW: number) {
    for (let i = 0; i < MAX_LANTERNS; i++) {
      const icon = scene.add.text(canvasW - 90 - i * 22, 10, '🏮', {
        fontSize: '16px',
      }).setOrigin(1, 0).setDepth(96);
      this.icons.push(icon);
    }
  }

  update(stock: number) {
    for (let i = 0; i < this.icons.length; i++) {
      this.icons[i].setAlpha(i < stock ? 1 : 0.2);
    }
  }
}
