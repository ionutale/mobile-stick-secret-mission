import Phaser from 'phaser';
import { PLAY_W, PLAY_H } from '../logic/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    const g = this.add.graphics();
    g.fillStyle(0x0b110b, 1);
    g.fillRect(0, 0, PLAY_W, PLAY_H);
    g.lineStyle(2, 0x0b110b, 1);
    g.strokeRect(4, 4, PLAY_W - 8, PLAY_H - 8);
    g.lineStyle(2, 0x0b110b, 1);
    g.lineBetween(40, 40, PLAY_W - 40, 40);
    this.add.text(PLAY_W / 2, PLAY_H / 2, 'SECRET MISSION', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#0b110b'
    }).setOrigin(0.5);
  }
}
