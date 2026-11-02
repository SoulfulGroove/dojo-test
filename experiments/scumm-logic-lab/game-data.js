/* Original learning scenario; Japanese lines are constructed, not Musashi quotations. */
const DOJO_GAME = {
  id: 'water-request-lab',
  room: {
    id: 'courtyard',
    title: 'The village courtyard',
    objects: {
      villager: { name: 'Villager', kind: 'actor' },
      cup: { name: 'Empty cup', kind: 'prop' },
      well: { name: 'Well', kind: 'prop' },
      kettle: { name: 'Tea kettle', kind: 'prop' },
      sign: { name: 'Well sign', kind: 'hotspot' },
      gate: { name: 'Village gate', kind: 'exit' }
    }
  },
  rules: [
    { id: 'villager-gratitude', verb: 'talk', target: 'villager',
      when: { eq: ['villagerHelped', true] },
      do: [{ say: 'The villager smiles. 「ありがとう。」 The gate is open now.' }] },
    { id: 'villager-request', verb: 'talk', target: 'villager',
      when: { eq: ['villagerHelped', false] },
      do: [{ say: 'She points toward the well and says, 「みずを ください。」' }] },
    { id: 'look-cup', verb: 'look', target: 'cup',
      do: [{ say: 'A small wooden cup. It can hold something.' }] },
    { id: 'look-well', verb: 'look', target: 'well',
      do: [{ say: 'A well with clear water. Its rope reaches a bucket below.' }] },
    { id: 'look-kettle', verb: 'look', target: 'kettle',
      do: [{ say: 'A kettle of warm tea sits near the hearth.' }] },
    { id: 'look-sign', verb: 'look', target: 'sign',
      do: [{ say: 'The wooden sign reads 「井戸」(いど). A small drawing shows a well.' }] },
    { id: 'look-villager', verb: 'look', target: 'villager',
      do: [{ say: 'The villager looks tired. She glances toward the well.' }] },
    { id: 'look-gate', verb: 'look', target: 'gate',
      do: [{ say: 'A fallen beam blocks the way into the village.' }] },
    { id: 'take-cup', verb: 'take', target: 'cup',
      when: { eq: ['hasCup', false] },
      do: [{ set: ['hasCup', true] }, { say: 'You take the cup. It appears in your inventory.' }] },
    { id: 'fill-with-water', verb: 'use', item: 'cup', target: 'well',
      when: { eq: ['hasCup', true] },
      do: [{ set: ['cupContents', 'water'] }, { say: 'You fill the cup with fresh water from the well.' }] },
    { id: 'fill-with-tea', verb: 'use', item: 'cup', target: 'kettle',
      when: { eq: ['hasCup', true] },
      do: [{ set: ['cupContents', 'tea'] }, { say: 'You fill the cup with tea. Is that what she requested?' }] },
    { id: 'give-water', verb: 'give', item: 'cup', target: 'villager',
      when: { all: [
        { eq: ['hasCup', true] },
        { eq: ['cupContents', 'water'] },
        { eq: ['villagerHelped', false] }
      ] },
      do: [
        { offer: 'water' },
        { set: ['villagerHelped', true] },
        { set: ['gateOpen', true] },
        { set: ['hasCup', false] },
        { set: ['cupContents', 'empty'] },
        { say: 'She drinks and smiles: 「ありがとう！」 She moves the fallen beam and opens the gate.' }
      ] },
    { id: 'give-tea-not-water', verb: 'give', item: 'cup', target: 'villager',
      when: { all: [
        { eq: ['hasCup', true] },
        { eq: ['cupContents', 'tea'] },
        { eq: ['villagerHelped', false] }
      ] },
      do: [{ offer: 'tea' }, { say: 'She gently shakes her head: 「みず…」 You can try again.' }] },
    { id: 'give-empty-cup', verb: 'give', item: 'cup', target: 'villager',
      when: { all: [
        { eq: ['hasCup', true] },
        { eq: ['cupContents', 'empty'] },
        { eq: ['villagerHelped', false] }
      ] },
      do: [{ offer: 'empty' }, { say: 'She looks in the empty cup: 「みず…」' }] },
    { id: 'open-gate', verb: 'use', target: 'gate',
      when: { eq: ['gateOpen', true] },
      do: [{ say: 'You step through the gate. The village awaits in the next chapter.' }] },
    { id: 'gate-blocked', verb: 'use', target: 'gate',
      when: { eq: ['gateOpen', false] },
      do: [{ say: 'A fallen beam blocks the way. Someone nearby might help.' }] }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = DOJO_GAME;
if (typeof window !== 'undefined') window.DOJO_GAME = DOJO_GAME;
