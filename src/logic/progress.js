export const PROGRESS_KEY = 'secret-mission-progress-v1';

export function loadProgress(storage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        unlocked: Number.isInteger(p.unlocked) && p.unlocked >= 1 ? p.unlocked : 1,
        lives: Number.isInteger(p.lives) && p.lives >= 1 && p.lives <= 5 ? p.lives : 5,
        score: Number.isInteger(p.score) && p.score >= 0 ? p.score : 0
      };
    }
  } catch {
    // fall through to defaults
  }
  return { unlocked: 1, lives: 5, score: 0 };
}

export function saveProgress(storage, progress) {
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // storage unavailable; ignore
  }
}
