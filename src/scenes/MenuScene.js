import Phaser from 'phaser';
import { PLAY_W, PLAY_H } from '../logic/constants.js';
import { sound } from '../logic/sound.js';

const INK = 0x0b110b;
const PAPER = 0xa8e6a0;
const DIM = 0x4f7a4a;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  init(data) {
    this.progress = data.progress || { unlocked: 1, lives: 5, score: 0 };
  }

  create() {
    this.input.on('pointerdown', () => sound.unlock());
    const bg = this.add.graphics();
    bg.fillStyle(PAPER, 1);
    bg.fillRect(0, 0, PLAY_W, PLAY_H);

    this.add.text(PLAY_W / 2, 70, 'SECRET MISSION', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#0b110b'
    }).setOrigin(0.5);
    this.add.text(PLAY_W / 2, 96, 'STICKMAN ADVENTURE', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#4f7a4a'
    }).setOrigin(0.5);
    this.add.text(PLAY_W / 2, 120, `SCORE ${String(this.progress.score).padStart(6, '0')}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#0b110b'
    }).setOrigin(0.5);

    const buttons = [];
    for (let i = 1; i <= 20; i++) {
      const unlocked = i <= this.progress.unlocked;
      const row = Math.floor((i - 1) / 5);
      const col = (i - 1) % 5;
      const x = 56 + col * 62;
      const y = 190 + row * 72;
      const b = this.add.rectangle(x, y, 52, 58, unlocked ? INK : 0x2a4027)
        .setStrokeStyle(2, INK);
      const t = this.add.text(x, y, String(i), {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: unlocked ? '#a8e6a0' : '#3a5238'
      }).setOrigin(0.5);
      buttons.push({ rect: b, text: t, level: i, unlocked });
      if (unlocked) {
        b.setInteractive({ useHandCursor: true });
        b.on('pointerdown', () => this.startLevel(i));
      }
    }

    this.add.text(PLAY_W / 2, PLAY_H - 34, 'collect all diamonds, open the door', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: DIM
    }).setOrigin(0.5);
  }

  startLevel(level) {
    this.scene.start('game', { level, progress: this.progress });
  }
}
