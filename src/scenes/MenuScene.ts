import Phaser from 'phaser';
import { AudioManager } from '@/audio/AudioManager';
import { BASE_W, BASE_H } from '@/config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const cx = BASE_W / 2;
    const cy = BASE_H / 2;

    // Dark overlay
    this.add.rectangle(cx, cy, BASE_W, BASE_H, 0x080f04, 0.92);

    // Title
    const title = this.add.text(cx, cy - 80, '🌳 Squirrel Park 🌳', {
      fontSize: '36px',
      color: '#7fdb4f',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 30, 'Collect nuts & avoid foxes in the park!', {
      fontSize: '14px',
      color: '#8bba6f',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);

    // Controls info
    this.add.text(cx, cy + 5, 'Arrow keys / WASD to move • Space to deploy lantern', {
      fontSize: '11px',
      color: '#6a9a50',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);

    this.add.text(cx, cy + 22, 'Touch joystick on mobile', {
      fontSize: '11px',
      color: '#6a9a50',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);

    // Play button
    const btnBg = this.add.rectangle(cx, cy + 70, 140, 44, 0x4a8c3f);
    btnBg.setStrokeStyle(2, 0x5da04e);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(cx, cy + 70, '▶  Play', {
      fontSize: '18px',
      color: '#fff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x5da04e);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x4a8c3f);
    });

    btnBg.on('pointerdown', async () => {
      // Init audio on user gesture
      await AudioManager.init();
      this.scene.start('GameScene');
    });
  }
}
