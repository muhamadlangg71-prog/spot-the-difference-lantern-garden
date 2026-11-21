// Procedural scene art for Lantern Garden, drawn with canvas 2D only.
// One function per level: drawScene(ctx, levelIndex, variant, seed, now).
// variant 0 = left panel (base), variant 1 = right panel (differences).
// Both variants re-seed the RNG identically, so the base picture matches
// exactly and only the listed differences change. No RNG is consumed by
// the difference branches themselves.
import { mulberry32 } from './random.js';
import { LEVELS, PANEL_W, PANEL_H } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

// Scattered points inside a rect, kept away from the level's differences.
function scattered(rng, count, x0, y0, x1, y1, avoid) {
  const pts = [];
  let guard = 0;
  while (pts.length < count && guard < count * 40) {
    guard++;
    const x = x0 + rng() * (x1 - x0);
    const y = y0 + rng() * (y1 - y0);
    let ok = true;
    for (const a of avoid) {
      const dx = x - a.x;
      const dy = y - a.y;
      const min = a.r + 16;
      if (dx * dx + dy * dy < min * min) { ok = false; break; }
    }
    if (ok) pts.push({ x, y, s: 0.6 + rng() * 0.9 });
  }
  return pts;
}

function firefly(ctx, x, y, r, now, phase) {
  const glow = 0.55 + 0.45 * Math.sin(now * 2.5 + phase);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `rgba(255, 230, 130, ${0.75 * glow})`);
  g.addColorStop(0.35, `rgba(255, 210, 90, ${0.3 * glow})`);
  g.addColorStop(1, 'rgba(255, 210, 90, 0)');
  ctx.fillStyle = g;
  circle(ctx, x, y, r * 4);
  ctx.fill();
  ctx.fillStyle = '#ffe98a';
  circle(ctx, x, y, r);
  ctx.fill();
}

function lantern(ctx, x, y, color) {
  // glow behind
  const g = ctx.createRadialGradient(x, y, 4, x, y, 46);
  g.addColorStop(0, 'rgba(255, 190, 90, 0.35)');
  g.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = g;
  circle(ctx, x, y, 46);
  ctx.fill();
  // body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 17, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 30, 20, 0.55)';
  ctx.lineWidth = 1.5;
  for (const off of [-8, 0, 8]) {
    ctx.beginPath();
    ctx.ellipse(x + off * 0.55, y, 7, 21, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // caps + tassel
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(x - 7, y - 26, 14, 6);
  ctx.fillRect(x - 7, y + 20, 14, 6);
  ctx.fillStyle = '#e8a83e';
  ctx.fillRect(x - 2, y + 26, 4, 10);
}

function flower(ctx, x, y, petal) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd94d';
  circle(ctx, x, y, 4);
  ctx.fill();
}

function koi(ctx, x, y, angle, scale, body, spot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  // tail
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-36, -11);
  ctx.lineTo(-36, 11);
  ctx.closePath();
  ctx.fill();
  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // spot
  if (spot) {
    ctx.fillStyle = '#2b2b33';
    circle(ctx, 4, -3, 5);
    ctx.fill();
  }
  // eye
  ctx.fillStyle = '#1d1d24';
  circle(ctx, 17, -3, 2.2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- level 1
function drawDusk(ctx, variant, rng, now) {
  const diffs = LEVELS[0].differences;
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#3a3560');
  sky.addColorStop(0.55, '#7a4a6b');
  sky.addColorStop(1, '#e8935a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 320);
  // stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (const p of scattered(rng, 22, 10, 10, 550, 170, diffs)) {
    circle(ctx, p.x, p.y, 1.4 * p.s);
    ctx.fill();
  }
  // moon
  ctx.fillStyle = '#f7e8b0';
  circle(ctx, 460, 90, 42);
  ctx.fill();
  ctx.fillStyle = '#e0c98a';
  circle(ctx, 448, 78, 7);
  ctx.fill();
  circle(ctx, 472, 102, 5);
  ctx.fill();
  circle(ctx, 462, 108, 3.5);
  ctx.fill();
  // distant hills
  ctx.fillStyle = '#2e2a4a';
  ctx.beginPath();
  ctx.moveTo(0, 320);
  ctx.quadraticCurveTo(140, 258, 300, 305);
  ctx.quadraticCurveTo(430, 262, 560, 312);
  ctx.lineTo(560, 320);
  ctx.closePath();
  ctx.fill();
  // ground
  ctx.fillStyle = '#3f5a3a';
  ctx.fillRect(0, 300, PANEL_W, 200);
  ctx.fillStyle = '#46663f';
  ctx.fillRect(0, 300, PANEL_W, 8);
  // house (left) with one round window
  ctx.fillStyle = '#4a3a52';
  ctx.fillRect(25, 215, 95, 85);
  ctx.beginPath();
  ctx.moveTo(15, 218);
  ctx.lineTo(72, 178);
  ctx.lineTo(130, 218);
  ctx.closePath();
  ctx.fillStyle = '#5d4a68';
  ctx.fill();
  ctx.fillStyle = '#3a2c42';
  ctx.fillRect(58, 262, 26, 38);
  ctx.fillStyle = variant === 0 ? '#ffd76a' : '#2a2438';
  circle(ctx, 70, 240, 13);
  ctx.fill();
  ctx.strokeStyle = '#3a2c42';
  ctx.lineWidth = 2;
  circle(ctx, 70, 240, 13);
  ctx.stroke();
  // tree
  ctx.fillStyle = '#5a3d28';
  ctx.beginPath();
  ctx.moveTo(138, 310);
  ctx.lineTo(146, 190);
  ctx.lineTo(158, 190);
  ctx.lineTo(164, 310);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2e4a2e';
  circle(ctx, 145, 168, 48);
  ctx.fill();
  circle(ctx, 105, 195, 34);
  ctx.fill();
  circle(ctx, 186, 195, 34);
  ctx.fill();
  ctx.fillStyle = '#3a5c38';
  circle(ctx, 132, 152, 26);
  ctx.fill();
  // lantern strings + lanterns
  ctx.strokeStyle = '#2b2438';
  ctx.lineWidth = 2;
  for (const lx of [200, 280, 360]) {
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 72);
    ctx.stroke();
  }
  lantern(ctx, 200, 95, '#d94f3d');
  lantern(ctx, 280, 110, variant === 0 ? '#d94f3d' : '#e8a83e');
  lantern(ctx, 360, 95, '#d94f3d');
  // bench + cat
  ctx.fillStyle = '#6b4a2e';
  ctx.fillRect(395, 325, 130, 10);
  ctx.fillRect(402, 335, 8, 28);
  ctx.fillRect(510, 335, 8, 28);
  ctx.fillStyle = '#7d5836';
  ctx.fillRect(395, 308, 130, 8);
  // cat sitting on the bench
  ctx.fillStyle = '#3a3a44';
  ellipse(ctx, 430, 312, 17, 20);
  ctx.fill();
  circle(ctx, 430, 284, 13);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(420, 276);
  ctx.lineTo(418, 264);
  ctx.lineTo(428, 272);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(440, 276);
  ctx.lineTo(442, 264);
  ctx.lineTo(432, 272);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a3a44';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (variant === 0) {
    // tail up
    ctx.moveTo(444, 322);
    ctx.quadraticCurveTo(462, 310, 456, 282);
  } else {
    // tail down, resting on the bench
    ctx.moveTo(444, 322);
    ctx.quadraticCurveTo(462, 330, 470, 324);
  }
  ctx.stroke();
  // pond (bottom right)
  ctx.fillStyle = '#3d6a8a';
  ellipse(ctx, 480, 458, 78, 30);
  ctx.fill();
  ctx.strokeStyle = '#7ab0c9';
  ctx.lineWidth = 2;
  ellipse(ctx, 480, 458, 78, 30);
  ctx.stroke();
  ctx.fillStyle = '#4a7a3a';
  ellipse(ctx, 435, 448, 16, 7);
  ctx.fill();
  if (variant === 0) {
    ellipse(ctx, 470, 445, 15, 6);
    ctx.fill();
  }
  ellipse(ctx, 510, 458, 17, 7);
  ctx.fill();
  // stone path
  ctx.fillStyle = '#9a938a';
  ellipse(ctx, 280, 480, 20, 9);
  ctx.fill();
  ellipse(ctx, 255, 440, 19, 9);
  ctx.fill();
  if (variant === 0) {
    ellipse(ctx, 290, 405, 19, 9);
    ctx.fill();
  }
  ellipse(ctx, 265, 370, 18, 8);
  ctx.fill();
  // flower bed along the bottom
  const petals = ['#e87aa0', '#f5f0e6', '#ffd94d', '#b48ae0', '#ff9a5a'];
  for (let i = 0; i < 13; i++) {
    const fx = 18 + i * 42 + rng() * 14;
    const fy = 452 + rng() * 34;
    ctx.strokeStyle = '#2e4a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 8);
    ctx.lineTo(fx, fy + 16);
    ctx.stroke();
    flower(ctx, fx, fy, petals[i % petals.length]);
  }
  if (variant === 0) flower(ctx, 120, 460, '#e87aa0');
  // fireflies
  for (const p of scattered(rng, 13, 20, 120, 540, 420, diffs)) {
    firefly(ctx, p.x, p.y, 2.4, now, p.x * 0.7 + p.y);
  }
  if (variant === 1) firefly(ctx, 500, 150, 2.6, now, 3.1);
}

// ---------------------------------------------------------------- level 2
function drawPond(ctx, variant, rng, now) {
  const diffs = LEVELS[1].differences;
  // water
  const w = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  w.addColorStop(0, '#2a6a7a');
  w.addColorStop(1, '#1d4a5e');
  ctx.fillStyle = w;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // ripples
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const ry = 60 + rng() * 400;
    const rx = rng() * 400;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + 40, ry - 5, rx + 90, ry);
    ctx.stroke();
  }
  // reeds (left + right edges)
  ctx.fillStyle = '#3f7a3a';
  for (const bx of [24, 38, 52, 508, 522, 538]) {
    const tip = 300 + rng() * 70;
    ctx.beginPath();
    ctx.moveTo(bx - 5, 500);
    ctx.quadraticCurveTo(bx - 2, (500 + tip) / 2, bx + 2, tip);
    ctx.quadraticCurveTo(bx + 6, (500 + tip) / 2, bx + 5, 500);
    ctx.closePath();
    ctx.fill();
  }
  // the one reed that changes height: short in variant 0, tall in variant 1
  ctx.beginPath();
  ctx.moveTo(55, 500);
  ctx.quadraticCurveTo(58, 400, 60, variant === 0 ? 360 : 280);
  ctx.quadraticCurveTo(64, 400, 65, 500);
  ctx.closePath();
  ctx.fill();
  // bridge (arched, across the top)
  ctx.strokeStyle = '#6b4a2e';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(70, 130);
  ctx.quadraticCurveTo(280, 40, 490, 130);
  ctx.stroke();
  ctx.fillStyle = '#8a6a4a';
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bx = 70 + t * 420;
    const by = 130 - Math.sin(t * Math.PI) * 62;
    if (variant === 1 && i === 4) continue; // the missing plank
    ctx.fillRect(bx - 14, by - 5, 28, 10);
  }
  ctx.strokeStyle = '#6b4a2e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(70, 108);
  ctx.quadraticCurveTo(280, 18, 490, 108);
  ctx.stroke();
  // lanterns hanging from the bridge + reflections
  ctx.strokeStyle = '#2b2438';
  ctx.lineWidth = 2;
  for (const lx of [150, 280, 410]) {
    ctx.beginPath();
    ctx.moveTo(lx, 96);
    ctx.lineTo(lx, 128);
    ctx.stroke();
  }
  lantern(ctx, 150, 152, '#d94f3d');
  lantern(ctx, 280, 162, '#e8a83e');
  lantern(ctx, 410, 152, '#d94f3d');
  // reflections (wavy streaks)
  ctx.strokeStyle = 'rgba(255, 190, 90, 0.5)';
  ctx.lineWidth = 5;
  for (const [rx, ry] of [[150, 405], [280, 415]]) {
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 6, ry + 26);
    ctx.stroke();
  }
  if (variant === 0) {
    ctx.beginPath();
    ctx.moveTo(410, 398);
    ctx.lineTo(416, 424);
    ctx.stroke();
  }
  // stones along the bottom
  ctx.fillStyle = '#8a8a8a';
  ellipse(ctx, 500, 380, 16, 10);
  ctx.fill();
  if (variant === 1) {
    ctx.fillStyle = '#5a7a4a';
    ellipse(ctx, 500, 380, 16, 10);
    ctx.fill();
  }
  ctx.fillStyle = '#7a7a7a';
  ellipse(ctx, 60, 470, 18, 10);
  ctx.fill();
  ellipse(ctx, 320, 480, 20, 11);
  ctx.fill();
  // lily pads + lotus
  ctx.fillStyle = '#4a7a3a';
  ellipse(ctx, 100, 440, 22, 9);
  ctx.fill();
  ellipse(ctx, 250, 460, 24, 9);
  ctx.fill();
  ellipse(ctx, 430, 450, 22, 9);
  ctx.fill();
  if (variant === 0) {
    ctx.fillStyle = '#f2a0c0';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      circle(ctx, 120 + Math.cos(a) * 8, 448 + Math.sin(a) * 8, 6);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd94d';
    circle(ctx, 120, 448, 4);
    ctx.fill();
  }
  // koi
  koi(ctx, 200, 300, -0.35, 1, '#e87a3a', false);
  koi(ctx, 380, 280, 0.25, 1, '#f2ede2', variant === 0);
  koi(ctx, 330, 390, 2.8, 0.9, '#e87a3a', false);
  if (variant === 0) koi(ctx, 180, 420, 0.5, 0.7, '#e8c83a', false);
  // dragonfly
  if (variant === 0) {
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, 112);
    ctx.lineTo(320, 132);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ellipse(ctx, 310, 116, 10, 4);
    ctx.fill();
    ellipse(ctx, 330, 116, 10, 4);
    ctx.fill();
    ellipse(ctx, 310, 126, 10, 4);
    ctx.fill();
    ellipse(ctx, 330, 126, 10, 4);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- level 3
function drawNight(ctx, variant, rng, now) {
  const diffs = LEVELS[2].differences;
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#0d1530');
  sky.addColorStop(1, '#1d2a52');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (const p of scattered(rng, 34, 10, 10, 550, 200, diffs)) {
    circle(ctx, p.x, p.y, 1.5 * p.s);
    ctx.fill();
  }
  if (variant === 0) {
    ctx.fillStyle = '#ffffff';
    circle(ctx, 530, 55, 2.6);
    ctx.fill();
    circle(ctx, 526, 51, 1.2);
    ctx.fill();
    circle(ctx, 534, 59, 1.2);
    ctx.fill();
  }
  // shooting star
  if (variant === 0) {
    const g = ctx.createLinearGradient(330, 58, 372, 82);
    g.addColorStop(0, 'rgba(255, 255, 255, 0)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(330, 58);
    ctx.lineTo(372, 82);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    circle(ctx, 372, 82, 2.5);
    ctx.fill();
  }
  // moon
  ctx.fillStyle = '#f2e6b8';
  circle(ctx, 480, 90, 36);
  ctx.fill();
  ctx.fillStyle = '#dcc98f';
  circle(ctx, 492, 100, 6);
  ctx.fill();
  circle(ctx, 468, 104, 4);
  ctx.fill();
  if (variant === 0) {
    circle(ctx, 475, 85, 5);
    ctx.fill();
  }
  // big tree (left) + swing branch
  ctx.fillStyle = '#3a2c22';
  ctx.beginPath();
  ctx.moveTo(58, 500);
  ctx.lineTo(78, 150);
  ctx.lineTo(96, 150);
  ctx.lineTo(104, 500);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(86, 150);
  ctx.lineTo(230, 118);
  ctx.lineTo(232, 130);
  ctx.lineTo(88, 162);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1d3320';
  circle(ctx, 84, 120, 58);
  ctx.fill();
  circle(ctx, 40, 150, 40);
  ctx.fill();
  circle(ctx, 130, 108, 42);
  ctx.fill();
  // swing: two ropes + seat (left rope missing in variant 1)
  ctx.strokeStyle = '#c9b18a';
  ctx.lineWidth = 3;
  if (variant === 0) {
    ctx.beginPath();
    ctx.moveTo(130, 122);
    ctx.lineTo(130, 198);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(170, 122);
  ctx.lineTo(170, 198);
  ctx.stroke();
  ctx.fillStyle = '#8a6a4a';
  ctx.fillRect(118, 198, 64, 10);
  // bushes along the bottom
  ctx.fillStyle = '#22401f';
  circle(ctx, 60, 470, 46);
  ctx.fill();
  circle(ctx, 150, 480, 52);
  ctx.fill();
  circle(ctx, 260, 478, 48);
  ctx.fill();
  circle(ctx, 360, 482, 44);
  ctx.fill();
  if (variant === 0) flower(ctx, 80, 380, '#e87aa0');
  // table (right) with teapot + cups
  ctx.fillStyle = '#6b4a2e';
  ellipse(ctx, 450, 392, 72, 15);
  ctx.fill();
  ctx.fillRect(444, 392, 12, 62);
  // teapot: body + spout (flips side in variant 1)
  ctx.fillStyle = '#b8b0c9';
  circle(ctx, 400, 360, 18);
  ctx.fill();
  ctx.beginPath();
  if (variant === 0) {
    ctx.moveTo(386, 352);
    ctx.lineTo(368, 344);
    ctx.lineTo(372, 360);
  } else {
    ctx.moveTo(414, 352);
    ctx.lineTo(432, 344);
    ctx.lineTo(428, 360);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a8299';
  ctx.fillRect(396, 338, 8, 8);
  // cups
  ctx.fillStyle = '#f2ede2';
  ctx.beginPath();
  ctx.moveTo(438, 392);
  ctx.lineTo(452, 392);
  ctx.lineTo(449, 404);
  ctx.lineTo(441, 404);
  ctx.closePath();
  ctx.fill();
  if (variant === 0) {
    ctx.beginPath();
    ctx.moveTo(473, 392);
    ctx.lineTo(487, 392);
    ctx.lineTo(484, 404);
    ctx.lineTo(476, 404);
    ctx.closePath();
    ctx.fill();
  }
  // fireflies
  for (const p of scattered(rng, 24, 20, 130, 540, 430, diffs)) {
    firefly(ctx, p.x, p.y, 2.4, now, p.x * 0.7 + p.y);
  }
  // the cluster that vanishes in variant 1
  if (variant === 0) {
    firefly(ctx, 290, 195, 2.6, now, 1.2);
    firefly(ctx, 306, 206, 2.6, now, 2.4);
    firefly(ctx, 298, 216, 2.6, now, 3.6);
  }
  // the one firefly that changes size
  firefly(ctx, 200, 300, variant === 0 ? 5 : 2.4, now, 5.0);
}

export function drawScene(ctx, levelIndex, variant, seed, now) {
  const rng = mulberry32(seed * 1000 + levelIndex * 77 + 13);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, PANEL_W, PANEL_H);
  ctx.clip();
  if (levelIndex === 0) drawDusk(ctx, variant, rng, now);
  else if (levelIndex === 1) drawPond(ctx, variant, rng, now);
  else drawNight(ctx, variant, rng, now);
  ctx.restore();
}
