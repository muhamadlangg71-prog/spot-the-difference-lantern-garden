// Staged scenes for screenshots (?shot=start|play|end&seed=N).
// Deterministic for a given seed: the scene art is seeded, and the
// staged state below is fixed.
import { LEVELS } from './config.js';
import { createWorld, newGame } from './world.js';

export function stageShot(name, world, seed = 1) {
  if (name === 'start') {
    const fresh = createWorld(seed);
    fresh.screen = 'title';
    return fresh;
  }
  if (name === 'play') {
    newGame(world);
    world.seed = seed;
    // 3 of level 1's 7 differences found, 4 still unfound, ~45s left.
    world.found = new Set([0, 1, 2]);
    world.score = 3 * 100;
    world.timeLeft = 45;
    world.screen = 'play';
    return world;
  }
  if (name === 'end') {
    newGame(world);
    world.seed = seed;
    const level = LEVELS[0];
    world.found = new Set(level.differences.map((_, i) => i));
    world.timeLeft = 30;
    world.lastBonus = Math.ceil(world.timeLeft) * 10;
    world.score = level.differences.length * 100 + world.lastBonus;
    world.screen = 'clear';
    world.clearedAll = false;
    return world;
  }
  throw new Error(`unknown shot: ${name}`);
}
