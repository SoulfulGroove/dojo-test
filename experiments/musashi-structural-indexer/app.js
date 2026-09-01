const CORPUS_URL = "../musashi-reader/data/corpus.json";
const SCRIPTS = ["hiragana", "katakana", "kanji"];

function classify(ch) {
  const cp = ch.codePointAt(0);
  if (cp >= 0x3040 && cp <= 0x309f) return "hiragana";
  if ((cp >= 0x30a0 && cp <= 0x30ff) || (cp >= 0x31f0 && cp <= 0x31ff) || (cp >= 0xff66 && cp <= 0xff9d)) return "katakana";
  if ((cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x20000 && cp <= 0x2ebef) || (cp >= 0x30000 && cp <= 0x323af)) return "kanji";
  return null;
}

function buildIndex(corpus) {
  const counters = Object.fromEntries(SCRIPTS.map(s => [s, 0]));
  let globalCharacter = 0;
  const records = [];
  const paragraphs = corpus.paragraphs || [];

  for (const paragraph of paragraphs) {
    let paragraphCharacter = 0;
    for (const character of paragraph.text || "") {
      const script = classify(character);
      if (!script) continue;

      globalCharacter += 1;
      paragraphCharacter += 1;
      counters[script] += 1;

      records.push({
        section: paragraph.section_id,
        paragraph: paragraph.paragraph_id,
        global_character: globalCharacter,
        paragraph_character: paragraphCharacter,
        script,
        script_sequence: counters[script],
        character
      });
    }
  }

  return { records, counters, globalCharacter, paragraphs };
}

let CORPUS = null;
let INDEX = null;
let activeFilter = "all";
let activeParagraph = null;

const paragraphSelect = document.getElementById("paragraphSelect");
const rows = document.getElementById("rows");
const sourceText = document.getElementById("sourceText");
const sourceLabel = document.getElementById("sourceLabel");
const stats = document.getElementById("stats");
const statusEl = document.getElementById("status");
const exportJson = document.getElementById("exportJson");
const exportCsv = document.getElementById("exportCsv");

async function init() {
  try {
    const response = await fetch(CORPUS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load corpus.json (${response.status})`);
    CORPUS = await response.json();
    INDEX = buildIndex(CORPUS);
    if (!INDEX.paragraphs.length) throw new Error("Corpus contains no paragraphs");

    activeParagraph = INDEX.paragraphs[0].paragraph_id;
    populateParagraphSelect();
    paragraphSelect.disabled = false;
    exportJson.disabled = false;
    exportCsv.disabled = false;
    statusEl.textContent = `${INDEX.paragraphs.length} paragraphs indexed`;
    render();
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Load failed: ${err.message}`;
  }
}

function populateParagraphSelect() {
  paragraphSelect.innerHTML = "";
  for (const p of INDEX.paragraphs) {
    const option = document.createElement("option");
    option.value = p.paragraph_id;
    option.textContent = `${p.paragraph_id} — ${p.section_id} — ${p.section_title}`;
    paragraphSelect.appendChild(option);
  }
}

paragraphSelect.addEventListener("change", () => {
  activeParagraph = paragraphSelect.value;
  render();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

function visibleRecords() {
  return INDEX.records.filter(record =>
    record.paragraph === activeParagraph &&
    (activeFilter === "all" || record.script === activeFilter)
  );
}

function renderStats() {
  const para = INDEX.records.filter(r => r.paragraph === activeParagraph);
  const counts = {
    all: para.length,
    hiragana: para.filter(r => r.script === "hiragana").length,
    kanji: para.filter(r => r.script === "kanji").length,
    katakana: para.filter(r => r.script === "katakana").length
  };
  stats.innerHTML = `
    <div class="stat"><span>Paragraph chars</span><strong>${counts.all}</strong></div>
    <div class="stat"><span>Hiragana</span><strong>${counts.hiragana}</strong></div>
    <div class="stat"><span>Kanji</span><strong>${counts.kanji}</strong></div>
    <div class="stat"><span>Katakana</span><strong>${counts.katakana}</strong></div>
    <div class="stat"><span>Corpus chars</span><strong>${INDEX.globalCharacter}</strong></div>
    <div class="stat"><span>Corpus hiragana</span><strong>${INDEX.counters.hiragana}</strong></div>
    <div class="stat"><span>Corpus kanji</span><strong>${INDEX.counters.kanji}</strong></div>
    <div class="stat"><span>Corpus katakana</span><strong>${INDEX.counters.katakana}</strong></div>
  `;
}

function render() {
  if (!INDEX) return;
  const paragraph = INDEX.paragraphs.find(p => p.paragraph_id === activeParagraph);
  sourceLabel.textContent = `${paragraph.section_id} · ${activeParagraph}`;
  sourceText.textContent = paragraph.text;
  renderStats();

  rows.innerHTML = visibleRecords().map(r => `
    <tr>
      <td>${r.global_character}</td>
      <td>${r.section}</td>
      <td>${r.paragraph}</td>
      <td>${r.paragraph_character}</td>
      <td>${capitalize(r.script)}</td>
      <td>${r.script_sequence}</td>
      <td class="char">${escapeHtml(r.character)}</td>
    </tr>
  `).join("");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}

function download(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

exportJson.addEventListener("click", () => {
  const payload = {
    format: "musashi-structural-index-v1.0",
    source: CORPUS.source || null,
    paragraphs: INDEX.paragraphs.map(p => ({
      paragraph_id: p.paragraph_id,
      section_id: p.section_id,
      section_title: p.section_title,
      scroll_id: p.scroll_id,
      scroll_title: p.scroll_title
    })),
    indexing_rules: {
      included: ["hiragana", "katakana", "kanji"],
      excluded: ["punctuation", "spaces", "backticks", "labels", "headings", "other symbols"],
      paragraph_character_resets_each_paragraph: true,
      global_character_continues_across_paragraphs: true,
      script_sequence_continues_across_paragraphs: true
    },
    totals: {
      paragraphs: INDEX.paragraphs.length,
      characters: INDEX.globalCharacter,
      hiragana: INDEX.counters.hiragana,
      katakana: INDEX.counters.katakana,
      kanji: INDEX.counters.kanji
    },
    records: INDEX.records
  };
  download("musashi-structural-index-master.json", "application/json;charset=utf-8", JSON.stringify(payload, null, 2));
});

exportCsv.addEventListener("click", () => {
  const headers = ["section","paragraph","global_character","paragraph_character","script","script_sequence","character"];
  const lines = [headers.join(",")];
  for (const record of INDEX.records) {
    lines.push(headers.map(h => csvCell(record[h])).join(","));
  }
  download("musashi-structural-index-master.csv", "text/csv;charset=utf-8", "\uFEFF" + lines.join("\n"));
});

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

init();
