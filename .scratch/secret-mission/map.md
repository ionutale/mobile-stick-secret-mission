## Destination

A playable HTML5 mobile-web recreated game: **exactly 20 levels** — a faithful retro monochrome 2D stickman platformer (ladders, ropes, gaps) with enemies, collectibles, and a level timer — running in the mobile browser with touch controls.

## Notes

- **Domain**: 2D platformer, mobile web (HTML5), touch-first controls, retro monochrome aesthetic. Original context: a built-in stickman platformer on an Alcatel One Touch 311 (Romania, ~2001) — research (ticket 01) identifies it as **Run Run**, a Lode Runner-style game; "Secret Mission" is a misremembered title.
- **Standing preferences** (locked at charting): destination = 20-level playable game; platform = mobile web / HTML5; look = faithful retro; mechanics = core (ladders + ropes) **plus** enemies, collectibles, a level timer, **and trap holes** (added by the 03 enemy-rules grilling); level count = **exactly 20**; level production = **data-driven with hand-designed exemplars** (3 exemplars define the style, implementation authors the rest); research into the original runs first; tracker = local markdown. **Progress saving**: the game persists progress in **browser localStorage** (unlocked level, lives, score — no accounts/online), per user instruction.
- **End of effort**: when the frontier clears and the build handoff is done, the work is committed, pushed to GitHub, and deployed to Vercel (user instruction).
- **Skills every session should consult**: `/grilling` + `/domain-modeling` for design decisions; `/prototype` for feel questions (rope mechanic); `/research` for anything outside this folder; frontend-design for the retro look. TDD for game logic once implementation starts.
- **Research gate**: visual language (07) and level format (09) wait on ticket 01 findings — resolved, findings at `research/01-unearth-the-real-secret-mission-details/findings.md`.
- **Build handoff**: the map ends when the frontier is clear — nothing left to decide. An implementation session then builds the engine and authors all 20 levels as data files from the locked decisions (level format 09, difficulty curve 11, exemplars 12); the build itself is not a wayfinder ticket.
- **Terminology**: the playable hero is the **stickman**; level elements are **platforms, ladders, ropes, gaps, trap holes**; threats are **enemies** — **patrollers** (edge-turn patrol) and **chasers** (home in, ground-only); pickups are **collectibles**; fail conditions are the **timer** and falling.

## Decisions so far

- [01 — Unearth the real Secret Mission details](.scratch/secret-mission/issues/01-unearth-the-real-secret-mission-details.md) — The game is almost certainly **Run Run** (a Lode Runner clone) burned into the Alcatel One Touch 311/310 firmware; "Secret Mission" is not a real title. 3 games shipped "on some versions" (Run Run, Killer Exp, Eyes & Star); no 311L exists; Run Run's level count is **not documented anywhere** (high confidence negative). Findings: `research/01-unearth-the-real-secret-mission-details/findings.md`.
- [03 — Define enemy behavior rules](.scratch/secret-mission/issues/03-define-enemy-behavior-rules.md) — Two enemy types: **patrollers** (edge-turn patrol, never fall) and **chasers** (ground-only, slightly slower than the stickman, turn at edges). Touch = lose a life. Dispatch: **head-stomp** or **trap holes** (enemy falls in = permanent death; full trap-hole mechanics folded into ticket 02). Per-level counts and mix deferred to ticket 11.
- [04 — Rope-swing feel prototype](.scratch/secret-mission/issues/04-rope-swing-feel-prototype.md) — **Hang-and-climb only; no pendulum swing** (hands-on verdict). Ropes are climbable beams, not swing points — this shapes gaps, level design (09/12) and the difficulty curve (11). Prototype asset: `prototypes/04-rope-feel/rope-feel.html`; candidate constants (g 900, walk 130, jump 380 px/s) feed ticket 02.
- [05 — Decide touch controls layout](.scratch/secret-mission/issues/05-decide-touch-controls-layout.md) — **On-screen buttons only**, portrait-locked. LEFT/RIGHT bottom-left; right cluster = JUMP (large), UP/DOWN above, GRAB + DIG beside; pause top-right. Targets ≥56px, pressed-state highlight, multi-touch simultaneous presses.
- [06 — Decide timer and fail rules](.scratch/secret-mission/issues/06-decide-timer-and-fail-rules.md) — Countdown top-center; zero = lose life + restart. **5 lives**, carried across levels (cap 5), refilled on game over (retry current level). Fall/enemy touch = lose life, respawn at level start, **collectibles stay collected, enemies/holes reset**. Auto-restart with countdown; per-level time budgets deferred to ticket 11.
- [07 — Set the visual language](.scratch/secret-mission/issues/07-set-the-visual-language.md) — **LCD-green monochrome, flat, 16px tiles**. Fine stick-figure hero; patroller round / chaser pointy; diamonds; rails+rungs ladders, line+knots ropes; dark-pit trap holes with crumble animation. In-world HUD bar (timer top-center, lives icons, pause top-right), outline semi-transparent buttons, instant cuts + big text screens.
- [08 — Pick the tech stack](.scratch/secret-mission/issues/08-pick-the-tech-stack.md) — **Phaser 3 (v3.90) + Vite + plain JS**; tests = Vitest (pure logic) **and** Playwright E2E; **custom AABB physics** in a pure module; art code-drawn via Graphics/Shape primitives; portrait-locked fully responsive canvas. Unblocks the scaffold (10).
- [02 — Lock the core mechanics spec](.scratch/secret-mission/issues/02-lock-the-core-mechanics-spec.md) — Full ruleset: g 900 / walk 130 / jump 380 (≈5 tiles), full air control, coyote+buffer windows, one-way platforms; ladders press-to-attach, climb 80 px/s, ropes hang-and-climb (GRAB toggle); trap holes diggable on any tile, ~2s refill, risky to self; diamonds: all collected → door opens → walk through; fail per 06 + 1.5s respawn grace. This is the mechanics section of the spec.
- [09 — Design the level format & authoring system](.scratch/secret-mission/issues/09-design-the-level-format-and-authoring-system.md) — Single-screen **22×40 (16px)** grids, rows of 9 tile codes (`. X L R S P C * E`), minimal wrapper `{level, timer, tileset, grid}`; `levels/01.json…20.json`; **level linter** ships in the scaffold; tileset version field reserved. Example schema in the ticket.
- [10 — Scaffold the mobile web project](.scratch/secret-mission/issues/10-scaffold-the-mobile-web-project.md) — Working scaffold at repo root: Vite+Phaser boot (352×640, FIT), `src/logic/constants.js` as single source of truth (Vitest 3/3 green), Playwright boot E2E (green), `levels/` + linter (PASS on `01.json`). Commands: `npm run dev` (:5174), `npm test`, `npm run test:e2e`, `npm run lint:levels`.
- [11 — Define the difficulty curve for 20 levels](.scratch/secret-mission/issues/11-define-the-difficulty-curve-for-20-levels.md) — Gentle linear + 2 inflections. Tutorial L1-2 (no enemies, 90s), gentle climb L3-9 (patrollers, holes from L5-6), mid push L10-15 (4 enemies 2P+2C), gauntlet L16-20 (5, chaser-heavy; L20 full gauntlet 2P+3C). Enemy counts `0,0,1,1,2,2,3,3,3,4,4,4,4,4,5,5,5,5,5,5`; gaps 1-2→4-5 tiles; ropes 1→3-4; `timer = max(60, 90-2·(L-2))`. **Fixed linear unlock, replayable, progress in localStorage.**
- [12 — Author the exemplar levels](.scratch/secret-mission/issues/12-author-the-exemplar-levels.md) — Three real, linter-valid exemplars: **01** (teaching line: ladder→2-tile safe gap→4 diamonds→door, no enemies, fading hints), **10** (three tiers, 3-tile gap, patroller hole-trap signature, chaser corridor, 2 ropes, 6 diamonds), **20** (rising 4-tier gauntlet, 4-tile gap, chaser corridor, hole-bridge choke on the top ledge, 8-diamond full tour, 2P+3C). Style reference for the remaining 17.

## Not yet specified

- Audio: does the game include sound (beeps/sfx), and what kind?

## Frontier status

**Clear — effort delivered.** All 12 tickets resolved; the implementation handoff built the full game (engine, controls, HUD, menu, localStorage progress, 20 levels, Vitest + Playwright suites), all checks green, committed and pushed to GitHub (`ionutale/mobile-stick-secret-mission`) and deployed to Vercel: https://mobile-stick-secret-mission.vercel.app (verified live). Remaining fog: audio (beeps/sfx) — deferred, out of this effort's scope.
- One tileset for all 20 levels, or per-zone themes? (feeds 07 Set the visual language.)

## Out of scope

- Levels beyond 20.
- In-browser level editor — levels are authored as data files.
- Native app packaging (Android/iOS builds).
- Accounts, online features, leaderboards, cloud saves — local progress persists via browser localStorage only.
- 1:1 recreation of the undocumented original — we reconstruct from research + memory; research informs but never blocks on perfection.
