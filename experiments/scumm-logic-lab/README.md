# Hiragana Dojo — SCUMM & Logic Lab

**Standalone, original study experiment.** This folder does not replace or modify the existing illustrated prototype, Supply Gate, Musashi vocabulary browser, or canonical V4 corpus.

## Open the GitHub Pages experiment

https://soulfulgroove.github.io/dojo-test/experiments/scumm-logic-lab/

GitHub Pages must be enabled for the repository's main branch for this URL to serve correctly.

## Purpose

A small learning laboratory for studying adventure-game architecture inspired by Lucasfilm Games' SCUMM scripting concepts. This is **not** SCUMM bytecode, and no LucasArts artwork or game data is included.

The experiment has three interactive views:

1. **Play the story**: Select Look, Take, Talk, Use, or Give, then a target. Pick up a cup, fill it at the well, and interpret the villager's modern Japanese request: 「みずを ください。」.
2. **Inspect the logic**: Watch the preconditions change as the game runs. The Give-water guard is C ∧ W ∧ ¬H, where C=has cup, W=cup contains water, H=villager already helped. See the rule/event log and its state effects.
3. **Zebra clues**: Infer one-to-one relationships between three villagers, three items, and three locations. A constraint-enumeration procedure tests 36 possible assignments and identifies exactly one solution.

## A crucial logic distinction

A **state predicate** is a proposition about the world at a moment, for example "hasCup is true."

A **guard/precondition** is a Boolean expression that must be satisfied before an event:
C ∧ W ∧ ¬H.

An **action** performs a **state transition**: Give water => villagerHelped=true, gateOpen=true, hasCup=false, cupContents=empty.

Therefore gateOpen can remain true even after the Give-water precondition becomes false. A dependency chart organizes actions and facts, but it is not merely a graph of propositional equivalences. It includes *causal state changes*.

A **zebra puzzle** is different: find assignments satisfying a set of simultaneous constraints. This example enforces one-to-one assignments of locations and objects to persons. It uses a tiny exhaustive search, not an external SAT solver.

## Files

- index.html — accessible(ish), responsive, original CSS illustration, tabs for play/rules/deduction.
- engine.js — generic adventure rule interpreter and small explanatory logic helper.
- game-data.js — authored scenes, objects, interaction rules, conditions, effects.
- app.js — browser interaction and developer view, plus the self-contained clue solver.
- tests.js — Node.js tests: adventure routes, assistance tracking, propositional truth table, unique clue solution.

To run locally, download the folder and open index.html in a browser. This lab has no external network calls or library dependencies. To run automated tests:

~~~sh
node tests.js
~~~

## Japanese learning and provenance

The Japanese lines are **constructed modern instructional Japanese**, not quoted or claimed to be attested in the Musashi V4 corpus. The script demonstrates one concrete response to a request; it does **not** prove independent comprehension, lasting memory, or proficiency. The flag independentlyCompleted means only that the first offered content was water without an explicit hint in this short encounter.

For a future Dojo integration, the vocabulary data should reference reviewed semantic-concept IDs and provenance; puzzle logic should reference those concepts but not rewrite source texts. Keep learning evidence independent from story-world flags, even when an interaction advances both.

## Study references

- Wallace Poulter's 1991 *S.C.U.M.M. Tutorial 0.1*: https://tandell.com/misc/SCUMM-Tutorial-0.1.pdf
- Maniac Mansion decoded object and room scripts: https://github.com/segrax/Maniac.Mansion.Disassembly
- Ron Gilbert's dependency chart discussion: https://grumpygamer.com/puzzle_dependency_charts/
- ScummC source compiler (historical experimentation): https://github.com/AlbanBedel/scummc
- quest'n'click modern rule definitions: https://github.com/Quest-n-Click/quest-n-click
- Existing learning prototype: https://github.com/SoulfulGroove/dojo-test/tree/main/experiments/dojo-meaning-quest

## Limitations / next test

The art is schematic CSS, not the intended illustrated-storybook art direction. No animation/actor navigation, room transitions, persistent saves, or actual mobile-device QA. The clue puzzle is English-only. It should be used to explore architecture, *not* construed as a finished Japanese lesson.

A good follow-up is to implement one simple second NPC interaction where the learner decodes Japanese clues and acts on a logically deduced relationship, then test independent performance with and without scaffolds.
