# Hiragana Dojo — Modular Scene Composer · Construction Test 01

## What this test proves

**Two scenes reuse one art bank without repainting their individual elements.** The browser reads one pre-existing EAST atlas at `../dojo-asset-lab/assets/miniature/east-scene.png` and uses SVG viewports to crop different sprites from it. The original rock, crate, and water-vessel shapes are separate reusable SVG `symbol` definitions. All scene layouts are collections of records specifying `id`, art key `a`, `x`, `y`, `s` (scale) and `z` (depth).

This experiment intentionally **does not select the final art style**. The static backgrounds are temporary scene-specific vector compositions, not a production art pack.

## Try the test

1. Open [the composer](https://soulfulgroove.github.io/dojo-test/experiments/modular-scene-composer/) on phone or desktop.
2. In **Arrange** mode, tap a rock, building, or vessel and drag it. The art moves together with its invisible tap region and bottom-center anchor.
3. Enable **Bounds** to reveal collision/touch regions and anchors. Resize a selected object with the scale control.
4. Select **Village Landing**: identical source assets are arranged into a different room.
5. Add a duplicate or another asset from the bank. Its source image has not been copied.
6. Move a water vessel, then choose **Explore** and tap it. Its independent hotspot still produces a contextual みず/water message.
7. Enable/disable **Motion**: only the separate water shapes animate; stationary rocks/buildings do not.
8. Change selected depth and observe overlaps. Export scene JSON to inspect instance records; reset only the active room.

## What this does not prove

It does not establish the final visual quality, compositional style, perspective, production-grade lighting, an art authoring/export pipeline, or learning progression. It is a **reuse, layering, animation and interaction architecture test**. The backgrounds are generic and some individual sprites may be too small on narrow screens. Phone/touch testing is still required.

## Provenance and licensing

The atlas is reused from the previously deployed `experiments/dojo-asset-lab/` source. The third-party **EAST Free Sample** assets are by **mmorwynn**: https://mmorwynn.itch.io/east-free-sample. See the existing [asset lab README](../dojo-asset-lab/README.md) for license/provenance details. The new experiment does not redistribute a third-party pack; it references the existing in-game texture atlas. The three additional SVG symbols are original construction-test shapes.

## Implementation notes

- Static page, no new build step, framework, or publishing configuration.
- In-page art bank and authored scene data; SVG groups compose scene instances.
- `pointerdown` / `pointermove` / `pointerup` implement touch and mouse editing in logical SVG coordinates.
- `localStorage` retains edits in the current browser; **Export JSON** downloads current scene layouts.
- An object hotspot is defined as part of its group; changing scale/position preserves alignment.
- Water uses independent paths and CSS animation, with `prefers-reduced-motion` support.
- Existing story game and previous experiments are untouched.

## Acceptance

Construction success means the same exact asset definitions can produce two separate scenes, duplicates reuse their art, objects and hitboxes travel together, depth and animation operate independently, and exported scene data retains the layout. The next experiment is **art-direction mockups**, comparing visual treatments on a fixed composition once this mechanism has been tested by hand.