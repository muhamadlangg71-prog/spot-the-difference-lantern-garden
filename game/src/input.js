// Mouse + keyboard input. Converts clicks to logical canvas coordinates
// and calls the handlers main.js provides. No game logic lives here.
export function bindInput(canvas, handlers) {
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((event.clientY - rect.top) * canvas.height) / rect.height;
    handlers.click(x, y);
  });
  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'h' || key === 'H') handlers.hint();
    else if (key === 'p' || key === 'P') handlers.pause();
    else if (key === 'r' || key === 'R') handlers.restart();
    else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      handlers.confirm();
    }
  });
}
