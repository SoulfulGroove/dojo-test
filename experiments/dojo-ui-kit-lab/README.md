# ADHD Dojo — Original UI Kit Lab v0.1

**Playable game-inspired mobile UI** built from project-original, editable SVG artwork. Reference archives are **not shipped** in this kit.

Live: https://soulfulgroove.github.io/dojo-test/experiments/dojo-ui-kit-lab/

## What this contains

- **Playable preview:** Hall, Quests, Skills, Codex, Map — functional navigation and outgoing links to existing Dojo training experiments.
- **Original asset library:** 18 separately reusable SVG assets, with project-owned provenance and semantic names.
- **Data separation:** `data/manifest.json` catalogs all assets, `data/skills.json` stores evidence-based skill nodes and statuses.
- **Indigo Lacquer / Warm Washi:** alternate visual themes, without duplicating content.
- **Component gallery:** filter by semantic family, inspect the editable file path, and compare visual roles.
- **Accessible interactions:** tap targets, keyboard focus, semantic buttons, reduced-motion media query, and explicit Back via existing game shell navigation.

## Directory layout

```text
experiments/dojo-ui-kit-lab/
├── index.html                  # Semantic playable interface
├── styles/app.css              # All layout and theme tokens
├── scripts/app.js              # Client-side navigation, filters and data binding
├── assets/
│   ├── ui/                     # Frames, quest card, medallion, crest, map pin, scroll, codex
│   ├── skills/                 # Original symbolic pictograms for skill nodes
│   └── world/                  # Original atmospheric scene and skill backdrop
├── data/
│   ├── manifest.json           # Asset manifest + provenance and reference taxonomy
│   └── skills.json             # Demonstrated/active/prospective skills and evidence
└── README.md
```

## Reference studies — no third-party artwork copied

The user supplied eight CraftPix ZIPs (seven unique pack sets; the samurai download was duplicated), plus an EAST sample from the previous lab. Each was inspected *for design structure*: 

- **Basic pixel RPG UI** → panels, framed buttons, interface hierarchies, repeatable states.
- **Animated magic book** → opening/closing interaction, page layers, icon inventory.
- **Monk / swordsman abilities** → icon categorization and high-level concept hierarchy, not tracing their imagery.
- **Crafter / blacksmith icons** → future practical skills and vocation-specific icon families.
- **Samurai animations** → state naming (idle/walk/attack), sprite-sheet conventions, not used in this UI kit.
- **Paths and road tiles** → grid and autotile organization, not used directly.
- **EAST Japanese sprite sample** → scene scale, separate shadows, and environmental composition. No sprites from that pack are included in this kit.

The artwork under `assets/` is **new, original SVG illustration made for the Dojo**, rather than modified or traced reference files. Third-party assets may have redistribution restrictions even if adapted; do not add any reference ZIPs to this repo.

## Skill evidence policy

The `skills.json` states describe **past user-reported performance** separately from practice currently underway and planned abilities; the 46/46 hiragana result is a historical delayed test, not a live proficiency certification. This kit does not modify progress or grant fictional XP.

Source Notion references:

- [Base Hiragana Learning Experiment — From Exposure to 100% Production](https://app.notion.com/p/3f6a0de59e12811bafaad31983fab12a)
- [Hiragana Learning Journey — Portrait Mermaid v1.0](https://app.notion.com/p/3ffa0de59e1281c6a924e915343fd9e4)

## Rules for future asset production

1. Stable semantic IDs (`family.name.variant` as the kit expands).
2. Preserve original SVG source, generate PNG/WebP only as runtime derivatives.
3. Keep UI states (`selected`, `disabled`, `mastered`, `planned`) as data and styles, not image filenames if one component can carry all states.
4. Design tappable hit areas at least 44px even when the image itself is smaller.
5. Display meaningful ability evidence and training action alongside decorative icons.
6. Track source creator, license, modification lineage and permitted distribution for every third-party derivative.
7. Avoid pseudo-historical claims. Illustrated landscapes and stylized icons are game artwork, not authentic Edo artifacts.

## Test

Serve locally: `python -m http.server 8877 -d experiments/dojo-ui-kit-lab`, then open `http://localhost:8877/`.

The full demo intentionally uses only HTML/CSS/JS and SVG/JSON files without external asset libraries or build dependencies.
