import { test, expect } from '@playwright/test';
import { openGame, startLevel, scene, holdButton, tapButton, waitFor } from './helpers.js';

const RIGHT_BTN = [96, 700];
const LEFT_BTN = [36, 700];
const JUMP_BTN = [294, 692];
const GRAB_BTN = [154, 668];

test('holding the RIGHT button moves the stickman right', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 1);
  const before = await scene(page);
  await holdButton(page, ...RIGHT_BTN, 800);
  const after = await scene(page);
  expect(after.x).toBeGreaterThan(before.x + 40);
});

test('holding the LEFT button moves the stickman left', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 1);
  await holdButton(page, ...RIGHT_BTN, 600);
  const before = await scene(page);
  await holdButton(page, ...LEFT_BTN, 500);
  const after = await scene(page);
  expect(after.x).toBeLessThan(before.x - 20);
});

test('tapping the JUMP button makes the stickman jump', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 1);
  const before = await scene(page);
  await tapButton(page, ...JUMP_BTN);
  const jumped = await waitFor(page, async () => {
    const s = await scene(page);
    return s.y < before.y - 30;
  }, 5000, 50);
  expect(jumped).toBe(true);
});

test('GRAB button grabs and releases the rope on level 2', async ({ page }) => {
  await openGame(page);
  await startLevel(page, 2);
  await holdButton(page, ...RIGHT_BTN, 1400);
  await tapButton(page, ...JUMP_BTN);
  const onTier = await waitFor(page, async () => {
    const s = await scene(page);
    return s.pose === 'ground' && s.y < 36 * 16;
  }, 8000, 50);
  expect(onTier).toBe(true);

  await tapButton(page, ...GRAB_BTN);
  const grabbed = await waitFor(page, async () => (await scene(page)).pose === 'rope', 5000, 50);
  expect(grabbed).toBe(true);

  await tapButton(page, ...GRAB_BTN);
  const released = await waitFor(page, async () => (await scene(page)).pose !== 'rope', 5000, 50);
  expect(released).toBe(true);
});
