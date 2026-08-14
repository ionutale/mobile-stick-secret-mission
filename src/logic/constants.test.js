import { describe, it, expect } from 'vitest';
import { G, WALK, JUMP, CLIMB, TILE, GRID_W, GRID_H, PLAY_W, PLAY_H, ROPE_GRAB_RADIUS } from './constants.js';

describe('locked mechanics constants', () => {
  it('carries the physics numbers from ticket 04', () => {
    expect(G).toBe(900);
    expect(WALK).toBe(130);
    expect(JUMP).toBe(380);
    expect(CLIMB).toBe(80);
  });
  it('matches the 16px grid from tickets 07 and 09', () => {
    expect(TILE).toBe(16);
    expect(GRID_W).toBe(22);
    expect(GRID_H).toBe(40);
    expect(PLAY_W).toBe(352);
    expect(PLAY_H).toBe(640);
  });
  it('rope grab radius from ticket 02', () => {
    expect(ROPE_GRAB_RADIUS).toBe(22);
  });
});
