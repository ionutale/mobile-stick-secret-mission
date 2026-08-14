Type: grilling
Status: resolved
Blocked by: 01, 02, 03, 04, 06

# 09 — Design the level format & authoring system

## Question

What is a "level" as data? Decide the level format for the 20-level game: the JSON schema for a level (grid/tile layout for platforms, ladders, ropes, gaps, and trap holes — one grid cell = one 16px tile per ticket 07; any platform tile is diggable per ticket 02, so no dig markers are needed; per-level enemy patrols — patrollers and chasers — and spawn points, diamond placement, exit-door position, time budget, and stickman spawn), the tileset reference it points at, and how levels are authored (hand-written JSON following the exemplars in ticket 12). Output is the level-format section of the game spec; the implementation handoff authors all 20 levels as data files from this format, the difficulty curve (11), and the exemplars (12).

## Answer

Level format locked (grilling, rounds 1-2). This is the level-format section of the game spec.

### Format
- **One screen per level, no scrolling.** Grid: **22 columns × 40 rows of 16px tiles** (352×640 logical playfield).
- Encoding: rows of single-character tile codes; the bottom row must be solid platform; columns 0 and 21 should be walls (linter-enforced conventions below).
- **Tile codes**: `.` empty (gap — falling here costs a life per 02/06) | `X` platform | `L` ladder | `R` rope | `S` stickman spawn | `P` patroller | `C` chaser | `*` diamond | `E` exit door. Enemy spawns are grid cells; edge-turn patrol (03) means no waypoint data is needed.
- **Wrapper** (minimal JSON): `{ "level": <number>, "timer": <seconds>, "tileset": <version int, ready for future PNG swap per decision>, "grid": [<40 strings of 22 chars>] }`. Diamonds, door, spawn, enemies all live in the grid itself.
- **Files**: `levels/01.json` … `levels/20.json`, one per level, numbered to match.

### Example
```json
{
  "level": 1,
  "timer": 90,
  "tileset": 1,
  "grid": [
    "XXXXXXXXXXXXXXXXXXXXXX",
    "X....................X",
    "X..S...........*E....X",
    "X..LLL....*...........X",
    "X..........LLL.......X",
    "XXXXXXXXXXXXXXXXXXXXXX"
  ]
}
```

### Authoring & validation
- Levels are hand-written JSON following ticket 12's exemplars.
- A **level linter** ships in the scaffold (ticket 10): validates all 20 files — schema shape, 40 rows × 22 chars, exactly one `S` and one `E`, timer present, bottom row solid; load-time warnings in dev.
- Renderer maps tile codes to code-drawn shape recipes (08); `tileset` version field reserved for a future PNG swap.
