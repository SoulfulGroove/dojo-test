/* Musashi V4 Vocabulary Atlas — read-only data explorer.
 * All lexical IDs, variant IDs, relationship evidence IDs and source paragraphs
 * come from the original cumulative extraction. This app does not verify or alter them.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ESC = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const searchNormalize = s => String(s ?? '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ');
  const SCROLL_ORDER = ['Preface','Earth','Water','Fire','Wind','Void'];
  const state = {mode:'noun', selected:null, query:'', scroll:'', sort:'connections', favoritesOnly:false, limit:36, loaded:false, mobileOpen:false};
  const data = {nouns:[],verbs:[],variants:[],evidence:[],paragraphs:[],reviews:[],manifest:null};
  const byId = new Map(), paras = new Map(), variantByVerb = new Map();
  const pairsByNoun = new Map(), pairsByVerb = new Map();
  const pairMap = new Map(), relatedCount = new Map();
  let favoriteIds = new Set();
  try { favoriteIds = new Set(JSON.parse(localStorage.getItem('musashi-v4-atlas-favorites-v1') || '[]')); } catch {}

  function persistFavorites() { try {localStorage.setItem('musashi-v4-atlas-favorites-v1',JSON.stringify([...favoriteIds]));}catch{} }
  function isMobile() { return window.matchMedia('(max-width: 850px)').matches; }
  function getScrolls(entry) { return [...new Set(entry.paragraphs.map(id=>paras.get(id)?.scroll).filter(Boolean))]; }
  function count(entry) { return relatedCount.get(entry.id) || 0; }
  function firstP(entry) { return entry.paragraphs.length ? Math.min(...entry.paragraphs.map(x=>Number(x.slice(1)))) : 999; }
  function currentEntries() {return state.mode==='noun'?data.nouns:data.verbs;}

  async function load() {
    try {
      const base = 'data/';
      const manifest = await json(base+'manifest.json');
      data.manifest = manifest;
      const files=['nouns.json','verbs.json','variants.json','paragraphs.json','reviews.json',...Array.from({length:manifest.evidence_shards},(_,i)=>`evidence-${i+1}.json`)];
      const loaded = await Promise.all(files.map(x=>json(base+x)));
      [data.nouns,data.verbs,data.variants,data.paragraphs,data.reviews] = loaded.slice(0,5);
      data.evidence = loaded.slice(5).flat();
      for(const e of [...data.nouns,...data.verbs])byId.set(e.id,e);
      for(const p of data.paragraphs)paras.set(p.id,p);
      for(const v of data.variants){let arr=variantByVerb.get(v.parent)||[];arr.push(v);variantByVerb.set(v.parent,arr);}
      for(const r of data.evidence){
        // One pair may have multiple distinct attested evidence records.
        const key=r.noun+'|'+r.verb;
        if(!byId.has(r.noun)||!byId.has(r.verb))throw new Error('Unresolved reference '+r.id);
        let pair=pairMap.get(key);
        if(!pair){pair={noun:r.noun,verb:r.verb,evidence:[]};pairMap.set(key,pair);}
        pair.evidence.push(r);
      }
      for(const pair of pairMap.values()){
        const ns=pairsByNoun.get(pair.noun)||[];ns.push(pair);pairsByNoun.set(pair.noun,ns);
        const vs=pairsByVerb.get(pair.verb)||[];vs.push(pair);pairsByVerb.set(pair.verb,vs);
      }
      for(const e of data.nouns)relatedCount.set(e.id,(pairsByNoun.get(e.id)||[]).length);
      for(const e of data.verbs)relatedCount.set(e.id,(pairsByVerb.get(e.id)||[]).length);
      if(data.nouns.length!==manifest.counts.nouns||data.verbs.length!==manifest.counts.verbs||data.evidence.length!==manifest.counts.evidence||pairMap.size!==manifest.counts.pairs){throw new Error('Dataset integrity check failed');}
      $('summaryStats').innerHTML=`<div><strong>${data.nouns.length.toLocaleString()}</strong><span>NOUNS</span></div><div><strong>${data.verbs.length.toLocaleString()}</strong><span>VERBS</span></div><div><strong>${pairMap.size.toLocaleString()}</strong><span>PAIRS</span></div>`;
      state.loaded=true;
      updateModeButtons();
      const deepLink=parseHash();
      if(deepLink) {state.mode=deepLink.mode; state.selected=deepLink.id;updateModeButtons();}
      renderTiles();renderDetail(false);
      if(state.selected&&isMobile())openMobileDetail();
    } catch(err){
      $('tileGrid').setAttribute('aria-busy','false');
      $('tileGrid').innerHTML=`<div class="list-empty"><b>Vocabulary could not load.</b><p>${ESC(err.message)}</p><p>When opening the multi-file version locally, run a local web server (see README). Or open the included single-file <b>Musashi_Atlas_Offline.html</b>.</p></div>`;
      $('resultCount').textContent='Unable to load';
    }
  }
  async function json(url){if(window.MUSASHI_EMBEDDED && Object.prototype.hasOwnProperty.call(window.MUSASHI_EMBEDDED,url))return window.MUSASHI_EMBEDDED[url];const res=await fetch(url);if(!res.ok)throw new Error(url+': HTTP '+res.status);return await res.json();}
  function updateModeButtons(){
    for(const mode of ['noun','verb']){
      const btn=$(mode==='noun'?'modeNoun':'modeVerb');
      btn.classList.toggle('active',state.mode===mode);
      btn.setAttribute('aria-pressed',String(state.mode===mode));
    }
    $('favoritesToggle').setAttribute('aria-pressed',String(state.favoritesOnly));
    $('favoritesToggle').innerHTML=(state.favoritesOnly?'★':'☆')+' <span>Saved</span>';
    $('searchInput').placeholder=state.mode==='noun'?'Search nouns, meanings, or ID…':'Search verbs, variants, or ID…';
  }
  function setMode(mode){if(mode!==state.mode){state.mode=mode;state.selected=null;state.limit=36;state.query='';$('searchInput').value='';state.scroll='';$('scrollFilter').value='';state.favoritesOnly=false;updateModeButtons();renderTiles();renderDetail(false);}}
  function filtered(){
    const q=searchNormalize(state.query);
    let entries=currentEntries().filter(e=>{
      if(state.favoritesOnly&&!favoriteIds.has(e.id))return false;
      if(state.scroll && !e.paragraphs.some(pid=>paras.get(pid)?.scroll===state.scroll))return false;
      if(q){
        let hay=searchNormalize([e.word,e.kana,e.meaning,e.id,...e.paragraphs].join(' '));
        if(state.mode==='verb')hay+=' '+searchNormalize((variantByVerb.get(e.id)||[]).flatMap(v=>[v.id,v.kana,...v.forms]).join(' '));
        if(!hay.includes(q))return false;
      }
      return true;
    });
    entries.sort((a,b)=>{
      if(state.sort==='connections')return count(b)-count(a)||firstP(a)-firstP(b)||a.id.localeCompare(b.id);
      if(state.sort==='kana')return (a.kana||a.word).localeCompare(b.kana||b.word,'ja')||a.id.localeCompare(b.id);
      return firstP(a)-firstP(b)||a.id.localeCompare(b.id);
    });
    return entries;
  }
  function renderTiles(){
    if(!state.loaded)return;
    const entries=filtered(),shown=entries.slice(0,state.limit);
    $('resultCount').textContent=`${entries.length.toLocaleString()} ${state.mode==='noun'?'nouns':'verbs'} · ${shown.length.toLocaleString()} shown`;
    $('tileGrid').setAttribute('aria-busy','false');
    $('tileGrid').innerHTML=shown.length?shown.map(e=>{
      const n=count(e);
      return `<button type="button" class="word-tile${state.selected===e.id?' selected':''}" data-select="${ESC(e.id)}" aria-label="Open ${ESC(e.word)}: ${ESC(e.meaning)}, ${n} connections" aria-pressed="${state.selected===e.id}">
        <span class="tile-top"><span class="tile-id">${ESC(e.id)}</span><span class="tile-pin">${favoriteIds.has(e.id)?'★':'◇'}</span></span>
        <span class="tile-jp" lang="ja">${ESC(e.word)}</span><span class="tile-kana" lang="ja">${ESC(e.kana)}</span>
        <span class="tile-meaning">${ESC(e.meaning||'Gloss not established')}</span>
        <span class="tile-bottom"><span class="${n?'tile-count':'tile-no-pair'}">${n?n+' connection'+(n===1?'':'s'):'No recorded pair'}</span><span>${ESC(e.paragraphs[0]||'—')}</span></span>
      </button>`;
    }).join(''):`<div class="list-empty"><b>No entries match.</b><p>Try another spelling, scroll, or browse mode.</p></div>`;
    $('loadMore').hidden=entries.length<=state.limit;
  }
  function selectEntry(id,mode,push=true){
    if(mode!=='noun'&&mode!=='verb')return;
    const entry=byId.get(id);
    if(!entry)return;
    if(mode!==state.mode){state.mode=mode;state.limit=36;state.query='';state.scroll='';state.favoritesOnly=false;$('searchInput').value='';$('scrollFilter').value='';updateModeButtons();}
    state.selected=id;
    if(push){const h=`#${mode}/${encodeURIComponent(id)}`;if(location.hash!==h)history.pushState(null,'',h);}
    renderTiles();renderDetail(true);
    if(isMobile())openMobileDetail();
  }
  function parseHash(){const match=location.hash.match(/^#(noun|verb)\/(L\d+[a-z]?)$/i);if(!match||!byId.has(match[2]))return null; const e=byId.get(match[2]);return {mode:e&&data.nouns.some(x=>x.id===e.id)?'noun':'verb',id:e.id};}
  function renderDetail(scrollToTop){
    if(!state.selected||!state.loaded){$('detailEmpty').hidden=false;$('detailContent').hidden=true;return;}
    const entry=byId.get(state.selected);
    if(!entry){$('detailEmpty').hidden=false;$('detailContent').hidden=true;return;}
    $('detailEmpty').hidden=true;$('detailContent').hidden=false;
    const mode=state.mode, linked=(mode==='noun'?pairsByNoun:pairsByVerb).get(entry.id)||[];
    const others=linked.slice().sort((a,b)=>b.evidence.length-a.evidence.length||a.evidence[0].paragraph.localeCompare(b.evidence[0].paragraph));
    const variantRows=mode==='verb'?(variantByVerb.get(entry.id)||[]):[];
    const reviews=entry.reviews||[];
    $('detailContent').innerHTML=`
      <div class="detail-header"><div class="detail-nav"><small>${mode==='noun'?'名詞 · NOUN':'動詞 · VERB'} <span> / </span> ${ESC(entry.id)}</small><div class="detail-nav-buttons"><button class="icon-btn detail-mobile-close" type="button" data-close-detail aria-label="Back to word list">←</button></div></div>
        <div class="detail-hero"><div><h2 class="detail-big" lang="ja">${ESC(entry.word)}</h2><p class="detail-reading" lang="ja">${ESC(entry.kana||'Reading not recorded')}</p></div>
        <button class="star-btn ${favoriteIds.has(entry.id)?'saved':''}" type="button" data-star="${ESC(entry.id)}" aria-label="${favoriteIds.has(entry.id)?'Remove from':'Add to'} saved entries" aria-pressed="${favoriteIds.has(entry.id)}">${favoriteIds.has(entry.id)?'★':'☆'}</button></div>
        <p class="detail-gloss">${ESC(entry.meaning||'Gloss not established')}</p>
        <div class="detail-idrow"><span class="pill">${entry.paragraphs.length} paragraph${entry.paragraphs.length===1?'':'s'}</span><span class="pill sand">${linked.length} linked ${mode==='noun'?'verb':'noun'}${linked.length===1?'':'s'}</span>${reviews.length?`<span class="pill alert">${reviews.length} review flag${reviews.length===1?'':'s'}</span>`:''}</div>
      </div>
      <div class="detail-body">
        <div class="section-heading"><h3>${mode==='noun'?'Associated verbs':'Associated nouns'}</h3><span>${linked.length} DISTINCT PAIRS</span></div>
        <p class="helper">Connections below come from the recorded V4 expressions. Tap a word to explore it in ${mode==='noun'?'verb':'noun'} mode.</p>
        <div class="relation-list">${others.length?others.map(p=>relationCard(p,mode)).join(''):`<div class="empty-rel">No ${mode==='noun'?'verb':'noun'} relationship is recorded for this entry in the current extraction. The word is still part of the vocabulary dataset.</div>`}</div>
        ${mode==='verb'?`<div class="variant-section"><div class="section-heading"><h3>Recorded verb forms</h3><span>${variantRows.length} VARIANTS</span></div>${variantRows.length?`<div class="variant-list">${variantRows.map(variantChip).join('')}</div>`:`<p class="helper">No distinct inflected forms were listed for this verb.</p>`}</div>`:''}
        <div class="source-refs"><div class="section-heading"><h3>Source paragraphs</h3><span>${entry.paragraphs.length} PASSAGES</span></div><div class="source-chips">${entry.paragraphs.map(pid=>`<button type="button" data-source="${ESC(pid)}">${ESC(pid)}</button>`).join('')}</div></div>
        ${reviews.length?`<div class="verse-note"><b>Review flags:</b> ${reviews.map(ESC).join(', ')}. These identify source questions, not automatic disqualification from the first-pass table.</div>`:''}
        ${entry.reading_note?`<div class="verse-note"><b>Reading note:</b> ${ESC(entry.reading_note)}</div>`:''}
        <div class="verse-note">Historical spelling is retained. Readings and English meanings are editorial study aids. A recorded pairing is not necessarily a fully verified grammatical interpretation.</div>
      </div>`;
    if(scrollToTop)$('detailPanel').scrollTop=0;
  }
  function variantChip(v){return `<div class="variant-chip"><b lang="ja">${ESC(v.forms.join(' / ')||'—')}</b><span class="variant-kana" lang="ja">${ESC(v.kana)}</span><span class="variant-id">${ESC(v.id)} · ${ESC(v.paragraphs.slice(0,3).join(', '))}${v.paragraphs.length>3?' …':''}</span>${v.reviews?.length?`<small>Review: ${v.reviews.map(ESC).join(', ')}</small>`:''}</div>`;}
  function relationCard(p,mode){
    const target=byId.get(mode==='noun'?p.verb:p.noun), targetMode=mode==='noun'?'verb':'noun';
    const first=p.evidence[0];
    const evidences=p.evidence.map(e=>`<div class="evidence-item"><p class="evidence-jp" lang="ja">${ESC(e.expression||'(Expression unavailable)')}</p><div class="evidence-meta"><button class="source-link" type="button" data-source="${ESC(e.paragraph)}">${ESC(e.paragraph)} · §${ESC(e.section||paras.get(e.paragraph)?.section||'—')}</button><span>${ESC(e.id)}</span>${e.variant?`<span>Form: ${ESC(e.variant)}</span>`:''}${e.reviews?.length?`<span class="review-tag">Review: ${e.reviews.map(ESC).join(', ')}</span>`:''}</div>${e.context?`<div class="evidence-meta" style="margin-top:6px">Context: ${ESC(e.context)}</div>`:''}</div>`).join('');
    return `<article class="relation-card"><button class="relation-action" type="button" data-jump="${ESC(target.id)}" data-jumpmode="${targetMode}"><span class="relation-kanji" lang="ja">${ESC(target.word)}</span><span class="relation-name"><strong lang="ja">${ESC(target.kana)}</strong><small>${ESC(target.meaning||'Gloss not established')}</small></span><span class="relation-arrow" aria-hidden="true">↗</span></button><details class="relation-evidence"><summary>${p.evidence.length} attested example${p.evidence.length===1?'':'s'} · first ${ESC(first.paragraph)}</summary>${evidences}</details></article>`;
  }
  function openMobileDetail(){if(!isMobile())return;state.mobileOpen=true;$('detailPanel').classList.add('open');document.body.style.overflow='hidden';$('detailPanel').scrollTop=0;}
  function closeMobileDetail(){state.mobileOpen=false;$('detailPanel').classList.remove('open');document.body.style.overflow='';}
  function openSource(pid){const p=paras.get(pid);if(!p)return;$('sourceTitle').textContent=`${pid} · ${p.scroll}`;$('sourceMeta').textContent=`SECTION ${p.section} · ${p.scroll} Scroll`;$('sourceText').textContent=p.text;$('sourceDialog').showModal();}
  function favoritesAction(id){if(favoriteIds.has(id))favoriteIds.delete(id);else favoriteIds.add(id);persistFavorites();renderTiles();renderDetail(false);}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.select){selectEntry(b.dataset.select,state.mode);return;}
    if(b.dataset.jump){selectEntry(b.dataset.jump,b.dataset.jumpmode);return;}
    if(b.dataset.star){favoritesAction(b.dataset.star);return;}
    if(b.dataset.source){openSource(b.dataset.source);return;}
    if(b.hasAttribute('data-close-detail')){closeMobileDetail();return;}
    if(b.dataset.mode){setMode(b.dataset.mode);return;}
  });
  $('searchInput').addEventListener('input',e=>{state.query=e.target.value;state.limit=36;renderTiles();});
  $('scrollFilter').addEventListener('change',e=>{state.scroll=e.target.value;state.limit=36;renderTiles();});
  $('sortSelect').addEventListener('change',e=>{state.sort=e.target.value;renderTiles();});
  $('favoritesToggle').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;state.limit=36;updateModeButtons();renderTiles();});
  $('loadMore').addEventListener('click',()=>{state.limit+=36;renderTiles();});
  $('sourceClose').addEventListener('click',()=>$('sourceDialog').close());
  $('sourceDialog').addEventListener('click',e=>{if(e.target===$('sourceDialog'))$('sourceDialog').close();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.mobileOpen&&!$('sourceDialog').open)closeMobileDetail();});
  window.addEventListener('hashchange',()=>{const link=parseHash();if(link)selectEntry(link.id,link.mode,false);else{state.selected=null;closeMobileDetail();renderDetail(false);renderTiles();}});
  window.addEventListener('popstate',()=>{const link=parseHash();if(link)selectEntry(link.id,link.mode,false);else{state.selected=null;closeMobileDetail();renderDetail(false);renderTiles();}});
  window.addEventListener('resize',()=>{if(!isMobile()&&state.mobileOpen)closeMobileDetail();});
  load();
})();

  