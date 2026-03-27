import Phaser from 'phaser';
import { AudioManager } from '@/audio/AudioManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.scale.refresh();
    const W = this.scale.width  || window.innerWidth;
    const H = this.scale.height || window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Dark overlay
    this.add.rectangle(cx, cy, W, H, 0x080f04, 0.92);

    // Title
    this.add.text(cx, cy - 95, '🌳 Squirrel Park 🌳', {
      fontSize: '36px',
      color: '#7fdb4f',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 48, 'Collect nuts & avoid foxes in the park!', {
      fontSize: '14px',
      color: '#8bba6f',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);

    // Divider
    this.add.rectangle(cx, cy - 24, 260, 1, 0x3a6a28);

    // Instructions — conditional on device type
    const instrStyle = {
      fontSize: '11px',
      color: '#7aad5a',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    };
    const labelStyle = {
      fontSize: '10px',
      color: '#4a7a35',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
    };

    if (isTouch) {
      this.add.text(cx, cy - 10, 'HOW TO PLAY', labelStyle).setOrigin(0.5);
      this.add.text(cx, cy + 8,  '👆 Drag anywhere to move', instrStyle).setOrigin(0.5);
      this.add.text(cx, cy + 24, '🏮 Tap the lantern button to stun foxes', instrStyle).setOrigin(0.5);
      this.add.text(cx, cy + 40, '🌰 Collect all nuts to reach the next level', instrStyle).setOrigin(0.5);
      this.add.text(cx, cy + 56, '🦊 Don\'t let the foxes catch you!', instrStyle).setOrigin(0.5);
    } else {
      this.add.text(cx, cy - 10, 'HOW TO PLAY', labelStyle).setOrigin(0.5);
      this.add.text(cx, cy + 8,  '⌨️ Arrow keys or WASD to move', instrStyle).setOrigin(0.5);
      this.add.text(cx, cy + 24, '🏮 Space or L to deploy a lantern & stun foxes', instrStyle).setOrigin(0.5);
      this.add.text(cx, cy + 40, '🌰 Collect all nuts to reach the next level', instrStyle).setOrigin(0.5);
      this.add.text(cx, cy + 56, '🦊 Don\'t let the foxes catch you!', instrStyle).setOrigin(0.5);
    }

    // Play button
    const btnBg = this.add.rectangle(cx, cy + 100, 140, 44, 0x4a8c3f);
    btnBg.setStrokeStyle(2, 0x5da04e);
    btnBg.setInteractive({ useHandCursor: true });

    this.add.text(cx, cy + 100, '▶  Play', {
      fontSize: '18px',
      color: '#fff',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x5da04e));
    btnBg.on('pointerout',  () => btnBg.setFillStyle(0x4a8c3f));

    btnBg.on('pointerdown', () => {
      // Request landscape lock on mobile (needs user gesture; silently ignored if unsupported)
      if (isTouch && screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as ScreenOrientation & { lock: (o: string) => Promise<void> })
          .lock('landscape').catch(() => {});
      }
      // Start audio in the background — if it fails (iOS restrictions etc.) the game
      // starts anyway. Never let audio init block or break navigation.
      AudioManager.init().catch(() => {});
      this.scene.start('GameScene');
    });
  }
}
