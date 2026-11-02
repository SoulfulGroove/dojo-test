/* Minimal adventure rule interpreter; not LucasArts SCUMM code. */
function freshState() {
  return {
    world: { hasCup: false, cupContents: 'empty', villagerHelped: false, gateOpen: false },
    evidence: { hintsUsed: 0, attemptsToOffer: 0, firstOffer: null, independentlyCompleted: false },
    log: []
  };
}
function evalCondition(cond, world) {
  if (!cond) return true;
  if (Object.prototype.hasOwnProperty.call(cond, 'eq')) return world[cond.eq[0]] === cond.eq[1];
  if (Array.isArray(cond.all)) return cond.all.every(c => evalCondition(c, world));
  if (Array.isArray(cond.any)) return cond.any.some(c => evalCondition(c, world));
  if (cond.not) return !evalCondition(cond.not, world);
  throw new Error('Unknown condition: ' + JSON.stringify(cond));
}
function matchesSignature(rule, cmd) {
  return rule.verb === cmd.verb && rule.target === cmd.target &&
    (rule.item || null) === (cmd.item || null);
}
function interpret(game, currentState, cmd) {
  const next = JSON.parse(JSON.stringify(currentState));
  const candidates = game.rules.filter(r => matchesSignature(r, cmd));
  const rule = candidates.find(r => evalCondition(r.when, next.world));
  const event = { command: cmd, matchedRule: rule ? rule.id : 'fallback', unmetConditions: [], effects: [] };
  let message = 'Nothing useful happens. Look more closely or try a different action.';
  if (!rule) {
    event.unmetConditions = candidates.map(r => ({ rule: r.id, requires: r.when }));
    if (cmd.verb === 'take' && cmd.target === 'cup' && next.world.hasCup) message = 'You already have the cup.';
    if ((cmd.verb === 'use' || cmd.verb === 'give') && cmd.item === 'cup' && !next.world.hasCup)
      message = 'You need to pick up the cup first.';
  } else {
    for (const effect of rule.do) {
      if (effect.set) {
        next.world[effect.set[0]] = effect.set[1];
        event.effects.push({ set: effect.set });
      }
      if (effect.offer) {
        next.evidence.attemptsToOffer += 1;
        if (next.evidence.firstOffer === null) next.evidence.firstOffer = effect.offer;
        event.effects.push({ offer: effect.offer });
      }
      if (effect.say) message = effect.say;
    }
    if (rule.id === 'give-water') {
      next.evidence.independentlyCompleted = next.evidence.hintsUsed === 0 &&
        next.evidence.firstOffer === 'water' && next.evidence.attemptsToOffer === 1;
    }
  }
  next.log.unshift(event);
  if (next.log.length > 30) next.log.pop();
  return { state: next, message, event };
}
function takeHint(currentState) {
  const state = JSON.parse(JSON.stringify(currentState));
  state.evidence.hintsUsed++;
  const message = state.evidence.hintsUsed === 1
    ? 'Context hint: 「みず」 (水) means water. 「ください」 is a polite request.'
    : 'Action hint: Take the cup, use it with the well, then give it to the villager.';
  state.log.unshift({ command: { verb: 'hint' }, matchedRule: 'help-system', effects: [{ hint: state.evidence.hintsUsed }] });
  return { state, message };
}
function explainWaterGate(world) {
  const tests = [
    { id: 'hasCup', label: 'Cup is in inventory', ok: world.hasCup === true },
    { id: 'cupContents', label: 'Cup contains water', ok: world.cupContents === 'water' },
    { id: 'villagerHelped', label: 'Villager has not yet been helped', ok: world.villagerHelped === false }
  ];
  return { expression: 'C AND W AND NOT H', conditions: tests, canGiveWater: tests.every(x => x.ok) };
}
const API = { freshState, evalCondition, matchesSignature, interpret, takeHint, explainWaterGate };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.DojoEngine = API;
