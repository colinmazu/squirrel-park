import Phaser from 'phaser';
import { PLAYER_SPEED, MAGIC_SPEED_MULT, TREACLE_SPEED_MULT } from '@/config';

export type SquirrelMode = 'normal' | 'magic' | 'treacle';

interface TailPt { x: number; y: number; ox: number; oy: number }

export class Squirrel extends Phaser.GameObjects.Container {
  public vx = 0;
  public vy = 0;
  public facing = 1;
  public moving = false;
  public mode: SquirrelMode = 'normal';
  public invincible = false;
  private gfx: Phaser.GameObjects.Graphics;
  private bodyW = 18;
  private bodyH = 24;

  // ── Tail verlet chain ──────────────────────────────────────────────────────
  //
  //  A squirrel tail is a bushy plume attached at the rump.  At rest it forms
  //  a pronounced "?" S-curve — rising steeply behind the body, arcing up and
  //  forward over the back.  When running the curve flattens and streams behind.
  //
  //  We model it as a chain of N points connected by fixed-length links.
  //  Each frame:
  //   1. Pin the base to the rump.
  //   2. Shift each point's *previous* position by the body's velocity so that
  //      the verlet velocity becomes relative to the *world* — this is what
  //      makes the tail trail behind the body with inertia.
  //   3. Apply spring forces toward a rest-pose bezier (mode-dependent).
  //   4. Apply gravity and damping.
  //   5. Satisfy distance constraints (3 passes).
  //   6. For idle squirrels, inject occasional random flick impulses at the tip
  //      to replicate the characteristic tail-twitch signalling behaviour.
  //
  //  Drawing uses the chain positions to build a filled contour whose width
  //  follows a naturalistic profile: narrow at the base, widest in the middle
  //  third, and tapering at the tip — like real squirrel tail fur.
  // ────────────────────────────────────────────────────────────────────────────

  private static readonly TAIL_N = 16;
  private static readonly TAIL_SEG = 2.8;
  private tailPts: TailPt[] = [];
  private tailInited = false;
  private prevFacing = 1;
  private twitchTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gfx = scene.add.graphics();
    this.add(this.gfx);
    scene.add.existing(this);
    this.setDepth(10);
  }

  getSpeed(): number {
    let speed = PLAYER_SPEED;
    if (this.mode === 'magic') speed *= MAGIC_SPEED_MULT;
    else if (this.mode === 'treacle') speed *= TREACLE_SPEED_MULT;
    return speed;
  }

  move(mx: number, my: number) {
    const speed = this.getSpeed();
    this.vx = mx * speed;
    this.vy = my * speed;
    this.x += this.vx;
    this.y += this.vy;
    this.moving = Math.abs(mx) > 0.1 || Math.abs(my) > 0.1;
    if (mx !== 0) this.facing = mx > 0 ? 1 : -1;
  }

  clamp(w: number, h: number) {
    this.x = Phaser.Math.Clamp(this.x, this.bodyW, w - this.bodyW);
    this.y = Phaser.Math.Clamp(this.y, this.bodyH, h - this.bodyH);
  }

  // ── TAIL PHYSICS ─────────────────────────────────────────────────────────

  /**
   * Compute the rest-pose bezier that the tail's spring forces pull toward.
   * Returns TAIL_N evenly-sampled points in container-local coordinates.
   *
   * Three distinct poses blended by movement speed and mode:
   *  - idle  : steep S-curve "?" rising over the back
   *  - run   : flattened arc streaming behind
   *  - treacle: heavy droop
   */
  private tailRestPose(): { x: number; y: number }[] {
    const f = this.facing;
    const N = Squirrel.TAIL_N;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const moveT = Math.min(speed / 2.5, 1);

    // Idle "?" — rises steeply, curls forward over the back
    const idleP0 = { x: f * -3,  y: 4   };
    const idleP1 = { x: f * -10, y: -5  };
    const idleP2 = { x: f * -16, y: -32 };
    const idleP3 = { x: f * -2,  y: -40 };

    // Running — streams backward, slight upward lift
    const runP0 = { x: f * -3,  y: 4   };
    const runP1 = { x: f * -14, y: 1   };
    const runP2 = { x: f * -24, y: -10 };
    const runP3 = { x: f * -30, y: -18 };

    // Treacle — heavy, barely lifts
    const treP0 = { x: f * -3,  y: 4  };
    const treP1 = { x: f * -10, y: 8  };
    const treP2 = { x: f * -16, y: 4  };
    const treP3 = { x: f * -13, y: -6 };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let p0: { x: number; y: number };
    let p1: { x: number; y: number };
    let p2: { x: number; y: number };
    let p3: { x: number; y: number };

    if (this.mode === 'treacle') {
      p0 = treP0; p1 = treP1; p2 = treP2; p3 = treP3;
    } else {
      p0 = { x: lerp(idleP0.x, runP0.x, moveT), y: lerp(idleP0.y, runP0.y, moveT) };
      p1 = { x: lerp(idleP1.x, runP1.x, moveT), y: lerp(idleP1.y, runP1.y, moveT) };
      p2 = { x: lerp(idleP2.x, runP2.x, moveT), y: lerp(idleP2.y, runP2.y, moveT) };
      p3 = { x: lerp(idleP3.x, runP3.x, moveT), y: lerp(idleP3.y, runP3.y, moveT) };
    }

    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const mt = 1 - t;
      pts.push({
        x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
        y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
      });
    }
    return pts;
  }

  private initTailChain() {
    const rest = this.tailRestPose();
    this.tailPts = rest.map(p => ({ x: p.x, y: p.y, ox: p.x, oy: p.y }));
    this.tailInited = true;
    this.prevFacing = this.facing;
    this.twitchTimer = 30 + Math.floor(Math.random() * 50);
  }

  private updateTail(frame: number) {
    if (!this.tailInited) this.initTailChain();

    const pts = this.tailPts;
    const rest = this.tailRestPose();
    const N = Squirrel.TAIL_N;
    const segLen = Squirrel.TAIL_SEG;

    const isTreacle = this.mode === 'treacle';
    const isMagic   = this.mode === 'magic';

    //  Tuning knobs — each mode has a distinct physical feel:
    //   treacle: heavy, sluggish, droopy
    //   magic  : light, bouncy, energetic
    //   normal : balanced with naturalistic swing
    const damping = isTreacle ? 0.76 : isMagic ? 0.92 : 0.87;
    const gravity = isTreacle ? 0.30 : isMagic ? 0.07 : 0.14;
    const restK   = isTreacle ? 0.18 : isMagic ? 0.035 : 0.065;
    const inertia = isTreacle ? 0.35 : isMagic ? 0.88  : 0.74;

    // Pin base to rump
    pts[0].ox = pts[0].x;
    pts[0].oy = pts[0].y;
    pts[0].x = rest[0].x;
    pts[0].y = rest[0].y;

    // Verlet integration — per-segment
    for (let i = 1; i < N; i++) {
      const p = pts[i];
      const t = i / N; // 0 at base, ~1 at tip

      // Shift previous position by body velocity to create world-space inertia.
      // Outer segments get more inertia → tip trails the most.
      p.ox += this.vx * inertia * t;
      p.oy += this.vy * inertia * t;

      // Verlet velocity
      let vx = (p.x - p.ox) * damping;
      let vy = (p.y - p.oy) * damping;

      // Gravity
      vy += gravity;

      // Spring toward rest pose — stronger near base for structural rigidity,
      // weaker at tip so it swings freely
      const k = restK * (1.3 - t * 0.8);
      vx += (rest[i].x - p.x) * k;
      vy += (rest[i].y - p.y) * k;

      // Integrate
      p.ox = p.x;
      p.oy = p.y;
      p.x += vx;
      p.y += vy;
    }

    // Distance constraints — 3 passes keeps the chain stiff
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < N; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const corr = (dist - segLen) / dist;

        if (i === 1) {
          // Base is pinned — push only the second point
          b.x -= dx * corr;
          b.y -= dy * corr;
        } else {
          const half = corr * 0.5;
          a.x += dx * half;
          a.y += dy * half;
          b.x -= dx * half;
          b.y -= dy * half;
        }
      }
    }

    // ── IDLE TWITCHING ──────────────────────────────────────────────────────
    // Squirrels constantly flick and twitch their tails when standing still.
    // This is a signalling behaviour — quick, jerky movements concentrated at
    // the outer third of the tail.  Magic mode twitches more frequently.
    if (!this.moving && !isTreacle) {
      this.twitchTimer--;
      if (this.twitchTimer <= 0) {
        this.twitchTimer = isMagic
          ? 12 + Math.floor(Math.random() * 25)  // hyper
          : 30 + Math.floor(Math.random() * 70);  // natural

        const flickX = (Math.random() - 0.5) * (isMagic ? 14 : 8);
        const flickY = -(1 + Math.random() * (isMagic ? 7 : 4));
        const start = Math.floor(N * 0.55);
        for (let i = start; i < N; i++) {
          const s = (i - start) / (N - start);
          // Quadratic ramp so the tip moves the most
          pts[i].x += flickX * s * s;
          pts[i].y += flickY * s * s;
        }
      }
    }

    // Remember facing so the rest-pose flip creates a natural whip
    this.prevFacing = this.facing;
  }

  // ── TAIL DRAWING ─────────────────────────────────────────────────────────

  private drawTailChain(
    g: Phaser.GameObjects.Graphics,
    tailColor: number,
    tailHighlight: number,
    darkColor: number,
  ) {
    const pts = this.tailPts;
    const N = Squirrel.TAIL_N;

    // Per-point normals (perpendicular to the local spine direction)
    const norms: { nx: number; ny: number }[] = [];
    for (let i = 0; i < N; i++) {
      let dx: number, dy: number;
      if (i === 0) {
        dx = pts[1].x - pts[0].x;
        dy = pts[1].y - pts[0].y;
      } else if (i === N - 1) {
        dx = pts[N-1].x - pts[N-2].x;
        dy = pts[N-1].y - pts[N-2].y;
      } else {
        dx = pts[i+1].x - pts[i-1].x;
        dy = pts[i+1].y - pts[i-1].y;
      }
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      norms.push({ nx: -dy / len, ny: dx / len });
    }

    // Width profile — naturalistic squirrel tail fur:
    //  narrow at base (exits the body), fans out to maximum bush in the
    //  centre third, then tapers to a rounded tip.
    const getWidth = (t: number): number => {
      if (t < 0.07) return 1.5 + (t / 0.07) * 3;
      if (t < 0.28) return 4.5 + ((t - 0.07) / 0.21) * 4.5;
      if (t < 0.62) return 9;
      return 9 * Math.pow(1 - (t - 0.62) / 0.38, 0.55);
    };

    // Build left & right contours
    const left:  { x: number; y: number }[] = [];
    const right: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const w = getWidth(t);
      left.push({  x: pts[i].x + norms[i].nx * w, y: pts[i].y + norms[i].ny * w });
      right.push({ x: pts[i].x - norms[i].nx * w, y: pts[i].y - norms[i].ny * w });
    }

    // ── Filled fur body ──────────────────────────────────────────────────
    g.fillStyle(tailColor);
    g.beginPath();
    g.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < N; i++) g.lineTo(left[i].x, left[i].y);
    // Converge at tip
    g.lineTo(pts[N-1].x, pts[N-1].y);
    for (let i = N - 1; i >= 0; i--) g.lineTo(right[i].x, right[i].y);
    g.closePath();
    g.fillPath();

    // ── Shaded edge (gives cylindrical depth) ────────────────────────────
    g.lineStyle(1.5, darkColor, 0.28);
    g.beginPath();
    g.moveTo(right[1].x, right[1].y);
    for (let i = 2; i < N; i++) g.lineTo(right[i].x, right[i].y);
    g.strokePath();

    // ── Centre highlight ─────────────────────────────────────────────────
    g.lineStyle(2.2, tailHighlight, 0.28);
    g.beginPath();
    g.moveTo(pts[1].x, pts[1].y);
    for (let i = 2; i < N; i++) g.lineTo(pts[i].x, pts[i].y);
    g.strokePath();

    // ── Fur tufts (soft circles along the bushy section) ─────────────────
    for (let i = 3; i < N - 2; i++) {
      const t = i / (N - 1);
      if (t < 0.18 || t > 0.90) continue;
      const w = getWidth(t);
      g.fillStyle(tailHighlight, 0.12);
      g.fillCircle(
        pts[i].x + norms[i].nx * w * 0.6,
        pts[i].y + norms[i].ny * w * 0.6,
        w * 0.38,
      );
      g.fillStyle(tailColor, 0.22);
      g.fillCircle(
        pts[i].x - norms[i].nx * w * 0.42,
        pts[i].y - norms[i].ny * w * 0.42,
        w * 0.30,
      );
    }

    // ── Tip tuft ─────────────────────────────────────────────────────────
    const tip = pts[N - 1];
    g.fillStyle(tailHighlight, 0.38);
    g.fillCircle(tip.x, tip.y, 4);
    g.fillStyle(0xffffff, 0.09);
    g.fillCircle(tip.x, tip.y - 1, 2.2);
  }

  // ── MAIN DRAW ────────────────────────────────────────────────────────────

  draw(frame: number) {
    const g = this.gfx;
    g.clear();

    if (this.invincible && (frame % 8) < 4) return;

    const { bodyW: bw, bodyH: bh } = this;
    const isMagic   = this.mode === 'magic';
    const isTreacle = this.mode === 'treacle';

    // Ground shadow
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(3, bh * 0.52, bw * 2.0, 11);

    // ── TAIL (physics-driven) ────────────────────────────────────────────────
    const tailColor     = isMagic ? this.rainbowColor(frame * 10)      : isTreacle ? 0xb8860b : 0x7a5230;
    const tailHighlight = isMagic ? this.rainbowColor(frame * 10 + 40) : isTreacle ? 0xd4a820 : 0xad7a50;
    const tailDark      = isMagic ? this.rainbowColor(frame * 10 + 80) : isTreacle ? 0x7a5208 : 0x4e2e18;

    this.updateTail(frame);
    this.drawTailChain(g, tailColor, tailHighlight, tailDark);

    // ── BODY ─────────────────────────────────────────────────────────────────
    const bodyColor    = isMagic ? this.rainbowColor(frame * 8)      : isTreacle ? 0xb8860b : 0x8b5e3c;
    const bodyShadow   = isMagic ? this.rainbowColor(frame * 8 + 30) : isTreacle ? 0x8a6008 : 0x6a4028;
    const bodyHighlght = isMagic ? this.rainbowColor(frame * 8 - 30) : isTreacle ? 0xd4a820 : 0xac7858;

    g.fillStyle(bodyShadow, 0.45);
    g.fillEllipse(3, 2, bw * 1.15, bh * 0.95);
    g.fillStyle(bodyColor);
    g.fillEllipse(0, 0, bw * 1.1, bh * 0.9);
    g.fillStyle(bodyHighlght, 0.22);
    g.fillEllipse(-bw * 0.2, -bh * 0.15, bw * 0.55, bh * 0.45);

    // Belly
    const bellyColor = isMagic ? this.rainbowColor(frame * 8 + 40) : isTreacle ? 0xd4a017 : 0xc4956a;
    g.fillStyle(bellyColor);
    g.fillEllipse(0, bh * 0.08, bw * 0.7, bh * 0.56);
    g.fillStyle(0x000000, 0.06);
    g.fillEllipse(0, bh * 0.20, bw * 0.5, bh * 0.30);

    // ── HEAD ─────────────────────────────────────────────────────────────────
    const headColor   = isMagic ? this.rainbowColor(frame * 8 + 20) : isTreacle ? 0xc49a12 : 0xa0704e;
    const headHilight = isMagic ? this.rainbowColor(frame * 8)      : isTreacle ? 0xe0c040 : 0xc49070;

    g.fillStyle(headColor);
    g.fillEllipse(0, -bh * 0.52, bw * 0.8, bh * 0.60);
    g.fillStyle(headHilight, 0.18);
    g.fillEllipse(-bw * 0.1, -bh * 0.62, bw * 0.45, bh * 0.35);

    // Cheek pouches
    g.fillStyle(bellyColor, 0.55);
    g.fillEllipse(-bw * 0.22, -bh * 0.44, bw * 0.28, bh * 0.20);
    g.fillEllipse( bw * 0.22, -bh * 0.44, bw * 0.28, bh * 0.20);

    // ── EARS ─────────────────────────────────────────────────────────────────
    const earColor = isMagic ? this.rainbowColor(frame * 8 + 60) : isTreacle ? 0xa08010 : 0x6b4423;
    const earInner = isMagic ? this.rainbowColor(frame * 8 + 90) : isTreacle ? 0xd4a820 : 0xff9090;

    g.fillStyle(earColor);
    for (let side = -1; side <= 1; side += 2) {
      g.fillTriangle(
        side * bw * 0.25, -bh * 0.65,
        side * bw * 0.42, -bh * 0.92,
        side * bw * 0.10, -bh * 0.72,
      );
    }
    g.fillStyle(earInner, 0.65);
    for (let side = -1; side <= 1; side += 2) {
      g.fillTriangle(
        side * bw * 0.25, -bh * 0.67,
        side * bw * 0.37, -bh * 0.88,
        side * bw * 0.14, -bh * 0.73,
      );
    }

    // ── EYES ─────────────────────────────────────────────────────────────────
    const lookX = this.vx * 0.3;
    const lookY = this.vy * 0.3;

    g.fillStyle(0xffffff);
    g.fillEllipse(-5 + lookX * 0.2, -bh * 0.53, 8, 9);
    g.fillEllipse( 5 + lookX * 0.2, -bh * 0.53, 8, 9);

    g.fillStyle(isMagic ? 0x6600cc : 0x1a1a1a);
    g.fillCircle(-5 + lookX, -bh * 0.53 + lookY * 0.5, 2.5);
    g.fillCircle( 5 + lookX, -bh * 0.53 + lookY * 0.5, 2.5);

    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-4 + lookX * 0.8, -bh * 0.56 + lookY * 0.3, 1.2);
    g.fillCircle( 6 + lookX * 0.8, -bh * 0.56 + lookY * 0.3, 1.2);

    // ── NOSE ─────────────────────────────────────────────────────────────────
    g.fillStyle(0x3a2010);
    g.fillEllipse(0, -bh * 0.40, 5, 3.5);
    g.fillStyle(0xffffff, 0.40);
    g.fillCircle(-0.8, -bh * 0.41, 1.0);

    // ── WHISKERS ─────────────────────────────────────────────────────────────
    const whiskAlpha = isTreacle ? 0.25 : 0.55;
    g.lineStyle(0.8, 0xffffff, whiskAlpha);
    for (let side = -1; side <= 1; side += 2) {
      for (let wi = 0; wi < 3; wi++) {
        const wy = -bh * 0.38 + (wi - 1) * 2.8;
        g.lineBetween(side * 3, wy, side * 15, wy + (wi - 1) * 1.8);
      }
    }

    // ── TREACLE DRIPS ────────────────────────────────────────────────────────
    if (isTreacle) {
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 6;
        const dy = bh * 0.35 + Math.sin(frame * 0.05 + i) * 3;
        g.fillStyle(0xb48210, 0.65);
        g.fillEllipse(dx, dy, 5, 9 + Math.sin(frame * 0.08 + i) * 4);
        g.fillStyle(0xe8c030, 0.28);
        g.fillEllipse(dx - 1, dy - 1, 2, 4);
      }
    }

    // ── FEET ─────────────────────────────────────────────────────────────────
    const footColor = isTreacle ? 0x8a6a10 : 0x6b4423;
    const footHi    = isTreacle ? 0xb08a20 : 0x9a6843;
    const footBob   = this.moving ? Math.sin(frame * 0.3) * 2 : 0;

    g.fillStyle(footColor);
    g.fillEllipse(-6, bh * 0.40 + footBob, 9, 7);
    g.fillEllipse( 6, bh * 0.40 - footBob, 9, 7);

    g.fillStyle(footHi, 0.4);
    g.fillEllipse(-7, bh * 0.38 + footBob, 4, 3);
    g.fillEllipse( 5, bh * 0.38 - footBob, 4, 3);

    g.lineStyle(0.8, 0x2a1008, 0.7);
    for (let c = 0; c < 3; c++) {
      g.lineBetween(-8 + c * 2, bh * 0.44 + footBob, -9 + c * 2.5, bh * 0.48 + footBob);
      g.lineBetween( 4 + c * 2, bh * 0.44 - footBob,  3 + c * 2.5, bh * 0.48 - footBob);
    }
  }

  private rainbowColor(hueOffset: number): number {
    const hue = hueOffset % 360;
    return Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.5).color;
  }

  getHitRadius(): number {
    return 15;
  }
}
