Type: task
Status: resolved
Blocked by: 08

# 10 — Scaffold the mobile web project

## Question

Manual work needed before implementation: set up the project scaffold per the tech-stack decision (08) — Vite + plain JS (ES modules) with Phaser 3 as the only runtime dependency; Vitest wired for the pure logic module and Playwright E2E harness (first test: boots a Phaser scene and asserts the canvas renders); portrait-locked fully responsive canvas stub rendering a test frame; viewport/mobile-meta boilerplate; a `levels/` directory with a placeholder `01.json` and the **level linter** script (per ticket 09: validates 40 rows × 22 chars, one S, one E, timer present, bottom row solid). The answer records where things live (paths, run commands) that later work depends on. The vertical-slice build itself happens in the implementation handoff after the frontier clears.

## Answer

Scaffold complete and verified (all checks green on this machine):

**Layout** (repo root `/Users/ionutale/games-development/mobile-stick-secret-mission`):
- `package.json` — Vite 7, Phaser 3.90 (only runtime dep), Vitest 4, @playwright/test 1.55; scripts below
- `vite.config.js` — dev server on port **5174**; Vitest include `src/**/*.test.js`
- `index.html` — mobile viewport meta, portrait-fit `#game` container (100dvh)
- `src/main.js` — Phaser boot: 352×640 logical canvas (from `src/logic/constants.js`), `Scale.FIT + CENTER_BOTH`, LCD-green background
- `src/scenes/BootScene.js` — stub scene drawing a test frame + "SECRET MISSION" text
- `src/logic/constants.js` — locked constants (G 900, WALK 130, JUMP 380, CLIMB 80, TILE 16, GRID 22×40, ROPE_GRAB_RADIUS 22) as the single source of truth
- `src/logic/constants.test.js` — Vitest tests (3 passing)
- `levels/01.json` — valid placeholder level per ticket 09 format (22×40, one S, one E, 5 diamonds, ladder/rope tiers, timer 90)
- `levels/lint-levels.mjs` — level linter (schema, 22×40, walls, exactly one S/E, solid bottom, timer, filename/level match)
- `tests/e2e/boot.spec.js` + `playwright.config.js` — E2E boot test (passing)
- `.gitignore`

**Commands**:
- `npm run dev` — dev server → http://localhost:5174
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E (starts the dev server itself)
- `npm run lint:levels` — validates all level files
- `npm run build` / `npm run preview` — production build

Verified: install clean (0 vulnerabilities), Vitest 3/3, E2E 1/1, linter PASS.
