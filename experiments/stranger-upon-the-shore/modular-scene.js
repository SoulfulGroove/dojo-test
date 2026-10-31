/*
 * Stranger Upon the Shore — modular painted-scene renderer.
 * Original WebP painting remains the canonical art; independent canvas modules
 * sample its water/mist and animate them without changing story/game.js.
 *
 * Future isolated PNG/WebP sprites can replace any module without changing
 * dialogue, hotspots, chapter transitions, or the rest of the animation system.
 */
(() => {
  'use strict';

  const art = document.getElementById('sceneArt');
  const story = document.getElementById('storyScreen');
  if (!art || !story) return;

  const ORIGINAL = 'assets/shore-scene.webp';
  // Coordinates refer to the original 16:9 painting, not the cropped viewport.
  // Soft-edged localized patches deliberately avoid the characters, wreck and ships.
  const modules = [
    { name: 'open-water-left', type: 'water', x: .375, y: .414, rx: .075, ry: .052, amplitude: 2.1, speed: 1.1 },
    { name: 'open-water-middle', type: 'water', x: .570, y: .397, rx: .069, ry: .049, amplitude: 2.4, speed: 1.3 },
    { name: 'harbor-water', type: 'water', x: .858, y: .477, rx: .126, ry: .044, amplitude: 2.6, speed: 1.2 },
    { name: 'rock-pool', type: 'water', x: .605, y: .657, rx: .085, ry: .037, amplitude: 3.0, speed: 1.5 },
    { name: 'right-breaker', type: 'water', x: .885, y: .608, rx: .120, ry: .067, amplitude: 4.2, speed: 1.8 },
    { name: 'foreground-surf', type: 'water', x: .899, y: .816, rx: .092, ry: .069, amplitude: 3.4, speed: 1.5 },
    { name: 'mountain-mist', type: 'mist', x: .685, y: .117, rx: .167, ry: .057, amplitude: 1.3, speed: .25 },
    { name: 'headland-haze', type: 'mist', x: .773, y: .208, rx: .099, ry: .040, amplitude: 1.1, speed: .33 }
  ];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'modular-painted-layer';
  canvas.setAttribute('aria-hidden', 'true');
  art.insertBefore(canvas, art.firstChild);
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) { canvas.remove(); return; }

  const source = new Image();
  source.decoding = 'async';
  source.src = ORIGINAL;

  let base, patch, patchCtx;
  let cssWidth = 0, cssHeight = 0, pixelsWidth = 0, pixelsHeight = 0;
  let imageDraw = { x:0, y:0, w:0, h:0 };
  let ready = false, active = 'shore', raf = 0, start = 0, lastFrame = 0;
  let surgeTime = -100;
  const motionAllowed = () =>
    !document.documentElement.classList.contains('motion-off') && !reduced.matches;
  const sceneVisible = () =>
    !document.hidden && !story.classList.contains('hidden') && active === 'shore';

  function inside(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // Replicate CSS background-size:cover + background-position:center exactly.
  function configure() {
    if (!source.naturalWidth || !source.naturalHeight) return false;
    const rect = art.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    if (!cssWidth || !cssHeight) return false;
    // Limit resolution on mobile: a painted overlay does not need retina 3x.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(cssWidth * dpr), h = Math.round(cssHeight * dpr);
    if (w === pixelsWidth && h === pixelsHeight && base) return true;
    pixelsWidth = w;
    pixelsHeight = h;
    canvas.width = w;
    canvas.height = h;
    base = document.createElement('canvas');
    base.width = w; base.height = h;
    patch = document.createElement('canvas');
    patch.width = w; patch.height = h;
    patchCtx = patch.getContext('2d');
    const scale = Math.max(w/source.naturalWidth, h/source.naturalHeight);
    imageDraw = {
      x:(w-source.naturalWidth*scale)/2,
      y:(h-source.naturalHeight*scale)/2,
      w:source.naturalWidth*scale,
      h:source.naturalHeight*scale
    };
    const bctx = base.getContext('2d');
    bctx.drawImage(source,imageDraw.x,imageDraw.y,imageDraw.w,imageDraw.h);
    return true;
  }

  // A self-contained sprite-like image module, feathered at its boundary.
  // Its content comes from the original detailed painting, not a vector substitute.
  function paintModule(layer, time, surge) {
    const cx = imageDraw.x + layer.x * imageDraw.w;
    const cy = imageDraw.y + layer.y * imageDraw.h;
    const rx = layer.rx * imageDraw.w;
    const ry = layer.ry * imageDraw.h;
    // Completely cropped layers are skipped on narrow portrait screens.
    if (cx + rx < 0 || cx - rx > pixelsWidth || cy + ry < 0 || cy - ry > pixelsHeight) return;

    const c = patchCtx;
    c.clearRect(0,0,pixelsWidth,pixelsHeight);
    c.save();
    c.beginPath();
    c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    c.clip();

    const amplitude = layer.amplitude * Math.min(window.devicePixelRatio || 1,1.5);
    const gain = layer.type === 'water' ? (1 + surge*0.65) : 0.7;
    const top = Math.max(0,Math.floor(cy-ry));
    const bottom = Math.min(pixelsHeight,Math.ceil(cy+ry));
    const band = Math.max(3,Math.round(4 * Math.min(window.devicePixelRatio || 1,1.5)));
    // Distort actual source pixels, with distinct motion frequency for each module.
    for (let y=top; y<bottom; y+=band) {
      const phase = y*.027 + time*layer.speed + cx*.001;
      const xshift = Math.sin(phase)*amplitude*gain
        + Math.sin(phase*.62+time*.7)*amplitude*.35;
      const yshift = Math.cos(phase*.78-time*layer.speed)*amplitude*.32*gain;
      const sy = inside(Math.floor(y+yshift),0,Math.max(0,pixelsHeight-band));
      c.drawImage(base,0,sy,pixelsWidth,Math.min(band+1,pixelsHeight-sy),
        xshift,y,pixelsWidth,Math.min(band+1,pixelsHeight-y));
    }
    c.restore();

    // Soft alpha edge makes the animated image tile blend into the painting.
    c.save();
    c.globalCompositeOperation='destination-in';
    c.translate(cx,cy);
    c.scale(rx,ry);
    const fade=c.createRadialGradient(0,0,0,0,0,1);
    fade.addColorStop(0,'rgba(0,0,0,1)');
    fade.addColorStop(.65,'rgba(0,0,0,1)');
    fade.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=fade;
    c.fillRect(-1,-1,2,2);
    c.restore();

    ctx.globalAlpha=layer.type==='mist'?.67:.95;
    ctx.drawImage(patch,0,0);
    ctx.globalAlpha=1;
  }

  function draw(now) {
    if (!ready || !configure()) return;
    const t = (now-start)/1000;
    const delta = Math.max(0,now/1000-surgeTime);
    const surge = delta < 2.8 ? Math.pow(1-delta/2.8,2) : 0;
    ctx.clearRect(0,0,pixelsWidth,pixelsHeight);
    for (const layer of modules) paintModule(layer,t,surge);
  }

  function tick(now) {
    raf=requestAnimationFrame(tick);
    if (!ready || !sceneVisible() || !motionAllowed()) return;
    // 24 FPS: keeps animation readable and reduces iPhone CPU/battery use.
    if (now-lastFrame < 42) return;
    lastFrame=now;
    if (!start) start=now;
    draw(now);
  }

  function syncScene() {
    active = art.style.backgroundImage.includes('hearth-scene') ? 'house' : 'shore';
    canvas.style.display = active === 'shore' && motionAllowed() ? 'block' : 'none';
  }

  new MutationObserver(syncScene).observe(art,{attributes:true,attributeFilter:['style']});
  new MutationObserver(syncScene).observe(document.documentElement,
    {attributes:true,attributeFilter:['class']});
  reduced.addEventListener?.('change',syncScene);
  document.getElementById('hotspotLayer')?.addEventListener('click',event=>{
    const label=event.target.closest('.hotspot')?.getAttribute('aria-label') || '';
    if(label==='Look toward sea')surgeTime=performance.now()/1000;
  });
  window.addEventListener('resize',()=>{pixelsWidth=0;pixelsHeight=0;},{passive:true});
  source.onload=()=>{ready=true;configure();syncScene();};
  source.onerror=()=>{canvas.remove();};

  syncScene();
  raf=requestAnimationFrame(tick);
})();
