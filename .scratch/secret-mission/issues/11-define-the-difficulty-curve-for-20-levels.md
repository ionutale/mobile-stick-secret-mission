Type: grilling
Status: resolved
Blocked by: 02, 03, 06

# 11 — Define the difficulty curve for 20 levels

## Question

How does difficulty ramp from level 1 to level 20? Decide the curve: how platform complexity, rope density, gap widths, enemy counts and the patroller/chaser mix (per ticket 03 rules), trap-hole reliance, collectible placement, and time budgets scale across the set; where the gentle tutorial levels sit, where the difficulty inflects, and what level 20's finale demands. Output is the difficulty-curve section of the game spec; it guides ticket 12 (Author the exemplar levels) and the implementation's authoring of the remaining levels.

## Answer

Difficulty curve locked (grilling, rounds 1-2). This is the difficulty-curve section of the game spec.

### Shape
- **Gentle linear climb with inflections**: tutorial phase (L1-2) → gentle climb (L3-9) → mid-set push (L10-15) → final gauntlet (L16-20).

### Phases
| Phase | Levels | Enemies | Gaps | Ropes | Timer | Design focus |
|---|---|---|---|---|---|---|
| Tutorial | 1-2 | none | 1-2 tiles | 1 | 90s | L1: ladder + walk + jump. L2: rope (hang & climb) + diamonds + door. |
| Gentle climb | 3-9 | 1-3, patrollers only (1 chaser from L7) | up to 3 | 1-2 | 90→76s | Trap holes designed-for from **L5-6**; first guarded diamond. |
| Mid-set push | 10-15 | 4 (2P+2C) | 3-4 | 2-3 | 74→64s | Diamonds guarded/tucked on risky ledges; rope routing matters. |
| Gauntlet | 16-20 | 5, chaser-heavy (L17-19: 1P+4C; L20: 2P+3C) | 4-5 | 3-4 | 60s floor | Holes relied on; every mechanic in play. |

### Per-level enemy counts
`[0, 0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5]` — chasers join at L7 (1), L10 (2), L15 (3), L17 (4); L20 balances to 2P+3C for the gauntlet.

### Time formula
`timer = max(60, 90 - 2 * (level - 2))` seconds, rounded — generous early, 60s floor from ~L16.

### Other dimensions
- **Gaps**: 1-2 tiles early → 4-5 by L16-20 (jump range ~5 tiles, so late gaps force rope/ladder routing).
- **Ropes**: 1 early → 3-4 late (vertical shortcuts + routing).
- **Diamonds**: main-route early → guarded/tool-gated late; never unreachable without a tool.
- **Level 20 finale**: full gauntlet — ropes, ladders, holes, chasers AND patrollers, wide gaps, 60s timer.

### Progression (fog cleared)
- **Fixed linear 1→20**; unlocked levels replayable from a menu; progress persists in **browser localStorage** (unlocked level, lives, score — per user instruction; no accounts/online).
