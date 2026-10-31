# A Stranger Upon the Shore — playable prologue

A self-contained, mobile-first, point-and-click historical adventure concept for the Japanese-language learning game developed in the Dojo project.

## What is playable

- Cinematic historical-fiction title screen.
- An illustrated shipwreck shoreline, with touch and mouse hotspots plus accessible action buttons.
- Conversation with the fisherman leading to a second scene.
- An illustrated coastal household with interactive objects.
- The Japanese word **みず** taught through context, then prompted again in a small recognition check.
- A prologue ending that introduces the larger quest of finding the missing crew.
- Optional browser text-to-speech for the Japanese word; turn it off using the Sound control.
- A journal and historical-inspiration notes.

## Run

Open `index.html` in a browser, or serve this folder as a static website. No build step, server API, third-party fonts, or external JavaScript dependencies are required.

## Publish to GitHub Pages

Copy the contents into `experiments/stranger-upon-the-shore/` in `SoulfulGroove/dojo-test` and commit. GitHub Pages will serve it under the experiment path.

## Visual approach

The original painted art is designed to evoke late-Sengoku/early-Tokugawa Japan, drawing broadly on period screens and maritime encounters rather than copying a single historic work. It is concept art, not an archaeologically vetted reconstruction. The title image is atmospheric and geographically nonliteral. The Japanese learning content uses modernized beginner-friendly language; historical dialogue has not been reconstructed.

Relevant primary and museum references:
- William Adams, 1611 letter, available in extracts via Fordham Modern History Sourcebook
- The Metropolitan Museum of Art, *Arrival of the Europeans* (first quarter of the 17th century): https://www.metmuseum.org/art/collection/search/65417
- Rodrigo de Vivero's 1609 shipwreck account and English trading diaries from the 1610s

## Scope

This is a **working narrative and interface slice**, not a completed course, historically validated reconstruction, or finished game. The goal is to test whether story, exploration, and a first Japanese comprehension moment belong together as an enjoyable experience.

## Animated illustration pass (v0.2)

The original game story and interaction code remains unchanged. Two additive files provide animation:
- `motion.css`: subtle water shimmer, sea spray, distant mist, hearth glow, smoke, embers, title-camera breathing, dialogue reveal, click ripples, and reduced-motion alternatives.
- `motion.js`: attaches decorative layers to the existing illustrated scenes; responds to scene changes and the existing water dialogue to change the fisherman's pose, and offers a user-controlled motion toggle (`✧` in the header).
- `assets/fisherman-idle.webp` and `assets/fisherman-offer.webp`: original isolated transparent character illustrations used as separate scene art.

This experiment uses native CSS animations and a small JavaScript controller, not a new game engine or external animation/CDN dependency. Animation never blocks pointer/touch actions. On reduced-motion devices, ambient movement is disabled. The historical art remains a creative interpretation, not a verified reconstruction.

### Playtest checks

1. Start the prologue, explore a shore hotspot, and talk to the fisherman.
2. Accept his help and enter the house. Look for smoke, firelight, and an independently breathing fisherman.
3. Tap the water vessel; the fisherman should offer a scoop and みず should appear.
4. Complete the same Japanese recall exercise and reach the ending.
5. Use the small motion icon in the header to turn animations off and back on.
6. Test on a small phone viewport and with an OS preference for reduced motion.