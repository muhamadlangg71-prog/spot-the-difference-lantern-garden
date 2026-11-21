// Draws everything on the canvas from the world state.
import {
  CANVAS_W,
  CANVAS_H,
  PANEL_W,
  PANEL_H,
  PANEL_Y,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  HINT_BTN,
  COLORS,
  LEVELS,
} from './config.js';
import { drawScene } from './scenes.js';

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function overlay(ctx, lines) {
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = CANVAS_W / 2;
  let y = 250;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const line of lines) {
    ctx.font = `${line.bold ? 'bold ' : ''}${line.size}px sans-serif`;
    ctx.fillStyle = line.color || COLORS.headerText;
    ctx.fillText(line.text, cx, y);
    y += line.size + 16;
  }
}

function drawPanels(ctx, world, now) {
  const origins = [PANEL_LEFT_X, PANEL_RIGHT_X];
  for (let p = 0; p < 2; p++) {
    ctx.save();
    ctx.translate(origins[p], PANEL_Y);
    drawScene(ctx, world.levelIndex, p, world.seed, now);
    ctx.restore();
    ctx.strokeStyle = COLORS.panelBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(origins[p], PANEL_Y, PANEL_W, PANEL_H);
  }
  // divider between the panels
  ctx.strokeStyle = 'rgba(154, 163, 184, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(640, PANEL_Y + 10);
  ctx.lineTo(640, PANEL_Y + PANEL_H - 10);
  ctx.stroke();
}

function drawMarkers(ctx, world, now) {
  const level = LEVELS[world.levelIndex];
  const origins = [PANEL_LEFT_X, PANEL_RIGHT_X];
  for (const i of world.found) {
    const d = level.differences[i];
    for (const ox of origins) {
      ctx.save();
      ctx.strokeStyle = COLORS.goldBright;
      ctx.lineWidth = 5;
      ctx.shadowColor = 'rgba(255, 217, 77, 0.9)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ox + d.x, PANEL_Y + d.y, d.r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (world.hintIndex !== null && !world.found.has(world.hintIndex)) {
    const d = level.differences[world.hintIndex];
    const pulse = 3 * Math.sin(now * 5);
    for (const ox of origins) {
      ctx.save();
      ctx.strokeStyle = COLORS.goldBright;
      ctx.globalAlpha = 0.65 + 0.35 * Math.sin(now * 5);
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(ox + d.x, PANEL_Y + d.y, d.r + 8 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (world.wrongFlash) {
    const f = world.wrongFlash;
    const ox = f.panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
    const alpha = Math.max(0, 1 - f.age / 0.6);
    const x = ox + f.x;
    const y = PANEL_Y + f.y;
    ctx.save();
    ctx.strokeStyle = COLORS.wrong;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 13);
    ctx.lineTo(x + 13, y + 13);
    ctx.moveTo(x + 13, y - 13);
    ctx.lineTo(x - 13, y + 13);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHeader(ctx, world) {
  const level = LEVELS[world.levelIndex];
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText('Lantern Garden', 40, 34);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = COLORS.headerText;
  ctx.textAlign = 'center';
  ctx.fillText(`Level ${world.levelIndex + 1} · ${level.name}`, CANVAS_W / 2, 34);
  ctx.textAlign = 'right';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Score ${world.score}`, CANVAS_W - 40, 34);
  // timer bar
  const frac = level.time > 0 ? Math.max(0, world.timeLeft / level.time) : 0;
  const barX = 40;
  const barW = 1000;
  const barY = 62;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(barX, barY, barW, 12);
  ctx.fillStyle =
    frac > 0.5 ? COLORS.timerGood : frac > 0.25 ? COLORS.timerWarn : COLORS.timerBad;
  ctx.fillRect(barX, barY, barW * frac, 12);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = COLORS.headerText;
  ctx.textAlign = 'left';
  ctx.fillText(fmtTime(world.timeLeft), 1055, 68);
  ctx.textAlign = 'right';
  ctx.fillText(
    `Found ${world.found.size} / ${level.differences.length}`,
    CANVAS_W - 40,
    68,
  );
}

function drawFooter(ctx, world) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '16px sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText('Click a difference in either picture  ·  H hint (−50 pts)  ·  P pause  ·  R restart', 40, 664);
  ctx.fillText(`Best ${world.best}`, 900, 664);
  // hint button
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.roundRect(HINT_BTN.x, HINT_BTN.y, HINT_BTN.w, HINT_BTN.h, 8);
  ctx.fill();
  ctx.fillStyle = '#20263a';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Hint (H) −50', HINT_BTN.x + HINT_BTN.w / 2, HINT_BTN.y + HINT_BTN.h / 2 + 1);
}

export function render(ctx, world, now) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHeader(ctx, world);
  drawPanels(ctx, world, now);
  drawMarkers(ctx, world, now);
  drawFooter(ctx, world);

  if (world.screen === 'title') {
    overlay(ctx, [
      { text: 'Lantern Garden', size: 56, color: COLORS.gold, bold: true },
      { text: 'Spot the Difference', size: 30, bold: true },
      { text: 'Two pictures, a few small changes. Find them all before time runs out.', size: 19 },
      { text: 'Click a difference in either picture  ·  H hint (−50 pts)  ·  P pause  ·  R restart', size: 18 },
      { text: `Best score: ${world.best}`, size: 19, color: COLORS.gold },
      { text: 'Click or press Enter to start', size: 22, bold: true },
    ]);
  } else if (world.screen === 'pause') {
    overlay(ctx, [
      { text: 'Paused', size: 48, color: COLORS.gold, bold: true },
      { text: 'Press P or click to resume', size: 22 },
    ]);
  } else if (world.screen === 'clear') {
    const level = LEVELS[world.levelIndex];
    const lines = [
      { text: world.clearedAll ? 'You found every difference!' : 'Level Clear!', size: 46, color: COLORS.gold, bold: true },
      { text: `${level.name} — all ${level.differences.length} differences found`, size: 22 },
      { text: `Time bonus +${world.lastBonus}  ·  Score ${world.score}`, size: 22 },
    ];
    if (world.clearedAll) {
      lines.push({ text: `Final score ${world.score}  ·  Best ${world.best}`, size: 20 });
      lines.push({ text: 'Press Enter to play again', size: 22, bold: true });
    } else {
      lines.push({ text: 'Press Enter for the next level', size: 22, bold: true });
    }
    overlay(ctx, lines);
  } else if (world.screen === 'over') {
    const level = LEVELS[world.levelIndex];
    overlay(ctx, [
      { text: "Time's Up!", size: 48, color: COLORS.timerBad, bold: true },
      { text: `You found ${world.found.size} of ${level.differences.length} differences in ${level.name}`, size: 22 },
      { text: `Score ${world.score}  ·  Best ${world.best}`, size: 22 },
      { text: 'Press R to retry this level  ·  Enter for a new game', size: 20, bold: true },
    ]);
  }
}
