import Phaser from 'phaser';
import { TILE, PLAY_W, PLAY_H, CONTROLS_H, CANVAS_H } from '../logic/constants.js';
import { Game, STATUS, POSE, STICK_W, STICK_H, ENEMY_SIZE } from '../logic/game.js';
import { LEVELS } from '../logic/levels.js';
import { loadProgress, saveProgress } from '../logic/progress.js';
import { sound, soundForEvent } from '../logic/sound.js';

const INK = 0x0b110b;
const PAPER = 0xa8e6a0;
const DIM = 0x4f7a4a;

const HINTS = {
  1: ['HOLD LEFT / RIGHT TO MOVE', 'PRESS JUMP TO HOP OVER GAPS', 'HOLD UP ON LADDERS TO CLIMB'],
  2: ['PRESS GRAB NEAR A ROPE TO HANG', 'HOLD UP / DOWN TO CLIMB THE ROPE', 'COLLECT ALL DIAMONDS TO OPEN THE DOOR']
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }

  init(data) {
    this.levelNum = data.level;
    this.progress = data.progress;
    this.resultTimer = 0;
    this.hintIndex = 0;
    this.hintTimer = 0;
    this.edges = { jumpEdge: false, grabEdge: false, digEdge: false };
    this.pressed = new Set();
  }

  create() {
    this.engine = new Game(LEVELS[this.levelNum - 1], this.progress);
    this.g = this.add.graphics();
    this.hud = this.add.graphics();
    this.overlay = this.add.graphics();

    this.tapZone = this.add.rectangle(PLAY_W / 2, PLAY_H / 2, PLAY_W, PLAY_H, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    this.tapZone.on('pointerdown', () => this.onOverlayTap());
    this.tapZone.setDepth(0);

    this.timeText = this.add.text(PLAY_W / 2, 10, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#0b110b'
    }).setOrigin(0.5, 0);
    this.livesText = this.add.text(10, 12, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#0b110b'
    });
    this.bigText = this.add.text(PLAY_W / 2, PLAY_H / 2, '', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#0b110b'
    }).setOrigin(0.5);
    this.hintText = this.add.text(PLAY_W / 2, 120, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#0b110b'
    }).setOrigin(0.5).setAlpha(0);

    this.makeButtons();
    this.makeKeyboard();
    this.hintTimer = HINTS[this.levelNum] ? 0.4 : -1;
    this.lastCount = -1;

    this.input.on('pointerdown', () => sound.unlock());
    this.input.keyboard.on('keydown', () => sound.unlock());
  }

  makeButtons() {
    const stripY = PLAY_H;
    const defs = [
      { k: 'left', x: 8, y: 30, w: 56, h: 60, label: '◀' },
      { k: 'right', x: 68, y: 30, w: 56, h: 60, label: '▶' },
      { k: 'grab', x: 128, y: 8, w: 52, h: 40, label: 'GRAB' },
      { k: 'dig', x: 128, y: 52, w: 52, h: 40, label: 'DIG' },
      { k: 'up', x: 184, y: 8, w: 52, h: 40, label: '▲' },
      { k: 'down', x: 184, y: 52, w: 52, h: 40, label: '▼' },
      { k: 'jump', x: 244, y: 20, w: 100, h: 64, label: 'JUMP' }
    ];
    this.buttons = {};
    for (const d of defs) {
      const rect = this.add.rectangle(d.x + d.w / 2, stripY + d.y + d.h / 2, d.w, d.h, INK, 0.15)
        .setStrokeStyle(2, INK);
      const label = this.add.text(d.x + d.w / 2, stripY + d.y + d.h / 2, d.label, {
        fontFamily: 'monospace',
        fontSize: d.label.length > 2 ? '11px' : '16px',
        color: '#0b110b'
      }).setOrigin(0.5);
      rect.setInteractive({ useHandCursor: true });
      const press = () => { this.pressed.add(d.k); };
      const release = () => { this.pressed.delete(d.k); };
      rect.on('pointerdown', press);
      rect.on('pointerup', release);
      rect.on('pointerout', release);
      this.buttons[d.k] = { rect, label, d };
    }
    const pause = this.add.rectangle(PLAY_W - 22, 16, 30, 30, INK, 0.15).setStrokeStyle(2, INK);
    const plabel = this.add.text(PLAY_W - 22, 16, 'II', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#0b110b'
    }).setOrigin(0.5);
    pause.setInteractive({ useHandCursor: true });
    pause.on('pointerdown', () => {
      if (this.engine.status === STATUS.PLAYING || this.engine.status === STATUS.PAUSED) {
        this.engine.togglePause();
        this.drawOverlay();
      }
    });
    this.pauseBtn = { rect: pause, label: plabel };
  }

  makeKeyboard() {
    const kb = this.input.keyboard;
    this.keyState = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    };
    kb.on('keydown-SPACE', () => { this.edges.jumpEdge = true; });
    kb.on('keydown-X', () => { this.edges.grabEdge = true; });
    kb.on('keydown-D', () => { this.edges.digEdge = true; });
    kb.on('keydown-P', () => {
      if (this.engine.status === STATUS.PLAYING || this.engine.status === STATUS.PAUSED) {
        this.engine.togglePause();
        this.drawOverlay();
      }
    });
    kb.on('keydown-ENTER', () => this.handleResultTap());
    this.input.keyboard.addCapture('SPACE,X,D,P,UP,LEFT,RIGHT,DOWN,ENTER');
  }

  readInput() {
    const k = this.keyState;
    const held = (a, b) => a.isDown || (b && b.isDown);
    return {
      left: held(k.left, k.a),
      right: held(k.right, k.d),
      up: held(k.up, k.w),
      down: held(k.down, k.s),
      jumpEdge: this.edges.jumpEdge,
      grabEdge: this.edges.grabEdge,
      digEdge: this.edges.digEdge
    };
  }

  update(time, delta) {
    const dt = delta / 1000;
    const engine = this.engine;
    if (this.edges.jumpEdge) sound.play('jump');
    engine.step(this.readInput(), dt);
    this.edges.jumpEdge = false;
    this.edges.grabEdge = false;
    this.edges.digEdge = false;

    this.processEvents();
    this.updateHint(dt);
    this.draw();
    this.drawHUD();

    if (engine.status === STATUS.WON || engine.status === STATUS.GAMEOVER) {
      this.resultTimer += dt;
    }
    if (engine.status === STATUS.COUNTDOWN) {
      const n = Math.ceil(engine.countdownT);
      if (n !== this.lastCount) {
        this.lastCount = n;
        sound.play(n > 0 ? 'tick' : 'go');
      }
    }
  }

  processEvents() {
    for (const ev of this.engine.events) {
      const snd = soundForEvent(ev.type);
      if (snd) sound.play(snd);
      if (ev.type === 'levelComplete') this.saveProgress();
      if (ev.type === 'gameover') this.saveProgress();
    }
    this.engine.events.length = 0;
  }

  saveProgress() {
    const e = this.engine;
    const unlocked = Math.max(this.progress.unlocked, Math.min(20, e.levelNum + 1));
    this.progress = { unlocked, lives: e.lives, score: e.score };
    saveProgress(window.localStorage, this.progress);
  }

  updateHint(dt) {
    if (this.hintTimer < 0) return;
    const hints = HINTS[this.levelNum];
    if (!hints) return;
    this.hintTimer -= dt;
    if (this.hintTimer <= 0) {
      if (this.hintIndex < hints.length) {
        const h = hints[this.hintIndex];
        this.hintText.setText(h).setAlpha(1);
        this.hintText.setAlpha(1);
        this.hintIndex++;
        this.hintTimer = 2.6;
      } else {
        this.hintText.setAlpha(0);
        this.hintTimer = -1;
      }
    }
  }

  draw() {
    const engine = this.engine;
    const g = this.g;
    g.clear();
    g.fillStyle(PAPER, 1);
    g.fillRect(0, 0, PLAY_W, PLAY_H);

    g.fillStyle(PAPER, 1);
    g.fillRect(0, PLAY_H, PLAY_W, CONTROLS_H);
    g.lineStyle(2, INK, 1);
    g.lineBetween(0, PLAY_H + 1, PLAY_W, PLAY_H + 1);
    g.lineStyle(1, INK, 0.6);
    for (const b of Object.values(this.buttons)) {
      const d = b.d;
      const x = d.x;
      const y = PLAY_H + d.y;
      g.fillStyle(INK, this.pressed.has(d.k) ? 0.5 : 0.15);
      g.fillRect(x + 2, y + 2, d.w - 4, d.h - 4);
    }

    const tiles = engine.parsed.tiles;
    for (let r = 0; r < engine.parsed.height; r++) {
      for (let c = 0; c < engine.parsed.width; c++) {
        const ch = tiles[r][c];
        const x = c * TILE;
        const y = r * TILE;
        if (ch === 'X') {
          if (engine.holes.has(`${c},${r}`)) {
            g.fillStyle(PAPER, 1);
            g.fillRect(x, y, TILE, TILE);
            g.lineStyle(1, DIM, 1);
            g.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
            g.lineBetween(x + 4, y + 4, x + TILE - 4, y + TILE - 4);
            g.lineBetween(x + TILE - 4, y + 4, x + 4, y + TILE - 4);
          } else {
            g.fillStyle(INK, 1);
            g.fillRect(x, y, TILE, TILE);
          }
        } else if (ch === 'L') {
          g.lineStyle(2, INK, 1);
          g.lineBetween(x + 4, y, x + 4, y + TILE);
          g.lineBetween(x + TILE - 4, y, x + TILE - 4, y + TILE);
          g.lineStyle(1, INK, 1);
          g.lineBetween(x + 4, y + 6, x + TILE - 4, y + 6);
          g.lineBetween(x + 4, y + 12, x + TILE - 4, y + 12);
        } else if (ch === 'R') {
          const center = x + TILE / 2;
          g.lineStyle(2, INK, 1);
          g.lineBetween(center, y, center, y + TILE);
          g.lineStyle(1, INK, 1);
          g.lineBetween(center - 4, y + 10, center + 4, y + 10);
          g.lineBetween(center - 4, y + 18, center + 4, y + 18);
          g.lineBetween(center - 4, y + 26, center + 4, y + 26);
          g.lineBetween(center - 4, y + 34, center + 4, y + 34);
        }
      }
    }

    for (const d of engine.parsed.diamonds) {
      if (engine.collected.has(`${d.col},${d.row}`)) continue;
      const x = d.col * TILE + TILE / 2;
      const y = d.row * TILE + TILE / 2;
      g.fillStyle(INK, 1);
      g.fillPoints([
        { x, y: y - 6 },
        { x: x + 5, y },
        { x, y: y + 6 },
        { x: x - 5, y }
      ], true);
    }

    this.drawDoor(engine);
    this.drawEnemies(engine);
    this.drawStickman(engine);
    this.drawOverlay();
  }

  drawDoor(engine) {
    const d = engine.parsed.door;
    const x = d.col * TILE;
    const y = (d.row + 1) * TILE - 32;
    const g = this.g;
    if (engine.doorOpen) {
      const blink = Math.floor(this.time.now * 0.1) % 2 === 0;
      g.fillStyle(PAPER, blink ? 1 : 0.4);
      g.fillRect(x, y, TILE, 32);
      g.lineStyle(2, INK, 1);
      g.strokeRect(x, y, TILE, 32);
    } else {
      g.lineStyle(2, INK, 1);
      g.strokeRect(x, y, TILE, 32);
      g.lineStyle(1, INK, 1);
      g.lineBetween(x + 5, y, x + 5, y + 32);
      g.lineBetween(x + 10, y, x + 10, y + 32);
    }
  }

  drawEnemies(engine) {
    const g = this.g;
    for (const e of engine.enemies) {
      if (!e.alive) continue;
      const cx = e.x + ENEMY_SIZE / 2;
      const cy = e.y + ENEMY_SIZE / 2;
      g.fillStyle(INK, 1);
      if (e.type === 'patroller') {
        g.fillCircle(cx, cy, 10);
        g.fillStyle(PAPER, 1);
        g.fillCircle(cx - 4, cy - 3, 2);
        g.fillCircle(cx + 4, cy - 3, 2);
      } else {
        g.fillPoints([
          { x: cx, y: e.y + 2 },
          { x: cx - 10, y: e.y + ENEMY_SIZE - 2 },
          { x: cx + 10, y: e.y + ENEMY_SIZE - 2 }
        ], true);
        g.fillStyle(PAPER, 1);
        g.fillCircle(cx, cy - 3, 2.5);
      }
    }
  }

  drawStickman(engine) {
    const s = engine.stickman;
    const g = this.g;
    if (s.invulnT > 0 && Math.floor(this.time.now * 0.12) % 2 === 0) return;
    const cx = s.x + STICK_W / 2;
    const top = s.y;
    g.lineStyle(3, INK, 1);
    g.fillStyle(INK, 1);
    g.fillCircle(cx, top + 6, 5);
    g.lineBetween(cx, top + 10, cx, top + 26);
    g.lineBetween(cx, top + 14, cx + 6 * s.facing, top + 20);
    g.lineBetween(cx, top + 26, cx + 5 * s.facing, top + 36);
    g.lineBetween(cx, top + 26, cx - 5 * s.facing, top + 36);
  }

  drawHUD() {
    const engine = this.engine;
    const hud = this.hud;
    hud.clear();
    hud.fillStyle(PAPER, 1);
    hud.fillRect(0, 0, PLAY_W, 34);
    hud.lineStyle(1, INK, 1);
    hud.lineBetween(0, 34, PLAY_W, 34);
    for (let i = 0; i < 5; i++) {
      const x = 16 + i * 14;
      const alive = i < engine.lives;
      hud.lineStyle(2, alive ? INK : DIM, 1);
      hud.fillStyle(alive ? INK : DIM, 1);
      hud.fillCircle(x, 16, 3);
      hud.lineBetween(x, 18, x, 26);
      hud.lineBetween(x - 3, 22, x + 3, 22);
    }
    for (const b of Object.values(this.buttons)) {
      b.rect.setFillStyle(INK, this.pressed.has(b.d.k) ? 0.5 : 0.15);
    }
    this.pauseBtn.rect.setFillStyle(INK, 0.15);
    this.timeText.setText(`TIME ${String(Math.max(0, Math.ceil(engine.timeLeft))).padStart(3, '0')}`);
    this.livesText.setText('');
  }

  drawOverlay() {
    const engine = this.engine;
    const g = this.overlay;
    g.clear();
    if (engine.status === STATUS.COUNTDOWN) {
      const n = Math.ceil(engine.countdownT);
      this.bigText.setText(n > 0 ? String(n) : 'GO!');
      this.bigText.setAlpha(1);
    } else if (engine.status === STATUS.PLAYING && this.bigText.text !== '') {
      this.bigText.setAlpha(0);
      this.bigText.setText('');
    } else if (engine.status === STATUS.PAUSED) {
      g.fillStyle(INK, 0.55);
      g.fillRect(0, 0, PLAY_W, PLAY_H);
      this.bigText.setText('PAUSED').setAlpha(1);
    } else if (engine.status === STATUS.GAMEOVER) {
      g.fillStyle(INK, 0.75);
      g.fillRect(0, 0, PLAY_W, PLAY_H);
      this.bigText.setText(`GAME OVER\nSCORE ${this.engine.score}\nTAP TO RETRY`).setAlpha(1);
    } else if (engine.status === STATUS.WON) {
      g.fillStyle(INK, 0.75);
      g.fillRect(0, 0, PLAY_W, PLAY_H);
      const next = this.engine.levelNum < 20 ? 'TAP TO CONTINUE' : 'TAP FOR MENU';
      this.bigText.setText(`LEVEL COMPLETE\nSCORE ${this.engine.score}\n${next}`).setAlpha(1);
    }
  }

  handleResultTap() {
    const engine = this.engine;
    if (engine.status === STATUS.WON) {
      if (engine.levelNum < 20) {
        this.scene.restart({ level: engine.levelNum + 1, progress: this.progress });
      } else {
        this.scene.start('menu', { progress: this.progress });
      }
    } else if (engine.status === STATUS.GAMEOVER) {
      engine.retry();
      this.bigText.setAlpha(0);
    }
  }

  onOverlayTap() {
    this.handleResultTap();
  }
}
