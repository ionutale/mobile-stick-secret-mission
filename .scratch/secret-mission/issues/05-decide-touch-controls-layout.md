Type: grilling
Status: resolved
Blocked by:

# 05 — Decide touch controls layout

## Question

How does the player control the stickman on a touch screen? Decide: on-screen buttons (left/right, jump, climb) vs swipe gestures vs a mix; where controls sit on the screen relative to the playfield and HUD; and how pausing works. Consider fat-finger ergonomics on a small phone screen.

## Answer

Touch controls locked (grilling, rounds 1-2):

- **Scheme**: on-screen buttons only — no swipe gestures. **Portrait** orientation, locked to portrait.
- **Movement**: fixed LEFT/RIGHT buttons, bottom-left.
- **Actions**, right side: JUMP (large) at bottom-right; UP/DOWN stacked above it (used for ladders and ropes alike); GRAB and DIG beside the cluster. GRAB toggles — press again (or move off) to release. DIG digs a trap hole while standing.
- **Pause**: small pause button, top-right corner.
- **Ergonomics**: touch targets ≥ 56px with spacing between them; buttons show a **pressed-state highlight** so input always registers visibly.
- **Multi-touch**: simultaneous presses (e.g. move + jump) must work — proven in the 04 rope prototype.
- Placement feeds ticket 07 (Set the visual language) for HUD/button styling, and the implementation handoff.
