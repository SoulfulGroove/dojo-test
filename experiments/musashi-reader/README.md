# Musashi Reader — Experiment v0.1

An isolated Foundry experiment using the validated paragraph-level corpus of *The Book of Five Rings*.

## Scope

- Browse the preface and five scrolls.
- Search the original Japanese, section titles, or stable paragraph IDs.
- Read all 168 paragraphs (`P000`–`P167`).
- Adjust Japanese reading size.
- Reserve aligned areas for modern Japanese and English layers.

## Data boundary

`data/corpus.json` is generated presentation data. The source master remains unchanged outside the interface, and the reader does not normalize, translate, or sentence-segment the text.

## Isolation

This experiment is self-contained under `experiments/musashi-reader/`. It does not import, edit, or share state with Road Warrior, Gig Warrior, Performance Forge, or the active DevHub.
