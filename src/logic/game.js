import { G, WALK, JUMP, CLIMB, ROPE_GRAB_RADIUS, TILE, GRID_W, GRID_H, PLAY_W, PLAY_H } from './constants.js';
import { parseLevel, solidAt, cellAt } from './level.js';

export const STICK_W = 18;
export const STICK_H = 38;
export const ENEMY_SIZE = 24;
export const POSE = { GROUND: 'ground', AIR: 'air', CLIMB: 'climb', ROPE: 'rope' };
export const STATUS = { COUNTDOWN: 'countdown', PLAYING: 'playing', PAUSED: 'paused', WON: 'won', GAMEOVER: 'gameover' };
export const COYOTE = 0.1;
export const BUFFER = 0.1;
export const INVULN = 1.5;
export const HOLE_TIME = 2;
export const COUNTDOWN_TIME = 3;
export const DIAMOND_SCORE = 100;
export const ENEMY_SCORE = 50;
export const TIME_BONUS_RATE = 10;

export class Game {
  constructor(levelData, progress = { lives: 5, score: 0 }) {
    this.parsed = parseLevel(levelData);
    this.levelNum = this.parsed.level;
    this.lives = progress.lives;
    this.score = progress.score;
    this.resetLevel(true);
  }

  resetLevel(initial) {
    const p = this.parsed;
    this.timeLeft = p.timer;
    this.diamondsLeft = p.diamonds.length;
    this.doorOpen = false;
    this.collected = new Set();
    this.holes = new Map();
    this.status = STATUS.COUNTDOWN;
    this.countdownT = COUNTDOWN_TIME;
    this.stickman = this.spawnStickman();
    this.enemies = [
      ...p.patrollers.map((c) => this.spawnEnemy('patroller', c)),
      ...p.chasers.map((c) => this.spawnEnemy('chaser', c))
    ];
    this.events = [];
    if (!initial) this.events.push({ type: 'levelRestart' });
  }

  spawnStickman() {
    const s = this.parsed.spawn;
    return {
      x: s.col * TILE + (TILE - STICK_W) / 2,
      y: (s.row + 1) * TILE - STICK_H,
      vx: 0,
      vy: 0,
      pose: POSE.GROUND,
      facing: 1,
      invulnT: 0,
      coyoteT: 0,
      bufferT: 0,
      prevFeetY: 0,
      ropeCol: null,
      ropeGrabY: 0,
      ladderCol: null
    };
  }

  spawnEnemy(type, c) {
    return {
      type,
      x: c.col * TILE + (TILE - ENEMY_SIZE) / 2,
      y: (c.row + 1) * TILE - ENEMY_SIZE,
      vx: 0,
      vy: 0,
      dir: 1,
      alive: true
    };
  }

  rects() {
    const s = this.stickman;
    return {
      stickman: { x: s.x, y: s.y, w: STICK_W, h: STICK_H },
      enemy: (e) => ({ x: e.x, y: e.y, w: ENEMY_SIZE, h: ENEMY_SIZE })
    };
  }

  overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  togglePause() {
    if (this.status === STATUS.PLAYING) this.status = STATUS.PAUSED;
    else if (this.status === STATUS.PAUSED) this.status = STATUS.PLAYING;
  }

  retry() {
    this.lives = 5;
    this.resetLevel(false);
  }

  step(input, dt) {
    if (this.status === STATUS.PAUSED || this.status === STATUS.WON || this.status === STATUS.GAMEOVER) return;
    if (this.status === STATUS.COUNTDOWN) {
      this.countdownT -= dt;
      if (this.countdownT <= 0) this.status = STATUS.PLAYING;
      return;
    }
    this.updateStickman(input, dt);
    this.updateHoles(dt);
    this.updateEnemies(dt);
    this.checkPickups();
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.loseLife('timeout');
    }
    if (this.stickman.y > PLAY_H + 40) this.loseLife('fall');
  }

  updateStickman(input, dt) {
    const s = this.stickman;
    s.invulnT = Math.max(0, s.invulnT - dt);
    s.bufferT = Math.max(0, s.bufferT - dt);
    s.coyoteT = Math.max(0, s.coyoteT - dt);

    if (input.jumpEdge) s.bufferT = BUFFER;

    if (s.pose === POSE.CLIMB) {
      this.updateClimb(input, dt);
    } else if (s.pose === POSE.ROPE) {
      this.updateRope(input, dt);
    } else {
      this.updateFree(input, dt);
    }

    if (s.pose !== POSE.CLIMB && s.pose !== POSE.ROPE) {
      this.tryLadder(input);
      if (s.pose !== POSE.CLIMB && s.pose !== POSE.ROPE) this.tryRope(input);
    }
    this.checkDig(input);
  }

  updateFree(input, dt) {
    const s = this.stickman;
    const dir = input.left ? -1 : input.right ? 1 : 0;
    s.facing = dir !== 0 ? dir : s.facing;
    s.vx = dir * WALK;
    s.vy += G * dt;
    s.vy = Math.min(s.vy, 700);

    s.prevFeetY = s.y + STICK_H;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    this.resolveH(s);
    const grounded = this.resolveV(s);
    if (grounded) {
      s.coyoteT = COYOTE;
      if (s.bufferT > 0) {
        s.vy = -JUMP;
        s.bufferT = 0;
        s.coyoteT = 0;
        s.pose = POSE.AIR;
        return;
      }
      s.pose = POSE.GROUND;
      s.vy = 0;
    } else {
      s.pose = POSE.AIR;
    }

    if (s.pose === POSE.GROUND && s.bufferT > 0) {
      s.vy = -JUMP;
      s.bufferT = 0;
      s.pose = POSE.AIR;
    }

    if (input.jumpEdge && (s.pose === POSE.GROUND || s.coyoteT > 0)) {
      s.vy = -JUMP;
      s.coyoteT = 0;
      s.bufferT = 0;
      s.pose = POSE.AIR;
    }
  }

  resolveH(s) {
    const feetRow = Math.floor((s.y + STICK_H - 6) / TILE);
    const headRow = Math.floor((s.y + 8) / TILE);
    if (s.vx > 0) {
      const right = s.x + STICK_W;
      const col = Math.floor((right + 1) / TILE);
      if (solidAt(this.parsed.tiles, this.holes, col, feetRow) || solidAt(this.parsed.tiles, this.holes, col, headRow)) {
        s.x = col * TILE - STICK_W;
        s.vx = 0;
      }
    } else if (s.vx < 0) {
      const col = Math.floor((s.x - 1) / TILE);
      if (solidAt(this.parsed.tiles, this.holes, col, feetRow) || solidAt(this.parsed.tiles, this.holes, col, headRow)) {
        s.x = (col + 1) * TILE;
        s.vx = 0;
      }
    }
    if (s.x < 0) s.x = 0;
    if (s.x + STICK_W > PLAY_W) s.x = PLAY_W - STICK_W;
  }

  resolveV(s) {
    if (s.vy > 0) {
      const feet = s.y + STICK_H;
      const feetRow = Math.floor((feet + 1) / TILE);
      const col = Math.floor((s.x + STICK_W / 2) / TILE);
      if (solidAt(this.parsed.tiles, this.holes, col, feetRow) && s.prevFeetY <= feetRow * TILE + 2) {
        s.y = feetRow * TILE - STICK_H;
        return true;
      }
    } else if (s.vy < 0 && s.y < 0) {
      s.y = 0;
      s.vy = 0;
    }
    return false;
  }

  tryLadder(input) {
    const s = this.stickman;
    if (!input.up && !input.down) return;
    const cx = s.x + STICK_W / 2;
    const col = Math.floor(cx / TILE);
    const feetRow = Math.floor((s.y + STICK_H - 4) / TILE);
    const c1 = cellAt(this.parsed.tiles, col, feetRow);
    const c2 = cellAt(this.parsed.tiles, col, feetRow - 1);
    const c3 = cellAt(this.parsed.tiles, col, feetRow + 1);
    const onLadder = c1 === 'L' || c2 === 'L' || (input.down && c3 === 'L');
    if (onLadder && Math.abs(cx - (col * TILE + TILE / 2)) < 10) {
      s.pose = POSE.CLIMB;
      s.ladderCol = col;
      s.x = col * TILE + (TILE - STICK_W) / 2;
      s.vx = 0;
      s.vy = 0;
    }
  }

  updateClimb(input, dt) {
    const s = this.stickman;
    const col = s.ladderCol;
    const dir = input.up ? -1 : input.down ? 1 : 0;
    if (dir !== 0) {
      s.y += dir * CLIMB * dt;
      if (s.y + STICK_H > GRID_H * TILE - 2) s.y = GRID_H * TILE - 2 - STICK_H;
      if (s.y < 0) s.y = 0;
    }
    const feetRow = Math.floor((s.y + STICK_H - 2) / TILE);
    const headRow = Math.floor((s.y + 2) / TILE);
    const feetL = cellAt(this.parsed.tiles, col, feetRow) === 'L';
    const headL = cellAt(this.parsed.tiles, col, headRow) === 'L';
    const belowL = cellAt(this.parsed.tiles, col, feetRow + 1) === 'L';
    const onPlatform = solidAt(this.parsed.tiles, this.holes, col, feetRow);

    if (input.left || input.right) {
      s.pose = POSE.AIR;
      s.ladderCol = null;
      s.vx = (input.left ? -1 : 1) * WALK;
      s.vy = 0;
      return;
    }
    if (input.jumpEdge) {
      s.pose = POSE.AIR;
      s.ladderCol = null;
      s.vy = -JUMP;
      s.vx = 0;
      return;
    }
    if (!feetL && !headL && !belowL && !onPlatform) {
      s.pose = POSE.AIR;
      s.ladderCol = null;
      s.vy = 0;
      return;
    }
    if (onPlatform && !feetL) {
      s.y = feetRow * TILE - STICK_H;
      s.pose = POSE.GROUND;
      s.ladderCol = null;
    }
  }

  tryRope(input) {
    if (!input.grabEdge) return;
    const s = this.stickman;
    const cx = s.x + STICK_W / 2;
    for (let c = 0; c < 22; c++) {
      const center = c * TILE + TILE / 2;
      if (Math.abs(cx - center) > ROPE_GRAB_RADIUS) continue;
      for (let r = 0; r < 40; r++) {
        if (cellAt(this.parsed.tiles, c, r) !== 'R') continue;
        const top = r * TILE;
        const bottom = top + TILE;
        if (s.y + STICK_H > top - 6 && s.y < bottom + 6) {
          const ropeTop = this.ropeTop(this.parsed.tiles, c, r);
          s.pose = POSE.ROPE;
          s.ropeCol = c;
          s.ropeGrabY = Math.max(0, Math.min(s.y + STICK_H - ropeTop, this.ropeLen(this.parsed.tiles, c) * TILE - STICK_H));
          s.x = center - STICK_W / 2;
          s.vx = 0;
          s.vy = 0;
          return;
        }
      }
    }
  }

  ropeTop(tiles, c, r) {
    while (r > 0 && tiles[r - 1][c] === 'R') r--;
    return r * TILE;
  }

  ropeLen(tiles, c) {
    let n = 0;
    for (let r = 0; r < 40; r++) if (tiles[r][c] === 'R') n++;
    return n;
  }

  updateRope(input, dt) {
    const s = this.stickman;
    const c = s.ropeCol;
    const top = this.ropeTop(this.parsed.tiles, c, 0);
    const bottom = top + this.ropeLen(this.parsed.tiles, c) * TILE;
    const center = c * TILE + TILE / 2;

    if (input.up || input.down) {
      const dir = input.up ? -1 : 1;
      s.ropeGrabY += dir * CLIMB * dt;
      s.ropeGrabY = Math.max(0, Math.min(bottom - top - STICK_H, s.ropeGrabY));
    }
    s.y = top + s.ropeGrabY;
    s.x = center - STICK_W / 2;
    s.vy = 0;
    s.vx = 0;

    if (input.left || input.right) {
      s.pose = POSE.AIR;
      s.ropeCol = null;
      s.vx = (input.left ? -1 : 1) * WALK * 0.5;
      return;
    }
    if (input.grabEdge) {
      s.pose = POSE.AIR;
      s.ropeCol = null;
      s.vy = 0;
      s.y += 4;
      return;
    }
    if (s.y + STICK_H >= bottom && solidAt(this.parsed.tiles, this.holes, c, Math.floor((bottom + 1) / TILE))) {
      s.pose = POSE.GROUND;
      s.ropeCol = null;
      s.y = bottom;
      return;
    }
  }

  checkDig(input) {
    const s = this.stickman;
    if (!input.digEdge || s.pose !== POSE.GROUND) return;
    const feetRow = Math.floor((s.y + STICK_H + 1) / TILE);
    const col = Math.floor((s.x + STICK_W / 2) / TILE);
    if (solidAt(this.parsed.tiles, this.holes, col, feetRow)) {
      this.holes.set(`${col},${feetRow}`, HOLE_TIME);
      this.events.push({ type: 'dig', col, row: feetRow });
    }
  }

  updateHoles(dt) {
    for (const [key, t] of this.holes) {
      const nt = t - dt;
      if (nt <= 0) this.holes.delete(key);
      else this.holes.set(key, nt);
    }
  }

  updateEnemies(dt) {
    const s = this.stickman;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const center = e.x + ENEMY_SIZE / 2;
      const feetRow = Math.floor((e.y + ENEMY_SIZE + 1) / TILE);
      const col = Math.floor(center / TILE);
      if (this.holes.has(`${col},${feetRow}`)) {
        e.alive = false;
        this.score += ENEMY_SCORE;
        this.events.push({ type: 'enemyFell' });
        continue;
      }

      if (e.type === 'chaser') {
        const sameTier = Math.abs(s.y + STICK_H - (e.y + ENEMY_SIZE)) < 2.5 * TILE;
        if (sameTier) {
          const sx = s.x + STICK_W / 2;
          e.dir = sx > center ? 1 : -1;
        }
      }
      const speed = e.type === 'chaser' ? WALK * 0.8 : WALK * 0.65;
      const ahead = e.dir > 0 ? e.x + ENEMY_SIZE : e.x - 1;
      const aheadCol = Math.floor((ahead + (e.dir > 0 ? 1 : 0)) / TILE);
      if (aheadCol < 0 || aheadCol >= GRID_W || !solidAt(this.parsed.tiles, this.holes, aheadCol, feetRow)) {
        e.dir *= -1;
      }
      e.vx = e.dir * speed;
      e.x += e.vx * dt;
      e.x = Math.max(0, Math.min(PLAY_W - ENEMY_SIZE, e.x));

      if (!solidAt(this.parsed.tiles, this.holes, col, feetRow + 1)) {
        e.vy += G * dt;
        e.y += e.vy * dt;
        const nrow = Math.floor((e.y + ENEMY_SIZE + 1) / TILE);
        if (solidAt(this.parsed.tiles, this.holes, col, nrow)) {
          e.y = nrow * TILE - ENEMY_SIZE;
          e.vy = 0;
        }
        if (e.y > PLAY_H + 60) e.alive = false;
      } else {
        e.y = feetRow * TILE - ENEMY_SIZE;
        e.vy = 0;
      }

      if (s.invulnT > 0) continue;
      const sr = { x: s.x, y: s.y, w: STICK_W, h: STICK_H };
      const er = { x: e.x, y: e.y, w: ENEMY_SIZE, h: ENEMY_SIZE };
      if (this.overlap(sr, er)) {
        const stomping = s.vy > 80 && s.y + STICK_H < e.y + ENEMY_SIZE / 2;
        if (stomping) {
          e.alive = false;
          s.vy = -JUMP * 0.6;
          this.score += ENEMY_SCORE;
          this.events.push({ type: 'stomp' });
        } else {
          this.loseLife('enemy');
          break;
        }
      }
    }
  }

  checkPickups() {
    const s = this.stickman;
    const sr = { x: s.x, y: s.y, w: STICK_W, h: STICK_H };
    for (const d of this.parsed.diamonds) {
      const key = `${d.col},${d.row}`;
      if (this.collected.has(key)) continue;
      const dr = { x: d.col * TILE + 5, y: d.row * TILE + 5, w: 6, h: 6 };
      if (this.overlap(sr, dr)) {
        this.collected.add(key);
        this.diamondsLeft--;
        this.score += DIAMOND_SCORE;
        this.events.push({ type: 'collect', col: d.col, row: d.row });
        if (this.diamondsLeft === 0) {
          this.doorOpen = true;
          this.events.push({ type: 'doorOpen' });
        }
      }
    }
    if (this.doorOpen) {
      const dr = { col: this.parsed.door.col, row: this.parsed.door.row };
      const doorRect = { x: dr.col * TILE, y: (dr.row + 1) * TILE - 32, w: TILE, h: 32 };
      if (this.overlap(sr, doorRect)) {
        this.status = STATUS.WON;
        this.score += Math.max(0, Math.round(this.timeLeft)) * TIME_BONUS_RATE;
        this.events.push({ type: 'levelComplete', score: this.score });
      }
    }
  }

  loseLife(reason) {
    this.lives--;
    this.events.push({ type: 'loseLife', reason, lives: this.lives });
    if (this.lives <= 0) {
      this.status = STATUS.GAMEOVER;
      this.events.push({ type: 'gameover', score: this.score });
      return;
    }
    if (reason === 'timeout') {
      this.resetLevel(false);
    } else {
      this.respawn();
    }
  }

  respawn() {
    this.stickman = this.spawnStickman();
    this.stickman.invulnT = INVULN;
    this.enemies = [
      ...this.parsed.patrollers.map((c) => this.spawnEnemy('patroller', c)),
      ...this.parsed.chasers.map((c) => this.spawnEnemy('chaser', c))
    ];
    this.holes.clear();
    this.timeLeft = this.parsed.timer;
    this.events.push({ type: 'respawn' });
  }
}
