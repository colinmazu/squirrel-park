import Phaser from 'phaser';
import { BASE_W, BASE_H } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { DebugScene } from './scenes/DebugScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: BASE_W,
  height: BASE_H,
  parent: 'game-container',
  backgroundColor: '#4a8c3a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene, DebugScene],
  render: {
    antialias: true,
    pixelArt: false,
  },
  input: {
    touch: {
      capture: true,
    },
  },
};

const game = new Phaser.Game(config);

// On mobile, orientationchange fires before the viewport has actually resized.
// Wait for the browser to settle, then tell Phaser to refit the canvas.
const onOrientationChange = () => setTimeout(() => game.scale.refresh(), 300);
window.addEventListener('orientationchange', onOrientationChange);
window.addEventListener('resize', () => game.scale.refresh());
