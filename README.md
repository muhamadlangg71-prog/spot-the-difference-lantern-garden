# Lantern Garden — Spot the Difference

A cozy, hand-drawn spot-the-difference game. Two near-identical garden
pictures sit side by side; click a difference in either one to ring it in
gold. Three levels, increasing difficulty: Dusk Garden (7 differences,
90s), Lantern Pond (8 differences, 75s), Firefly Night (9 differences,
60s). All art is procedural canvas 2D — no image, audio or font files,
no network, no libraries.

![Lantern Garden](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/muhamadlangg71-prog/spot-the-difference-lantern-garden/rank.svg)](https://make.fun/competitions/best-spot-the-difference-game-20261121-0451/leaderboard)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/muhamadlangg71-prog/spot-the-difference-lantern-garden/reward.svg)](https://make.fun/competitions/best-spot-the-difference-game-20261121-0451)

## Run

```sh
node serve.ts
# open http://localhost:8080
```

## Controls

- **Click** a difference in either picture: +100 points, gold ring on both sides.
- **Wrong click**: red X, −5 seconds.
- **H** or the Hint button: reveals one unfound difference, −50 points.
- **P** pause, **R** restart the level, **Enter / Space** start / continue.
- Clearing a level adds +10 points per second left. Best score is kept in
  localStorage.

## Screenshot stages

`?shot=start&seed=1` title screen, `?shot=play&seed=1` mid-level with
3 of 7 differences found, `?shot=end&seed=1` level-clear screen.
