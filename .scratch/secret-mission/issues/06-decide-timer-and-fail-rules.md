Type: grilling
Status: resolved
Blocked by:

# 06 — Decide timer and fail rules

## Question

How does the level timer work and what happens on failure? Decide: timer per level (length in seconds, where it displays), what happens at zero (level fail → restart / game over), lives count and how the player loses/gains one, fall-into-gap penalty, and the restart flow (instant restart vs menu). Output feeds the fail-state section of the game spec and the level's time budget.

## Answer

Timer and fail rules locked (grilling, rounds 1-2):

- **Timer**: per-level countdown, displayed top-center HUD; pausing pauses the timer. Exact per-level time budgets are set by ticket 11 (Define the difficulty curve for 20 levels); the level format (09) carries a per-level time field.
- **Timeout**: zero = lose a life + restart the level.
- **Lives**: 5 lives. They carry over between levels (capped at 5); game over refills to 5. If collectibles ever grant lives (ticket 02's decision), they respect the cap.
- **Falling into a gap**: lose a life, respawn at the level start, level state kept.
- **Enemy contact** (rules from 03, flow from 06): identical to falling — lose a life, respawn at level start, level state kept.
- **Respawn resets**: enemies and trap holes reset to their initial state; collectibles stay collected (progress kept, threats back).
- **Game over** (all lives lost): retry the current level with lives refilled; the game-over screen shows the score and a retry option (styling in ticket 07).
- **Restart flow**: brief countdown ("3, 2, 1") then automatic restart; the timer does not run during the countdown.
