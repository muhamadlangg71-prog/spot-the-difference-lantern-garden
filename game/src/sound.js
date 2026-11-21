// Tiny WebAudio beeps. No audio files. Everything is guarded so the
// game keeps working when AudioContext is unavailable. The context is
// created lazily on first use (a user gesture), never at import time.
let actx = null;

function ac() {
  try {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type = 'sine', gain = 0.12, delay = 0) {
  const c = ac();
  if (!c) return;
  try {
    const t0 = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch {
    // sound is decorative; never break the game
  }
}

export function playClick() {
  tone(660, 0.06, 'sine', 0.05);
}

export function playFound() {
  tone(880, 0.12, 'sine', 0.12);
  tone(1318, 0.18, 'sine', 0.12, 0.09);
}

export function playWrong() {
  tone(160, 0.18, 'sawtooth', 0.08);
}

export function playHint() {
  tone(740, 0.1, 'sine', 0.08);
}

export function playClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'sine', 0.12, i * 0.09));
}

export function playWin() {
  [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, 'sine', 0.12, i * 0.1));
}
