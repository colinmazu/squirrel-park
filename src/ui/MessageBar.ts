import Phaser from 'phaser';

export class MessageBar {
  private text: Phaser.GameObjects.Text;
  private timer: Phaser.Time.TimerEvent | null = null;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, canvasW: number, canvasH: number) {
    this.scene = scene;
    this.text = scene.add.text(canvasW / 2, canvasH + 14, '', {
      fontSize: '13px',
      color: '#b8d4a0',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5, 0).setDepth(96);
  }

  show(msg: string, duration = 3000) {
    this.text.setText(msg);
    if (this.timer) this.timer.destroy();
    this.timer = this.scene.time.delayedCall(duration, () => {
      this.text.setText('');
    });
  }

  clear() {
    this.text.setText('');
  }
}
