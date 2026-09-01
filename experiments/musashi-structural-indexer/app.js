const SECTION = "0000";

const PARAGRAPHS = [
  {
    id: "P000",
    text: "`兵法の道 `二天一流 `と号し数年鍛錬の事初て書物に書き顕はさんと思ふ"
  },
  {
    id: "P001",
    text: "`時に寛永二十年十月上旬の頃九州肥後の地巌殿山に上り天を拝し観音を礼し仏前に向ひ生国播磨の武士新免武蔵藤原玄信年つもりて六十 `我若年のむかしより兵法の道に心をかけ十三歳にして初て勝負を為す `その相手新当流の有馬喜兵衛といふ `兵法者に打勝ち十六歳にして但馬国秋山といふ強力の兵法者に打ち勝ち二十一歳にして都に上り天下の兵法者に逢ひて数度の勝負を決すといへども勝利を得ずといふことなし `その後国々所々に至り諸流の兵法者に行逢ひ六十余度まで勝負すといへども一度もその利を失はず `その程年十三より二十八九までのことなり"
  },
  {
    id: "P002",
    text: "`三十を越えて跡をおもひ見るに兵法至極して勝つにはあらず `おのづから道の器用ありて天理を離れざるが故か `又は他流の兵法不足なる所にや `その後猶も深き道理を得んと朝鍛夕錬して見ればおのづから兵法の道にあふこと我五十歳のころなり `それより以来は尋ね入るべき道なくして光陰をおくる"
  },
  {
    id: "P003",
    text: "`兵法の利にまかせて諸芸諸能の道となせば万事に於て我に師匠なし `今この書を作るといへども仏法儒道の古語をもからず軍記軍法の古きことをも用ゐずこの一流の見立実の心をあらはすこと天道と観世音とを鏡として十月十日の夜寅の一点に筆を把りて書き初るものなり"
  }
];

const SCRIPT_TESTS = [
  ["hiragana", /\p{Script=Hiragana}/u],
  ["katakana", /\p{Script=Katakana}/u],
  ["kanji", /\p{Script=Han}/u]
];

function classify(char) {
  for (const [script, rx] of SCRIPT_TESTS) {
    if (rx.test(char)) return script;
  }
  return null;
}

function buildIndex() {
  const counters = { hiragana: 0, katakana: 0, kanji: 0 };
  let globalCharacter = 0;
  const records = [];

  for (const paragraph of PARAGRAPHS) {
    let paragraphCharacter = 0;
    for (const character of [...paragraph.text]) {
      const script = classify(character);
      if (!script) continue;

      globalCharacter += 1;
      paragraphCharacter += 1;
      counters[script] += 1;

      records.push({
        section: SECTION,
        paragraph: paragraph.id,
        global_character: globalCharacter,
        paragraph_character: paragraphCharacter,
        script,
        script_sequence: counters[script],
        character
      });
    }
  }

  return { records, counters, globalCharacter };
}

const INDEX = buildIndex();
let activeFilter = "all";
let activeParagraph = PARAGRAPHS[0].id;

const paragraphSelect = document.getElementById("paragraphSelect");
const rows = document.getElementById("rows");
const sourceText = document.getElementById("sourceText");
const sourceLabel = document.getElementById("sourceLabel");
const stats = document.getElementById("stats");

for (const p of PARAGRAPHS) {
  const option = document.createElement("option");
  option.value = p.id;
  option.textContent = p.id;
  paragraphSelect.appendChild(option);
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
    <div class="stat"><span>Pilot global chars</span><strong>${INDEX.globalCharacter}</strong></div>
  `;
}

function render() {
  const paragraph = PARAGRAPHS.find(p => p.id === activeParagraph);
  sourceLabel.textContent = `${SECTION} · ${activeParagraph}`;
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

document.getElementById("exportJson").addEventListener("click", () => {
  const payload = {
    format: "musashi-structural-index-pilot-v0.1",
    section: SECTION,
    paragraphs: PARAGRAPHS.map(p => p.id),
    indexing_rules: {
      included: ["hiragana", "katakana", "kanji"],
      excluded: ["punctuation", "spaces", "backticks", "labels", "other symbols"],
      paragraph_character_resets_each_paragraph: true,
      global_character_continues_across_paragraphs: true,
      script_sequence_continues_across_paragraphs: true
    },
    totals: {
      characters: INDEX.globalCharacter,
      hiragana: INDEX.counters.hiragana,
      katakana: INDEX.counters.katakana,
      kanji: INDEX.counters.kanji
    },
    records: INDEX.records
  };
  download("musashi-structural-index-0000-pilot.json", "application/json;charset=utf-8", JSON.stringify(payload, null, 2));
});

document.getElementById("exportCsv").addEventListener("click", () => {
  const headers = ["section","paragraph","global_character","paragraph_character","script","script_sequence","character"];
  const lines = [headers.join(",")];
  for (const record of INDEX.records) {
    lines.push(headers.map(h => csvCell(record[h])).join(","));
  }
  download("musashi-structural-index-0000-pilot.csv", "text/csv;charset=utf-8", "\uFEFF" + lines.join("\n"));
});

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

render();
