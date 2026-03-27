import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { DebugScene } from './scenes/DebugScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#4a8c3a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // No explicit width/height — RESIZE reads the container size immediately,
    // avoiding the mismatch where scenes layout at 750×422 before the canvas
    // has actually expanded to fill the screen.
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

// After orientation settles, refresh the canvas size and restart the menu if
// it's the active scene so it re-layouts at the new dimensions.
const onOrientationChange = () => setTimeout(() => {
  game.scale.refresh();
  const active = game.scene.getScenes(true)[0];
  if (active?.scene.key === 'MenuScene') active.scene.restart();
}, 300);

window.addEventListener('orientationchange', onOrientationChange);
window.addEventListener('resize', () => game.scale.refresh());
