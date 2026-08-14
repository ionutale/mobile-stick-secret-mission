Type: grilling
Status: resolved
Blocked by: 04

# 02 — Lock the core mechanics spec

## Question

What exactly are the rules of the core loop? Decide and specify: ladder mechanics (climb speed, auto-grab vs button, dismount), rope mechanics (**hang-and-climb only — the swing question is settled by ticket 04**; specify grab radius, climb speed, dismount, drop behavior), jumping physics feel (height, gravity, air control — prototype constants to start from: g 900 px/s², walk 130, jump 380), gap rules (what happens when the stickman misses a platform and falls — lose life? restart level? reset to ledge?), trap-hole mechanics (dig input, hole duration and refill, who falls in, does the stickman risk his own holes — per ticket 03 enemy rules), and how collectibles work (what they are, what they do — score, lives capped at 5 per ticket 06, exit gate). Output is the mechanics section of the game spec.

## Answer

Core mechanics spec locked (grilling, rounds 1-2). This is the mechanics section of the game spec.

### Motion & jumping
- Gravity `900 px/s²`, walk `130 px/s`, jump velocity `380 px/s` (ticket 04 prototype constants) → jump height ~80px ≈ 5 tiles.
- Full air control — the stickman steers left/right mid-air at walk speed.
- Forgiveness: ~100ms coyote time (jump shortly after leaving an edge) + ~100ms jump buffering (press shortly before landing).
- Platforms are **one-way**: jump up through them from below, land on top.

### Ladders & ropes
- Ladders: **press-to-attach** — attaching happens only while UP/DOWN is pressed while overlapping a ladder; climb at `80 px/s`; dismount with LEFT/RIGHT or jump.
- Ropes (hang-and-climb only, per ticket 04): GRAB button attaches within ~22px; GRAB again or moving off releases; climb at the same `80 px/s`; release drops.

### Trap holes
- DIG button while standing on a platform tile; **any tile is diggable** — no dig markers needed in the level format.
- A hole stays open ~2s then refills. Enemies falling in die permanently (ticket 03); the **stickman can fall into his own holes too**.
- Holes reset to undug when the stickman respawns (ticket 06).

### Collectibles & exit
- Collectibles are diamonds. **Collecting ALL diamonds in the level opens the exit door**; walking into the open door finishes the level. Diamonds are not lives.

### Fail & respawn (from tickets 03 + 06, restated for the spec)
- Falling into a gap, enemy contact, or timeout each cost one of the 5 lives.
- On losing a life: respawn at level start with ~1.5s invulnerability; collectibles stay collected; enemies and holes reset.
- Game over (0 lives): retry the current level with lives refilled (per ticket 06).
- Timer counts down from the per-level budget (set by ticket 11); zero = lose a life + restart the level.
