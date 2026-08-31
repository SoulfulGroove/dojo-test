const runBtn = document.getElementById('runBtn');
const paragraphSelect = document.getElementById('paragraphSelect');
const statusEl = document.getElementById('status');
const summary = document.getElementById('summary');
const detail = document.getElementById('detail');
const timeline = document.getElementById('timeline');

let analysis = null;
let corpus = null;

function isHiragana(ch) {
  const cp = ch.codePointAt(0);
  return cp >= 0x3040 && cp <= 0x309f;
}
function isKatakana(ch) {
  const cp = ch.codePointAt(0);
  return (cp >= 0x30a0 && cp <= 0x30ff) || (cp >= 0x31f0 && cp <= 0x31ff) || (cp >= 0xff66 && cp <= 0xff9d);
}
function isKanji(ch) {
  const cp = ch.codePointAt(0);
  return (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0x20000 && cp <= 0x2ebef) ||
    (cp >= 0x30000 && cp <= 0x323af);
}
function classify(ch) {
  if (isHiragana(ch)) return 'hiragana';
  if (isKatakana(ch)) return 'katakana';
  if (isKanji(ch)) return 'kanji';
  return null;
}
function uniqueInOrder(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}
function analyzeCorpus(corpusData) {
  const paragraphs = corpusData.paragraphs || [];
  const scripts = ['hiragana', 'katakana', 'kanji'];
  const seen = Object.fromEntries(scripts.map(s => [s, new Set()]));
  const globalCounts = Object.fromEntries(scripts.map(s => [s, new Map()]));
  const paragraphSets = Object.fromEntries(scripts.map(s => [s, new Map()]));
  const firstSeen = Object.fromEntries(scripts.map(s => [s, new Map()]));
  const features = [];

  for (const p of paragraphs) {
    const charsByScript = Object.fromEntries(scripts.map(s => [s, []]));
    for (const ch of p.text) {
      const script = classify(ch);
      if (script) charsByScript[script].push(ch);
    }

    const pf = { paragraph: p, scripts: {} };
    for (const script of scripts) {
      const chars = charsByScript[script];
      const unique = uniqueInOrder(chars);
      const newlySeen = unique.filter(ch => !seen[script].has(ch));
      const review = unique.filter(ch => seen[script].has(ch));

      for (const ch of chars) {
        globalCounts[script].set(ch, (globalCounts[script].get(ch) || 0) + 1);
        if (!paragraphSets[script].has(ch)) paragraphSets[script].set(ch, new Set());
        paragraphSets[script].get(ch).add(p.paragraph_id);
        if (!firstSeen[script].has(ch)) {
          firstSeen[script].set(ch, {
            paragraph_id: p.paragraph_id,
            paragraph_index: p.paragraph_index,
            scroll_id: p.scroll_id,
            section_id: p.section_id
          });
        }
      }
      unique.forEach(ch => seen[script].add(ch));
      pf.scripts[script] = {
        totalCount: chars.length,
        unique,
        new: newlySeen,
        review,
        cumulativeUniqueCount: seen[script].size
      };
    }
    features.push(pf);
  }

  return {
    features,
    totals: Object.fromEntries(scripts.map(script => [script, {
      unique: globalCounts[script].size,
      occurrences: [...globalCounts[script].values()].reduce((a, b) => a + b, 0)
    }]))
  };
}

function chipList(el, chars, markNew = false) {
  el.innerHTML = '';
  if (!chars.length) {
    el.innerHTML = '<span class="note">None</span>';
    return;
  }
  for (const ch of chars) {
    const span = document.createElement('span');
    span.className = 'chip' + (markNew ? ' new' : '');
    span.textContent = ch;
    el.appendChild(span);
  }
}

function metricCard(label, value) {
  return `<div class="card"><div class="label">${label}</div><div class="metric">${value}</div></div>`;
}

function renderSummary() {
  const c = document.getElementById('summaryCards');
  c.innerHTML = [
    metricCard('Paragraphs', analysis.features.length),
    metricCard('Unique hiragana', analysis.totals.hiragana.unique),
    metricCard('Unique katakana', analysis.totals.katakana.unique),
    metricCard('Unique kanji', analysis.totals.kanji.unique),
    metricCard('Kanji occurrences', analysis.totals.kanji.occurrences)
  ].join('');
  summary.hidden = false;
}

function renderParagraph(index) {
  const f = analysis.features[index];
  const p = f.paragraph;
  document.getElementById('paragraphHeading').textContent = `${p.paragraph_id} · ${p.section_title}`;
  document.getElementById('paragraphText').textContent = p.text.replaceAll('`', '');
  document.getElementById('paragraphCards').innerHTML = [
    metricCard('New hiragana', f.scripts.hiragana.new.length),
    metricCard('New katakana', f.scripts.katakana.new.length),
    metricCard('New kanji', f.scripts.kanji.new.length),
    metricCard('Cumulative kanji', f.scripts.kanji.cumulativeUniqueCount)
  ].join('');
  chipList(document.getElementById('newHiragana'), f.scripts.hiragana.new, true);
  chipList(document.getElementById('newKatakana'), f.scripts.katakana.new, true);
  chipList(document.getElementById('newKanji'), f.scripts.kanji.new, true);
  chipList(document.getElementById('allHiragana'), f.scripts.hiragana.unique);
  chipList(document.getElementById('allKatakana'), f.scripts.katakana.unique);
  chipList(document.getElementById('allKanji'), f.scripts.kanji.unique);
  detail.hidden = false;
}

function renderTimeline() {
  const tbody = document.getElementById('timelineBody');
  tbody.innerHTML = '';
  for (const [idx, f] of analysis.features.entries()) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><button data-idx="${idx}" style="padding:4px 8px">${f.paragraph.paragraph_id}</button></td>
      <td>${f.scripts.hiragana.new.length}</td>
      <td>${f.scripts.katakana.new.length}</td>
      <td>${f.scripts.kanji.new.length}</td>
      <td>${f.scripts.hiragana.cumulativeUniqueCount}</td>
      <td>${f.scripts.kanji.cumulativeUniqueCount}</td>`;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll('button[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      paragraphSelect.value = String(idx);
      renderParagraph(idx);
      window.scrollTo({ top: detail.offsetTop - 10, behavior: 'smooth' });
    });
  });
  timeline.hidden = false;
}

function populateParagraphSelect() {
  paragraphSelect.innerHTML = '';
  analysis.features.forEach((f, idx) => {
    const option = document.createElement('option');
    option.value = String(idx);
    option.textContent = `${f.paragraph.paragraph_id} — ${f.paragraph.section_title}`;
    paragraphSelect.appendChild(option);
  });
  paragraphSelect.disabled = false;
}

async function runAnalysis() {
  runBtn.disabled = true;
  statusEl.textContent = 'Loading corpus and analyzing P000–P167…';
  try {
    const response = await fetch('data/corpus.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load corpus.json (${response.status})`);
    corpus = await response.json();
    analysis = analyzeCorpus(corpus);
    populateParagraphSelect();
    renderSummary();
    renderParagraph(0);
    renderTimeline();
    statusEl.textContent = `Analysis complete. ${analysis.features.length} paragraphs processed entirely in this browser.`;
    runBtn.textContent = 'Run Again';
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Analysis failed: ${err.message}`;
  } finally {
    runBtn.disabled = false;
  }
}

runBtn.addEventListener('click', runAnalysis);
paragraphSelect.addEventListener('change', () => renderParagraph(Number(paragraphSelect.value)));
