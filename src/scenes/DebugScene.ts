import Phaser from 'phaser';
import { MusicSequencer, MusicMode } from '@/audio/MusicSequencer';

interface DebugData {
  level: number;
  lives: number;
}

export class DebugScene extends Phaser.Scene {
  private modeText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Debug' });
  }

  create(data: DebugData) {
    const W = this.scale.width;   // 750
    const H = this.scale.height;  // 422
    const panelW = 460;
    const panelH = 310;
    const px = (W - panelW) / 2;  // 145
    const py = (H - panelH) / 2;  // 91
    const cx = W / 2;

    // Dim the game behind
    this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.72).setDepth(0);

    // Panel background
    const panel = this.add.graphics().setDepth(1);
    panel.fillStyle(0x0e0e1a, 0.97);
    panel.fillRoundedRect(px, py, panelW, panelH, 8);
    panel.lineStyle(1.5, 0x3a3a60);
    panel.strokeRoundedRect(px, py, panelW, panelH, 8);

    // Title
    this.add.text(cx, py + 20, '◈  DEBUG MODE  ◈', {
      fontSize: '15px', color: '#9999cc', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    // Game state info (right-aligned in header)
    this.add.text(px + panelW - 14, py + 12, `level ${data.level}  ❤ ${data.lives}`, {
      fontSize: '9px', color: '#444466', fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(2);

    this.hRule(px, py + 37, panelW);

    // ── MUSIC SEQUENCES ──────────────────────────────
    this.sectionLabel(px + 16, py + 46, 'MUSIC SEQUENCES');

    const modes: { mode: MusicMode; label: string; hint: string; color: number }[] = [
      { mode: 'normal',  label: '▶ Normal',  hint: '[1]', color: 0x1a4428 },
      { mode: 'magic',   label: '▶ Magic',   hint: '[2]', color: 0x2a1a44 },
      { mode: 'treacle', label: '▶ Treacle', hint: '[3]', color: 0x3d2810 },
    ];

    modes.forEach(({ mode, label, hint, color }, i) => {
      const bx = cx + (i - 1) * 145;
      this.makeBtn(bx, py + 82, 128, 30, `${label}  ${hint}`, color, () => {
        MusicSequencer.setMode(mode);
        this.refreshMode();
      });
    });

    // Active mode indicator
    this.modeText = this.add.text(cx, py + 117, '', {
      fontSize: '11px', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(2);
    this.refreshMode();

    this.hRule(px, py + 135, panelW);

    // ── TRANSPORT ────────────────────────────────────
    this.sectionLabel(px + 16, py + 144, 'TRANSPORT');

    this.makeBtn(cx - 80, py + 178, 118, 28, '■ Stop  [S]',     0x3a1010, () => MusicSequencer.stop());
    this.makeBtn(cx + 80, py + 178, 118, 28, '↺ Restart  [R]',  0x103030, () => MusicSequencer.start());

    this.hRule(px, py + 205, panelW);

    // ── PICKUPS ───────────────────────────────────────
    this.sectionLabel(px + 16, py + 214, 'PICKUPS');

    const spawnFirstAid = () => {
      this.scene.get('GameScene').events.emit('debug:spawnFirstAid');
    };
    this.makeBtn(cx, py + 248, 180, 30, '♥ Spawn First Aid  [F]', 0x3a0a14, spawnFirstAid);

    // Footer / close hint
    this.add.text(cx, py + panelH - 13, 'T  or  ESC  —  resume game', {
      fontSize: '9px', color: '#333355', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(2);

    // ── Keyboard shortcuts ────────────────────────────
    const kb = this.input.keyboard!;
    const modeKeys: [string, MusicMode][] = [['ONE', 'normal'], ['TWO', 'magic'], ['THREE', 'treacle']];
    modeKeys.forEach(([key, mode]) => {
      kb.addKey(key).on('down', () => { MusicSequencer.setMode(mode); this.refreshMode(); });
    });
    kb.addKey('S').on('down', () => MusicSequencer.stop());
    kb.addKey('R').on('down', () => MusicSequencer.start());
    kb.addKey('F').on('down', () => spawnFirstAid());
    kb.addKey('T').on('down', () => this.close());
    kb.addKey('ESC').on('down', () => this.close());

    // Click outside panel to close
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      const outside = ptr.x < px || ptr.x > px + panelW || ptr.y < py || ptr.y > py + panelH;
      if (outside) this.close();
    });
  }

  // ── Helpers ──────────────────────────────────────────

  private refreshMode() {
    const mode = MusicSequencer.mode;
    const cfg: Record<string, { label: string; color: string }> = {
      normal:  { label: 'NORMAL',  color: '#66cc88' },
      magic:   { label: 'MAGIC',   color: '#cc66ff' },
      treacle: { label: 'TREACLE', color: '#ffbb33' },
    };
    const { label, color } = cfg[mode] ?? { label: mode.toUpperCase(), color: '#ffffff' };
    this.modeText.setText(`active:  ${label}`).setColor(color);
  }

  private makeBtn(
    x: number, y: number, w: number, h: number,
    label: string, bgColor: number,
    onClick: () => void,
  ) {
    const g = this.add.graphics().setDepth(2);

    const draw = (hover: boolean) => {
      g.clear();
      g.fillStyle(bgColor, hover ? 1.0 : 0.82);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      g.lineStyle(1, hover ? 0x8888bb : 0x33334a);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };
    draw(false);

    this.add.text(x, y, label, {
      fontSize: '11px', color: '#ccccdd', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(3);

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setDepth(3).setInteractive();
    hit.on('pointerover',  () => draw(true));
    hit.on('pointerout',   () => draw(false));
    hit.on('pointerdown',  () => { draw(false); onClick(); });
  }

  private hRule(px: number, y: number, w: number) {
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(1, 0x222240);
    g.lineBetween(px + 14, y, px + w - 14, y);
  }

  private sectionLabel(x: number, y: number, text: string) {
    this.add.text(x, y, text, {
      fontSize: '9px', color: '#444466', fontFamily: 'monospace',
    }).setDepth(2);
  }

  private close() {
    this.scene.resume('Game');
    this.scene.stop();
  }
}
