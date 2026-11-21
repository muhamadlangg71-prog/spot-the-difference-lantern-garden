// Configuration for Lantern Garden — Spot the Difference.
// Canvas is 1280x720 logical; two 560x500 panels side by side.
// Difference coordinates are panel-local (0..560, 0..500).
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const PANEL_W = 560;
export const PANEL_H = 500;
export const PANEL_Y = 100;
export const PANEL_LEFT_X = 40;
export const PANEL_RIGHT_X = 680;

export const HINT_BTN = { x: 1100, y: 642, w: 140, h: 44 };

export const SCORE_PER_DIFF = 100;
export const TIME_BONUS_PER_SEC = 10;
export const HINT_COST = 50;
export const WRONG_PENALTY_SEC = 5;

export const COLORS = {
  bg: '#20263a',
  headerText: '#f5efe0',
  gold: '#f2c14e',
  goldBright: '#ffd94d',
  muted: '#9aa3b8',
  panelBorder: '#f2c14e',
  timerGood: '#7ab648',
  timerWarn: '#e8a83e',
  timerBad: '#d94f3d',
  wrong: '#e84c3d',
  overlay: 'rgba(10, 12, 24, 0.78)',
};

export const LEVELS = [
  {
    name: 'Dusk Garden',
    time: 90,
    differences: [
      { x: 280, y: 110, r: 30, label: 'lantern colour' },
      { x: 120, y: 460, r: 20, label: 'flower missing' },
      { x: 470, y: 445, r: 24, label: 'lily pad missing' },
      { x: 456, y: 290, r: 22, label: "cat's tail" },
      { x: 500, y: 150, r: 18, label: 'extra firefly' },
      { x: 70, y: 240, r: 22, label: 'window lit' },
      { x: 290, y: 405, r: 22, label: 'stepping stone missing' },
    ],
  },
  {
    name: 'Lantern Pond',
    time: 75,
    differences: [
      { x: 180, y: 420, r: 30, label: 'koi missing' },
      { x: 60, y: 320, r: 22, label: 'reed taller' },
      { x: 410, y: 410, r: 24, label: 'reflection missing' },
      { x: 500, y: 380, r: 18, label: 'stone colour' },
      { x: 320, y: 120, r: 18, label: 'dragonfly' },
      { x: 280, y: 68, r: 20, label: 'bridge plank' },
      { x: 120, y: 450, r: 18, label: 'lotus missing' },
      { x: 380, y: 280, r: 22, label: 'koi spot' },
    ],
  },
  {
    name: 'Firefly Night',
    time: 60,
    differences: [
      { x: 530, y: 55, r: 14, label: 'star missing' },
      { x: 135, y: 160, r: 24, label: 'swing rope' },
      { x: 480, y: 400, r: 18, label: 'cup missing' },
      { x: 300, y: 205, r: 26, label: 'firefly cluster' },
      { x: 377, y: 352, r: 22, label: 'teapot spout' },
      { x: 80, y: 380, r: 16, label: 'bush flower' },
      { x: 475, y: 85, r: 20, label: 'moon crater' },
      { x: 200, y: 300, r: 18, label: 'firefly size' },
      { x: 350, y: 70, r: 20, label: 'shooting star' },
    ],
  },
];
