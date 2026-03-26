import { COMBO_WINDOW, MAX_COMBO_MULT } from '@/config';

export class ComboManager {
  public count = 0;
  public timer = 0;

  hit() {
    if (this.timer > 0) {
      this.count++;
    } else {
      this.count = 1;
    }
    this.timer = COMBO_WINDOW;
  }

  getMultiplier(): number {
    return Math.min(this.count, MAX_COMBO_MULT);
  }

  update() {
    if (this.timer > 0) {
      this.timer--;
      if (this.timer <= 0) this.count = 0;
    }
  }

  reset() {
    this.count = 0;
    this.timer = 0;
  }
}
