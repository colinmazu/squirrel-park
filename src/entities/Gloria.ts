import Phaser from 'phaser';

export type GloriaState = 'entering' | 'digging' | 'submerged' | 'emerging' | 'leaving' | 'done';

/**
 * Gloria the Rabbit — the burrowing wormhole digger.
 * State machine:
 *   entering  : hops in from screen edge toward the entry dig spot
 *   digging   : burrows in (shrinks downward)
 *   submerged : invisible while travelling underground
 *   emerging  : pops up at the exit hole
 *   leaving   : hops away off-screen
 *   done      : sequence complete (caller should remove)
 */
export class Gloria extends Phaser.GameObjects.Container {
  public state: GloriaState = 'entering';
  public stateTimer = 0;
  public entryX: number;
  public entryY: number;
  public exitX: number;
  public exitY: number;
  private spawnX: number;
  private spawnY: number;
  private leaveTargetX: number;
  private leaveTargetY: number;
  private gfx: Phaser.GameObjects.Graphics;
  private hopPhase = 0;
  private digSink = 0;     // 0 → 1 sink amount during dig animation
  private emergeRise = 0;  // 0 → 1 rise amount during emerge animation
  private earWag = 0;
  private canvasW: number;
  private canvasH: number;

  constructor(
    scene: Phaser.Scene,
    entryX: number, entryY: number,
    exitX: number,  exitY: number,
    canvasW: number, canvasH: number,
  ) {
    super(scene, 0, 0);
    this.entryX = entryX;
    this.entryY = entryY;
    this.exitX = exitX;
    this.exitY = exitY;
    this.canvasW = canvasW;
    this.canvasH = canvasH;

    // Pick a spawn point off-screen on whichever side is closer to the entry
    const fromLeft = entryX < canvasW * 0.5;
    this.spawnX = fromLeft ? -40 : canvasW + 40;
    this.spawnY = entryY + (Math.random() - 0.5) * 30;

    // Pick a leave point off-screen on whichever side is closer to the exit
    const leaveLeft = exitX < canvasW * 0.5;
    this.leaveTargetX = leaveLeft ? -40 : canvasW + 40;
    this.leaveTargetY = exitY + (Math.random() - 0.5) * 30;

    this.x = this.spawnX;
    this.y = this.spawnY;

    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(11);
  }

  update() {
    this.stateTimer++;
    this.hopPhase += 0.2;

    switch (this.state) {
      case 'entering': {
        // Hop toward the entry hole
        const dx = this.entryX - this.x;
        const dy = this.entryY - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 4) {
          this.x = this.entryX;
          this.y = this.entryY;
          this.state = 'digging';
          this.stateTimer = 0;
        } else {
          const speed = 2.6;
          this.x += (dx / d) * speed;
          this.y += (dy / d) * speed;
        }
        break;
      }
      case 'digging': {
        // Burrow into the ground over 50 frames
        this.digSink = Math.min(this.stateTimer / 50, 1);
        if (this.digSink >= 1) {
          this.state = 'submerged';
          this.stateTimer = 0;
          this.x = this.exitX;
          this.y = this.exitY;
        }
        break;
      }
      case 'submerged': {
        // Brief travel time underground (45 frames)
        if (this.stateTimer > 45) {
          this.state = 'emerging';
          this.stateTimer = 0;
          this.emergeRise = 0;
        }
        break;
      }
      case 'emerging': {
        // Pop up out of exit hole over 45 frames
        this.emergeRise = Math.min(this.stateTimer / 45, 1);
        if (this.emergeRise >= 1) {
          this.state = 'leaving';
          this.stateTimer = 0;
        }
        break;
      }
      case 'leaving': {
        // Hop away
        const dx = this.leaveTargetX - this.x;
        const dy = this.leaveTargetY - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 5) {
          this.state = 'done';
        } else {
          const speed = 3.0;
          this.x += (dx / d) * speed;
          this.y += (dy / d) * speed;
        }
        break;
      }
    }

    this.earWag = Math.sin(this.hopPhase * 0.5) * 0.08;
  }

  draw() {
    const g = this.gfx;
    g.clear();

    // Hidden underground
    if (this.state === 'submerged') return;

    // Hop bounce — only when actively hopping
    let bounce = 0;
    if (this.state === 'entering' || this.state === 'leaving') {
      bounce = Math.abs(Math.sin(this.hopPhase)) * -6;
    }

    // Vertical offset for digging / emerging
    let yOff = bounce;
    let scaleY = 1;
    if (this.state === 'digging') {
      yOff = bounce + this.digSink * 22;
      scaleY = 1 - this.digSink * 0.7;
    } else if (this.state === 'emerging') {
      yOff = bounce + (1 - this.emergeRise) * 22;
      scaleY = 0.3 + this.emergeRise * 0.7;
    }

    // Shadow on ground (always at base level, fades during dig)
    if (this.state !== 'emerging' && this.state !== 'digging') {
      g.fillStyle(0x000000, 0.18);
      g.fillEllipse(2, 18, 26, 8);
    }

    // Body parts shifted by yOff and scaled by scaleY
    const ear = this.earWag;

    // ── EARS (drawn first so head sits in front) ────────────────────────────
    const earH = 18 * scaleY;
    g.fillStyle(0xfafafa);
    // Left ear
    g.fillEllipse(-5 + ear * 3, -22 * scaleY + yOff, 5, earH);
    // Right ear
    g.fillEllipse( 5 - ear * 3, -22 * scaleY + yOff, 5, earH);
    // Inner ear (pink)
    g.fillStyle(0xffb0c0, 0.85);
    g.fillEllipse(-5 + ear * 3, -22 * scaleY + yOff, 2.5, earH * 0.75);
    g.fillEllipse( 5 - ear * 3, -22 * scaleY + yOff, 2.5, earH * 0.75);

    // ── BODY (chubby fluffy rabbit) ──────────────────────────────────────────
    g.fillStyle(0xe8e8e8, 0.55);
    g.fillEllipse(2, 4 * scaleY + yOff, 26, 18 * scaleY);
    g.fillStyle(0xffffff);
    g.fillEllipse(0, 2 * scaleY + yOff, 24, 17 * scaleY);
    // Belly
    g.fillStyle(0xf0f0f0);
    g.fillEllipse(0, 6 * scaleY + yOff, 16, 10 * scaleY);

    // ── TAIL POOF ────────────────────────────────────────────────────────────
    g.fillStyle(0xffffff);
    g.fillCircle(-13, 3 * scaleY + yOff, 4.5);
    g.fillStyle(0xf0f0f0, 0.8);
    g.fillCircle(-13, 2 * scaleY + yOff, 3);

    // ── HEAD ─────────────────────────────────────────────────────────────────
    g.fillStyle(0xffffff);
    g.fillEllipse(0, -10 * scaleY + yOff, 17, 14 * scaleY);
    g.fillStyle(0xf0f0f0, 0.5);
    g.fillEllipse(-3, -12 * scaleY + yOff, 10, 8 * scaleY);

    // ── EYES ─────────────────────────────────────────────────────────────────
    g.fillStyle(0x1a1a1a);
    g.fillEllipse(-4, -10 * scaleY + yOff, 2.5, 3.5);
    g.fillEllipse( 4, -10 * scaleY + yOff, 2.5, 3.5);
    // Eye shine
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-3.5, -11 * scaleY + yOff, 0.9);
    g.fillCircle( 4.5, -11 * scaleY + yOff, 0.9);

    // ── NOSE (pink) ──────────────────────────────────────────────────────────
    g.fillStyle(0xff7090);
    g.fillEllipse(0, -7 * scaleY + yOff, 3, 2);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(-0.5, -7.5 * scaleY + yOff, 0.7);

    // ── MOUTH ────────────────────────────────────────────────────────────────
    g.lineStyle(0.8, 0x553344, 0.7);
    g.lineBetween(0, -6 * scaleY + yOff, -1.5, -4.5 * scaleY + yOff);
    g.lineBetween(0, -6 * scaleY + yOff,  1.5, -4.5 * scaleY + yOff);

    // ── FRONT TEETH ──────────────────────────────────────────────────────────
    g.fillStyle(0xffffff);
    g.fillRect(-1.5, -5 * scaleY + yOff, 3, 2.5);
    g.lineStyle(0.5, 0xcccccc, 0.7);
    g.lineBetween(0, -5 * scaleY + yOff, 0, -2.5 * scaleY + yOff);

    // ── WHISKERS ─────────────────────────────────────────────────────────────
    g.lineStyle(0.6, 0x888888, 0.5);
    for (let s = -1; s <= 1; s += 2) {
      for (let i = -1; i <= 1; i++) {
        g.lineBetween(s * 2, -7 * scaleY + yOff + i * 1.2, s * 12, -7 * scaleY + yOff + i * 2);
      }
    }

    // ── FEET ─────────────────────────────────────────────────────────────────
    if (scaleY > 0.5) {
      g.fillStyle(0xffffff);
      g.fillEllipse(-7, 14 * scaleY + yOff, 7, 4);
      g.fillEllipse( 7, 14 * scaleY + yOff, 7, 4);
      g.fillStyle(0xffb0c0, 0.6);
      g.fillCircle(-7, 14 * scaleY + yOff, 1.4);
      g.fillCircle( 7, 14 * scaleY + yOff, 1.4);
    }

    // ── DIRT PARTICLES while digging/emerging ────────────────────────────────
    if (this.state === 'digging' || this.state === 'emerging') {
      for (let i = 0; i < 5; i++) {
        const a = (this.stateTimer * 0.3 + i * 1.4) % (Math.PI * 2);
        const r = 14 + (this.stateTimer % 30) * 0.3;
        g.fillStyle(0x6b4828, 0.7);
        g.fillCircle(Math.cos(a) * r, 18 + Math.sin(a) * 4, 2);
      }
    }
  }
}
