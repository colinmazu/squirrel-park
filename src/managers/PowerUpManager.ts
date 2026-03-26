import {
  MAGIC_DURATION, TREACLE_DURATION, INVINCIBILITY_DURATION,
  PLAYER_SPEED, MAGIC_SPEED_MULT, TREACLE_SPEED_MULT,
  FOX_TREACLE_SPEED_MULT,
} from '@/config';
import { MusicSequencer, MusicMode } from '@/audio/MusicSequencer';

export class PowerUpManager {
  public magicTimer = 0;
  public treacleTimer = 0;
  public invincTimer = 0;

  activateMagic() {
    this.magicTimer = MAGIC_DURATION;
    this.treacleTimer = 0; // cancel treacle
    MusicSequencer.setMode('magic');
  }

  activateTreacle() {
    if (this.magicTimer > 0) return false; // magic protects
    this.treacleTimer = TREACLE_DURATION;
    MusicSequencer.setMode('treacle');
    return true;
  }

  activateInvincibility() {
    this.invincTimer = INVINCIBILITY_DURATION;
  }

  isMagic(): boolean { return this.magicTimer > 0; }
  isTreacle(): boolean { return this.treacleTimer > 0 && this.magicTimer <= 0; }
  isInvincible(): boolean { return this.invincTimer > 0 || this.magicTimer > 0; }

  getSpeedMultiplier(): number {
    if (this.magicTimer > 0) return MAGIC_SPEED_MULT;
    if (this.treacleTimer > 0) return TREACLE_SPEED_MULT;
    return 1;
  }

  getFoxSpeedMultiplier(): number {
    if (this.isTreacle()) return FOX_TREACLE_SPEED_MULT;
    return 1;
  }

  getMagicProgress(): number {
    return this.magicTimer / MAGIC_DURATION;
  }

  getTreacleProgress(): number {
    return this.treacleTimer / TREACLE_DURATION;
  }

  update() {
    if (this.magicTimer > 0) {
      this.magicTimer--;
      if (this.magicTimer <= 0) {
        MusicSequencer.setMode('normal');
      }
    }
    if (this.treacleTimer > 0 && this.magicTimer <= 0) {
      this.treacleTimer--;
      if (this.treacleTimer <= 0) {
        MusicSequencer.setMode('normal');
      }
    }
    if (this.invincTimer > 0) this.invincTimer--;
  }

  getMode(): 'normal' | 'magic' | 'treacle' {
    if (this.magicTimer > 0) return 'magic';
    if (this.treacleTimer > 0) return 'treacle';
    return 'normal';
  }

  reset() {
    this.magicTimer = 0;
    this.treacleTimer = 0;
    this.invincTimer = 0;
  }
}
