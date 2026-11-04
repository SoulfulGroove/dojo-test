# Musashi · Vocabulary Atlas

A **standalone, mobile-first, read-only tile browser** for the noun–verb relationships in the original Musashi V4 Japanese corpus extraction.

**Open:** https://soulfulgroove.github.io/dojo-test/experiments/musashi-relation-atlas/

## Explore

- **名詞 Nouns** — browse all 875 extracted noun entries; tap one to see its attested verb counterparts.
- **動詞 Verbs** — browse all 495 primary verb entries; tap one to see its noun counterparts and 1,015 linked recorded variants.
- Search Japanese, hiragana, English meanings, lexical IDs, or passage numbers. Filter by scroll (Preface, Earth, Water, Fire, Wind, Void); sort by connections, kana, or first passage.
- Open a pairing's **attested examples** to inspect the individual original relationship evidence IDs and exact quoted V4 expressions. View the entire original paragraph by tapping its P-ID.
- Favorite words locally with ☆. Favorites are browser-specific and not synced.

## Original source and scope

The application embeds read-only data derived from **Musashi_Cumulative_P000-P167.json**, schema `musashi-noun-verb-extraction-1.2`, completed first-pass extraction dated 2026-11-03. Original IDs and source wording are unchanged.

| Source element | Count |
|---|---:|
| Nouns | 875 |
| Primary verbs | 495 |
| Verb variants | 1,015 |
| Relationship evidence records (NV IDs) | 2,025 |
| Distinct noun/verb pairs | 1,381 |
| V4 source paragraphs | 168 |
| Review flags retained | 313 |

Every noun and verb is browseable, even entries for which no noun–verb relationship was recorded. Evidence is grouped by noun ID + verb ID for display, without discarding underlying NV source records. Variant forms remain linked to primary verb L-IDs.

**Evidence status:** This reflects a first-pass extraction, not a completed historical linguistic verification. Some readings, English glosses, and grammatical interpretations remain provisional; no missing pairings are invented.

## Architecture

This initial release is intentionally just **one self-contained index.html file**: its CSS, JavaScript, JSON data, evidence records, variants, and paragraph texts are embedded, so GitHub Pages can serve it without extra dependencies. A separate modular source and reproducible build/test scripts were assembled locally in the working artifact package. Future changes should regenerate the page from the original, versioned corpus rather than manually editing 1,300,000 bytes of embedded data.

This experiment is isolated under `experiments/musashi-relation-atlas/` and does **not** change other Dojo apps, games or the authoritative Musashi source.
