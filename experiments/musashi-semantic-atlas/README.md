# Musashi Semantic Atlas · GitHub Pages v0.1

A **new, self-contained experiment** for the existing `SoulfulGroove/dojo-test` GitHub Pages repository. It does **not** replace `experiments/musashi-picture-vocab/`.

## Where to put it

Copy this directory to:

```
experiments/musashi-semantic-atlas/
    index.html
    app.js
    styles.css
    data/catalog.json
    data/occurrences.json
    scripts/build_catalog.py
    tests/test_catalog.py
    README.md
```

The eight original illustrations are loaded from the neighboring `../musashi-picture-vocab/assets/` folder **only when an exact matching word has an existing original illustration**. The app gracefully shows typographic placeholders if used on its own. No other artwork is implied to exist. No frameworks, build servers, authentication, CDN, or paid services are required for deployment.

Expected live URL **after** adding these files to the repository's default branch and waiting for GitHub Pages deployment:

`https://soulfulgroove.github.io/dojo-test/experiments/musashi-semantic-atlas/`

This address is not an assertion of current deployment.

## Run locally

From the folder containing `experiments/` (or directly in this directory):

```
cd experiments/musashi-semantic-atlas
python -m http.server 8000
```

Then open `http://localhost:8000/` in a browser. Opening `index.html` via `file://` does not allow browsers to fetch JSON reliably.

## Pedagogical design

The initial screen shows the 29 forms connected to at least one of 75 source-attested patterns. Search or filter to 65 seed forms with provisional reading guides or all 192 source-string candidates. Click a form for:

- **Concept + visual plan.** Existing word/illustration pairs are displayed if a local asset exists. Unillustrated concepts have a clearly stated visual brief or no image claim.
- **Action relationships.** See source-attested noun/predicate patterns with V4 evidence; proposed grammatical roles are labeled editorial. The 21 separately context-interpreted examples carry clearer labels and grammar framework references.
- **Canonical source references.** Inspect exact original spans in the indexed paragraph, with `P###`, four-digit section/scroll, 1-based inclusive global and paragraph character coordinates. The entire indexed text stream of the paragraph is reconstructed by joining structural index characters, without inventing editorial punctuation.
- **Kanji neighborhood.** Explore seeded forms sharing a written kanji, without mistaking character overlap for a semantic identity.
- **Recall check.** Hide/reveal the existing provisional reading and meaning; no unearned points or invented progress tracking.

Search can match written characters, kana (where provided), romaji, English glosses (where provided), semantic families, verb descriptors, and source action patterns. Source substring counts are **not** validated dictionary word frequencies. Modern transfer tags are editorial, not empirical counts for games or anime.

## Provenance and limits

Input files in the user's ChatGPT File Library:

1. `Musashi_Historical_Grammar_Semantic_v03.json` (v0.3 master, built on v0.2).
2. `musashi-structural-index-master 2.json` (canonical character/paragraph coordinates).
3. `Musashi_Semantic_Vocabulary_Database.json` (prior 65 curated guides and visual briefs).

`data/catalog.json` contains 192 candidate forms, 75 relations, 210 relation occurrences, 21 contextual grammar interpretations, 16 grammar rules, 12 pronunciation guides, 278 kanji links, 578 unique kanji inventory records, 10 proposed scenes, 14 editorial contrasts, and all 168 paragraph indexed streams. `data/occurrences.json` contains **all 4,304** seed occurrence positions. No database tables or IDs were renumbered.

The compiler checks each seed-occurrence and relation-evidence span by 1-based paragraph/global coordinates against the exact indexed source. Source SHA-256 is `80a0709963d40aa0c7567ac117f2f4204f003a1884b3022250bc83a811fa0148`.

**Important qualifications:** 127 of the 192 string candidates **do not yet have reviewed reading or meaning fields**; don't auto-populate these by guessing. The 65 previous guides are themselves provisional. V4 may preserve historical spelling; synthesized speech uses the modern reading field and is device-dependent, **not** an original period reconstruction. Shirane's classical grammar framework and Rodrigues's contemporaneous observations are useful analytical aids, not automatic proof of a particular sentence analysis. The 21 contextual interpretations are still editorial interpretations; 2,121 unverified noun-particle proximity windows and 7,639 unsegmented cue matches were deliberately **not** presented as grammar relationships.

## Regenerate after source review

Regenerate both JSON files **together** when a reviewed source database changes:

```
python scripts/build_catalog.py \
  /path/to/Musashi_Historical_Grammar_Semantic_v03.json \
  '/path/to/musashi-structural-index-master 2.json' \
  /path/to/Musashi_Semantic_Vocabulary_Database.json
```

The raw 9.6 MB research master is intentionally **not** published to GitHub Pages. Only compact, audited browser exports are published. Review and version edits upstream, then regenerate static exports instead of editing source facts within `app.js`.

## Next meaningful upgrade

Use **one attested source pattern** to build a scene-based substitution practice, with clearly separated learner-produced modern Japanese and quoted historic V4 text. Test whether a user can select an object, choose a sensible action, and recognize the change in particle/role. Do not automatically treat a plausible new combination as a verified V4 quotation.