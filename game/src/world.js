// Pure game state and rules for Lantern Garden — Spot the Difference.
// No drawing, no browser APIs: importable and unit-testable in Node.
import {
  LEVELS,
  SCORE_PER_DIFF,
  TIME_BONUS_PER_SEC,
  HINT_COST,
  WRONG_PENALTY_SEC,
} from './config.js';

export function createWorld(seed = 1) {
  return {
    seed,
    screen: 'title', // 'title' | 'play' | 'pause' | 'clear' | 'over'
    levelIndex: 0,
    found: new Set(),
    score: 0,
    levelStartScore: 0,
    timeLeft: 0,
    misses: 0,
    hintsUsed: 0,
    hintIndex: null,
    wrongFlash: null, // { panel, x, y, age }
    lastBonus: 0,
    clearedAll: false,
    best: 0,
  };
}

export function levelOf(world) {
  return LEVELS[world.levelIndex];
}

export function startLevel(world, index) {
  world.levelIndex = index;
  world.found = new Set();
  world.levelStartScore = world.score;
  world.timeLeft = LEVELS[index].time;
  world.hintIndex = null;
  world.wrongFlash = null;
  world.lastBonus = 0;
  world.screen = 'play';
}

export function newGame(world) {
  world.score = 0;
  world.misses = 0;
  world.hintsUsed = 0;
  world.clearedAll = false;
  startLevel(world, 0);
}

// Restart the current level (keeps the score earned on earlier levels).
// From title / clear / over screens, restarts the whole game instead.
export function restart(world) {
  if (world.screen === 'play' || world.screen === 'pause') {
    world.score = world.levelStartScore;
    startLevel(world, world.levelIndex);
  } else {
    newGame(world);
  }
}

// Advance after a level clear. Returns true when another level starts,
// false when the whole game is done (caller should start a new game).
export function nextLevel(world) {
  if (world.levelIndex + 1 < LEVELS.length) {
    startLevel(world, world.levelIndex + 1);
    return true;
  }
  return false;
}

export function togglePause(world) {
  if (world.screen === 'play') world.screen = 'pause';
  else if (world.screen === 'pause') world.screen = 'play';
}

// Click in panel-local coordinates. panel is 0 (left) or 1 (right);
// both panels share the same difference positions, so either counts.
export function clickAt(world, panel, x, y) {
  if (world.screen !== 'play') return { type: 'ignored' };
  const level = levelOf(world);
  for (let i = 0; i < level.differences.length; i++) {
    if (world.found.has(i)) continue;
    const d = level.differences[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      world.found.add(i);
      world.score += SCORE_PER_DIFF;
      if (world.hintIndex === i) world.hintIndex = null;
      if (world.found.size === level.differences.length) {
        world.lastBonus = Math.ceil(world.timeLeft) * TIME_BONUS_PER_SEC;
        world.score += world.lastBonus;
        world.clearedAll = world.levelIndex === LEVELS.length - 1;
        world.screen = 'clear';
        return { type: 'hit', index: i, cleared: true };
      }
      return { type: 'hit', index: i, cleared: false };
    }
  }
  // Miss: -5 seconds and a red X flash at the click.
  world.timeLeft = Math.max(0, world.timeLeft - WRONG_PENALTY_SEC);
  world.misses += 1;
  world.wrongFlash = { panel, x, y, age: 0 };
  if (world.timeLeft <= 0) {
    world.screen = 'over';
    return { type: 'miss', timedOut: true };
  }
  return { type: 'miss', timedOut: false };
}

// Reveal the first unfound difference. Costs 50 points, floored at 0.
export function useHint(world) {
  if (world.screen !== 'play') return null;
  const level = levelOf(world);
  for (let i = 0; i < level.differences.length; i++) {
    if (!world.found.has(i)) {
      world.hintIndex = i;
      world.score = Math.max(0, world.score - HINT_COST);
      world.hintsUsed += 1;
      return i;
    }
  }
  return null;
}

export function tick(world, dt) {
  if (world.screen === 'play') {
    world.timeLeft -= dt;
    if (world.timeLeft <= 0) {
      world.timeLeft = 0;
      world.screen = 'over';
    }
  }
  if (world.wrongFlash) {
    world.wrongFlash.age += dt;
    if (world.wrongFlash.age > 0.6) world.wrongFlash = null;
  }
}
