const assert = require('node:assert/strict');
const e = require('./engine.js');
const game = require('./game-data.js');
const context = require('./context-actions.js');
const primary = (state, target) => context.forTarget(game, state, target)[0];
const tap = (state, target) => e.interpret(game, state, primary(state, target).command).state;

let s = e.freshState();
assert.deepEqual(primary(s, 'cup').command, { verb: 'take', target: 'cup' });
assert.deepEqual(primary(s, 'well').command, { verb: 'look', target: 'well' });
assert.deepEqual(primary(s, 'villager').command, { verb: 'talk', target: 'villager' });
assert.deepEqual(primary(s, 'gate').command, { verb: 'use', target: 'gate' });
assert.equal(context.forTarget(game, s, 'cup').length, 2);

s = tap(s, 'cup');
assert.equal(s.world.hasCup, true);
assert.deepEqual(primary(s, 'well').command, { verb: 'use', target: 'well', item: 'cup' });
assert.deepEqual(primary(s, 'villager').command, { verb: 'talk', target: 'villager' }, 'An empty cup is not automatically offered');
assert.ok(context.forTarget(game, s, 'villager').some(a => a.command.verb === 'give'), 'Offering an empty cup remains possible deliberately');
s = tap(s, 'well');
assert.equal(s.world.cupContents, 'water');
assert.deepEqual(primary(s, 'villager').command, { verb: 'give', target: 'villager', item: 'cup' });
s = tap(s, 'villager');
assert.equal(s.world.gateOpen, true);
assert.equal(s.evidence.independentlyCompleted, true);
assert.deepEqual(primary(s, 'villager').command, { verb: 'talk', target: 'villager' });
assert.equal(context.forTarget(game, s, 'cup').length, 0, 'A delivered cup must not reappear as a tappable object');

let wrong=e.freshState();
wrong=tap(wrong,'cup');
wrong=tap(wrong,'kettle');
wrong=tap(wrong,'villager');
assert.equal(wrong.world.gateOpen,false);
assert.equal(wrong.evidence.firstOffer,'tea');
wrong=tap(wrong,'well');
wrong=tap(wrong,'villager');
assert.equal(wrong.world.gateOpen,true);
assert.equal(wrong.evidence.independentlyCompleted,false);

console.log('PASS: context taps, alternate actions, no unwanted empty offering, tea retry, and original learning evidence');
