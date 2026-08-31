# Musashi Curriculum Feature Extraction

This folder contains derived-data tooling for the Musashi Reader experiment.

## Safety rule

The canonical corpus is **input only**. The extractor reads:

`../data/corpus.json`

and writes derived files under:

`../data/features/`

It does not edit the corpus or the reader source files.

## Run

From `experiments/musashi-reader/scripts/`:

```bash
python3 extract_features.py
```

Or from the repository root:

```bash
python3 experiments/musashi-reader/scripts/extract_features.py
```

## v0.1 outputs

- `paragraph_features.json` — per-paragraph script inventory, counts, new vs. previously encountered characters, cumulative unique counts
- `hiragana.json` — corpus-wide hiragana registry with stable Unicode-derived IDs, first occurrence, frequency, and paragraph coverage
- `katakana.json` — same for katakana
- `kanji.json` — same for CJK ideographs / kanji
- `corpus_stats.json` — validation and high-level corpus counts

## Important distinction

This first pass is intentionally deterministic. It identifies **visible characters**, not linguistic roles.

For example, the extractor may report that `は` occurs in a paragraph, but it does **not** automatically claim that occurrence is the topic particle. Likewise, adjacent kanji are not automatically treated as a vocabulary word.

A later reviewed annotation layer should handle:

- particles and grammatical functions
- vocabulary / word segmentation
- readings
- classical-to-modern correspondences
- grammar constructions
- sentence segmentation

This separation keeps the derived curriculum data auditable and prevents the first-pass extractor from smuggling interpretation into the canonical corpus.
