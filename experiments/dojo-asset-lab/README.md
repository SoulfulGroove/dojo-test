# ADHD Dojo — Asset Design Lab v0.1

**Purpose:** Try a playable, asset-driven world slice in two competing visual directions, without changing existing experiments: **Japan → Kyoto → Practice Hall → the existing Hiragana K-row rep**.

## Why this experiment exists

The [Japan Overworld Lab](../japan-overworld-lab/) proved basic navigation. This lab separates **rendered art assets** from **scene topology and interactions**. The browser handles clicks, game HUD, panels, and routing; SVG/PNG files provide the map, landscape, and building illustrations.

## Project structure

```text
experiments/dojo-asset-lab/
├── index.html                     # Mobile-first scene renderer + interaction HUD
├── README.md                      # This file
├── data/
│   ├── scenes.json                # World hierarchy, landmarks, positions, actions, both art variants
│   ├── manifest.json              # Asset taxonomy, provenance, licensing, schema notes
│   └── east-atlas.json            # Coordinates of cropped sprites in the actual sprite texture
├── assets/
│   ├── atlas/japan.svg            # Geography-informed original Japan overview artwork
│   ├── illustrated/
│   │   ├── kyoto-valley.svg       # Original illustrated Kyoto-like fictional valley
│   │   └── dojo-room.svg          # Original illustrated indoor training hall
│   └── miniature/
│       ├── kyoto-terrace.svg      # Original isometric courtyard/terrain layer
│       ├── dojo-plaza.svg         # Original isometric training courtyard layer
│       └── east-scene.png         # Selected EAST sprites as one in-game image atlas
└── tools/
    └── build_east_atlas.py        # Deterministic atlas builder for user's local EAST zip
```

## Playable routes

- Open `world`, then select **Kyoto** to enter `kyoto`.
- Switch **Miniature** or **Illustrated** and stay in the same scene.
- Select the **Practice Hall** marker and enter `dojo`.
- Select **Kana Study** to open `../hiragana-dojo/` in a full-screen overlay; exit back to the scene.
- **Back** goes up one level, **World** returns directly to Japan, and stepper buttons move directly between known stages.
- Scene and style are saved to localStorage; this lab does not grade skills or write learning evidence.

## Asset taxonomy

See [`data/manifest.json`](data/manifest.json) for the source-of-truth definitions. The five families are `atlas` (geography), `environments` (terrain/rooms), `landmarks` (buildings/bridges), `foliage` (seasonal vegetation), and `ui` (markers/panels).

Scene coordinates use percentages of each illustrated artboard. Miniature sprites are assembled at the 900×570 regional scene coordinate scale from the atlas metadata. Scene actions are `scene:<id>`, `trainer`, or `select`; the renderer controls transitions.

## Art provenance & license

The visual world is **fictional and stylized**, not an accurate seventeenth-century geographic reconstruction. The Japan map is based on an existing simplified modern geographic outline and visually reworked into an atlas asset. The Kyoto landscape and fictional training hall are original vector illustrations. They are **not period maps**, and this experiment does not claim Musashi trained in this particular location.

**Third-party artwork:** [EAST Free Sample](https://mmorwynn.itch.io/east-free-sample) by **mmorwynn**. The bundled sample README permits commercial and non-commercial project use; credit is welcome but not required; redistributing the source files themselves as an asset pack is forbidden. This project includes **one palette-compressed in-game texture atlas** of twelve used sprites, not the full download, and the source ZIP remains outside the repository. Do not extract and redistribute it as a standalone asset pack.

To regenerate the in-game sprite sheet with a user-downloaded sample:

```sh
python -m pip install Pillow
python tools/build_east_atlas.py /path/to/east-free-sample.zip
```

## Technical and QA notes

A static web app: plain HTML/CSS/JS + JSON + SVG + PNG. Run with an HTTP server, since browsers restrict fetch of JSON over `file://`.

Browser smoke-tested with Chromium/Playwright at 390×844 mobile and 1320×960 desktop before publishing: navigation, style switching, scene selection, full-screen training launch/close, JSON and image loading, runtime errors, and horizontal overflow. Still needs real-device validation on iOS and Android, especially orientation and touch targets.

### Evolution paths

1. Replace the original vector illustrated scene with an art-directed painting **without changing scene data**.
2. Add more coherent world assets, including animated state variants, using the same atlas metadata contract.
3. Move persistent learning state into shared quest/skill data; this lab deliberately remains visual-only.
4. Add authentic historical-map inspection separately from fantasy location navigation.
