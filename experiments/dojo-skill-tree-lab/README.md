# ADHD Dojo — Skill Tree Design Lab v0.1

A self-contained, mobile-first skill-tree UI laboratory. The prototype compares three interaction layouts using **the exact same eight nodes** representing documented or proposed stages of the user's hiragana learning journey.

## Modes

- **Glyph Constellation**: a large Japanese glyph overlaid by connected RPG nodes. Pan the open canvas, pinch to zoom on touch devices, or use + / − / FIT (mouse wheel zoom on desktop).
- **Path Lanes**: compact, vertically grouped capabilities with one-tap selection.
- **Card Deck**: sideways swipeable, snap-aligned skill cards.

Tap any node/card for the description and source-linked evidence. The selected layout, favorite, and selected node are saved only to this browser. **This lab does not update training scores, certify mastery, or alter existing quests.**

## Integrated actions

- Chart Reconstruction and Unaided Recall → `../hiragana-dojo/` (existing playable K-row activity).
- Authentic Reading → `../musashi-reader/` (existing Musashi reader).
- Back to Dojo Hall → `../dojo-shell-v02/` (existing game shell).

## Evidence and status caveat

The source data derives from:
- [Base Hiragana Learning Experiment — From Exposure to 100% Production](https://app.notion.com/p/3f6a0de59e12811bafaad31983fab12a)
- [Hiragana Learning Journey — Portrait Mermaid v1.0](https://app.notion.com/p/3ffa0de59e1281c6a924e915343fd9e4)
- [Go Rin no Sho — Skill Tree & Parallel Progression v1.0](https://app.notion.com/p/3ffa0de59e12814a979dc87f9cfb1d42)

**Reported** means a historic achievement in these notes, not a live verified skill score; **Active/emerging** means practice is underway; **Prospective** denotes a planned direction. The personal 46/46 written-production result was a single documented delayed test, not a proven universal method.

## Design references

[Interface In Game](https://interfaceingame.com/games/) organizes game UI screenshots by platform and UI element, including [skill trees](https://interfaceingame.com/screenshots/). Representative pages: [Genshin Impact Mobile](https://interfaceingame.com/games/genshin-impact-mobile/) (character talents and constellations), [Sifu Skill Tree](https://interfaceingame.com/screenshots/sifu-skill-tree/). The UI here uses original CSS/SVG; copyrighted game screenshots are *not* copied into this experiment.

## Scope and tests

Single HTML file, no build step or external JS libraries, no account, no tracking. Includes keyboard tab access, reduced-motion CSS, and on-device pan/zoom behavior.

Tested locally with Chromium/Playwright at 320×700, 390×844, 1280×860: no horizontal document overflow or runtime exceptions; mode switching, card selection, state-panel updates, and navigation hrefs checked. GitHub Pages and physical device interaction should be tested after deployment.