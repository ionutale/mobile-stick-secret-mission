Type: grilling
Status: resolved
Blocked by:

# 08 — Pick the tech stack

## Question

Which stack does the mobile-web game use? Decide: Phaser (battle-tested 2D mobile support) vs vanilla Canvas API vs another engine, plus the project shape (plain HTML/JS, Vite, etc.) and the test approach for game logic. Output unblocks ticket 10 (Scaffold the mobile web project).

## Answer

Tech stack locked (grilling, rounds 1-2; Phaser state verified against current docs):

- **Engine**: Phaser 3 (v3.90, current stable, maintained) — scenes, input, shape objects; mobile-web proven.
- **Tooling**: Vite + plain JavaScript (ES modules), dev server with HMR, static deploy later.
- **Testing**: **both** — Vitest unit tests on the pure game-logic module, and Playwright E2E driving the real game in a browser (boot, play a level, fail flows, respawn rules).
- **Physics**: custom AABB physics in a pure, DOM-free module (gravity, jump, climb, rope hang, trap holes) — deterministic and unit-testable; carries the candidate constants from ticket 04 (g 900, walk 130, jump 380 px/s).
- **Art**: code-drawn with Phaser Graphics/Shape primitives (rects, lines, circles) — the monochrome LCD look needs no assets; levels stay pure data.
- **Canvas**: portrait-locked (per 05) with fully responsive scaling — the canvas adapts to the device's pixels.
- Unblocks ticket 10 (Scaffold the mobile web project).
