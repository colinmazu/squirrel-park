import Phaser from 'phaser';

export class InputManager {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private lKey!: Phaser.Input.Keyboard.Key;
  private rKey!: Phaser.Input.Keyboard.Key;
  private mKey!: Phaser.Input.Keyboard.Key;

  // Joystick
  private joyActive = false;
  private joyAngle = 0;
  private joyMag = 0;
  private joyZone: Phaser.GameObjects.Container | null = null;
  private joyThumb: Phaser.GameObjects.Arc | null = null;
  private joyBase: Phaser.GameObjects.Arc | null = null;
  private joyCenterX = 0;
  private joyCenterY = 0;
  private joyMaxR = 38;

  // Lantern deploy flag
  public deployPressed = false;
  private deployConsumed = false;

  // Touch device
  private isTouchDevice = false;

  create(scene: Phaser.Scene) {
    if (!scene.input.keyboard) return;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.mKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    // Detect touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (this.isTouchDevice) {
      this.createJoystick(scene);
    }
  }

  private createJoystick(scene: Phaser.Scene) {
    const gameW = scene.scale.width;
    const gameH = scene.scale.height;
    const cx = 70;
    const cy = gameH - 70;

    // Joystick base
    this.joyBase = scene.add.circle(cx, cy, 50, 0xffffff, 0.06);
    this.joyBase.setStrokeStyle(2, 0xffffff, 0.1);
    this.joyBase.setDepth(200);

    // Joystick thumb
    this.joyThumb = scene.add.circle(cx, cy, 18, 0xffffff, 0.15);
    this.joyThumb.setStrokeStyle(2, 0xffffff, 0.2);
    this.joyThumb.setDepth(201);

    this.joyCenterX = cx;
    this.joyCenterY = cy;

    // Lantern button (right side)
    const btnX = gameW - 60;
    const btnY = gameH - 60;
    const lanternBtnBg = scene.add.circle(btnX, btnY, 32, 0x00aacc, 0.15);
    lanternBtnBg.setStrokeStyle(2, 0x00ccee, 0.3);
    lanternBtnBg.setDepth(200);
    lanternBtnBg.setInteractive();
    lanternBtnBg.on('pointerdown', () => { this.deployPressed = true; });

    const lanternLabel = scene.add.text(btnX, btnY, '🏮', {
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(201);

    // Touch handling for joystick via scene pointer events
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < gameW / 2) {
        this.joyActive = true;
        this.joyCenterX = pointer.x;
        this.joyCenterY = pointer.y;
        if (this.joyBase) {
          this.joyBase.setPosition(pointer.x, pointer.y);
          this.joyBase.setVisible(true);
        }
        if (this.joyThumb) {
          this.joyThumb.setPosition(pointer.x, pointer.y);
          this.joyThumb.setVisible(true);
        }
      }
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.joyActive || !pointer.isDown) return;
      if (pointer.x >= gameW / 2) return; // only track left side

      const dx = pointer.x - this.joyCenterX;
      const dy = pointer.y - this.joyCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.joyMag = Math.min(dist / this.joyMaxR, 1);
      this.joyAngle = Math.atan2(dy, dx);

      const clampDist = Math.min(dist, this.joyMaxR);
      const nx = this.joyCenterX + (dx / (dist || 1)) * clampDist;
      const ny = this.joyCenterY + (dy / (dist || 1)) * clampDist;
      if (this.joyThumb) this.joyThumb.setPosition(nx, ny);
    });

    scene.input.on('pointerup', () => {
      this.joyActive = false;
      this.joyMag = 0;
      if (this.joyThumb && this.joyBase) {
        this.joyThumb.setPosition(this.joyCenterX, this.joyCenterY);
      }
    });
  }

  getMovement(): { x: number; y: number } {
    let mx = 0, my = 0;

    // Keyboard
    if (this.cursors?.left.isDown || this.wasd?.a?.isDown) mx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.d?.isDown) mx += 1;
    if (this.cursors?.up.isDown || this.wasd?.w?.isDown) my -= 1;
    if (this.cursors?.down.isDown || this.wasd?.s?.isDown) my += 1;

    // Joystick
    if (this.joyMag > 0.15) {
      mx += Math.cos(this.joyAngle) * this.joyMag;
      my += Math.sin(this.joyAngle) * this.joyMag;
    }

    // Normalize
    const len = Math.sqrt(mx * mx + my * my);
    if (len > 1) { mx /= len; my /= len; }

    return { x: mx, y: my };
  }

  isDeployPressed(): boolean {
    const keyPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
                       Phaser.Input.Keyboard.JustDown(this.lKey);
    const touchPressed = this.deployPressed;

    if (keyPressed || touchPressed) {
      this.deployPressed = false;
      return true;
    }
    return false;
  }

  isRestartPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.rKey);
  }

  isMutePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.mKey);
  }
}
