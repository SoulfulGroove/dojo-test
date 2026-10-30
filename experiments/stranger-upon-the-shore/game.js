(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const screens = ['#titleScreen','#storyScreen','#endingScreen'].map($);
  const story = $('#storyScreen');
  const art = $('#sceneArt');
  const hotspotLayer = $('#hotspotLayer');
  const placeLabel = $('#placeLabel');
  const chapterLabel = $('#chapterLabel');
  const speaker = $('#speaker');
  const dialogueText = $('#dialogueText');
  const nextButton = $('#nextButton');
  const choiceRow = $('#choices');
  const learningStrip = $('#learningStrip');
  const romanHint = $('#romanHint');
  const quickActions = $('#quickActions');
  const modal = $('#infoDialog');
  const modalTitle = $('#infoTitle');
  const modalContent = $('#infoContent');
  let soundOn = true;
  const state = { scene:'title', phase:'shore-intro', seen:new Set(), wordLearned:false, mistakes:0, waterSelected:false };
  const beach = {
    wreck:{label:'Inspect wreck',x:14,y:41,name:'THE WRECK',text:'Splintered oak, shattered casks, and wet hemp lie strewn across the rocks. The ship will never sail again. The little work you put into her timbers now lies broken before you.'},
    shore:{label:'Look toward sea',x:77,y:40,name:'THE COAST',text:'The air tastes of salt. Beyond the headland, the waters stretch toward a horizon you cannot read. Somewhere out there may be your shipmates, if the sea has spared them.'},
    clothes:{label:'Examine yourself',x:23,y:66,name:'THE TRAVELER',text:'Your shirt is stiff with brine; your shoulder burns. You have your life, but little else. England is very far away.'},
    fisherman:{label:'Speak to fisherman',x:44,y:55,name:'THE FISHERMAN',text:'A man from the village approaches, wary but concerned. He speaks rapidly. You catch not a single word, but the meaning of his outstretched hand is plain.'}
  };
  const house = {
    jar:{label:'Water vessel',x:9,y:62,name:'A VESSEL OF WATER',text:'A dark vessel and ladle stand by the low table. You can see water glistening in the opening.'},
    rice:{label:'Rice bowl',x:21,y:72,name:'THE RICE',text:'Steam rises from a bowl of rice. After weeks of spoiled biscuit and salted meat, the aroma is nearly enough to make you weep.'},
    hearth:{label:'Hearth',x:58,y:57,name:'THE HEARTH',text:'Charcoal glows within the sunken hearth. Smoke and the scent of dried fish gather in the rafters. The warmth feels like a kindness.'},
    bedding:{label:'Resting place',x:82,y:53,name:'A PLACE TO REST',text:'A folded sleeping mat waits beyond the hearth. Someone has put aside a dry blanket for a man whose name they do not know.'}
  };
  const pages = {
    history: `<p>This is an original story, set loosely around 1600. The premise takes inspiration from the documented voyages of William Adams and other Europeans who arrived in Japan under difficult maritime circumstances.</p><p>The painted environments are a <strong>historical-fiction interpretation</strong>, not exact reconstructions of a named settlement or household. Clothing, boat forms and architecture would receive specialist review for a final release.</p><p>For a contemporary Japanese visual source, see the Metropolitan Museum of Art's <a href="https://www.metmuseum.org/art/collection/search/65417" target="_blank" rel="noopener">Arrival of the Europeans</a>, an early-seventeenth-century painted screen.</p><p>The Japanese in this short learning demo is presented in accessible modern form, not as an attempted transcription of speech from 1600.</p>`,
    journal: () => `<p><strong>The situation.</strong> A seafaring voyage meant for the East Indies has gone wrong. You have been cast upon an unknown Japanese shore, with no means of returning home. Your first business is to learn whether any companions survived.</p><p><strong>People met.</strong> ${state.scene==='title'?'None yet.':'A fisherman who carried you from the beach.'}</p><p><strong>Knowledge discovered.</strong> ${state.wordLearned?'<span lang="ja">みず</span> · mizu · water':'Not yet. Listen and look closely.'}</p><p><strong>Current purpose.</strong> ${state.scene==='ending'?'Find the missing crew.':'Survive, understand your hosts, and discover where you have come.'}</p>`
  };
  const setScreen = (id) => {
    screens.forEach(s => s.classList.toggle('hidden', s.id!==id));
    window.scrollTo({top:0,behavior:'instant'});
  };
  const speak = (text) => {
    if (!soundOn || !('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.8;u.pitch=1;window.speechSynthesis.speak(u); } catch (_) { /* speech is optional */ }
  };
  function clearDialogue(){choiceRow.innerHTML='';nextButton.classList.add('hidden');learningStrip.classList.add('hidden');romanHint.classList.add('hidden');}
  function say(name,text,opts={}){
    clearDialogue();speaker.textContent=name;dialogueText.textContent=text;
    if(opts.word){learningStrip.classList.remove('hidden');if(opts.reveal)romanHint.classList.remove('hidden');}
    if(opts.next){nextButton.classList.remove('hidden');nextButton.onclick=opts.next;}
    if(opts.choices)opts.choices.forEach(c=>{const b=document.createElement('button');b.className='dialogue-choice';b.textContent=c.label;b.addEventListener('click',()=>c.action(b));choiceRow.append(b)});
  }
  function showActions(data,fn){
    quickActions.innerHTML='';hotspotLayer.innerHTML='';
    Object.entries(data).forEach(([id,item])=>{
      const hot=document.createElement('button');hot.className='hotspot';hot.style.left=`${item.x}%`;hot.style.top=`${item.y}%`;hot.setAttribute('aria-label',item.label);hot.title=item.label;hot.addEventListener('click',()=>fn(id));hotspotLayer.append(hot);
      const action=document.createElement('button');action.className='action';action.textContent=item.label;action.addEventListener('click',()=>fn(id));quickActions.append(action);
    });
  }
  const mark=(id)=>{
    state.seen.add(id);
    [...hotspotLayer.children].forEach((x,i)=>{if(Object.keys(state.scene==='shore'?beach:house)[i]===id)x.classList.add('visited')});
    [...quickActions.children].forEach((x,i)=>{if(Object.keys(state.scene==='shore'?beach:house)[i]===id)x.classList.add('acquired')});
  };
  function start(){state.scene='shore';state.phase='shore-intro';state.seen=new Set();state.wordLearned=false;state.mistakes=0;state.waterSelected=false;setScreen('storyScreen');showShore();}
  function showShore(){
    state.scene='shore';state.phase='shore-free';state.seen=new Set();
    art.style.backgroundImage="url('assets/shore-scene.webp')";
    chapterLabel.textContent='CHAPTER I';placeLabel.textContent='THE UNFAMILIAR SHORE';
    showActions(beach,inspectShore);
    say('THE TRAVELER','Salt water stings your eyes. Your ship is broken upon the rocks. Through the surf, a figure approaches from the village. You have no notion where you are.');
  }
  function inspectShore(id){
    mark(id);const p=beach[id];
    if(id==='fisherman'){
      state.phase='shore-rescue';
      quickActions.innerHTML='';hotspotLayer.innerHTML='';
      say('THE FISHERMAN','He speaks, but you understand none of it. He glances at your injured shoulder, then offers his arm.',{choices:[{label:'Accept his help',action:()=>{
        say('THE TRAVELER','You take his hand. He leads you slowly from the shore toward the houses beyond the rocks.',{next:showHouse});
      }}]});
    }else{
      say(p.name,p.text,{choices:[{label:'Speak with the fisherman',action:()=>inspectShore('fisherman')}]});
    }
  }
  function showHouse(){
    state.scene='house';state.phase='house-free';state.seen=new Set();
    art.style.backgroundImage="url('assets/hearth-scene.webp')";
    chapterLabel.textContent='CHAPTER I';placeLabel.textContent='THE FISHERMAN’S HOUSE';
    showActions(house,inspectHouse);
    say('THE TRAVELER','A low roof, the warmth of a hearth, the smell of rice and fish. A family has given you shelter, though you cannot speak to them.');
  }
  function inspectHouse(id){
    mark(id);const p=house[id];
    if(state.wordLearned){say(p.name,p.text,{choices:[{label:'Continue',action:showWordRecall}]});return;}
    if(id==='jar'){
      state.waterSelected=true;state.wordLearned=true;state.phase='house-word';
      quickActions.innerHTML='';hotspotLayer.innerHTML='';
      say('THE FISHERMAN','He nods. “みず.” He offers you the vessel. The word belongs to this thing you needed before you knew how to ask for it.',{word:true,reveal:true,next:showWordRecall});
      speak('みず');
    }else{
      say(p.name,p.text,{choices:[{label:'Look for water',action:()=>inspectHouse('jar')}]});
    }
  }
  function showWordRecall(){
    state.phase='house-recall';hotspotLayer.innerHTML='';quickActions.innerHTML='';
    say('A MOMENT LATER','You look toward the water once more. Which of these is the word you just heard?',{
      choices:[
        {label:'みち',action:()=>wrongWord('みち','That was not the word the fisherman used.')},
        {label:'みず',action:correctWord},
        {label:'みせ',action:()=>wrongWord('みせ','Look again at the word you heard beside the water vessel.')}
      ]
    });
  }
  function wrongWord(word,message){state.mistakes++;say('TRY AGAIN',message,{word:true,choices:[{label:'Try the words again',action:showWordRecall},{label:'Hear it again',action:()=>{speak('みず');showWordRecall();}}]});}
  function correctWord(){
    state.phase='house-done';
    say('THE TRAVELER','みず. You remember. The fisherman smiles, recognizing that you have understood something for yourself.',{word:true,reveal:true,next:showEnding});
    speak('みず');
  }
  function showEnding(){state.scene='ending';state.phase='complete';setScreen('endingScreen');}
  function showDialog(kind){
    modalTitle.textContent=kind==='journal'?'Field Journal':'Historical Inspiration';
    modalContent.innerHTML=kind==='journal'?pages.journal():pages.history;
    if(typeof modal.showModal==='function')modal.showModal();
  }
  $('#startButton').addEventListener('click',start);
  $('#replayButton').addEventListener('click',start);
  $('#toTitle').addEventListener('click',()=>{state.scene='title';setScreen('titleScreen')});
  $('#historyButton').addEventListener('click',()=>showDialog('history'));
  $('#journalButton').addEventListener('click',()=>showDialog('journal'));
  $('#closeInfo').addEventListener('click',()=>modal.close());
  $('#soundButton').addEventListener('click',(e)=>{soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',String(soundOn));e.currentTarget.innerHTML=`Sound <span class="top-icon">${soundOn?'♫':'×'}</span>`;if(!soundOn&&'speechSynthesis' in window)window.speechSynthesis.cancel();});
  $('#voiceBtn').addEventListener('click',()=>speak('みず'));
  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&modal.open)modal.close();
    if(event.key==='Enter'&&!modal.open&&!nextButton.classList.contains('hidden')&&!['BUTTON','A'].includes(document.activeElement.tagName)){event.preventDefault();nextButton.click();}
  });
})();