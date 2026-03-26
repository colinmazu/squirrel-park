import Phaser from 'phaser';

export class ScreenShake {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(camera: Phaser.Cameras.Scene2D.Camera) {
    this.camera = camera;
  }

  shake(intensity: number, duration: number = 150) {
    this.camera.shake(duration, intensity / 500);
  }
}
