import Phaser from 'phaser';
import {
  TREE_DEFS,
  NUT_BASE_COUNT, NUTS_PER_LEVEL, NUT_COLLECT_RADIUS, NUT_MAGNET_RADIUS, NUT_MAGNET_STRENGTH,
  NUT_PROB_LANTERN, NUT_PROB_FIRSTAID, NUT_PROB_TREACLE, NUT_PROB_MAGIC,
  FOX_BASE_SPEED, FOX_SPEED_PER_LEVEL, FOX_SPAWN_BASE_MS, FOX_SPAWN_REDUCTION_PER_LEVEL,
  FOX_SPAWN_MIN_MS, FOX_BASE_MAX,
  SQUIRREL_FOX_HIT_DIST_SQ, MAX_LANTERNS, MAX_LIVES,
  LANTERN_STUN_FRAMES, LANTERN_BOUNCE_DIST,
} from '@/config';
import { distSq } from '@/utils/MathUtils';
import { Squirrel } from '@/entities/Squirrel';
import { Fox } from '@/entities/Fox';
import { Nut, NutType } from '@/entities/Nut';
import { Lantern } from '@/entities/Lantern';
import { Butterfly } from '@/entities/Butterfly';
import { BackgroundRenderer } from '@/graphics/BackgroundRenderer';
import { drawTree } from '@/graphics/TreeRenderer';
import { EffectsRenderer } from '@/graphics/EffectsRenderer';
import { InputManager } from '@/input/InputManager';
import { ParticleManager } from '@/managers/ParticleManager';
import { ComboManager } from '@/managers/ComboManager';
import { PowerUpManager } from '@/managers/PowerUpManager';
import { FloatingTextManager } from '@/ui/FloatingText';
import { PowerBar } from '@/ui/PowerBar';
import { LanternStockDisplay } from '@/ui/LanternStockDisplay';
import { MessageBar } from '@/ui/MessageBar';
import { ScreenShake } from '@/utils/ScreenShake';
import { MusicSequencer } from '@/audio/MusicSequencer';
import { SfxPlayer } from '@/audio/SfxPlayer';
import { AmbientSounds } from '@/audio/AmbientSounds';
import { AudioManager } from '@/audio/AudioManager';

export class GameScene extends Phaser.Scene {
  // Canvas dimensions (set from scale manager, updated on restart)
  private W = 750;
  private H = 422;

  // State
  private frame = 0;
  private score = 0;
  private level = 1;
  private lives = 3;
  private lanternStock = MAX_LANTERNS;
  private gameOver = false;

  // Entities
  private squirrel!: Squirrel;
  private foxes: Fox[] = [];
  private nuts: Nut[] = [];
  private lanterns: Lantern[] = [];
  private butterflies: Butterfly[] = [];

  // Managers
  private input2!: InputManager;
  private particles!: ParticleManager;
  private combo!: ComboManager;
  private powerUps!: PowerUpManager;
  private floatTexts!: FloatingTextManager;
  private shaker!: ScreenShake;

  // Rendering
  private effects!: EffectsRenderer;
  private treeGfx!: Phaser.GameObjects.Graphics;
  private powerBar!: PowerBar;
  private lanternDisplay!: LanternStockDisplay;
  private messageBar!: MessageBar;

  // HUD texts
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private muteBtn!: Phaser.GameObjects.Text;

  // Fox spawning
  private foxSpawnTimer = 0;

  // Game over overlay
  private gameOverContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('GameScene');
  }

  create() {
    this.scale.refresh();
    this.W = this.scale.width  || window.innerWidth;
    this.H = this.scale.height || window.innerHeight;

    // Background
    const bgRenderer = new BackgroundRenderer(this);
    bgRenderer.create(this.W, this.H);

    // Trees (drawn each frame for y-sorting, but static ones on a graphics layer)
    this.treeGfx = this.add.graphics();
    this.treeGfx.setDepth(15);

    // Effects
    this.effects = new EffectsRenderer(this, this.W, this.H);

    // Managers
    this.input2 = new InputManager();
    this.input2.create(this);
    this.particles = new ParticleManager(this);
    this.combo = new ComboManager();
    this.powerUps = new PowerUpManager();
    this.floatTexts = new FloatingTextManager(this);
    this.shaker = new ScreenShake(this.cameras.main);

    // Squirrel
    this.squirrel = new Squirrel(this, this.W / 2, this.H / 2);

    // Butterflies
    for (let i = 0; i < 5; i++) {
      this.butterflies.push(new Butterfly(
        this,
        Math.random() * this.W,
        Math.random() * this.H * 0.7 + this.H * 0.1,
        i, this.W, this.H,
      ));
    }

    // UI
    this.powerBar = new PowerBar(this, this.W, this.H);
    this.lanternDisplay = new LanternStockDisplay(this, this.W);
    this.messageBar = new MessageBar(this, this.W, this.H);

    // HUD
    this.createHUD();

    // Game over overlay (hidden initially)
    this.createGameOverOverlay();

    // Spawn initial nuts
    this.spawnNuts();

    // Start music
    MusicSequencer.start();
    AmbientSounds.start();

    this.messageBar.show('Go!');
    this.foxSpawnTimer = 90;

    // Debug event: spawn a first aid pack near the squirrel
    this.events.on('debug:spawnFirstAid', () => {
      const nx = Phaser.Math.Clamp(this.squirrel.x + 70, 40, this.W - 40);
      const ny = Phaser.Math.Clamp(this.squirrel.y, 40, this.H - 40);
      this.nuts.push(new Nut(this, nx, ny, 'firstaid'));
    });
  }

  private createHUD() {
    const hudStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '12px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    };

    // Score
    this.add.text(8, 6, 'SCORE', { ...hudStyle, fontSize: '9px', color: '#8bba6f' }).setDepth(96);
    this.scoreText = this.add.text(8, 16, '0', {
      ...hudStyle, fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(96);

    // Level
    this.add.text(80, 6, 'LEVEL', { ...hudStyle, fontSize: '9px', color: '#8bba6f' }).setDepth(96);
    this.levelText = this.add.text(80, 16, '1', {
      ...hudStyle, fontSize: '14px', color: '#7fdbff', fontStyle: 'bold',
    }).setDepth(96);

    // Lives
    this.add.text(130, 6, 'LIVES', { ...hudStyle, fontSize: '9px', color: '#8bba6f' }).setDepth(96);
    this.livesText = this.add.text(130, 16, '♥♥♥', {
      ...hudStyle, fontSize: '14px', color: '#ff4757',
    }).setDepth(96);

    // Combo
    this.comboText = this.add.text(200, 16, '', {
      ...hudStyle, fontSize: '14px', color: '#fff', fontStyle: 'bold',
    }).setDepth(96);

    // Mute button
    this.muteBtn = this.add.text(this.W - 70, 6, 'Sound: ON', {
      ...hudStyle, fontSize: '11px', color: '#ccc',
      backgroundColor: 'rgba(255,255,255,0.08)',
      padding: { x: 6, y: 3 },
    }).setDepth(96).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => {
      const muted = AudioManager.toggleMute();
      this.muteBtn.setText(muted ? 'Sound: OFF' : 'Sound: ON');
    });
  }

  private createGameOverOverlay() {
    this.gameOverContainer = this.add.container(0, 0);
    this.gameOverContainer.setDepth(200);
    this.gameOverContainer.setVisible(false);

    const bg = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.7);
    const title = this.add.text(this.W / 2, this.H * 0.4, 'GAME OVER', {
      fontSize: '36px', color: '#ff4757', fontStyle: 'bold',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);
    const scoreLabel = this.add.text(this.W / 2, this.H * 0.55, '', {
      fontSize: '22px', color: '#ffd700', fontStyle: 'bold',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);
    const levelLabel = this.add.text(this.W / 2, this.H * 0.65, '', {
      fontSize: '14px', color: '#8bba6f',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);
    const restartLabel = this.add.text(this.W / 2, this.H * 0.78, 'Press R or tap to restart', {
      fontSize: '12px', color: '#ccc',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }).setOrigin(0.5);

    this.gameOverContainer.add([bg, title, scoreLabel, levelLabel, restartLabel]);

    // Make background clickable for restart
    bg.setInteractive();
    bg.on('pointerdown', () => { if (this.gameOver) this.restart(); });
  }

  private showGameOver() {
    this.gameOver = true;
    this.gameOverContainer.setVisible(true);
    // Update labels
    const children = this.gameOverContainer.list as Phaser.GameObjects.Text[];
    children[2].setText(`Score: ${this.score}`);
    children[3].setText(`Level ${this.level} reached`);
    SfxPlayer.gameOver();
    MusicSequencer.stop();
  }

  private restart() {
    this.scale.refresh();
    this.W = this.scale.width  || window.innerWidth;
    this.H = this.scale.height || window.innerHeight;

    // Clean up
    this.foxes.forEach(f => f.destroy());
    this.foxes = [];
    this.nuts.forEach(n => n.destroy());
    this.nuts = [];
    this.lanterns.forEach(l => l.destroy());
    this.lanterns = [];
    this.particles.reset();
    this.floatTexts.reset();
    this.combo.reset();
    this.powerUps.reset();

    // Reset state
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.lanternStock = MAX_LANTERNS;
    this.gameOver = false;
    this.frame = 0;
    this.foxSpawnTimer = 90;

    this.squirrel.x = this.W / 2;
    this.squirrel.y = this.H / 2;
    this.squirrel.vx = 0;
    this.squirrel.vy = 0;
    this.squirrel.mode = 'normal';
    this.squirrel.invincible = false;

    this.gameOverContainer.setVisible(false);
    this.effects.setTreacleAlpha(0);

    this.spawnNuts();
    this.updateHUD();
    MusicSequencer.start();
    this.messageBar.show('Go!');
  }

  // ==================== SPAWNING ====================
  private spawnNuts() {
    // Clear existing
    this.nuts.forEach(n => n.destroy());
    this.nuts = [];

    const count = NUT_BASE_COUNT + this.level * NUTS_PER_LEVEL;
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      let type: NutType;
      if (r < NUT_PROB_LANTERN)       type = 'lantern';
      else if (r < NUT_PROB_FIRSTAID) type = 'firstaid';
      else if (r < NUT_PROB_TREACLE)  type = 'treacle';
      else if (r < NUT_PROB_MAGIC)    type = 'magic';
      else type = 'normal';

      let nx = 0, ny = 0;
      for (let attempt = 0; attempt < 20; attempt++) {
        nx = 40 + Math.random() * (this.W - 80);
        ny = 40 + Math.random() * (this.H - 80);
        const dsSq = distSq(nx, ny, this.squirrel.x, this.squirrel.y);
        if (dsSq < 2500) continue;
        let valid = true;
        for (const other of this.nuts) {
          if (distSq(nx, ny, other.x, other.y) < 900) { valid = false; break; }
        }
        if (valid) break;
      }

      this.nuts.push(new Nut(this, nx, ny, type));
    }
  }

  private spawnFox() {
    const maxFoxes = FOX_BASE_MAX + this.level;
    if (this.foxes.length >= maxFoxes) return;

    const side = Math.floor(Math.random() * 4);
    let fx = 0, fy = 0;
    if (side === 0) { fx = Math.random() * this.W; fy = -20; }
    else if (side === 1) { fx = this.W + 20; fy = Math.random() * this.H; }
    else if (side === 2) { fx = Math.random() * this.W; fy = this.H + 20; }
    else { fx = -20; fy = Math.random() * this.H; }

    this.foxes.push(new Fox(this, fx, fy));
  }

  private deployLantern() {
    if (this.lanternStock <= 0 || this.gameOver) return;
    this.lanternStock--;
    this.lanterns.push(new Lantern(this, this.squirrel.x, this.squirrel.y, this.W, this.H));
    SfxPlayer.lanternDeploy();
    this.messageBar.show('Lantern deployed!');
    this.particles.burst(this.squirrel.x, this.squirrel.y, 15, 0x00ced1, 3, 30, 2);
    this.lanternDisplay.update(this.lanternStock);
  }

  // ==================== COLLISION & GAME LOGIC ====================
  private collectNut(nut: Nut) {
    nut.collected = true;
    nut.setVisible(false);

    this.combo.hit();
    const mult = this.combo.getMultiplier();
    const basePoints = nut.getPoints();
    const points = basePoints * mult;
    this.score += points;

    let msg = '';

    switch (nut.nutType) {
      case 'normal':
        SfxPlayer.nutCollect();
        this.particles.burst(nut.x, nut.y, 8, 0xc4956a, 2, 25, 2);
        msg = mult > 1 ? `Nut! x${mult} +${points}` : 'Nut collected! +10';
        break;

      case 'magic':
        SfxPlayer.magicCollect();
        this.powerUps.activateMagic();
        this.effects.setTreacleAlpha(0);
        this.particles.rainbowBurst(nut.x, nut.y, 25);
        msg = mult > 1 ? `MAGIC! x${mult} +${points}` : 'MAGIC MODE! +25';
        break;

      case 'treacle':
        SfxPlayer.treacleCollect();
        if (this.powerUps.isMagic()) {
          msg = 'Magic protects you!';
        } else {
          this.powerUps.activateTreacle();
          msg = mult > 1 ? `Treacle! x${mult} +${points}` : 'Treacle mode! +5';
        }
        this.particles.burst(nut.x, nut.y, 10, 0xd4a017, 2, 25, 2);
        break;

      case 'lantern':
        SfxPlayer.lanternPickup();
        if (this.lanternStock < MAX_LANTERNS) this.lanternStock++;
        this.lanternDisplay.update(this.lanternStock);
        this.particles.burst(nut.x, nut.y, 12, 0x00ced1, 2.5, 30, 2);
        msg = mult > 1 ? `Lantern! x${mult} +${points}` : 'Lantern collected! +15';
        break;

      case 'firstaid':
        SfxPlayer.nutCollect();
        if (this.lives < MAX_LIVES) {
          this.lives++;
          this.particles.burst(nut.x, nut.y, 16, 0xff4466, 2.5, 30, 2);
          this.particles.burst(nut.x, nut.y, 8, 0xffffff, 1.5, 20, 1.5);
          msg = mult > 1 ? `First Aid! x${mult} +${points} ♥` : 'First Aid! +1 life ♥';
        } else {
          this.particles.burst(nut.x, nut.y, 8, 0xff4466, 2, 20, 1.5);
          msg = 'Full health! +20';
        }
        break;
    }

    if (mult > 1) SfxPlayer.combo(mult);

    const color = nut.nutType === 'magic'    ? '#ff44ff' :
                  nut.nutType === 'treacle'  ? '#ffd700' :
                  nut.nutType === 'lantern'  ? '#00ced1' :
                  nut.nutType === 'firstaid' ? '#ff4466' : '#fff';
    const txt = mult > 1 ? `x${mult} +${points}` : `+${points}`;
    this.floatTexts.add(nut.x, nut.y - 10, txt, color, mult > 1 ? 16 + mult * 2 : 14);
    this.messageBar.show(msg);
  }

  private hurtSquirrel() {
    if (this.powerUps.isInvincible()) return;

    this.lives--;
    this.powerUps.activateInvincibility();
    this.squirrel.invincible = true;
    SfxPlayer.hurt();
    this.shaker.shake(8);
    this.particles.burst(this.squirrel.x, this.squirrel.y, 15, 0xff4757, 3, 30, 3);
    this.floatTexts.add(this.squirrel.x, this.squirrel.y - 20, 'OUCH!', '#ff4757', 18);

    if (this.lives <= 0) {
      this.showGameOver();
    }
  }

  private checkLevelUp() {
    const remaining = this.nuts.filter(n => !n.collected);
    if (remaining.length === 0) {
      this.level++;
      SfxPlayer.levelUp();
      if (this.lanternStock < MAX_LANTERNS) this.lanternStock++;
      this.lanternDisplay.update(this.lanternStock);
      this.messageBar.show(`Level ${this.level}!`);
      this.floatTexts.add(this.W / 2, this.H / 2, `LEVEL ${this.level}`, '#7fdbff', 24);
      this.particles.rainbowBurst(this.W / 2, this.H / 2, 30);
      this.spawnNuts();
    }
  }

  // ==================== UPDATE ====================
  update() {
    if (this.gameOver) {
      if (this.input2.isRestartPressed()) this.restart();
      return;
    }

    this.frame++;

    // Input
    if (this.input2.isMutePressed()) {
      const muted = AudioManager.toggleMute();
      this.muteBtn.setText(muted ? 'Sound: OFF' : 'Sound: ON');
    }
    if (this.input2.isDeployPressed()) this.deployLantern();
    if (this.input2.isDebugTreaclePressed()) {
      this.scene.pause();
      this.scene.launch('Debug', { level: this.level, lives: this.lives });
    }

    // Power-up timers
    this.powerUps.update();
    this.combo.update();

    // Update squirrel mode
    const mode = this.powerUps.getMode();
    this.squirrel.mode = mode;
    this.squirrel.invincible = this.powerUps.invincTimer > 0;

    // Treacle overlay
    if (this.powerUps.isTreacle()) {
      this.effects.setTreacleAlpha(Math.min(0.35, this.powerUps.getTreacleProgress() * 0.35));
    } else {
      this.effects.setTreacleAlpha(0);
    }

    // Squirrel movement
    const mov = this.input2.getMovement();
    this.squirrel.move(mov.x, mov.y);
    this.squirrel.clamp(this.W, this.H);

    // Fox spawning
    this.foxSpawnTimer--;
    if (this.foxSpawnTimer <= 0) {
      const interval = Math.max(FOX_SPAWN_MIN_MS, FOX_SPAWN_BASE_MS - this.level * FOX_SPAWN_REDUCTION_PER_LEVEL);
      this.foxSpawnTimer = Math.round(interval / (1000 / 60));
      this.spawnFox();
    }

    // Fox movement
    const foxSpeed = (FOX_BASE_SPEED + this.level * FOX_SPEED_PER_LEVEL) * this.powerUps.getFoxSpeedMultiplier();
    for (const fox of this.foxes) {
      fox.chase(this.squirrel.x, this.squirrel.y, foxSpeed);
    }

    // Nut collection + magnetism
    for (const nut of this.nuts) {
      if (nut.collected) continue;
      const ds = distSq(this.squirrel.x, this.squirrel.y, nut.x, nut.y);
      const dist = Math.sqrt(ds);

      // Magnetism
      if (dist < NUT_MAGNET_RADIUS && dist > NUT_COLLECT_RADIUS) {
        const dx = this.squirrel.x - nut.x;
        const dy = this.squirrel.y - nut.y;
        nut.x += (dx / dist) * NUT_MAGNET_STRENGTH;
        nut.y += (dy / dist) * NUT_MAGNET_STRENGTH;
      }

      if (dist < NUT_COLLECT_RADIUS) this.collectNut(nut);
    }

    // Fox-squirrel collision
    for (const fox of this.foxes) {
      if (fox.stunTimer > 0 || fox.spawnAnim > 0) continue;
      if (distSq(this.squirrel.x, this.squirrel.y, fox.x, fox.y) < SQUIRREL_FOX_HIT_DIST_SQ) {
        this.hurtSquirrel();
        break;
      }
    }

    // Lantern updates
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const lan = this.lanterns[i];
      lan.update();
      if (lan.isExpired()) {
        lan.destroy();
        this.lanterns.splice(i, 1);
        continue;
      }
      // Fox-beam collision
      for (const fox of this.foxes) {
        if (fox.stunTimer > 0) continue;
        if (lan.isOnBeam(fox.x, fox.y)) {
          fox.stun(LANTERN_STUN_FRAMES);
          fox.bounceFrom(lan.x, lan.y, LANTERN_BOUNCE_DIST);
          fox.x = Phaser.Math.Clamp(fox.x, 0, this.W);
          fox.y = Phaser.Math.Clamp(fox.y, 0, this.H);
          SfxPlayer.foxBeamHit();
          this.particles.burst(fox.x, fox.y, 12, 0x00ced1, 3, 25, 2);
          this.particles.burst(fox.x, fox.y, 6, 0xffffff, 2, 15, 1.5);
        }
      }
    }

    // Clean up off-screen stunned foxes
    for (let i = this.foxes.length - 1; i >= 0; i--) {
      const fox = this.foxes[i];
      if (fox.stunTimer > 0 && (fox.x < -100 || fox.x > this.W + 100 || fox.y < -100 || fox.y > this.H + 100)) {
        fox.destroy();
        this.foxes.splice(i, 1);
      }
    }

    // Level up check
    this.checkLevelUp();

    // Butterflies
    for (const b of this.butterflies) b.updateMovement(this.frame);

    // Ambient leaves
    if (this.frame % 40 === 0) {
      const lx = Math.random() * this.W;
      const hue = (80 + Math.random() * 60) / 360;
      const color = Phaser.Display.Color.HSLToColor(hue, 0.5, 0.4);
      this.particles.emit(lx, -5, (Math.random() - 0.5) * 0.8, 0.3 + Math.random() * 0.5, 180, color.color, 2.5, 0.005);
    }

    // Magic trail particles
    if (this.powerUps.isMagic() && this.squirrel.moving && this.frame % 2 === 0) {
      const hue = (this.frame * 12 % 360) / 360;
      const color = Phaser.Display.Color.HSLToColor(hue, 1, 0.65);
      this.particles.emit(
        this.squirrel.x - this.squirrel.vx * 2,
        this.squirrel.y - this.squirrel.vy * 2 + 5,
        (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5,
        30, color.color, 3, 0.02,
      );
    }

    // Dust trail
    if (this.squirrel.moving && this.frame % 5 === 0 && !this.powerUps.isMagic()) {
      this.particles.emit(
        this.squirrel.x, this.squirrel.y + 12,
        (Math.random() - 0.5) * 0.5, -Math.random() * 0.3,
        20, 0x786440, 2, 0,
      );
    }

    // Update managers
    this.particles.update();
    this.floatTexts.update();
    this.effects.update(this.frame);

    // Draw entities
    this.drawEntities();

    // Update HUD
    this.updateHUD();
  }

  private drawEntities() {
    // Draw squirrel
    this.squirrel.draw(this.frame);

    // Draw foxes
    for (const fox of this.foxes) {
      fox.draw(this.frame, this.powerUps.isMagic());
    }

    // Draw nuts
    for (const nut of this.nuts) {
      nut.draw(this.frame);
    }

    // Draw lanterns
    for (const lan of this.lanterns) {
      lan.draw(this.frame);
    }

    // Draw butterflies
    for (const b of this.butterflies) {
      b.draw();
    }

    // Draw trees (y-sorted with entities would be ideal, but simplified here)
    this.treeGfx.clear();
    for (const td of TREE_DEFS) {
      drawTree(this.treeGfx, td.x * this.W, td.y * this.H, td.s);
    }

    // Draw particles
    this.particles.draw();

    // Draw power bar
    this.powerBar.draw(
      this.powerUps.getMagicProgress(),
      this.powerUps.getTreacleProgress(),
      this.frame,
    );

    // Lantern stock
    this.lanternDisplay.update(this.lanternStock);
  }

  private updateHUD() {
    this.scoreText.setText(String(this.score));
    this.levelText.setText(String(this.level));

    let hearts = '';
    for (let i = 0; i < Math.max(3, this.lives); i++) hearts += i < this.lives ? '♥' : '♡';
    this.livesText.setText(hearts);

    if (this.combo.count > 1 && this.combo.timer > 0) {
      const mult = this.combo.getMultiplier();
      this.comboText.setAlpha(1);
      this.comboText.setText(`x${mult} COMBO`);
      if (mult >= 5) {
        const hue = this.frame * 8 % 360;
        this.comboText.setColor(`hsl(${hue},100%,65%)`);
      } else if (mult >= 3) {
        this.comboText.setColor('#ffd700');
      } else {
        this.comboText.setColor('#ffffff');
      }
    } else {
      this.comboText.setAlpha(0);
    }
  }
}
