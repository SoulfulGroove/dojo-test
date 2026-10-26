(()=>{
  'use strict';
  const pages=['hall','quests','skills','codex','map'];
  const $=(q)=>document.querySelector(q);const $$=(q)=>[...document.querySelectorAll(q)];
  let current='hall',skills=[],selected='sound',previousFocus=null,lastQuest='recall',dialogAction='trainer';
  const qs={musashi:{title:'Read the Opening Passage',description:'Authentic Musashi reading is an emerging practice goal. Open the reader to work on a real passage, inspect kana and sentence boundaries.',action:'reader',button:'Open Musashi Reader'},recall:{title:'Kana Recall Drill',description:'Practice recognizing and retrieving kana. The K-row trainer is already playable. Demo progress shown in the illustration is not read from your actual work.',action:'trainer',button:'Begin Kana Practice'},vocab:{title:'Vocabulary Anchor',description:'Build from a small number of authentic words and attach meaning to forms you can pronounce. This is a planned quest, not a finished exercise.',action:'codex',button:'Open Codex'},syntax:{title:'Sentence Construction',description:'A future challenge: reconstruct and analyze genuine Japanese phrases. This artwork represents a proposed quest and is not yet a playable reconstruction exercise.',action:'reader',button:'Open Reader'}};
  // Reuse the trainer's real quest definition and local, browser-only practice state.
  let hallQuest={title:'Rebuild the K-row',description:'Reconstruct five kana, then recall their sounds without choices.'};
  const hallTrainerStorage='adhd-dojo-hiragana-k-row-v01';
  function renderHallQuest(){
    const title=$('#hallQuestTitle'),description=$('#hallQuestDescription'),status=$('#hallQuestProgress'),button=$('#hallQuestStart');
    if(!title||!description||!status||!button)return;
    title.textContent=hallQuest.title;
    description.textContent=hallQuest.description;
    let progress=null;
    try{progress=JSON.parse(localStorage.getItem(hallTrainerStorage)||'null')}catch(e){}
    const phase=progress&&progress.phase;
    if(phase==='done'&&Array.isArray(progress.results)&&progress.results.length){
      const n=progress.results.length;
      const first=progress.results.filter(x=>x&&x.firstTry===true).length;
      const revealed=progress.results.filter(x=>x&&x.assisted===true).length;
      status.textContent='Last recall rep: '+first+' / '+n+' first try'+(revealed?', '+revealed+' revealed':'')+'. Not a mastery certification.';
      button.textContent='Review or repeat practice →';
    }else if(phase==='recall'&&Array.isArray(progress.order)){
      const n=progress.order.length;
      const checked=Math.min(n,Math.max(0,Math.floor(Number(progress.index)||0)));
      status.textContent='Reconstruction complete · Sound recall '+checked+' / '+n+' checked.';
      button.textContent='Continue recall →';
    }else if(phase==='rebuild'&&progress.placed&&typeof progress.placed==='object'){
      const count=Math.min(5,Object.keys(progress.placed).length);
      status.textContent=count?'Reconstruction in progress: '+count+' / 5 placed. Recall is next.':'Two practice stages: reconstruct, then retrieve from memory.';
      button.textContent=count?'Continue reconstruction →':'Begin practice →';
    }else{
      status.textContent='Two practice stages: reconstruct, then retrieve from memory.';
      button.textContent='Begin practice →';
    }
  }
  fetch('../hiragana-dojo/data/kana.json').then(r=>{if(!r.ok)throw Error('Quest metadata unavailable');return r.json()}).then(data=>{
    const quest=data&&data.quest;
    if(quest&&quest.id==='kana-k-foundation'&&typeof quest.title==='string'&&typeof quest.description==='string'&&quest.title.length<100&&quest.description.length<250){
      hallQuest={title:quest.title,description:quest.description};
    }
    renderHallQuest();
  }).catch(()=>renderHallQuest());
  function nav(page,opts={}){
    if(!pages.includes(page))return;
    current=page;
    if(page==='hall')renderHallQuest();
    pages.forEach(p=>{const el=$('#page-'+p);el.hidden=p!==page;el.classList.toggle('is-active',p===page)});
    $$('.bottom-nav button').forEach(b=>{const active=b.dataset.page===page;b.classList.toggle('active',active);active?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
    if(!opts.preserveScroll)window.scrollTo({top:0,behavior:'instant'});
    try{history.replaceState(null,'','#'+page)}catch(e){}
    try{localStorage.setItem('dojo-illustrated-page',page)}catch(e){}
  }
  function openDialog(title,text,action='trainer',cta='Enter activity'){
    previousFocus=document.activeElement;dialogAction=action;$('#dialogTitle').textContent=title;$('#dialogText').textContent=text;$('#dialogPrimary').textContent=cta+' →';$('#dialogOverlay').hidden=false;document.body.style.overflow='hidden';$('.dialog').focus();
  }
  function closeDialog(){ $('#dialogOverlay').hidden=true;document.body.style.overflow=''; if(previousFocus?.focus)previousFocus.focus();}
  function training(){ closeDialog();$('#trainingOverlay').hidden=false;const f=$('#trainingFrame');f.src='../hiragana-dojo/';document.body.style.overflow='hidden';}
  function closeTraining(){$('#trainingOverlay').hidden=true;$('#trainingFrame').src='about:blank';document.body.style.overflow='';renderHallQuest();}
  function followAction(action){if(action==='trainer'){training();return;}if(action==='reader'){window.location.href='../musashi-reader/';return;}if(action==='codex'){closeDialog();nav('codex');return;}if(action==='profile'){openDialog('Apprentice profile','Character level, XP, and reward values illustrated in this concept are deliberately fictional. Your demonstrated Japanese-learning milestones appear separately in the Skills panel.','skills','Inspect learning skills');return;}if(action==='skills'){closeDialog();nav('skills');return;}}
  function questFilter(view){
    $$('.quest-filters button').forEach(b=>{let v=b.dataset.questfilter===view;b.classList.toggle('selected',v);b.setAttribute('aria-selected',String(v))});
    $('#questActive').hidden=view!=='active';$('#questArchive').hidden=view!=='archive';$('#questMilestones').hidden=view!=='milestones';
  }
  function codexTab(view){
    $$('.codex-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.codextab===view)));
    $('#codexCharacters').hidden=view!=='characters';$('#codexVocab').hidden=view!=='vocab';$('#codexReading').hidden=view!=='reading';
  }
  function showSkill(id){
    const s=skills.find(x=>x.id===id);if(!s)return;selected=s.id;
    $$('.skill-node').forEach(n=>{const a=n.dataset.skill===id;n.classList.toggle('active',a);n.setAttribute('aria-pressed',String(a))});
    $('#selectedSkillIcon').src='assets/'+s.icon+'.webp';$('#selectedSkillTitle').textContent=s.title;
    $('#selectedSkillState').textContent=s.status==='active'?'Active / emerging':'Historically reported';
    $('#selectedSkillDescription').textContent=s.summary;$('#selectedSkillEvidence').textContent=s.evidence;
    const btn=$('#selectedSkillAction');btn.dataset.action=s.target;btn.innerHTML='';btn.append(document.createTextNode(s.action+' →'));
    try{localStorage.setItem('dojo-illustrated-skill',s.id)}catch(e){}
  }
  function sayKana(kana,sound){
    $('#kanaReadout').textContent=kana+' — '+sound+' · listen and repeat';
    $$('.kana-buttons button').forEach(b=>b.classList.toggle('playing',b.dataset.kana===kana));
    try{ if('speechSynthesis' in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(kana);u.lang='ja-JP';u.rate=.78;window.speechSynthesis.speak(u);} }catch(e){}
  }
  document.addEventListener('click',(ev)=>{
    const el=ev.target.closest('button,a');if(!el||el.tagName==='A')return;
    const p=el.dataset.page;if(p){nav(p);return;}
    const act=el.dataset.action;if(act){if(act==='close-dialog'){closeDialog();return;}if(act==='close-training'){closeTraining();return;}followAction(act);return;}
    if(el.dataset.questfilter){questFilter(el.dataset.questfilter);return;}
    if(el.dataset.codextab){codexTab(el.dataset.codextab);return;}
    if(el.dataset.skill){showSkill(el.dataset.skill);return;}
    if(el.dataset.quest){const q=qs[el.dataset.quest];lastQuest=el.dataset.quest;openDialog(q.title,q.description,q.action,q.button);return;}
    if(el.dataset.kana){sayKana(el.dataset.kana,el.dataset.sound);return;}
    if(el.id==='dialogPrimary'){closeDialog();followAction(dialogAction);return;}
  });
  window.addEventListener('storage',(ev)=>{if(ev.key===hallTrainerStorage)renderHallQuest()});
  document.addEventListener('keydown',(ev)=>{
    if(ev.key==='Escape'){if(!$('#trainingOverlay').hidden){closeTraining();return;}if(!$('#dialogOverlay').hidden){closeDialog();return;}}
    if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){
      let a=document.activeElement; if(a?.closest('.kana-buttons')){const i= ['か','き','く','け','こ'].indexOf(a.dataset.kana),next=(i+(ev.key==='ArrowRight'?1:4))%5;$$('.kana-buttons button')[next].focus();ev.preventDefault();}
    }
  });
  fetch('data/skills.json').then(r=>{if(!r.ok)throw Error('skill source unavailable');return r.json()}).then(x=>{skills=x.skills;let p='sound';try{p=localStorage.getItem('dojo-illustrated-skill')||p}catch(e){}showSkill(p)}).catch(()=>{skills=[{id:'sound',title:'Sound Structure',icon:'skill-sound',status:'reported',summary:'Organized hiragana sounds into a recoverable structure.',evidence:'Documented in the hiragana experiment.',target:'trainer',action:'Open practice'}];showSkill('sound')});
  let first=location.hash.slice(1);if(!pages.includes(first)){try{first=localStorage.getItem('dojo-illustrated-page')}catch(e){first='hall'}}nav(pages.includes(first)?first:'hall');
  // Test-facing state is read-only and contains no user secrets.
  window.__dojoLab={get page(){return current},get skill(){return selected},nav,showSkill,questFilter,codexTab};
})();
