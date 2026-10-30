# Hiragana Dojo · The Supply Gate (v0.1)

A standalone, mobile-first, **playable learning experiment** for GitHub Pages. It does not replace or modify the existing Hiragana Dojo, vocabulary apps, illustrated prototypes, or Semantic Atlas.

## Try it

Open `index.html` in a browser, or visit `https://soulfulgroove.github.io/dojo-test/experiments/dojo-meaning-quest/` after deployment.

1. **Recognize:** interpret `これは水です。` and choose the item being identified.
2. **Construct:** reuse the pattern to identify tea, selecting meaningful Japanese parts and rejecting distractors.
3. **Transfer:** identify a new brush using free Japanese text input. An optional word-bank scaffold is available, but assisted completion is recorded separately from independent transfer.

On correct completion, the supply gate visibly opens. The browser stores only cumulative local completion counts (and independent completions) in `localStorage` when available. There are no accounts, third-party scripts, network calls, or analytics in v0.1.

## Japanese accuracy and scope

- `これ` is a proximal demonstrative pronoun ("this" near the speaker).
- `は` is a topic marker, pronounced `wa`.
- `です` here is used for a polite identification sentence.
- `これは水です。` = "This is water."; `これはお茶です。` = "This is tea."; `これは筆です。` = "This is a brush."
- Vocabulary: 水 (みず, water), お茶 (おちゃ, tea), 筆 (ふで, brush), 本 (ほん, book).
- All Japanese examples in this prototype are **constructed modern Japanese**; no claim of attestation in Musashi's V4 corpus.
- Output checking is intentionally constrained to the chosen construction, not a full grammar evaluation or a claim of general fluency.
- The game's supplied English situations deliberately establish that the **player** is holding the object being identified; `これ` refers to what is near the player/speaker.
- Optional audio uses the browser/device's Japanese TTS voices (if available), not verified recorded audio.

## One learning loop

This is a deliberate prototype of: **activate existing knowledge → recognize an integrated expression → produce a meaningful substitution → apply the pattern to a new object without a model**.

A gate opening is narrative feedback for completion, not proof of mastery. The more meaningful signal is whether the learner can write the new expression *without* opening the structural reminder or word bank. The experiment does not yet test retention, spontaneous dialogue, multiple acceptable paraphrases, or actions such as `水を飲む` / `筆を持つ`.

## Next experiment

After hands-on playtesting, replace static label-writing with a second action-focused quest: select a relevant action, choose participants and objects, and resolve an NPC's concrete need. Keep the original supplied vocabulary and structural knowledge available for strategic priming without asking the learner to memorize another unrelated phrase list.

## Development

One dependency-free `index.html` contains the stylesheet, game logic and markup to simplify fast iteration. For a larger build, move level data into structured JSON without rewriting the canonical Musashi V4 provenance or changing other experiments.