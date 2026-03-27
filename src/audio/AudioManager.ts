import * as Tone from 'tone';

class AudioManagerSingleton {
  private _initialized = false;
  private _muted = false;
  public musicBus!: Tone.Channel;
  public sfxBus!: Tone.Channel;
  public reverb!: Tone.Reverb;

  get initialized() { return this._initialized; }
  get muted() { return this._muted; }

  async init() {
    if (this._initialized) return;
    await Tone.start();

    // Master compressor
    const compressor = new Tone.Compressor({
      threshold: -18,
      ratio: 4,
      attack: 0.003,
      release: 0.15,
    }).toDestination();

    // Reverb
    this.reverb = new Tone.Reverb({ decay: 1.8, wet: 0.18 });
    await this.reverb.generate();
    this.reverb.connect(compressor);

    // Music bus
    this.musicBus = new Tone.Channel({ volume: -5 });
    this.musicBus.connect(compressor);
    this.musicBus.connect(this.reverb);

    // SFX bus
    this.sfxBus = new Tone.Channel({ volume: -2 });
    this.sfxBus.connect(compressor);

    Tone.getDestination().volume.value = -3;

    this._initialized = true;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    Tone.getDestination().mute = this._muted;
    return this._muted;
  }

  setMuted(val: boolean) {
    this._muted = val;
    Tone.getDestination().mute = val;
  }
}

export const AudioManager = new AudioManagerSingleton();
