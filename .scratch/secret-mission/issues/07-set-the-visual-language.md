Type: grilling
Status: resolved
Blocked by: 01

# 07 — Set the visual language

## Question

What does the game look like? Decide the visual language grounded in the faithful-retro preference, whatever ticket 01 (Unearth the real Secret Mission details) turned up, and the locked control layout (05): palette (true monochrome vs greenish LCD tint vs two-tone), tile-grid size, stickman proportions (chunky pixels vs fine lines), platform/rope/ladder/enemy/collectible/trap-hole visual forms, HUD style (timer top-center, lives, pause button top-right per 05), button styling (semi-transparent overlays respecting the 05 layout), screen states (game-over screen with score + retry, restart countdown — per 06), and any screen transitions. Output is the visual section of the game spec.

## Answer

Visual language locked (grilling, rounds 1-2):

- **Palette**: LCD-green monochrome (dark pixels on light green), flat — no scanlines, no dithering, no effects.
- **Tile grid**: 16px logical tiles — the level art unit (feeds ticket 09's level format: one grid cell = one 16px tile).
- **Stickman**: fine stick figure — circle head, thin ~3px limbs.
- **Enemies**: distinct silhouettes — patroller round and wide, chaser sharp and pointy; both in the same monochrome.
- **Collectibles**: small diamonds.
- **Ladders**: two rails with rungs. **Ropes**: hanging line with a knot tick every 16px — both clearly read as climbables.
- **Trap holes**: dark pit with a brief crumble dig animation.
- **HUD**: in-world monochrome bar — timer top-center, lives as tiny stickman icons, pause button top-right (respecting the 05 control layout).
- **Buttons**: outline, semi-transparent over the playfield; pressed state = filled highlight (per 05).
- **Screens & transitions**: instant cuts; game-over / restart / countdown as big centered monochrome text (per 06 flows).
