const CORPUS_URL = "../musashi-reader/data/corpus.json";

const SCRIPT_TESTS = [
  ["hiragana", /\p{Script=Hiragana}/u],
  ["katakana", /\p{Script=Katakana}/u],
  ["kanji", /\p{Script=Han}/u]
];

const PROPOSALS = {
  P000: [
    ["兵法","lexical"],["の","grammar"],["道","lexical"],["二天一流","lexical"],["と","grammar"],["号し","mixed"],["数年","lexical"],["鍛錬","lexical"],["の","grammar"],["事","lexical"],["初て","mixed"],["書物","lexical"],["に","grammar"],["書き","mixed"],["顕はさん","mixed"],["と","grammar"],["思ふ","mixed"]
  ],
  P001: [
    ["時","lexical"],["に","grammar"],["寛永二十年","lexical"],["十月","lexical"],["上旬","lexical"],["の","grammar"],["頃","lexical"],["九州","lexical"],["肥後","lexical"],["の","grammar"],["地","lexical"],["巌殿山","lexical"],["に","grammar"],["上り","mixed"],["天","lexical"],["を","grammar"],["拝し","mixed"],["観音","lexical"],["を","grammar"],["礼し","mixed"],["仏前","lexical"],["に","grammar"],["向ひ","mixed"],["生国","lexical"],["播磨","lexical"],["の","grammar"],["武士","lexical"],["新免武蔵藤原玄信","lexical"],["年","lexical"],["つもりて","mixed"],["六十","lexical"],["我","lexical"],["若年","lexical"],["の","grammar"],["むかし","lexical"],["より","grammar"],["兵法","lexical"],["の","grammar"],["道","lexical"],["に","grammar"],["心","lexical"],["を","grammar"],["かけ","mixed"],["十三歳","lexical"],["に","grammar"],["して","grammar"],["初て","mixed"],["勝負","lexical"],["を","grammar"],["為す","mixed"],["その","grammar"],["相手","lexical"],["新当流","lexical"],["の","grammar"],["有馬喜兵衛","lexical"],["と","grammar"],["いふ","mixed"],["兵法者","lexical"],["に","grammar"],["打勝ち","mixed"],["十六歳","lexical"],["に","grammar"],["して","grammar"],["但馬国","lexical"],["秋山","lexical"],["と","grammar"],["いふ","mixed"],["強力","lexical"],["の","grammar"],["兵法者","lexical"],["に","grammar"],["打ち","mixed"],["勝ち","mixed"],["二十一歳","lexical"],["に","grammar"],["して","grammar"],["都","lexical"],["に","grammar"],["上り","mixed"],["天下","lexical"],["の","grammar"],["兵法者","lexical"],["に","grammar"],["逢ひて","mixed"],["数度","lexical"],["の","grammar"],["勝負","lexical"],["を","grammar"],["決す","mixed"],["と","grammar"],["いへども","grammar"],["勝利","lexical"],["を","grammar"],["得ず","mixed"],["と","grammar"],["いふ","mixed"],["こと","lexical"],["なし","mixed"],["その","grammar"],["後","lexical"],["国々","lexical"],["所々","lexical"],["に","grammar"],["至り","mixed"],["諸流","lexical"],["の","grammar"],["兵法者","lexical"],["に","grammar"],["行逢ひ","mixed"],["六十余度","lexical"],["まで","grammar"],["勝負","lexical"],["す","mixed"],["と","grammar"],["いへども","grammar"],["一度","lexical"],["も","grammar"],["その","grammar"],["利","lexical"],["を","grammar"],["失はず","mixed"],["その","grammar"],["程","lexical"],["年","lexical"],["十三","lexical"],["より","grammar"],["二十八九","lexical"],["まで","grammar"],["の","grammar"],["こと","lexical"],["なり","grammar"]
  ],
  P002: [
    ["三十","lexical"],["を","grammar"],["越えて","mixed"],["跡","lexical"],["を","grammar"],["おもひ","mixed"],["見る","mixed"],["に","grammar"],["兵法","lexical"],["至極","lexical"],["して","grammar"],["勝つ","mixed"],["に","grammar"],["は","grammar"],["あらず","grammar"],["おのづから","lexical"],["道","lexical"],["の","grammar"],["器用","lexical"],["ありて","grammar"],["天理","lexical"],["を","grammar"],["離れざる","mixed"],["が","grammar"],["故","lexical"],["か","grammar"],["又","lexical"],["は","grammar"],["他流","lexical"],["の","grammar"],["兵法","lexical"],["不足","lexical"],["なる","grammar"],["所","lexical"],["に","grammar"],["や","grammar"],["その","grammar"],["後","lexical"],["猶も","lexical"],["深き","mixed"],["道理","lexical"],["を","grammar"],["得ん","mixed"],["と","grammar"],["朝鍛夕錬","lexical"],["して","grammar"],["見れば","mixed"],["おのづから","lexical"],["兵法","lexical"],["の","grammar"],["道","lexical"],["に","grammar"],["あふ","mixed"],["こと","lexical"],["我","lexical"],["五十歳","lexical"],["の","grammar"],["ころ","lexical"],["なり","grammar"],["それ","grammar"],["より","grammar"],["以来","lexical"],["は","grammar"],["尋ね","mixed"],["入る","mixed"],["べき","grammar"],["道","lexical"],["なく","grammar"],["して","grammar"],["光陰","lexical"],["を","grammar"],["おくる","mixed"]
  ],
  P003: [
    ["兵法","lexical"],["の","grammar"],["利","lexical"],["に","grammar"],["まかせて","mixed"],["諸芸","lexical"],["諸能","lexical"],["の","grammar"],["道","lexical"],["と","grammar"],["なせば","mixed"],["万事","lexical"],["に","grammar"],["於て","grammar"],["我","lexical"],["に","grammar"],["師匠","lexical"],["なし","mixed"],["今","lexical"],["この","grammar"],["書","lexical"],["を","grammar"],["作る","mixed"],["と","grammar"],["いへども","grammar"],["仏法","lexical"],["儒道","lexical"],["の","grammar"],["古語","lexical"],["を","grammar"],["も","grammar"],["からず","mixed"],["軍記","lexical"],["軍法","lexical"],["の","grammar"],["古き","mixed"],["こと","lexical"],["を","grammar"],["も","grammar"],["用ゐず","mixed"],["この","grammar"],["一流","lexical"],["の","grammar"],["見立","lexical"],["実","lexical"],["の","grammar"],["心","lexical"],["を","grammar"],["あらはす","mixed"],["こと","lexical"],["天道","lexical"],["と","grammar"],["観世音","lexical"],["と","grammar"],["を","grammar"],["鏡","lexical"],["と","grammar"],["して","grammar"],["十月十日","lexical"],["の","grammar"],["夜","lexical"],["寅","lexical"],["の","grammar"],["一点","lexical"],["に","grammar"],["筆","lexical"],["を","grammar"],["把りて","mixed"],["書き","mixed"],["初る","mixed"],["もの","lexical"],["なり","grammar"]
  ]
};

let corpus;
let index = [];
let spans = [];
let current = "P000";

function scriptOf(ch){
  for (const [name,re] of SCRIPT_TESTS) if (re.test(ch)) return name;
  return null;
}

function stripToIndexed(text){
  return [...text].filter(ch => scriptOf(ch)).join("");
}

function buildIndex(paragraphs){
  let global = 0;
  const scriptCounts = {hiragana:0,katakana:0,kanji:0};
  const out=[];
  for (const p of paragraphs){
    let local=0;
    for (const ch of [...p.text]){
      const script=scriptOf(ch);
      if(!script) continue;
      global++; local++; scriptCounts[script]++;
      out.push({section:p.section_id,paragraph:p.paragraph_id,global_character:global,paragraph_character:local,script,script_sequence:scriptCounts[script],character:ch});
    }
  }
  return out;
}

function buildSpans(){
  const all=[];
  let sequence=0;
  for (const pid of Object.keys(PROPOSALS)){
    const p=corpus.paragraphs.find(x=>x.paragraph_id===pid);
    const source=stripToIndexed(p.text);
    const proposalText=PROPOSALS[pid].map(x=>x[0]).join("");
    if(source!==proposalText){
      throw new Error(`${pid} proposal does not reconstruct source exactly.`);
    }
    const records=index.filter(r=>r.paragraph===pid);
    let cursor=0;
    PROPOSALS[pid].forEach(([surface,type],i)=>{
      const chars=[...surface];
      const slice=records.slice(cursor,cursor+chars.length);
      if(slice.map(r=>r.character).join("")!==surface) throw new Error(`${pid} chunk alignment failure at ${surface}`);
      sequence++;
      all.push({
        span_id:`LS${String(sequence).padStart(4,"0")}`,
        paragraph:pid,
        section:p.section_id,
        chunk_index:i+1,
        surface,
        type,
        global_start:slice[0].global_character,
        global_end:slice[slice.length-1].global_character,
        paragraph_start:slice[0].paragraph_character,
        paragraph_end:slice[slice.length-1].paragraph_character,
        character_records:slice.map(r=>({global_character:r.global_character,paragraph_character:r.paragraph_character,script:r.script,script_sequence:r.script_sequence,character:r.character})),
        status:"prototype-proposed"
      });
      cursor+=chars.length;
    });
  }
  return all;
}

function renderParagraphButtons(){
  const box=document.getElementById("paragraphButtons");
  box.innerHTML="";
  Object.keys(PROPOSALS).forEach(pid=>{
    const b=document.createElement("button"); b.textContent=pid; b.className=pid===current?"active":"";
    b.onclick=()=>{current=pid;renderParagraphButtons();render();}; box.appendChild(b);
  });
}

function render(){
  const p=corpus.paragraphs.find(x=>x.paragraph_id===current);
  const ps=spans.filter(s=>s.paragraph===current);
  document.getElementById("heading").textContent=`${current} · Section ${p.section_id}`;
  document.getElementById("source").textContent=p.text;
  const chunks=document.getElementById("chunks"); chunks.innerHTML="";
  ps.forEach(s=>{
    const b=document.createElement("button"); b.className=`chunk ${s.type}`;
    b.innerHTML=`<span class="jp">${escapeHtml(s.surface)}</span><span class="kind">${s.type}</span>`;
    b.onclick=()=>showDetail(s,b); chunks.appendChild(b);
  });
  const rows=document.getElementById("rows"); rows.innerHTML="";
  ps.forEach(s=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${s.span_id}</td><td>${s.paragraph}</td><td class="jp">${escapeHtml(s.surface)}</td><td>${s.type}</td><td>${s.global_start}</td><td>${s.global_end}</td><td>${s.paragraph_start}</td><td>${s.paragraph_end}</td><td>${s.character_records.length}</td>`;
    rows.appendChild(tr);
  });
  document.getElementById("detailText").textContent="Select a chunk.";
  document.getElementById("detailMeta").innerHTML="";
}

function showDetail(s,button){
  document.querySelectorAll(".chunk").forEach(x=>x.classList.remove("selected")); button.classList.add("selected");
  document.getElementById("detailText").textContent=s.surface;
  const chars=s.character_records.map(r=>`${r.character} · G${r.global_character} · P${r.paragraph_character} · ${r.script}`).join(" | ");
  document.getElementById("detailMeta").innerHTML=`
    <div><strong>Span ID</strong>${s.span_id}</div><div><strong>Type</strong>${s.type}</div><div><strong>Section</strong>${s.section}</div><div><strong>Paragraph</strong>${s.paragraph}</div>
    <div><strong>Global span</strong>${s.global_start}–${s.global_end}</div><div><strong>Paragraph span</strong>${s.paragraph_start}–${s.paragraph_end}</div><div style="grid-column:1/-1"><strong>Underlying character records</strong>${escapeHtml(chars)}</div>`;
}

function exportJson(){
  const payload={format:"musashi-lexical-span-prototype-v0.1",section:"0000",paragraphs:["P000","P001","P002","P003"],status:"prototype-proposed-not-canonical",rules:{source_text_mutated:false,spans_must_reconstruct_indexed_source:true,types:["lexical","grammar","mixed"],coordinates_derived_from_structural_character_index:true},records:spans};
  download("musashi-section-0000-lexical-span-prototype.json",JSON.stringify(payload,null,2),"application/json");
}

function exportCsv(){
  const headers=["span_id","section","paragraph","chunk_index","surface","type","global_start","global_end","paragraph_start","paragraph_end","character_count","status"];
  const lines=[headers.join(","),...spans.map(s=>headers.map(h=>csv(h==="character_count"?s.character_records.length:s[h])).join(","))];
  download("musashi-section-0000-lexical-span-prototype.csv","\ufeff"+lines.join("\n"),"text/csv;charset=utf-8");
}
function csv(v){const x=String(v??"");return /[",\n]/.test(x)?`"${x.replaceAll('"','""')}"`:x;}
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

async function init(){
  try{
    const res=await fetch(CORPUS_URL,{cache:"no-store"}); if(!res.ok) throw new Error(`Corpus load failed (${res.status})`);
    corpus=await res.json();
    const targets=corpus.paragraphs.filter(p=>["P000","P001","P002","P003"].includes(p.paragraph_id));
    if(targets.length!==4) throw new Error("Could not find all four preface paragraphs.");
    index=buildIndex(corpus.paragraphs);
    spans=buildSpans();
    renderParagraphButtons(); render();
    document.getElementById("exportJson").disabled=false; document.getElementById("exportCsv").disabled=false;
    document.getElementById("status").innerHTML=`<span class="ok">Ready · ${spans.length} proposed spans</span>`;
  }catch(err){
    console.error(err); document.getElementById("status").innerHTML=`<span class="bad">${escapeHtml(err.message)}</span>`;
  }
}

document.getElementById("exportJson").onclick=exportJson;
document.getElementById("exportCsv").onclick=exportCsv;
init();
