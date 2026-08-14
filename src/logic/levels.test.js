import { describe, it, expect } from 'vitest';
import { parseLevel } from './level.js';
import { LEVELS } from './levels.js';

describe('level parsing', () => {
  it('parses every shipped level', () => {
    expect(LEVELS.length).toBe(20);
    for (let i = 0; i < 20; i++) {
      const parsed = parseLevel(LEVELS[i]);
      expect(parsed.level).toBe(i + 1);
      expect(parsed.timer).toBeGreaterThan(0);
      expect(parsed.spawn).toBeTruthy();
      expect(parsed.door).toBeTruthy();
      expect(parsed.diamonds.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('matches the difficulty-curve enemy table', () => {
    const expected = [0, 0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5];
    for (let i = 0; i < 20; i++) {
      const parsed = parseLevel(LEVELS[i]);
      expect(parsed.patrollers.length + parsed.chasers.length).toBe(expected[i]);
    }
  });

  it('matches the timer formula', () => {
    for (let i = 0; i < 20; i++) {
      const lv = i + 1;
      const expected = Math.max(60, 90 - 2 * Math.max(0, lv - 2));
      expect(parseLevel(LEVELS[i]).timer).toBe(expected);
    }
  });
});
