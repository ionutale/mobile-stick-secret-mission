import Phaser from 'phaser';
import { PLAY_W, CANVAS_H } from './logic/constants.js';
import { loadProgress } from './logic/progress.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const progress = loadProgress(window.localStorage);

const game = new Phaser.Game({
  type: new URLSearchParams(window.location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
  width: PLAY_W,
  height: CANVAS_H,
  backgroundColor: '#a8e6a0',
  parent: 'game',
  input: {
    activePointers: 6
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MenuScene, GameScene],
  sceneData: { progress }
});

window.__game = game;
