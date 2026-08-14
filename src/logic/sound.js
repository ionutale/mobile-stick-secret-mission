const EVENT_SOUNDS = {
  collect: 'collect',
  dig: 'dig',
  stomp: 'stomp',
  enemyFell: 'enemyFell',
  doorOpen: 'doorOpen',
  levelComplete: 'win',
  gameover: 'gameover',
  loseLife: 'loseLife'
};

export function soundForEvent(type) {
  return EVENT_SOUNDS[type] || null;
}

const DEFS = {
  jump: [{ f: 320, d: 0.09, v: 0.22 }],
  dig: [{ f: 220, d: 0.06, v: 0.25 }, { f: 150, d: 0.06, v: 0.25 }, { f: 90, d: 0.09, v: 0.25 }],
  collect: [{ f: 660, d: 0.07, v: 0.22 }, { f: 880, d: 0.1, v: 0.22 }],
  stomp: [{ f: 180, d: 0.12, type: 'triangle', v: 0.3 }],
  enemyFell: [{ f: 400, e: 120, d: 0.25, v: 0.22 }],
  doorOpen: [{ f: 523, d: 0.08, v: 0.22 }, { f: 659, d: 0.08, v: 0.22 }, { f: 784, d: 0.12, v: 0.22 }],
  win: [{ f: 523, d: 0.1, v: 0.22 }, { f: 659, d: 0.1, v: 0.22 }, { f: 784, d: 0.1, v: 0.22 }, { f: 1047, d: 0.25, v: 0.24 }],
  gameover: [{ f: 330, d: 0.15, v: 0.24 }, { f: 262, d: 0.15, v: 0.24 }, { f: 196, d: 0.32, v: 0.26 }],
  loseLife: [{ f: 150, d: 0.18, type: 'sawtooth', v: 0.2 }],
  tick: [{ f: 880, d: 0.05, v: 0.14 }],
  go: [{ f: 1047, d: 0.12, v: 0.22 }]
};

function tone(ctx, t, spec) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + (spec.delay || 0);
  osc.type = spec.type || 'square';
  osc.frequency.setValueAtTime(spec.f, start);
  if (spec.e) osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.e), start + spec.d);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(spec.v || 0.2, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + spec.d);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + spec.d + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

export function createSoundEngine(makeCtx) {
  let ctx = null;
  return {
    unlock() {
      if (ctx) return;
      try {
        if (makeCtx) {
          ctx = makeCtx();
        } else {
          const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
          if (!AC) return;
          ctx = new AC();
        }
        if (ctx.state === 'suspended') ctx.resume();
      } catch {
        ctx = null;
      }
    },
    play(name) {
      if (!ctx || !DEFS[name]) return;
      const defs = DEFS[name];
      defs.forEach((spec, i) => tone(ctx, ctx.currentTime, { ...spec, delay: i * 0.06 }));
    },
    get unlocked() {
      return ctx !== null;
    }
  };
}

export const sound = createSoundEngine();
