// Boot + fixed-step loop for Lantern Garden.
// ?shot=start|play|end&seed=N paints the staged scene twice and sets
// window.__shotReady = true (for screenshots); otherwise runs the game.
// ?seed=N gives a deterministic layout.
import {
  LEVELS,
  PANEL_W,
  PANEL_H,
  PANEL_Y,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  HINT_BTN,
} from './config.js';
import {
  createWorld,
  newGame,
  clickAt,
  useHint,
  tick,
  togglePause,
  restart,
  nextLevel,
} from './world.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import {
  playClick,
  playFound,
  playWrong,
  playHint,
  playClear,
  playWin,
} from './sound.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seed = parseInt(params.get('seed') || '1', 10) || 1;
const shot = params.get('shot');

let world = createWorld(seed);
try {
  world.best = parseInt(localStorage.getItem('lanternGardenBest') || '0', 10) || 0;
} catch {
  world.best = 0;
}

function saveBest() {
  try {
    if (world.score > world.best) {
      world.best = world.score;
      localStorage.setItem('lanternGardenBest', String(world.best));
    }
  } catch {
    // best score is a nicety; never break the game
  }
}

let lastStatus = '';
function updateStatus() {
  const level = LEVELS[world.levelIndex];
  let text;
  if (world.screen === 'title') {
    text = `Lantern Garden — Spot the Difference. Press Enter or click to start. Best score ${world.best}.`;
  } else if (world.screen === 'play') {
    text = `Level ${world.levelIndex + 1}: ${level.name}. Found ${world.found.size} of ${level.differences.length} differences. ${Math.ceil(world.timeLeft)} seconds left. Score ${world.score}.`;
  } else if (world.screen === 'pause') {
    text = 'Paused. Press P to resume.';
  } else if (world.screen === 'clear') {
    text = world.clearedAll
      ? `You found every difference! Final score ${world.score}. Press Enter to play again.`
      : `Level clear! Time bonus ${world.lastBonus}. Score ${world.score}. Press Enter for the next level.`;
  } else {
    text = `Time's up! You found ${world.found.size} of ${level.differences.length}. Score ${world.score}. Press R to retry, Enter for a new game.`;
  }
  if (text !== lastStatus) {
    lastStatus = text;
    statusEl.textContent = text;
  }
}

function startGame() {
  playClick();
  newGame(world);
}

function advance() {
  playClick();
  if (world.clearedAll) {
    newGame(world);
  } else {
    nextLevel(world);
  }
}

function doHint() {
  const idx = useHint(world);
  if (idx !== null) playHint();
}

function doClick(panel, x, y) {
  const res = clickAt(world, panel, x, y);
  if (res.type === 'hit') {
    playFound();
    if (res.cleared) {
      saveBest();
      if (world.clearedAll) playWin();
      else playClear();
    }
  } else if (res.type === 'miss') {
    playWrong();
    if (world.screen === 'over') saveBest();
  }
}

const handlers = {
  click(x, y) {
    if (world.screen === 'title') {
      startGame();
      return;
    }
    if (world.screen === 'clear') {
      advance();
      return;
    }
    if (world.screen === 'over') {
      newGame(world);
      return;
    }
    if (world.screen === 'pause') {
      togglePause(world);
      return;
    }
    // playing
    if (
      x >= HINT_BTN.x &&
      x <= HINT_BTN.x + HINT_BTN.w &&
      y >= HINT_BTN.y &&
      y <= HINT_BTN.y + HINT_BTN.h
    ) {
      doHint();
      return;
    }
    if (y >= PANEL_Y && y <= PANEL_Y + PANEL_H) {
      if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL_W) {
        doClick(0, x - PANEL_LEFT_X, y - PANEL_Y);
      } else if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL_W) {
        doClick(1, x - PANEL_RIGHT_X, y - PANEL_Y);
      }
    }
  },
  hint() {
    if (world.screen === 'play') doHint();
  },
  pause() {
    if (world.screen === 'play' || world.screen === 'pause') togglePause(world);
  },
  restart() {
    restart(world);
  },
  confirm() {
    if (world.screen === 'title') startGame();
    else if (world.screen === 'clear') advance();
    else if (world.screen === 'over') newGame(world);
    else if (world.screen === 'pause') togglePause(world);
  },
};

if (shot) {
  // Screenshot mode: paint the staged scene twice, then signal readiness.
  world = stageShot(shot, world, seed);
  render(ctx, world, 1.0);
  updateStatus();
  requestAnimationFrame(() => {
    render(ctx, world, 1.0);
    window.__shotReady = true;
  });
} else {
  bindInput(canvas, handlers);
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;
  let prevScreen = world.screen;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      tick(world, STEP);
      acc -= STEP;
    }
    if (world.screen !== prevScreen) {
      if (world.screen === 'over') {
        saveBest();
        playWrong();
      }
      if (world.screen === 'clear') saveBest();
      prevScreen = world.screen;
    }
    render(ctx, world, now / 1000);
    updateStatus();
    requestAnimationFrame(frame);
  }
  updateStatus();
  requestAnimationFrame(frame);
}
