# Shore water animation — production proof and acceptance criteria

## Why this proof exists

The original shore illustration is a single, beautiful flattened WebP image. Earlier animation prototypes moved rectangular or elliptical image regions containing rocks, wreckage, figures and boats. That is incorrect for an illustrated point-and-click scene: **static scenery must remain fixed while water changes independently**.

The first proof is `water-isolation-lab.html`. It is a standalone scene-construction tool, not a replacement for the game.

## Required scene construction

In compositing order, back to front:

1. **Static environment plate**: sky, mountains, village, intact rocks, wreckage, boats, shoreline structures. No transforms or distortions.
2. **Water underlay**: clean illustrated ocean behind foreground scenery. The finished version must include painted water beneath every movable water area.
3. **Animated water**: separate animated ocean/surf surface, masked to only those pixels actually occupied by water. Animation may be sprite frames, hand-painted loops, or a localized GPU displacement of *water-only* pixels.
4. **Foreground occluders**: independent image cutouts for rocks, shipwreck timber, boats and shore details that sit **over** the water and its foam. Static pixels in these objects are never animated.
5. **Water accents**: localized foam, splashes and wetness that are separately designed and aligned to shore/rock contact points.
6. **Characters**: standalone illustrated characters with separate idle/action frames or rigs. No movement of the character pixels embedded in the environment.
7. **Game layer**: existing hotspots, story dialogue, audio and Japanese practice.

When source PSD/Procreate layers do not exist, exporting layer 4 requires extracting those shapes and **inpainting/restoring the missing water/background behind them**. Pure auto-segmentation is not enough at detailed edges.

## Proof stages

### Proof A — water-only matte (implemented)

- The original painting remains fixed and visible as a reference.
- A separate layer moves only where the mask allows.
- The mask overlay can be displayed.
- Brush editor can add water or protect solid objects.
- The current image matte can be exported as `shore-water-mask.png`.
- Sample point diagnostic checks unchanged areas as a warning.
- On small-screen crops, mask and animation stay registered to the *source illustration*, not page coordinates.

This proof uses a **conservative initial matte** that intentionally leaves some water stationary. It needs manual refinement before any production claim.

### Proof B — clean plate and occluders (not yet implemented)

Deliver: `shore-static.webp`, `shore-water-underlay.webp`, `shore-occluders.webp` (alpha), and `shore-water-mask.png` (alpha).

Verify: rock, figure, ship, timber and harbor outlines are identical across two time samples; water never drags an edge or reveals black/transparent holes.

### Proof C — authentic wave cycle (not yet implemented)

Animate 3–5 s of advancing/receding sea with actual changes in foam silhouette and rock contact. A tiny texture displacement is **not a complete breaking wave**. Test loops at original scale on a phone and inspect first/last frame continuity.

### Proof D — integrate back into story (not yet implemented)

Swap the validated layer stack into the playable prologue without changing `game.js`. Check all hotspot locations, the fisherman's interaction, water introduction `みず`, speech button, recall challenge and ending. Preserve reduced-motion/animation-off.

## Acceptance gate

- No rock, building, rigging, wood or character pixels move over time.
- Water can move behind foreground objects without overlapping them.
- Surf animation reads as a wave, not just a filter applied to static artwork.
- No visible mask seams, hard-edged patches or source-image ghosting.
- Source artwork preserves its original painting quality.
- Clear animation on/off control and `prefers-reduced-motion` behavior.
- Touch controls and dialogue continue working at narrow portrait sizes.
- Document which outputs were actually visually tested and on which browsers.

**Current status:** Proof A is implemented as a browser lab, but visual acceptance and the layer reconstruction in Proof B remain open. Do not call the overall scene production-ready based on the starter mask or numerical sample check alone.
