Type: grilling
Status: resolved
Blocked by: 09, 11

# 12 — Author the exemplar levels

## Question

What do the exemplar levels look like, concretely? Design three full levels in the level format from ticket 09, following the difficulty curve from ticket 11: level 1 (gentle, tutorial-style introduction of ladders, ropes, gaps, trap holes, collectibles, enemies, timer), a mid-set level (~10, where the curve inflects), and level 20 (the finale). These three layouts are the style reference the implementation handoff authors the remaining 17 levels from. Assets (level data files, ASCII/tile sketches) are linked from this ticket; the answer records the design rationale per level.

## Answer

Three exemplar levels shipped as real, linter-validated level files. Assets: `levels/01.json`, `levels/10.json`, `levels/20.json`.

### Level 1 (90s) — Compact teaching line
Spawn → ladder A rises from the spawn (teaches UP) → walk right along tier 1 (LEFT/RIGHT) → **2-tile gap** with safe ground below (teaches JUMP without risk) → ladder B → tier 2 → **4 diamonds in a row** → door. Zero enemies, one platform tier. Fading text hints (per Q2) teach: move, jump, climb.

### Level 10 (74s) — Balanced three-tier, mid-set inflection
Tier 1 split by a **3-tile gap**; patroller P1 paces the right segment beside the **guarded diamond** — the signature: dig a hole under him to send him to his permanent death, then collect. Two chasers (C1, C2) patrol tier 2's main path (chasers on the main path); rope R1 is a tier1↔tier2 shortcut, rope R2 a tier2↔tier3 shortcut; patroller P2 paces tier 3 near the door. 6 diamonds: 4 on-route, 2 guarded.

### Level 20 (60s) — Rising gauntlet, the finale
Four tiers climbing to the door. Tier 1: **4-tile gap** (tight jump; rope R1 shortcut). Tier 2: **chaser corridor** (C1 + C2). Tier 3: patroller floor (P2). Top tier: a **narrow ledge with a 2-tile gap and chaser C3** — the signature **hole-bridge choke**: on the ledge, dig under C3 to dispatch him, cross the gap, grab the last diamond beside the door, exit. 8 diamonds force a **full tour** of every mechanic; 2 patrollers + 3 chasers.

### Style reference
These three define the authoring style for the remaining 17 levels: single-screen 22×40 grids, explicit tiered architecture, gaps sized per the curve (11), enemies placed per the phase table, ropes as shortcuts, diamonds as the tour guide, door at the top of the climb. The build handoff authors `02.json`–`09.json` and `11.json`–`19.json` following these exemplars and the difficulty-curve spec.
