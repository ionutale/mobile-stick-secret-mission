Type: prototype
Status: resolved
Blocked by:

# 04 — Rope-swing feel prototype

## Question

How should grabbing a rope feel on touch? Build a cheap, rough, throwaway prototype (per `/prototype`) to test the candidate rope behaviors — hang-and-climb only vs pendulum swing — on a mobile browser, so the feel can be judged by hand before the mechanics spec is locked. Links the prototype as an asset; the answer records what felt right and what the candidate physics numbers were.

## Answer

Verdict from hands-on testing (user, phone + desktop): **hang-and-climb only** — no pendulum swing. Grabbing a rope lets you hang, climb up/down its length, and drop off; the rope is a climbing aid, not a swing.

- Prototype asset (throwaway, primary source): `prototypes/04-rope-feel/rope-feel.html` — served at `http://<LAN>:8123/rope-feel.html` while running; single self-contained file.
- Candidate physics constants from the prototype, to carry into ticket 02 (Lock the core mechanics spec): gravity `900 px/s²`, walk `130 px/s`, jump velocity `380 px/s`, ladder/rope climb `85 px/s`, rope length `215 px` (tune per level). Rope grab radius `22 px`, rope-climb `70 px/s`.
- Swing-mode code in the prototype is superseded; the implementation should not include pendulum physics.
- Consequence: gaps must be crossable by jumping and rope traversal (drop from rope near the far edge), never by swinging — level designs (09, 12) and difficulty curve (11) should treat ropes as climbable beams, not swing points.
