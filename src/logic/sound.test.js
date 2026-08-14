import { describe, it, expect } from 'vitest';
import { soundForEvent, createSoundEngine } from './sound.js';

describe('soundForEvent', () => {
  it('maps engine events to sounds', () => {
    expect(soundForEvent('collect')).toBe('collect');
    expect(soundForEvent('dig')).toBe('dig');
    expect(soundForEvent('stomp')).toBe('stomp');
    expect(soundForEvent('enemyFell')).toBe('enemyFell');
    expect(soundForEvent('doorOpen')).toBe('doorOpen');
    expect(soundForEvent('levelComplete')).toBe('win');
    expect(soundForEvent('gameover')).toBe('gameover');
    expect(soundForEvent('loseLife')).toBe('loseLife');
    expect(soundForEvent('respawn')).toBeNull();
  });
});

describe('createSoundEngine', () => {
  it('play is a no-op before unlock', () => {
    const engine = createSoundEngine(() => null);
    expect(() => engine.play('jump')).not.toThrow();
    expect(engine.unlocked).toBe(false);
  });

  it('unlock and play schedule tones on the context', () => {
    const started = [];
    const fakeCtx = {
      currentTime: 0,
      destination: {},
      state: 'running',
      createOscillator() {
        return {
          type: '',
          frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
          start(t) { started.push(t); },
          stop() {},
          disconnect() {},
          onended: null
        };
      },
      createGain() {
        return {
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
          disconnect() {}
        };
      }
    };
    const engine = createSoundEngine(() => fakeCtx);
    engine.unlock();
    expect(engine.unlocked).toBe(true);
    engine.play('collect');
    expect(started.length).toBe(2);
  });
});
