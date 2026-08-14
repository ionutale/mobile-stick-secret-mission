export async function openGame(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game && window.__game.scene.isActive('menu'), null, { timeout: 15000 });
}

export async function startLevel(page, level, progress = { unlocked: 1, lives: 5, score: 0 }) {
  await page.evaluate(({ level, progress }) => {
    window.__game.scene.start('game', { level, progress });
  }, { level, progress });
  await waitPlaying(page);
}

export async function waitPlaying(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const s = window.__game.scene.getScene('game');
    return s && s.engine && s.engine.status === 'playing';
  }, null, { timeout });
}

export function scene(page) {
  return page.evaluate(() => {
    const s = window.__game.scene.getScene('game');
    return {
      status: s.engine.status,
      level: s.engine.levelNum,
      lives: s.engine.lives,
      score: s.engine.score,
      x: s.engine.stickman.x,
      y: s.engine.stickman.y,
      pose: s.engine.stickman.pose,
      invuln: s.engine.stickman.invulnT,
      diamondsLeft: s.engine.diamondsLeft,
      doorOpen: s.engine.doorOpen,
      timeLeft: s.engine.timeLeft,
      countdown: s.engine.countdownT
    };
  });
}

export async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

export async function holdUntil(page, key, predicate, timeout = 20000, interval = 100) {
  await page.keyboard.down(key);
  const start = Date.now();
  try {
    while (Date.now() - start < timeout) {
      if (await predicate()) return true;
      await page.waitForTimeout(interval);
    }
    return false;
  } finally {
    await page.keyboard.up(key);
  }
}

export async function waitFor(page, predicate, timeout = 20000, interval = 100) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return true;
    await page.waitForTimeout(interval);
  }
  return false;
}

export async function tapLogical(page, x, y) {
  const box = await page.locator('#game canvas').boundingBox();
  const s = box.width / 352;
  await page.mouse.click(box.x + x * s, box.y + y * s);
}

export async function holdButton(page, x, y, ms) {
  const box = await page.locator('#game canvas').boundingBox();
  const s = box.width / 352;
  await page.mouse.move(box.x + x * s, box.y + y * s);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

export async function tapButton(page, x, y) {
  const box = await page.locator('#game canvas').boundingBox();
  const s = box.width / 352;
  await page.mouse.move(box.x + x * s, box.y + y * s);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.up();
}
