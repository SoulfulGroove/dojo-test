const assert = require('node:assert/strict');
const game = require('./game-data.js');
const e = require('./engine.js');

function act(state,verb,target,item) {
  return e.interpret(game,state,{verb,target,...(item?{item}:{})});
}
let s=e.freshState();
assert.equal(s.world.hasCup,false);
assert.equal(act(s,'give','villager','cup').event.matchedRule,'fallback');
assert.equal(s.log.length,0,'The interpreter must not mutate its input');

s=act(s,'take','cup').state;
assert.equal(s.world.hasCup,true);
assert.equal(act(s,'take','cup').event.matchedRule,'fallback');
s=act(s,'use','kettle','cup').state;
assert.equal(s.world.cupContents,'tea');
s=act(s,'give','villager','cup').state;
assert.equal(s.world.gateOpen,false);
assert.equal(s.evidence.firstOffer,'tea');
assert.equal(s.evidence.attemptsToOffer,1);
s=act(s,'use','well','cup').state;
assert.equal(s.world.cupContents,'water');
assert.equal(e.explainWaterGate(s.world).canGiveWater,true);
s=act(s,'give','villager','cup').state;
assert.equal(s.world.villagerHelped,true);
assert.equal(s.world.gateOpen,true);
assert.equal(s.world.hasCup,false);
assert.equal(s.evidence.independentlyCompleted,false);
assert.equal(e.explainWaterGate(s.world).canGiveWater,false,
  'A guard need not remain true after its own state-changing action');
assert.equal(act(s,'use','gate').event.matchedRule,'open-gate');

let independent=e.freshState();
independent=act(independent,'take','cup').state;
independent=act(independent,'use','well','cup').state;
independent=act(independent,'give','villager','cup').state;
assert.equal(independent.evidence.independentlyCompleted,true);
let assisted=e.takeHint(e.freshState()).state;
assisted=act(assisted,'take','cup').state;
assisted=act(assisted,'use','well','cup').state;
assisted=act(assisted,'give','villager','cup').state;
assert.equal(assisted.evidence.independentlyCompleted,false);
assert.equal(e.evalCondition({all:[
  {eq:['gateOpen',true]},
  {not:{eq:['hasCup',true]}}
]},independent.world),true);
assert.equal(e.evalCondition({any:[
  {eq:['gateOpen',false]},
  {eq:['villagerHelped',true]}
]},independent.world),true);

// Truth-table verification for action guard C AND W AND NOT H.
for(const C of [false,true])for(const W of [false,true])for(const H of [false,true]){
  const world={hasCup:C,cupContents:W?'water':'empty',villagerHelped:H};
  const expected=C&&W&&!H;
  const guard={all:[{eq:['hasCup',true]},{eq:['cupContents','water']},{not:{eq:['villagerHelped',true]}}]};
  assert.equal(e.evalCondition(guard,world),expected);
  assert.equal(e.explainWaterGate(world).canGiveWater,expected);
}

// A standalone, tiny constraint-enumeration check for the same four
// clue premises demonstrated by the browser deduction board.
const people=['Aki','Hana','Ren'];
const locs=['Well','Gate','Shrine'];
const objects=['Book','Lantern','Cup'];
const perms=xs=>xs.length===1?[xs]:xs.flatMap((x,i)=>perms(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest]));
let satisfying=[];
for(const locations of perms(locs))for(const items of perms(objects)){
  const a=Object.fromEntries(people.map((p,i)=>[p,{location:locations[i],object:items[i]}]));
  const clues=[
    a.Hana.location==='Shrine',
    people.some(p=>a[p].location==='Well'&&a[p].object==='Book'),
    people.some(p=>a[p].location==='Gate'&&a[p].object==='Lantern'),
    a.Aki.object!=='Lantern'
  ];
  if(clues.every(Boolean))satisfying.push(a);
}
assert.equal(satisfying.length,1,'The four clues must yield a unique solution');
assert.deepEqual(satisfying[0],{
  Aki:{location:'Well',object:'Book'},
  Hana:{location:'Shrine',object:'Cup'},
  Ren:{location:'Gate',object:'Lantern'}
});
console.log('PASS: adventure transitions, retry, evidence, truth table (8 states), and unique zebra solution');
