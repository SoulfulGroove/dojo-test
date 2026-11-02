/* Contextual command suggestions for the lab. The adventure rules remain authoritative. */
(function (root) {
  'use strict';
  const engine = (typeof module !== 'undefined' && module.exports)
    ? require('./engine.js') : root.DojoEngine;

  function labelFor(command, state) {
    const { verb, target, item } = command;
    if (verb === 'take') return 'Take cup';
    if (verb === 'talk') return 'Talk';
    if (verb === 'look') return 'Inspect';
    if (verb === 'give' && item === 'cup') return 'Offer cup';
    if (verb === 'use' && item === 'cup' && target === 'well') return 'Fill with water';
    if (verb === 'use' && item === 'cup' && target === 'kettle') return 'Fill with tea';
    if (verb === 'use' && target === 'gate') return state.world.gateOpen ? 'Enter village' : 'Try gate';
    return verb.charAt(0).toUpperCase() + verb.slice(1);
  }

  function rank(command, state) {
    const { verb, target } = command;
    if (target === 'cup') return verb === 'take' ? 0 : 1;
    if (target === 'villager') {
      // Do not offer an empty cup by default. A filled cup is a deliberate offering.
      const readyToOffer = state.world.hasCup && state.world.cupContents !== 'empty' && !state.world.villagerHelped;
      return verb === (readyToOffer ? 'give' : 'talk') ? 0 :
        verb === (readyToOffer ? 'talk' : 'look') ? 1 : 2;
    }
    if (target === 'well' || target === 'kettle') return verb === 'use' ? 0 : 1;
    if (target === 'gate') return verb === 'use' ? 0 : 1;
    return verb === 'look' ? 0 : 1;
  }

  function forTarget(game, state, target) {
    // Rules describe logical eligibility; the scene also controls physical presence.
    if (target === 'cup' && (state.world.hasCup || state.world.villagerHelped)) return [];
    const matches = new Map();
    for (const rule of game.rules) {
      if (rule.target !== target || !engine.evalCondition(rule.when, state.world)) continue;
      const command = { verb: rule.verb, target: rule.target };
      if (rule.item) command.item = rule.item;
      const key = [command.verb, command.item || '', command.target].join('|');
      if (!matches.has(key)) matches.set(key, { command, label: labelFor(command, state) });
    }
    return [...matches.values()].sort((a, b) => rank(a.command, state) - rank(b.command, state));
  }

  const api = { forTarget };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') root.DojoContextActions = api;
})(typeof window !== 'undefined' ? window : {});
