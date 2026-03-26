import Phaser from 'phaser';
import { MAX_FLOAT_TEXTS } from '@/config';

interface FloatEntry {
  text: Phaser.GameObjects.Text;
  life: number;
  maxLife: number;
}

export class FloatingTextManager {
  private scene: Phaser.Scene;
  private entries: FloatEntry[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  add(x: number, y: number, content: string, color: string, size = 14) {
    // Recycle oldest if at capacity
    if (this.entries.length >= MAX_FLOAT_TEXTS) {
      const oldest = this.entries.shift()!;
      oldest.text.destroy();
    }

    const text = this.scene.add.text(x, y, content, {
      fontSize: `${size}px`,
      color,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.entries.push({ text, life: 60, maxLife: 60 });
  }

  update() {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const e = this.entries[i];
      e.life--;
      const alpha = Math.max(0, e.life / e.maxLife);
      const scale = 1 + (1 - alpha) * 0.3;
      e.text.setAlpha(alpha);
      e.text.setScale(scale);
      e.text.y -= 0.8;

      if (e.life <= 0) {
        e.text.destroy();
        this.entries.splice(i, 1);
      }
    }
  }

  reset() {
    for (const e of this.entries) e.text.destroy();
    this.entries = [];
  }
}
