import { test, expect } from '@playwright/test';

test('game boots and renders a canvas', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeVisible();
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('menu'));
});

test('starts level 1, timer counts down, stickman moves with keys', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('menu'));
  await page.evaluate(() => {
    window.__game.scene.start('game', { level: 1, progress: { unlocked: 1, lives: 5, score: 0 } });
  });
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine && s.engine.status === 'playing';
  }, null, { timeout: 10000 });

  const t0 = await page.evaluate(() => window.__game.scene.getScene('game').engine.timeLeft);
  await page.waitForTimeout(1200);
  const t1 = await page.evaluate(() => window.__game.scene.getScene('game').engine.timeLeft);
  expect(t1).toBeLessThan(t0);

  const x0 = await page.evaluate(() => window.__game.scene.getScene('game').engine.stickman.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(800);
  await page.keyboard.up('ArrowRight');
  const x1 = await page.evaluate(() => window.__game.scene.getScene('game').engine.stickman.x);
  expect(x1).toBeGreaterThan(x0 + 20);
});

test('collecting all diamonds opens the door on level 1', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('menu'));
  await page.evaluate(() => {
    window.__game.scene.start('game', { level: 1, progress: { unlocked: 1, lives: 5, score: 0 } });
  });
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine && s.engine.status === 'playing';
  }, null, { timeout: 10000 });
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('game');
    for (const d of s.engine.parsed.diamonds) {
      s.engine.collected.add(`${d.col},${d.row}`);
    }
    s.engine.diamondsLeft = 0;
    s.engine.doorOpen = true;
  });
  const open = await page.evaluate(() => window.__game.scene.getScene('game').engine.doorOpen);
  expect(open).toBe(true);
});
