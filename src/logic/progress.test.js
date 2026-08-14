import { describe, it, expect } from 'vitest';
import { loadProgress, saveProgress, PROGRESS_KEY } from './progress.js';

function fakeStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };
}

describe('progress', () => {
  it('defaults for a fresh storage', () => {
    expect(loadProgress(fakeStorage())).toEqual({ unlocked: 1, lives: 5, score: 0 });
  });

  it('round-trips a save', () => {
    const s = fakeStorage();
    saveProgress(s, { unlocked: 7, lives: 3, score: 1250 });
    expect(loadProgress(s)).toEqual({ unlocked: 7, lives: 3, score: 1250 });
    expect(s.getItem(PROGRESS_KEY)).toBeTruthy();
  });

  it('clamps corrupt values', () => {
    const s = fakeStorage();
    s.setItem(PROGRESS_KEY, JSON.stringify({ unlocked: 'x', lives: 99, score: -5 }));
    expect(loadProgress(s)).toEqual({ unlocked: 1, lives: 5, score: 0 });
  });

  it('survives garbage JSON', () => {
    const s = fakeStorage();
    s.setItem(PROGRESS_KEY, '{{{');
    expect(loadProgress(s)).toEqual({ unlocked: 1, lives: 5, score: 0 });
  });
});
