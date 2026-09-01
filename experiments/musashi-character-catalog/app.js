const CORPUS_URL = "../musashi-reader/data/corpus.json";
const scripts = ["hiragana","katakana","kanji"];
let catalog = [];
let activeFilter = "all";

function isHiragana(ch){const cp=ch.codePointAt(0);return cp>=0x3040&&cp<=0x309f}
function isKatakana(ch){const cp=ch.codePointAt(0);return (cp>=0x30a0&&cp<=0x30ff)||(cp>=0x31f0&&cp<=0x31ff)||(cp>=0xff66&&cp<=0xff9d)}
function isKanji(ch){const cp=ch.codePointAt(0);return (cp>=0x3400&&cp<=0x4dbf)||(cp>=0x4e00&&cp<=0x9fff)||(cp>=0xf900&&cp<=0xfaff)||(cp>=0x20000&&cp<=0x2ebef)||(cp>=0x30000&&cp<=0x323af)}
function classify(ch){if(isHiragana(ch))return "hiragana";if(isKatakana(ch))return "katakana";if(isKanji(ch))return "kanji";return null}

function buildStructuralRecords(corpus){
  const counters={hiragana:0,katakana:0,kanji:0};
  let globalCharacter=0;
  const records=[];
  for(const p of corpus.paragraphs||[]){
    let paragraphCharacter=0;
    for(const character of [...p.text]){
      const script=classify(character); if(!script) continue;
      globalCharacter++; paragraphCharacter++; counters[script]++;
      records.push({section:p.section_id,paragraph:p.paragraph_id,global_character:globalCharacter,paragraph_character:paragraphCharacter,script,script_sequence:counters[script],character});
    }
  }
  return records;
}

function buildCatalog(records){
  const map=new Map();
  const scriptUniqueCounters={hiragana:0,katakana:0,kanji:0};
  let uniqueCounter=0;
  for(const r of records){
    const key=`${r.script}:${r.character}`;
    let item=map.get(key);
    if(!item){
      uniqueCounter++; scriptUniqueCounters[r.script]++;
      const prefix=r.script==="hiragana"?"H":r.script==="katakana"?"T":"K";
      item={
        unique_id:`U${String(uniqueCounter).padStart(3,"0")}`,
        script_id:`${prefix}${String(scriptUniqueCounters[r.script]).padStart(3,"0")}`,
        character:r.character,
        script:r.script,
        first_global_character:r.global_character,
        first_section:r.section,
        first_paragraph:r.paragraph,
        first_paragraph_character:r.paragraph_character,
        occurrence_count:0,
        occurrences:[]
      };
      map.set(key,item);
    }
    item.occurrence_count++;
    item.occurrences.push({section:r.section,paragraph:r.paragraph,global_character:r.global_character,paragraph_character:r.paragraph_character,script_sequence:r.script_sequence});
  }
  return [...map.values()];
}

const rows=document.getElementById("rows"), stats=document.getElementById("stats"), statusEl=document.getElementById("status"), searchEl=document.getElementById("search"), sortEl=document.getElementById("sort"), detail=document.getElementById("detail");

function filteredCatalog(){
  const q=searchEl.value.trim().toLowerCase();
  let items=catalog.filter(x=>(activeFilter==="all"||x.script===activeFilter)&&(!q||x.character.includes(q)||x.unique_id.toLowerCase().includes(q)||x.script_id.toLowerCase().includes(q)));
  if(sortEl.value==="frequency") items.sort((a,b)=>b.occurrence_count-a.occurrence_count||a.first_global_character-b.first_global_character);
  else if(sortEl.value==="character") items.sort((a,b)=>a.character.localeCompare(b.character,"ja"));
  else items.sort((a,b)=>a.first_global_character-b.first_global_character);
  return items;
}

function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function renderStats(){
  const counts=Object.fromEntries(scripts.map(s=>[s,catalog.filter(x=>x.script===s).length]));
  const occ=catalog.reduce((n,x)=>n+x.occurrence_count,0);
  stats.innerHTML=`<div class="stat"><span>Unique characters</span><strong>${catalog.length}</strong></div><div class="stat"><span>Hiragana</span><strong>${counts.hiragana}</strong></div><div class="stat"><span>Kanji</span><strong>${counts.kanji}</strong></div><div class="stat"><span>Katakana</span><strong>${counts.katakana}</strong></div><div class="stat"><span>Mapped occurrences</span><strong>${occ.toLocaleString()}</strong></div>`;
}
function render(){
  const items=filteredCatalog();
  rows.innerHTML=items.map(x=>`<tr data-id="${x.unique_id}"><td>${x.unique_id}</td><td>${x.script_id}</td><td class="char">${x.character}</td><td>${cap(x.script)}</td><td>${x.first_global_character}</td><td>${x.first_section}</td><td>${x.first_paragraph}</td><td>${x.first_paragraph_character}</td><td>${x.occurrence_count}</td></tr>`).join("");
  rows.querySelectorAll("tr[data-id]").forEach(tr=>tr.addEventListener("click",()=>showDetail(tr.dataset.id)));
}
function showDetail(id){
  const x=catalog.find(c=>c.unique_id===id); if(!x)return;
  document.getElementById("detailChar").textContent=x.character;
  document.getElementById("detailMeta").innerHTML=`<strong>${x.unique_id} · ${x.script_id}</strong> · ${cap(x.script)} · first at global ${x.first_global_character}, ${x.first_section} / ${x.first_paragraph} char ${x.first_paragraph_character} · ${x.occurrence_count} total occurrences`;
  document.getElementById("occurrences").innerHTML=x.occurrences.map(o=>`<span class="chip">G${o.global_character} · ${o.section}/${o.paragraph}:${o.paragraph_character} · S${o.script_sequence}</span>`).join("");
  detail.classList.remove("hidden");
  detail.scrollIntoView({behavior:"smooth",block:"start"});
}
function download(filename,mime,content){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
function csvCell(v){const text=String(v);return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text}

function exportJson(){
  const payload={format:"musashi-unique-character-catalog-v1.0",derived_from:"V4 Book of Five Rings paragraph corpus via structural coordinate rules",totals:{unique_characters:catalog.length,hiragana:catalog.filter(x=>x.script==="hiragana").length,katakana:catalog.filter(x=>x.script==="katakana").length,kanji:catalog.filter(x=>x.script==="kanji").length,occurrences:catalog.reduce((n,x)=>n+x.occurrence_count,0)},records:catalog};
  download("musashi-unique-character-catalog.json","application/json;charset=utf-8",JSON.stringify(payload,null,2));
}
function exportCsv(){
  const headers=["unique_id","script_id","character","script","first_global_character","first_section","first_paragraph","first_paragraph_character","occurrence_count"];
  const lines=[headers.join(",")];
  for(const x of catalog)lines.push(headers.map(h=>csvCell(x[h])).join(","));
  download("musashi-unique-character-catalog.csv","text/csv;charset=utf-8","\uFEFF"+lines.join("\n"));
}

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{activeFilter=btn.dataset.filter;document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");render()}));
searchEl.addEventListener("input",render);sortEl.addEventListener("change",render);document.getElementById("exportJson").addEventListener("click",exportJson);document.getElementById("exportCsv").addEventListener("click",exportCsv);

(async function init(){
  try{
    const res=await fetch(CORPUS_URL,{cache:"no-store"}); if(!res.ok)throw new Error(`corpus.json ${res.status}`);
    const corpus=await res.json();
    const structural=buildStructuralRecords(corpus);
    catalog=buildCatalog(structural);
    renderStats();render();
    document.getElementById("exportJson").disabled=false;document.getElementById("exportCsv").disabled=false;
    statusEl.textContent=`Ready: ${catalog.length} unique characters from ${structural.length.toLocaleString()} occurrences`;
  }catch(err){console.error(err);statusEl.textContent=`Load failed: ${err.message}`}
})();
