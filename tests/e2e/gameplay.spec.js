import { test, expect } from '@playwright/test';
import { openGame, startLevel, scene, hold, holdUntil, waitFor, tapLogical } from './helpers.js';

test('plays level 1 to completion with the keyboard and saves progress', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 1);

  const reached = await holdUntil(page, 'ArrowRight', async () => {
    const s = await scene(page);
    return s.x >= 182;
  }, 20000, 25);
  expect(reached).toBe(true);

  await page.keyboard.down('ArrowUp');
  let climbed = false;
  const climbStart = Date.now();
  while (Date.now() - climbStart < 20000 && !climbed) {
    const s = await scene(page);
    climbed = s.pose === 'ground' && s.y < 30 * 16;
    if (!climbed && s.pose === 'ground') {
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
    }
  }
  await page.keyboard.up('ArrowUp');
  expect(climbed).toBe(true);

  const grabbed = await holdUntil(page, 'ArrowLeft', async () => {
    const s = await scene(page);
    return s.diamondsLeft === 2;
  }, 5000, 25);
  expect(grabbed).toBe(true);

  await holdUntil(page, 'ArrowRight', async () => {
    const s = await scene(page);
    return s.status === 'won';
  }, 10000);

  const final = await scene(page);
  expect(final.status).toBe('won');
  expect(final.diamondsLeft).toBe(0);
  expect(final.score).toBeGreaterThan(0);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('secret-mission-progress-v1')));
  expect(saved.unlocked).toBe(2);
  expect(saved.lives).toBe(5);

  await page.keyboard.press('Enter');
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine && s.engine.levelNum === 2;
  }, null, { timeout: 10000 });
});

test('progress persists across a reload', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 1);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('game');
    s.engine.doorOpen = true;
    s.engine.stickman.x = 15 * 16;
    s.engine.stickman.y = 29 * 16 - 38;
  });
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine.status === 'won';
  }, null, { timeout: 10000 });

  await page.reload();
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('menu'), null, { timeout: 15000 });
  const unlocked = await page.evaluate(() => JSON.parse(localStorage.getItem('secret-mission-progress-v1')).unlocked);
  expect(unlocked).toBe(2);
});

test('touching a patroller on level 5 costs a life and respawns with grace', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 5);

  await holdUntil(page, 'ArrowRight', async () => {
    const s = await scene(page);
    return s.x >= 40;
  }, 5000, 25);
  const climbed = await holdUntil(page, 'ArrowUp', async () => {
    const s = await scene(page);
    return s.pose === 'ground' && s.y < 36 * 16;
  }, 10000);
  expect(climbed).toBe(true);

  const hit = await waitFor(page, async () => (await scene(page)).lives === 4, 15000);
  expect(hit).toBe(true);

  const after = await scene(page);
  expect(after.y).toBeGreaterThan(560);
  expect(after.invuln).toBeGreaterThan(0);
});

test('game over retries the current level with lives refilled', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 5);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('game');
    s.engine.lives = 1;
  });

  await holdUntil(page, 'ArrowRight', async () => {
    const s = await scene(page);
    return s.x >= 40;
  }, 5000, 25);
  await holdUntil(page, 'ArrowUp', async () => {
    const s = await scene(page);
    return s.pose === 'ground' && s.y < 36 * 16;
  }, 10000);

  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine.status === 'gameover';
  }, null, { timeout: 15000 });
  expect((await scene(page)).lives).toBe(0);

  await page.keyboard.press('Enter');
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine && s.engine.status === 'playing' && s.engine.lives === 5;
  }, null, { timeout: 15000 });
  expect((await scene(page)).level).toBe(5);
});

test('tapping the level button on the menu starts the level', async ({ page }) => {
  await openGame(page);
  await tapLogical(page, 56, 190);
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine && s.engine.levelNum === 1;
  }, null, { timeout: 10000 });
});
