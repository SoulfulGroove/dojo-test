/* Self-contained motion layer. Original story and Japanese-learning logic remains in game.js. */
(() => {
  'use strict';
  const art = document.querySelector('#sceneArt');
  const dialogue = document.querySelector('#dialogueCard');
  const text = document.querySelector('#dialogueText');
  const soundButton = document.querySelector('#soundButton');
  const isReduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!art || !dialogue || !text) return;
  const stage = document.createElement('div');
  stage.className = 'ambient-layer shore';
  stage.setAttribute('aria-hidden', 'true');
  art.insertBefore(stage, art.firstChild);
  const sceneParts = {
    shore: '<div class="sea-breathe"></div><div class="sea-spray"></div><div class="sun-path"></div><div class="far-mist"></div>',
    house: '<div class="fire-glow"></div><div class="smoke s1"></div><div class="smoke s2"></div><div class="smoke s3"></div><div class="ember e1"></div><div class="ember e2"></div><div class="ember e3"></div><img class="fisherman-figure" alt="" src="assets/fisherman-idle.webp" loading="eager" draggable="false">'
  };
  let scene = '';
  let offer = false;
  let userMotion = true;
  let lastSpeech = '';
  function activeMotion() { return userMotion && !isReduced.matches; }
  function enterScene(kind) {
    if (!sceneParts[kind] || scene === kind) return;
    scene = kind;
    offer = false;
    stage.className = `ambient-layer ${kind}`;
    stage.innerHTML = sceneParts[kind];
    art.classList.remove('motion-enter');
    void art.offsetWidth;
    art.classList.add('motion-enter');
    art.setAttribute('data-motion-scene',kind);
  }
  function offerWater() {
    if (scene !== 'house' || offer) return;
    offer = true;
    const figure = stage.querySelector('.fisherman-figure');
    if (figure) {
      figure.src = 'assets/fisherman-offer.webp';
      figure.classList.add('gesturing');
    }
    if (activeMotion()) addToken('みず');
  }
  function addToken(word) {
    const n = document.createElement('span');
    n.className = 'motion-token'; n.lang = 'ja'; n.textContent = word;
    stage.appendChild(n);
    n.addEventListener('animationend', () => n.remove(), {once:true});
  }
  function celebrate() {
    if (!activeMotion()) return;
    for (let i = 0; i < 9; i++) {
      const spark = document.createElement('i');
      spark.className = 'motion-goldfleck';
      spark.style.left = `${54 + (i % 3) * 4}%`;
      spark.style.top = `${52 + Math.floor(i / 3) * 4}%`;
      spark.style.setProperty('--dx', `${(i - 4) * 17}px`);
      spark.style.setProperty('--dy', `${-40 - i*5}px`);
      stage.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), {once:true});
    }
  }
  function pulseDialogue() {
    dialogue.classList.remove('speaking');
    if (activeMotion()) {
      void dialogue.offsetWidth;
      dialogue.classList.add('speaking');
    }
    if (scene === 'house' && text.textContent.includes('The word belongs to this thing')) offerWater();
    if (scene === 'house' && text.textContent.includes('You remember.')) celebrate();
  }
  new MutationObserver(pulseDialogue).observe(text,{childList:true,characterData:true,subtree:true});
  new MutationObserver(() => {
    const style = art.style.backgroundImage;
    if (style.includes('hearth-scene')) enterScene('house');
    else if (style.includes('shore-scene')) enterScene('shore');
  }).observe(art,{attributes:true,attributeFilter:['style']});
  art.addEventListener('click', e => {
    if (!e.target.closest('.hotspot') || !activeMotion()) return;
    const r = art.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'motion-ripple';
    ripple.style.left = `${e.clientX - r.left}px`;
    ripple.style.top = `${e.clientY - r.top}px`;
    stage.appendChild(ripple);
    ripple.addEventListener('animationend',() => ripple.remove(),{once:true});
  });
  // Keep animation optional. Preference setting is local to this play session.
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'top-btn motion-toggle';
  toggle.id = 'motionButton'; toggle.textContent = '✧';
  toggle.setAttribute('aria-label','Turn animations off');
  toggle.setAttribute('title','Toggle animations');
  toggle.setAttribute('aria-pressed','true');
  document.querySelector('.top-actions')?.appendChild(toggle);
  toggle.addEventListener('click', () => {
    userMotion = !userMotion;
    document.documentElement.classList.toggle('motion-off',!userMotion);
    toggle.setAttribute('aria-pressed',String(userMotion));
    toggle.setAttribute('aria-label',userMotion?'Turn animations off':'Turn animations on');
    toggle.textContent = userMotion?'✧':'✕';
  });
  document.querySelector('#startButton')?.addEventListener('click', () => {
    lastSpeech = '';
  });
  // Do not add unnecessary audio loops: voice still uses the original opt-in Sound control.
  enterScene('shore');
})();