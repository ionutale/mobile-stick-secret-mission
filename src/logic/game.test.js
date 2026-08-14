import { describe, it, expect, beforeEach } from 'vitest';
import { Game, STATUS, POSE, INVULN, ENEMY_SIZE } from './game.js';
import { WALK, PLAY_W } from './constants.js';

const H = 40;
const W = 22;

function makeLevel(overrides = {}) {
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  for (let r = 0; r < H; r++) { g[r][0] = 'X'; g[r][W - 1] = 'X'; }
  g[0] = Array(W).fill('X');
  g[H - 1] = Array(W).fill('X');
  for (let c = 2; c <= 19; c++) g[36][c] = 'X';
  for (let c = 8; c <= 14; c++) g[24][c] = 'X';
  for (let r = 25; r <= 38; r++) g[r][9] = 'L';
  for (let r = 25; r <= 30; r++) g[r][12] = 'R';
  g[23][10] = '*';
  g[23][13] = 'E';
  g[38][2] = 'S';
  if (overrides.patroller) g[38][16] = 'P';
  if (overrides.chaser) g[23][8] = 'C';
  const grid = g.map((row) => row.join(''));
  return { level: 1, timer: 60, tileset: 1, grid };
}

function emptyInput() {
  return { left: false, right: false, up: false, down: false, jumpEdge: false, grabEdge: false, digEdge: false };
}

function boot(game) {
  let guard = 0;
  while (game.status === STATUS.COUNTDOWN && guard++ < 400) game.step(emptyInput(), 1 / 60);
}

function stepFor(game, seconds, input = emptyInput()) {
  const frames = Math.round(seconds * 60);
  for (let i = 0; i < frames; i++) game.step(input, 1 / 60);
}

describe('stickman motion', () => {
  let game;
  beforeEach(() => {
    game = new Game(makeLevel(), { lives: 5, score: 0 });
    boot(game);
  });

  it('stands on the ground without falling', () => {
    const y0 = game.stickman.y;
    stepFor(game, 1);
    expect(game.stickman.y).toBeCloseTo(y0, 0);
    expect(game.stickman.pose).toBe(POSE.GROUND);
  });

  it('walks right when right is held', () => {
    const x0 = game.stickman.x;
    stepFor(game, 0.5, { ...emptyInput(), right: true });
    expect(game.stickman.x).toBeGreaterThan(x0 + 40);
  });

  it('jumps and returns to the ground', () => {
    const y0 = game.stickman.y;
    const input = { ...emptyInput(), jumpEdge: true };
    game.step(input, 1 / 60);
    let peak = game.stickman.y;
    let guard = 0;
    while (game.stickman.pose === POSE.AIR && guard++ < 120) {
      game.step(emptyInput(), 1 / 60);
      peak = Math.min(peak, game.stickman.y);
    }
    expect(peak).toBeLessThan(y0 - 60);
    expect(game.stickman.pose).toBe(POSE.GROUND);
  });

  it('jump height matches the spec (~5 tiles)', () => {
    const y0 = game.stickman.y;
    game.step({ ...emptyInput(), jumpEdge: true }, 1 / 60);
    let peak = game.stickman.y;
    let guard = 0;
    while (game.stickman.pose === POSE.AIR && guard++ < 120) {
      game.step(emptyInput(), 1 / 60);
      peak = Math.min(peak, game.stickman.y);
    }
    expect(y0 - peak).toBeGreaterThan(60);
    expect(y0 - peak).toBeLessThan(110);
  });

  it('climbs a ladder while holding up', () => {
    stepFor(game, 0.9, { ...emptyInput(), right: true });
    const y0 = game.stickman.y;
    let climbed = false;
    let guard = 0;
    while (!climbed && guard++ < 120) {
      game.step({ ...emptyInput(), up: true }, 1 / 60);
      climbed = game.stickman.pose === POSE.CLIMB && game.stickman.y < y0 - 10;
    }
    expect(climbed).toBe(true);
  });

  it('collects a diamond on contact', () => {
    stepFor(game, 0.9, { ...emptyInput(), right: true });
    let onTop = false;
    let guard = 0;
    while (!onTop && guard++ < 300) {
      game.step({ ...emptyInput(), up: true }, 1 / 60);
      onTop = game.stickman.pose === POSE.GROUND && game.stickman.y < 30 * 16;
    }
    expect(onTop).toBe(true);
    let collected = false;
    guard = 0;
    while (!collected && guard++ < 300) {
      game.step({ ...emptyInput(), right: true }, 1 / 60);
      collected = game.events.some((e) => e.type === 'collect');
    }
    expect(collected).toBe(true);
    expect(game.diamondsLeft).toBe(0);
    expect(game.doorOpen).toBe(true);
  });
});

describe('trap holes', () => {
  it('digs a hole that refills after 2 seconds', () => {
    const game = new Game(makeLevel(), { lives: 5, score: 0 });
    boot(game);
    const feetRow = Math.floor((game.stickman.y + 38 + 1) / 16);
    game.step({ ...emptyInput(), digEdge: true }, 1 / 60);
    expect(game.holes.size).toBe(1);
    stepFor(game, 2.5);
    expect(game.holes.size).toBe(0);
  });
});

describe('enemies', () => {
  it('a patroller edge-turns instead of falling off its platform', () => {
    const game = new Game(makeLevel({ patroller: true }), { lives: 5, score: 0 });
    boot(game);
    const patroller = game.enemies.find((e) => e.type === 'patroller');
    stepFor(game, 6);
    expect(patroller.alive).toBe(true);
    expect(patroller.y).toBeGreaterThan(39 * 16 - 26);
    expect(patroller.y).toBeLessThan(39 * 16);
    expect(patroller.x).toBeGreaterThan(0);
    expect(patroller.x).toBeLessThan(PLAY_W - ENEMY_SIZE);
  });

  it('touching an enemy costs a life and respawns with grace', () => {
    const game = new Game(makeLevel({ patroller: true }), { lives: 5, score: 0 });
    boot(game);
    const input = { ...emptyInput(), right: true };
    let lost = false;
    let guard = 0;
    while (!lost && guard++ < 600) {
      game.step(input, 1 / 60);
      lost = game.events.some((e) => e.type === 'loseLife');
    }
    expect(lost).toBe(true);
    expect(game.lives).toBe(4);
    expect(game.stickman.invulnT).toBeGreaterThan(0);
    expect(game.stickman.invulnT).toBeLessThanOrEqual(INVULN);
    expect(game.diamondsLeft).toBe(1);
  });

  it('stomping an enemy defeats it and bounces the stickman', () => {
    const game = new Game(makeLevel({ patroller: true }), { lives: 5, score: 0 });
    boot(game);
    const patroller = game.enemies.find((e) => e.type === 'patroller');
    game.stickman.y = patroller.y - 90;
    game.stickman.pose = POSE.AIR;
    game.stickman.vy = 150;
    let stomped = false;
    let guard = 0;
    while (!stomped && guard++ < 200) {
      game.stickman.x = patroller.x;
      game.step(emptyInput(), 1 / 60);
      stomped = game.events.some((e) => e.type === 'stomp');
    }
    expect(stomped).toBe(true);
    expect(patroller.alive).toBe(false);
  });

  it('a chaser homes in on the stickman on the same tier', () => {
    const game = new Game(makeLevel({ chaser: true }), { lives: 5, score: 0 });
    boot(game);
    const chaser = game.enemies.find((e) => e.type === 'chaser');
    game.stickman.x = 13 * 16;
    game.stickman.y = 24 * 16 - 38;
    game.stickman.pose = POSE.GROUND;
    const before = chaser.x;
    stepFor(game, 2);
    expect(chaser.x).toBeGreaterThan(before);
  });
});

describe('fail and win flows', () => {
  it('falling off the world costs a life and respawns at spawn', () => {
    const game = new Game(makeLevel(), { lives: 5, score: 0 });
    boot(game);
    game.stickman.y = 700;
    let guard = 0;
    while (game.stickman.y < 720 && guard++ < 200) game.step(emptyInput(), 1 / 60);
    expect(game.lives).toBe(4);
    expect(game.stickman.y).toBeLessThan(600);
    expect(game.events.some((e) => e.type === 'respawn')).toBe(true);
  });

  it('timeout costs a life and restarts the level fully', () => {
    const game = new Game(makeLevel(), { lives: 5, score: 0 });
    boot(game);
    game.timeLeft = 0.5;
    stepFor(game, 0.6);
    expect(game.lives).toBe(4);
    expect(game.status).toBe(STATUS.COUNTDOWN);
    expect(game.diamondsLeft).toBe(1);
  });

  it('game over on zero lives', () => {
    const game = new Game(makeLevel(), { lives: 1, score: 0 });
    boot(game);
    game.loseLife('fall');
    expect(game.status).toBe(STATUS.GAMEOVER);
  });

  it('walking into the open door wins the level', () => {
    const game = new Game(makeLevel(), { lives: 5, score: 0 });
    boot(game);
    game.collected.add('23,10');
    game.diamondsLeft = 0;
    game.doorOpen = true;
    game.stickman.x = 13 * 16;
    game.stickman.y = 23 * 16;
    stepFor(game, 0.2);
    expect(game.status).toBe(STATUS.WON);
    expect(game.events.some((e) => e.type === 'levelComplete')).toBe(true);
  });
});
