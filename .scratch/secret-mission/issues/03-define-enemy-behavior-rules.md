Type: grilling
Status: resolved
Blocked by:

# 03 — Define enemy behavior rules

## Question

Do enemies/guards exist in the game, and if so what are their rules? Decide: patrol patterns (back-and-forth lines, set paths), whether they chase, how contact with the stickman is resolved (touch = lose life / knockback / nothing), whether the stickman can dispatch them (jump on top? none?), and how many per level is reasonable.

## Answer

Enemy rules locked (grilling, rounds 1-3):

- **Two enemy types**: patrollers and chasers. Both are ground-only — they never climb ladders or grab ropes.
- **Patrollers**: walk a fixed line back and forth and turn around at platform edges; they never fall off.
- **Chasers**: home in on the stickman when they share a tier; they move slightly slower than the stickman's walk speed and turn around at platform edges (they never fall off naturally either).
- **Contact**: touching an enemy costs one life. The fail/restart flow itself lives in ticket 06 (Decide timer and fail rules).
- **Dispatch**: the stickman defeats enemies by (a) landing on their head, or (b) digging a trap hole beneath them — an enemy that falls into a trap hole is destroyed permanently. Full trap-hole mechanics (dig input, hole duration, refill) are specified in ticket 02 (Lock the core mechanics spec).
- **Falling**: enemies never fall off natural level edges; falling only happens into trap holes, which is permanent death.
- **Counts**: per-level enemy counts and the patroller/chaser mix are deferred to ticket 11 (Define the difficulty curve for 20 levels).
