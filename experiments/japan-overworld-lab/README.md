# Japan Overworld Design Lab · v0.1

A **self-contained, interactive Japan overworld** design experiment for the ADHD Dojo mobile-game shell.

## Try it

Hosted at `https://soulfulgroove.github.io/dojo-test/experiments/japan-overworld-lab/` (when deployed).

1. Switch between **Edo Atlas** and **RPG Realm** using the style selector. Both share one recognizable geographical outline.
2. Tap **Kyoto**, **Edo**, **Kokura**, or **Kumamoto** on the overview, or pan/pinch/zoom using gestures (or `+`, `−`, and **Fit** controls).
3. Choose **Explore Kyoto → Enter Practice Hall → Enter Hiragana Training** to try a complete vertical slice. Only Kyoto has a detailed playable branch in v0.1; the others are labeled preview destinations.
4. Use **Back**, breadcrumbs, **World**, **Dojo**, or **Next Rep** to navigate directly.
5. Open **Historical sources & map notes** for reference provenance and accuracy limitations.

The existing `../hiragana-dojo/` opens within a focus overlay. The **Skills** tab links to the existing `../dojo-skill-tree-lab/`. No original experiment was replaced.

## Historical basis and fidelity

- **Geography:** public-domain Natural Earth simplified country polygons (`naturalearth_lowres`, packaged with pyogrio). The full outline is an original, embedded SVG; no externally hosted basemap or copyrighted scans are included. Small islands, relief hatching, and paths are schematic decorations. This is *not* a georeferenced historic map.
- **Historical inspiration:** the National Diet Library's early national map formerly called **Keichō Nihon Sōzu**, which historical research dates to **Kan'ei 15 (1638)**. Original: https://dl.ndl.go.jp/pid/1286203 . Reference: National Diet Library Newsletter no. 226, 2019; University of Zurich historical map guide: https://adfontes.uzh.ch/tutorium/old-japanese-maps/edo-period-maps .
- **Important caveat:** maps of the 1630s typically omitted **Ezo** (now Hokkaido). This modern geographic base includes Hokkaido for recognizable orientation, and styles it differently in Atlas mode. Our illustrated regional map and fictional Practice Hall are game environments, not authentic reconstructions of Kyoto circa 1640.
- **Placenames:** Kyoto, Edo, Kokura, and Kumamoto are actual Japanese places placed approximately at their modern geographic locations; map labels are simplified and not a political-boundary survey.

## Technical design

One generated `index.html`, no frontend framework, network libraries, accounts, or analytics. `build.py` and `template.html` are retained in this local work folder as reproducible source, while the GitHub deployment needs only the complete `index.html` (includes original SVG/CSS/JS). Styles, selected location, and current navigation level are browser-local preferences.

Touch and keyboard navigation; map pointer pan and basic pinch, buttons for zoom/fit; no swipe-driven app-level page changes while map gestures are active. Reduced motion uses the user's operating-system setting.

## Smoke test (local Chromium / Playwright)

Viewport 320×700, 390×844 and 1280×900: no horizontal page overflow, no page errors; confirmed art-style switching, Japan → Kyoto → Dojo and Back, reference sheet open/close, and zoom control. Screenshot captures also generated at 320 and 390px and at desktop. Actual GitHub Pages integration and physical iOS pinch/scroll should still be tested on device.

## Future experiments

Replace the schematic Kyoto scene with finer historical provincial maps and a better geography pipeline; compare additional graphic treatments; choose one region for more detailed geographic/historical research before adding story content. No invented Musashi events or falsely attributed sources should be inserted.