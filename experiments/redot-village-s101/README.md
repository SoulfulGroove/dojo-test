# Village Courtyard — Redot S101 (phone test)

This is an independently editable **Redot 26.3** proof of the same S101 interaction loop from the Village Courtyard ZIP. It uses **procedurally drawn placeholder artwork**, not the original PNG artwork; that keeps this first hosted browser test self-contained and makes it easy to check whether Redot rendering and touch work on an iPhone.

## Try on iPhone

Once the "Build Redot Village Web Test" GitHub Actions workflow succeeds, visit:

https://soulfulgroove.github.io/dojo-test/experiments/redot-village-s101/play/

Turn the phone sideways (landscape). Tap the villager, cup, well, villager again, and gate. Try **Show hitboxes** and **Restart**.

## Open in Redot

Import this directory's `project.godot` in Redot 26.3, open `main.tscn`, and press F5. `main.gd` contains the whole temporary scene, drawn with Redot's native Node2D drawing methods.

## Test purpose and limits

- 960x540 logical canvas, 16:9 landscape and touch/mouse input.
- Short interactive story state, inventory indicator, animated water/tree, hitbox overlay.
- **Not yet confirmed on a physical iPhone**. A successful GitHub Actions export only proves the build completes; it does not prove Safari behavior.
- This source-only test intentionally doesn't replace the richer sprite-art ZIP or any other prototype in `dojo-test`.
