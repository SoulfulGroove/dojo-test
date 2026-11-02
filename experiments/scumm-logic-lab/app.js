/* SCUMM -> Dojo Lab interaction layer. No game rules are embedded in UI. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const story = $('tab-story'), logic = $('tab-logic'), clues = $('tab-clues');
 let state = DojoEngine.freshState(), verb = 'look', selectedItem = null;
 const targets = ['villager','well','cup','kettle','sign','gate'];
 const names = {villager:'Villager',well:'Well',cup:'Cup',kettle:'Tea kettle',sign:'Well sign',gate:'Village gate'};
 const btn = (text, className='') => {
   const el = document.createElement('button'); el.type='button';el.textContent=text;if(className)el.className=className;return el;
 };
 function showTab(name) {
   [story,logic,clues].forEach(p=>p.hidden=p.id!=='tab-'+name);
   document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===name)));
   if(name==='logic') renderLogic();
   if(name==='clues') renderClues();
 }
 function say(text){$('message').textContent=text}
 function selectVerb(name){verb=name;selectedItem=null;render();}
 function drawScene(){
   const scene=$('scene'); scene.replaceChildren();
   const house=document.createElement('div');house.className='house';scene.append(house);
   for(const id of targets) {
     if(id==='cup'&&state.world.hasCup)continue;
     const b=btn(names[id]+({villager:' · 人',well:' · 井戸'}[id]||''),'hotspot hotspot-'+id);
     b.dataset.target=id;b.addEventListener('click',()=>run(id));scene.append(b);
   }
   const gate=scene.querySelector('[data-target="gate"]'); if(gate)gate.textContent=state.world.gateOpen?'Gate · OPEN':'Gate · closed';
 }
 function run(target){
   if(['use','give'].includes(verb)&&target==='cup'&&!selectedItem){inventoryClick();return;}
   const cmd={verb,target};
   if(selectedItem)cmd.item=selectedItem;
   const result=DojoEngine.interpret(DOJO_GAME,state,cmd);
   state=result.state;selectedItem=null;say(result.message);render(result.event);
 }
 function inventoryClick(){
   if(!['use','give'].includes(verb)){say('First select Use or Give to choose the cup as an item.');return;}
   selectedItem='cup';say('Cup selected. Now choose the well, tea kettle, or villager.');render();
 }
 function render(event){
   drawScene();
   document.querySelectorAll('[data-verb]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.verb===verb)));
   $('command').textContent=verb.toUpperCase()+(selectedItem?' '+selectedItem.toUpperCase():'')+' → '+(selectedItem?'choose destination':'choose target');
   $('inventory').replaceChildren();
   if(state.world.hasCup){
     const b=btn('Cup · '+state.world.cupContents,'inventory-item');b.addEventListener('click',inventoryClick);$('inventory').append(b);
   }else $('inventory').textContent='Empty';
   $('world').textContent=JSON.stringify(state.world,null,2);
   $('evidence').textContent=JSON.stringify(state.evidence,null,2);
   if(event)$('lastRule').textContent=JSON.stringify(event,null,2);
   $('events').textContent=JSON.stringify(state.log.slice(0,8),null,2);
   renderLogic();
 }
 function renderLogic(){
   const gate=DojoEngine.explainWaterGate(state.world);
   $('guardFormula').textContent=gate.expression;
   const host=$('conditionTable');host.replaceChildren();
   for(const t of gate.conditions){
     const li=document.createElement('li');li.className='check '+(t.ok?'passed':'pending');
     const marker=document.createElement('span');marker.className='mark';marker.textContent=t.ok?'✓':'○';
     const label=document.createElement('span');label.textContent=t.label;
     li.append(marker,label);host.append(li);
   }
   $('allowed').textContent=gate.canGiveWater?'YES — water can be offered':'NO — one or more prerequisites are missing';
   $('allowed').className=gate.canGiveWater?'result allowed':'result';
   $('gateEffect').textContent=state.world.gateOpen?'OPEN':'CLOSED';
   $('flagNotice').textContent=state.world.villagerHelped
     ? 'The successful action already happened. Its effects changed the world: the cup was handed over and the gate remains open, even though the original guard is no longer true.'
     : 'The guard is evaluated immediately before Give cup → villager. The action, if allowed, produces villagerHelped=true and gateOpen=true.';
   const nodes=[
     {id:'take',title:'Take cup',needs:'hasCup = false',produces:'hasCup = true'},
     {id:'fill',title:'Use cup → well',needs:'hasCup = true',produces:'cupContents = water'},
     {id:'give',title:'Give cup → villager',needs:'C ∧ W ∧ ¬H',produces:'villagerHelped; gateOpen'}
   ];
   const steps=$('dependencies');steps.replaceChildren();
   nodes.forEach((node,i)=>{
     const d=document.createElement('div');d.className='dependency';
     const title=document.createElement('strong');title.textContent=node.title;
     const needs=document.createElement('small');needs.textContent='Requires: '+node.needs;
     const produces=document.createElement('small');produces.textContent='Produces: '+node.produces;
     d.append(title,needs,produces);steps.append(d);
     if(i<2){const arr=document.createElement('span');arr.className='dep-arrow';arr.textContent='→';arr.setAttribute('aria-hidden','true');steps.append(arr)}
   });
 }
 const persons=['Aki','Hana','Ren'], places=['Well','Gate','Shrine'], things=['Book','Lantern','Cup'];
 const allPerms=xs=> xs.length===1?[xs]:xs.flatMap((a,i)=>allPerms(xs.filter((_,j)=>i!==j)).map(t=>[a,...t]));
 const assignments=[];
 for(const locs of allPerms(places))for(const objects of allPerms(things)){
   const a=Object.fromEntries(persons.map((p,i)=>[p,{location:locs[i],object:objects[i]}]));
   assignments.push(a);
 }
 const clueDefinitions=[
   {label:'Hana is at the shrine.',test:a=>a.Hana.location==='Shrine'},
   {label:'The book is at the well.',test:a=>persons.some(p=>a[p].location==='Well'&&a[p].object==='Book')},
   {label:'The lantern belongs to the person at the gate.',test:a=>persons.some(p=>a[p].location==='Gate'&&a[p].object==='Lantern')},
   {label:'Aki is not carrying the lantern.',test:a=>a.Aki.object!=='Lantern'}
 ];
 const solutions=assignments.filter(a=>clueDefinitions.every(c=>c.test(a)));
 let clueUsedHint=false;
 function chooseSelect(options,value,person,kind){
   const s=document.createElement('select');
   s.setAttribute('aria-label',person+' '+kind);
   for(const label of ['— choose —',...options]){
     const o=document.createElement('option');o.textContent=label;o.value=label==='— choose —'?'':label;s.append(o);
   }
   s.value=value||''; s.addEventListener('change',()=>{$('clueFeedback').textContent='Selections changed. Check your deductions when ready.'});
   s.dataset.person=person;s.dataset.kind=kind;
   return s;
 }
 function renderClues(){
   const host=$('assignments');if(host.children.length)return;
   for(const p of persons){
     const row=document.createElement('div');row.className='clue-row';
     const name=document.createElement('strong');name.textContent=p;
     row.append(name,chooseSelect(places,'',p,'location'),chooseSelect(things,'',p,'object'));host.append(row);
   }
   const list=$('clueList');
   clueDefinitions.forEach((c,i)=>{const li=document.createElement('li');li.textContent=c.label;list.append(li)});
   $('clueCount').textContent='Exactly '+solutions.length+' assignment'+(solutions.length===1?'':'s')+' satisfies all four clues.';
 }
 function getSelections(){
   const values={};
   for(const p of persons)values[p]={location:'',object:''};
   document.querySelectorAll('#assignments select').forEach(s=>values[s.dataset.person][s.dataset.kind]=s.value);
   return values;
 }
 function checkClues(){
   const x=getSelections(),chosenLocations=persons.map(p=>x[p].location),chosenObjects=persons.map(p=>x[p].object);
   const filled=chosenLocations.every(Boolean)&&chosenObjects.every(Boolean);
   const unique=new Set(chosenLocations.filter(Boolean)).size===chosenLocations.filter(Boolean).length
     && new Set(chosenObjects.filter(Boolean)).size===chosenObjects.filter(Boolean).length;
   const consistent=assignments.filter(a=>clueDefinitions.every(c=>c.test(a))&&persons.every(p=>
      (!x[p].location||x[p].location===a[p].location)&&(!x[p].object||x[p].object===a[p].object)));
   if(!unique){$('clueFeedback').textContent='Each place and object must belong to exactly one person. Check for duplicates.';return}
   if(!consistent.length){$('clueFeedback').textContent='These deductions conflict with at least one clue. Reconsider the assignments.';return}
   if(!filled){$('clueFeedback').textContent='Your partial deductions are consistent. Complete all six assignments to finish.';return}
   $('clueFeedback').textContent='Solved! All assignments satisfy the clues'+(clueUsedHint?' (with a hint).':' without assistance.')+' This is a logic exercise, not evidence of Japanese comprehension.';
 }
 function clueHint(){
   clueUsedHint=true;
   $('clueFeedback').textContent='Deduction hint: Hana is at the shrine, so the other two places belong to Aki and Ren. Combine the book/well and lantern/gate clues with what Aki cannot carry.';
 }
 $('hint').addEventListener('click',()=>{
   const result=DojoEngine.takeHint(state);state=result.state;say(result.message);render(state.log[0]);
 });
 $('reset').addEventListener('click',()=>{
   state=DojoEngine.freshState();verb='look';selectedItem=null;
   say('She points toward the well: 「みずを ください。」 What does she need?');
   render({message:'Session reset'});
 });
 document.querySelectorAll('[data-verb]').forEach(b=>b.addEventListener('click',()=>selectVerb(b.dataset.verb)));
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
 $('clueCheck').addEventListener('click',checkClues);
 $('clueHint').addEventListener('click',clueHint);
 $('clueReset').addEventListener('click',()=>{
   document.querySelectorAll('#assignments select').forEach(s=>s.value='');
   clueUsedHint=false;$('clueFeedback').textContent='Clear board. Deduce the owner and location of each item.';
 });
 $('clueReveal').addEventListener('click',()=>{
   const answer=solutions[0];
   document.querySelectorAll('#assignments select').forEach(s=>s.value=answer[s.dataset.person][s.dataset.kind]);
   clueUsedHint=true;
   $('clueFeedback').textContent='Solution revealed. This counts as assisted exploration, not an independent deduction.';
 });
 render();showTab('story');
})();
