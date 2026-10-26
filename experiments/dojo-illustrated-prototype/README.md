# ADHD Dojo — Illustrated UI Prototype v0.2

**Live demo:** https://soulfulgroove.github.io/dojo-test/experiments/dojo-illustrated-prototype/

## What this is

This experiment turns the user's high-resolution original illustrated Dojo mockups into **36 separately deployed game-art assets**, with an actual mobile web app built from them. It is not a single full-screen screenshot with hotspots. The scenes, cards, navigation thumbnails, skill medallions, codex spread, and button art are individually cropped/exported as WebP images. Interactions are HTML buttons, browser-native dialogs and a real iframe that launches the previously deployed Hiragana K-row application. The skill board is assembled from separate image nodes and live connector geometry.

The first version intentionally keeps several decorative UI card captions and example XP values *baked into* their illustrated WebP assets. Those values are **concept-only**, not verified saved user progress. The skill detail panel itself is real text driven by JSON learning evidence; future work should make *all* captions/data overlays live and commission separate text-free source paintings and nine-slice frames for complete localization/reskinning.

## Interactions

- **Dojo**: painted environment, one readable live K-row quest card and four illustrated navigation tiles; the existing playable Hiragana trainer still launches in an iframe. The quest card reads the trainer's own JSON and saved browser practice state.
- **Quests**: interactive Active / Archive / Milestones tabs; four selectable independent illustrated quest cards; tap opens a live detail sheet. Unsupported quests are explicitly marked as future, not falsely presented as playable.
- **Skills**: connected skill tree with six separately extracted glowing raster skill medallions. Tap updates actual skill title, state, evidence, and practice action; no fabricated XP.
- **Codex**: painted manuscript with live Characters / Vocabulary / Reading tabs and five clickable kana buttons; uses browser Japanese speech synthesis if available.
- **Map**: navigates to the previously deployed Japan overworld experiment.
- **Navigation**: persistent 5-room bottom bar, Escape to close overlays, responsive 320px+ touch targets, reduced-motion support.

## Repo layout

```
experiments/dojo-illustrated-prototype/
  index.html
  styles.css
  app.js
  README.md
  data/skills.json
  data/manifest.json
  assets/*.webp             # 36 independently addressable image assets
  tools/build_assets.py     # reproducible WebP slicing from source mockups
```

## Asset provenance

All painted artwork is derived from the original four mockup illustrations generated during the user's Dojo design discussions, not from any downloaded third-party asset pack. The third-party reference ZIPs and raw asset packs are **not** included in the repository. `data/manifest.json` records the source mockup, pixel crop region, intended use, and output path for each art object.

The original source mockup PNGs remain in the working design assets but are not committed as redundant large screenshots. To reproduce the crops locally, place the source PNGs into `/mnt/data` under the names expected by the helper, or adapt `SRC` to a local source directory. `build_assets.py` only rebuilds image exports, not the working interaction layer.

## Editorial / authenticity

- Historical achievement: all 46 base hiragana reproduced from memory on the delayed writing test.
- Learning stages: sound structure, recognition, chart reconstruction, unaided recall, writing production = previously reported activities/achievements. Authentic reading = ongoing.
- Mockup XP/levels and quest progress are demonstrations; there is no fake mastery awarded in this prototype.
- Asset screenshots may contain baked captions. Prefer data-driven text and graphic layers in the next art production pass.

## QA

Smoke test on Playwright/Chromium at 320px, 390px and 1280px: initial Hall rendering, navigation across pages, selected skill updates, quest sheets, codex tabs/kana selection, iframe K-row trainer, Escape and close behavior, missing asset network checks, and horizontal overflow.

## Hall v0.2 — first data-driven interaction

The Hall now replaces three decorative sample-status panels with one real K-row quest card. Quest title and description come from the existing trainer at `../hiragana-dojo/data/kana.json` (with a readable fallback). This avoids duplicating the same quest metadata in another JSON file.

The Hall displays the last saved local reconstruction/recall state under `adhd-dojo-hiragana-k-row-v01`. It refreshes when returning from the trainer; no account, remote progress system, new scoring algorithm, or false mastery claim is added. The Skills, Quests, Codex, Map and standalone trainer remain unchanged. Other painted concept elements may still show illustrative XP.
