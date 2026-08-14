import { TILE, GRID_W, GRID_H } from './constants.js';

export function parseLevel(data) {
  if (!data || !Array.isArray(data.grid) || data.grid.length !== GRID_H) {
    throw new Error(`level ${data?.level}: grid must have ${GRID_H} rows`);
  }
  const tiles = [];
  let spawn = null;
  let door = null;
  const diamonds = [];
  const patrollers = [];
  const chasers = [];
  for (let r = 0; r < GRID_H; r++) {
    const row = data.grid[r];
    if (typeof row !== 'string' || row.length !== GRID_W) {
      throw new Error(`level ${data.level}: row ${r} must be exactly ${GRID_W} chars`);
    }
    tiles.push(row.split(''));
    for (let c = 0; c < GRID_W; c++) {
      const ch = row[c];
      if (ch === 'S') spawn = { col: c, row: r };
      else if (ch === 'E') door = { col: c, row: r };
      else if (ch === '*') diamonds.push({ col: c, row: r });
      else if (ch === 'P') patrollers.push({ col: c, row: r });
      else if (ch === 'C') chasers.push({ col: c, row: r });
    }
  }
  if (!spawn) throw new Error(`level ${data.level}: missing S`);
  if (!door) throw new Error(`level ${data.level}: missing E`);
  return {
    level: data.level,
    timer: data.timer,
    tiles,
    spawn,
    door,
    diamonds,
    patrollers,
    chasers,
    width: GRID_W,
    height: GRID_H
  };
}

export function cellAt(tiles, col, row) {
  if (col < 0 || col >= GRID_W || row < 0 || row >= GRID_H) return null;
  return tiles[row][col];
}

export function solidAt(tiles, holes, col, row) {
  if (col < 0 || col >= GRID_W || row < 0) return true;
  if (row >= GRID_H) return false;
  const ch = tiles[row][col];
  if (ch === 'X') {
    if (holes.has(`${col},${row}`)) return false;
    return true;
  }
  return false;
}
