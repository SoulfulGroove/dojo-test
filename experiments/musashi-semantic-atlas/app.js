'use strict';
/* Static, generated JSON only. Nothing in this app generates a grammatical claim. */
const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const PIC={大工:'carpenter.webp',木:'wood.webp',柱:'pillar.webp',家:'house.webp',節:'knot.webp',障子:'shoji.webp',薪:'firewood.webp',道:'path.webp'};
const SCROLL={'0000':'Preface (Earth opening)','0100':'Earth','0200':'Water','0300':'Fire','0400':'Wind','0500':'Void'};
const S={data:null,occurrences:null,filter:'actions',query:'',family:'',sort:'relations',limit:24,selected:null,evidenceShown:4,openParagraph:null,recallOpen:false};
let toastTimeout=null;
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('active');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('active'),2800)}
function imgMarkup(term,cls='') {const file=PIC[term];if(!file) return `<span class="fallback" lang="ja">${escapeHTML([...term].slice(0,2).join(''))}</span>`;
  return `<img src="../musashi-picture-vocab/assets/${file}" alt="Illustration for ${escapeHTML(term)} from the original picture deck" loading="lazy" onerror="this.hidden=true;this.parentElement.querySelector('.fallback').hidden=false"><span class="fallback" lang="ja" hidden>${escapeHTML([...term].slice(0,2).join(''))}</span>`;
}
function byId(id){return S.data.lexemes.find(w=>w.id===id)}
function relationsFor(id){return S.data.relations.filter(r=>r.lexeme===id)}
function annotationFor(relation){return S.data.annotations.find(a=>a.relation_id===relation)}
function paragraphsById(id){return S.data.paragraphs.find(p=>p.id===id)}
function paragraphSpan(id,c0,c1,contextOnly=false){
 const p=paragraphsById(id);if(!p)return '<em>Paragraph unavailable</em>';
 const t=p.text;if(!c0||!c1||t.slice(c0-1,c1).length===0)return escapeHTML(t);
 let a=0,b=t.length;if(contextOnly){a=Math.max(0,c0-1-22);b=Math.min(t.length,c1+22)}
 const before=(a?'…':'')+t.slice(a,c0-1);
 const match=t.slice(c0-1,c1);
 const after=t.slice(c1,b)+(b<t.length?'…':'');
 return `${escapeHTML(before)}<mark>${escapeHTML(match)}</mark>${escapeHTML(after)}`;
}
function matchedLexemes(){
 const q=S.query.toLocaleLowerCase();
 let words=S.data.lexemes.filter(w=>{
  const rs=relationsFor(w.id),hasReview=rs.some(r=>Boolean(annotationFor(r.id)));
  if(S.family&&w.family!==S.family)return false;
  if(S.filter==='reading'&&!w.reading)return false;
  if(S.filter==='actions'&&!rs.length)return false;
  if(S.filter==='reviewed'&&!hasReview)return false;
  if(S.filter==='pending'&&w.reading)return false;
  if(!q)return true;
  return [w.id,w.text,w.reading,w.romaji,w.gloss,w.family,w.category,w.modernTransfer,
   ...rs.flatMap(r=>[r.pattern,r.predicate,r.modernGuide,r.gloss,r.cue])]
   .some(v=>String(v??'').toLocaleLowerCase().includes(q));
 });
 if(S.sort==='alphabetical')words.sort((a,b)=>a.text.localeCompare(b.text,'ja'));
 else if(S.sort==='relations')words.sort((a,b)=>relationsFor(b.id).length-relationsFor(a.id).length||b.matches-a.matches);
 else words.sort((a,b)=>b.matches-a.matches||a.id.localeCompare(b.id));
 return words;
}
function cardMarkup(w){
 const r=relationsFor(w.id),ready=Boolean(w.reading),reviewed=r.some(x=>annotationFor(x.id));
 const label=reviewed?'Context interpretation':!ready?'Needs review':r.length?'With actions':'Reading guide';
 const style=reviewed?'reviewed':!ready?'pending':'';
 return `<button class="word-card" data-word="${escapeHTML(w.id)}" aria-label="Open ${escapeHTML(w.text)} ${escapeHTML(w.gloss||'unreviewed candidate')} details">
  <div class="card-art">${imgMarkup(w.text)}${!PIC[w.text]?'<span class="art-hint">image brief pending</span>':''}</div>
  <div class="word-info"><span class="word-jp" lang="ja">${escapeHTML(w.text)}</span>
  <span class="word-reading" lang="ja">${escapeHTML(w.reading||'Reading unreviewed')}</span>
  <span class="word-gloss ${!ready?'missing':''}">${escapeHTML(w.gloss||'Meaning / segmentation not reviewed')}</span>
  <span class="card-bottom"><span>${Number(w.matches).toLocaleString()} string hits</span><span class="tag ${style}">${escapeHTML(label)}</span></span></div></button>`;
}
function renderCards(){
 if(!S.data)return;
 const list=matchedLexemes();const visible=list.slice(0,S.limit);
 $('resultCount').textContent=`${list.length} forms · showing ${visible.length}`;
 $('cards').innerHTML=visible.length?visible.map(cardMarkup).join(''):'<p class="empty-results">No forms match. Try another family or a different search.</p>';
 $('moreCards').hidden=visible.length===list.length;
}
function renderSourceRow(ev,type='occ'){
 const pid=ev.p;
 return `<button class="source-row" data-paragraph="${escapeHTML(pid)}" data-c0="${ev.c0}" data-c1="${ev.c1}" aria-label="Inspect V4 ${escapeHTML(pid)} at global character ${ev.g0}">
 <span class="source-top"><b>${escapeHTML(pid)} · §${escapeHTML(ev.section)}</b><code>g${ev.g0}–${ev.g1} · c${ev.c0}–${ev.c1}</code></span>
 <span class="source-excerpt" lang="ja">${paragraphSpan(pid,ev.c0,ev.c1,true)}</span>
 <span class="tiny">${type==='relation'?'Exact source pattern':'Indexed substring'} · Select to inspect paragraph</span></button>`;
}
function renderDetail(){
 const w=S.selected;if(!w)return;
 const rs=relationsFor(w.id),ann=rs.map(r=>annotationFor(r.id)).filter(Boolean);
 const same=S.data.lexemes.filter(x=>x.id!==w.id&&[...w.text].some(c=>/\p{Script=Han}/u.test(c)&&x.text.includes(c))).sort((a,b)=>b.matches-a.matches).slice(0,18);
 const scenes=S.data.scenes.filter(s=>s.entry_lexeme_id===w.id||s.other_relation_ids.some(id=>rs.some(r=>r.id===id)));
 const records=(S.occurrences?.occurrences||[]).filter(e=>e.lexeme===w.id);
 const imageHint=w.visualBrief||({object_image:'Proposed: concrete object picture',scene_image:'Proposed: realistic use scene',abstract_scene:'Proposed: contextual diagram'}[w.imageApproach])||'Illustration concept to be reviewed';
 const related=w.reading?`<span class="reading" lang="ja">${escapeHTML(w.reading)}</span> <span class="micro">${escapeHTML(w.romaji||'')}</span>`:'<span class="reading">Reading not verified / not yet supplied</span>';
 let html=`<div class="detail-header"><div class="detail-art">${imgMarkup(w.text)}</div><div><div class="eyebrow">${escapeHTML(w.family)} · ${escapeHTML(w.id)}</div><div class="jp" lang="ja">${escapeHTML(w.text)}</div>${related}<div class="gloss">${escapeHTML(w.gloss||'Meaning not yet reviewed')}</div><div class="micro">${escapeHTML(w.ontology)} · ${escapeHTML(w.status.replaceAll('_',' '))}</div></div></div>
 <div class="detail-metrics"><span>${w.matches} exact substring matches</span><span>${w.paragraphCount} paragraphs</span><span>${rs.length} attested action patterns</span></div>
 <section class="detail-section"><h3>Meaning & picture</h3><p>${escapeHTML(imageHint)}</p>
 ${w.reading?'<div class="notice">Reading and meaning are provisional modern study guides. Written-string presence is verified; segmentation, reading in context, and exact sense may still need review.</div>':'<div class="notice">Source-string candidate only. No reading or English definition has been asserted; interpret with passage context before creating a learning card.</div>'}
 <p class="tiny">Modern transfer (editorial): ${escapeHTML(w.modernTransfer==='not rated'?'Not assessed':w.modernTransfer)}. This is not a measured anime/gaming usage statistic.</p>
 ${w.reading?`<button class="speaking" data-speak="${escapeHTML(w.reading)}">▶ Modern synthesized pronunciation (device-dependent)</button>`:''}</section>
 <section class="detail-section"><h3>Actions & roles <span class="micro">(${rs.length})</span></h3>`;
 if(!rs.length)html+='<p>No source-attested noun/action patterns have been linked to this form yet. That does not establish that it cannot take verbs.</p>';
 for(const r of rs){
  const a=annotationFor(r.id);const evidence=S.data.relationEvidence.filter(e=>e.relation===r.id);const ev=evidence[0];
  html+=`<div class="relation-card"><div class="relation-head"><b lang="ja">${escapeHTML(r.pattern)}</b><span class="relationship-status ${a?'reviewed':''}">${a?'Context interpreted':'Role provisional'}</span></div>
    <div class="relation-summary">${escapeHTML(r.gloss)} · <strong>${escapeHTML(r.modernGuide||r.predicate)}</strong></div>
    <div class="relation-meta">${escapeHTML(r.id)} · Cue: ${escapeHTML(r.cue)} · Proposed role: ${escapeHTML(a?.semantic_role||r.role)} ${a?'· '+escapeHTML(a.interpretive_confidence):''}</div>
    ${a?`<div class="tiny">Contextual interpretation: ${escapeHTML(a.contextual_english)}. ${escapeHTML(a.notes||'')}<br>Grammar pointers: ${escapeHTML(a.grammar_rule_ids)} · Editorial, not independent historical token proof.</div>`:''}
    ${ev?renderSourceRow(ev,'relation'):'<p class="tiny">No coordinate example supplied.</p>'}</div>`;
 }
 html+='</section>';
 if(ann.length){const ruleids=new Set(ann.flatMap(a=>String(a.grammar_rule_ids||'').split(',').map(x=>x.trim())));
   const rules=S.data.grammars.filter(g=>ruleids.has(g.rule_id));
   html+=`<section class="detail-section"><h3>Grammar frameworks</h3><p class="tiny">Framework references to Shirane and Rodrigues are not sentence-level proof. Open the V4 examples above to see the actual written pattern.</p>`+
   rules.map(g=>`<div class="relation-card"><b>${escapeHTML(g.rule_id)} · ${escapeHTML(g.feature.replaceAll('_',' '))}</b><p class="tiny">${escapeHTML(g.interpretation)}</p><span class="micro">${escapeHTML(g.source_id)} · ${escapeHTML(g.source_locator)} · ${escapeHTML(g.evidence_scope)}</span></div>`).join('')+'</section>';
 }
 html+=`<section class="detail-section"><h3>Connected by kanji <span class="micro">(${same.length} displayed)</span></h3>${same.length?`<div class="linked-terms">${same.map(x=>`<button class="term-link" data-word="${escapeHTML(x.id)}" title="${escapeHTML(x.gloss||'Unreviewed meaning')}" lang="ja">${escapeHTML(x.text)}</button>`).join('')}</div>`:'<p>No other indexed seed form shares a kanji with this one.</p>'}
 <p class="tiny">Shared written characters are a discovery link, not proof that words have the same meaning.</p></section>`;
 if(scenes.length){html+='<section class="detail-section"><h3>Possible story situations</h3>';
 for(const scene of scenes.slice(0,3))html+=`<div class="scene-note"><b>${escapeHTML(scene.name)}</b> · ${escapeHTML(scene.scene_id)}<p>${escapeHTML(scene.proposed_quest_application_NOT_SOURCE)}</p><div class="tiny">Proposed quest, NOT part of Musashi's source text. Anchor: ${escapeHTML(scene.source_paragraph_id)}.</div></div>`;
 html+='</section>'}
 const readingGuides=S.data.readingGuides.filter(g=>g.surface_v4===w.text);
 if(readingGuides.length){html+='<section class="detail-section"><h3>Historical spelling / modern reading</h3>';
 for(const g of readingGuides)html+=`<div class="relation-card"><div class="tiny">${escapeHTML(g.example_id)} · Conventional study guidance; not reconstructed period speech</div><p lang="ja"><b>${escapeHTML(g.surface_v4)}</b> · modern reading ${escapeHTML(g.modern_study_reading)} · historical kana guide ${escapeHTML(g.historical_kana_guide)}</p><div class="tiny">${escapeHTML(g.notes)} · Framework ${escapeHTML(g.grammar_source_id)}, ${escapeHTML(g.source_rule_id)}</div></div>`;
 html+='</section>';
 }
 const contrasts=S.data.contrasts.filter(c=>[c.concept_a,c.concept_b].some(t=>w.text.includes(t)));
 if(contrasts.length){html+='<section class="detail-section"><h3>Concept contrasts</h3>';
 for(const c of contrasts)html+=`<div class="relation-card"><b lang="ja">${escapeHTML(c.concept_a)} ↔ ${escapeHTML(c.concept_b)}</b><p class="tiny">Editorial contrast between written characters, not a verified opposition in this V4 passage. Indexed character counts: ${c.indexed_character_freq_a} and ${c.indexed_character_freq_b}.</p></div>`;
 html+='</section>';
 }
 html+=`<section class="detail-section"><h3>Original V4 appearances</h3><p class="tiny">Matches are exact substrings of the indexed character stream. Text excludes editorial separators; counts may include longer words or overlapping occurrences. Global/paragraph positions are 1-based inclusive.</p>`;
 if(!S.occurrences)html+='<p class="tiny">Loading all indexed coordinates…</p>';
 else {html+=records.slice(0,S.evidenceShown).map(e=>renderSourceRow(e)).join('');
 if(records.length>S.evidenceShown)html+=`<button class="secondary-btn" id="moreEvidence">Show next ${Math.min(10,records.length-S.evidenceShown)} source matches</button>`;}
 html+=`<div id="paragraphFocus"></div></section>`;
 if(w.reading)html+=`<section class="detail-section"><h3>Recall check</h3><div class="recall"><p>Without looking above, can you recall the study reading and meaning for <span lang="ja">${escapeHTML(w.text)}</span>?</p><button id="toggleRecall">${S.recallOpen?'Hide answer':'Reveal answer'}</button><div class="recall-answer" aria-live="polite">${S.recallOpen?escapeHTML(w.reading+' · '+(w.gloss||'')):'　'}</div><span class="tiny">Self-check only; this prototype does not claim or track mastery.</span></div></section>`;
 $('detailContent').innerHTML=html;
 if(S.openParagraph)renderFocusedParagraph();
}
function renderFocusedParagraph(){const e=S.openParagraph;if(!e)return;
 const p=paragraphsById(e.pid);const target=$('paragraphFocus');if(!target||!p)return;
 target.innerHTML=`<div class="paragraph-view"><div class="source-top"><b>${escapeHTML(e.pid)} · §${escapeHTML(p.section)} · ${escapeHTML(SCROLL[p.scroll]||p.scroll)}</b><span>Indexed character stream</span></div><p class="paragraph-text" lang="ja">${paragraphSpan(e.pid,e.c0,e.c1)}</p><div class="tiny">Every symbol above follows the canonical V4 character index. Editorial separators and punctuation excluded from this indexed representation.</div></div>`;
 target.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function openWord(id){const w=byId(id);if(!w)return;S.selected=w;S.evidenceShown=4;S.openParagraph=null;S.recallOpen=false;renderDetail();if(!$('detail').open)$('detail').showModal();}
async function load(){try{
 const response=await fetch('data/catalog.json');if(!response.ok)throw new Error('catalog.json HTTP '+response.status);
 S.data=await response.json();
 $('totalWords').textContent=S.data.lexemes.length;
 $('totalRelations').textContent=S.data.relations.length;
 $('totalInterpretations').textContent=S.data.annotations.length;
 $('sourceHash').textContent='Corpus: V4 SHA-256 '+S.data.source.v4Sha256+'. Database source: '+S.data.source.sourceVersion+'. Original reading/picture deck is unchanged.';
 const families=[...new Set(S.data.lexemes.map(w=>w.family))].sort();
 $('family').innerHTML='<option value="">All families</option>'+families.map(f=>`<option value="${escapeHTML(f)}">${escapeHTML(f)}</option>`).join('');
 renderCards();
 // Separate JSON: full coordinate hits are loaded after the smaller catalog.
 fetch('data/occurrences.json').then(r=>{if(!r.ok)throw Error('occurrences.json HTTP '+r.status);return r.json()}).then(data=>{
  if(data.v4Sha256!==S.data.source.v4Sha256)throw Error('Source version mismatch');
  S.occurrences=data;if(S.selected)renderDetail();
 }).catch(e=>toast('Full source-coordinate data unavailable: '+e.message));
 }catch(error){$('resultCount').textContent='Cannot open catalog';$('cards').innerHTML=`<p class="empty-results">Catalog did not load. Serve this directory through a local web server or GitHub Pages, then refresh. (${escapeHTML(error.message)})</p>`}}
$('search').addEventListener('input',ev=>{S.query=ev.target.value.trim();S.limit=24;renderCards()});
$('family').addEventListener('change',ev=>{S.family=ev.target.value;S.limit=24;renderCards()});
$('sort').addEventListener('change',ev=>{S.sort=ev.target.value;S.limit=24;renderCards()});
document.querySelector('.chips').addEventListener('click',ev=>{
 const b=ev.target.closest('[data-filter]');if(!b)return;
 S.filter=b.dataset.filter;S.limit=24;
 document.querySelectorAll('[data-filter]').forEach(button=>{let on=button===b;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on))});
 renderCards();
});
$('moreCards').addEventListener('click',()=>{S.limit+=24;renderCards()});
$('cards').addEventListener('click',ev=>{const b=ev.target.closest('[data-word]');if(b)openWord(b.dataset.word)});
$('closeDialog').addEventListener('click',()=>$('detail').close());
$('detail').addEventListener('click',ev=>{if(ev.target===$('detail'))$('detail').close()});
$('detailContent').addEventListener('click',ev=>{
 const word=ev.target.closest('[data-word]');if(word){openWord(word.dataset.word);return}
 const source=ev.target.closest('[data-paragraph]');if(source){S.openParagraph={pid:source.dataset.paragraph,c0:Number(source.dataset.c0),c1:Number(source.dataset.c1)};renderFocusedParagraph();return}
 if(ev.target.closest('#moreEvidence')){S.evidenceShown+=10;renderDetail();return}
 if(ev.target.closest('#toggleRecall')){S.recallOpen=!S.recallOpen;renderDetail();return}
 const speak=ev.target.closest('[data-speak]');if(speak){
  if(!('speechSynthesis'in window)){toast('No Japanese speech synthesis available on this device.');return}
  const utterance=new SpeechSynthesisUtterance(speak.dataset.speak);utterance.lang='ja-JP';utterance.rate=.8;
  window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);
 }
});
load();