import Phaser from 'phaser';
import { BASE_W, BASE_H } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: BASE_W,
  height: BASE_H,
  parent: 'game-container',
  backgroundColor: '#4a8c3a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene],
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

new Phaser.Game(config);
