"""Lightweight static-export integrity tests, no external dependencies."""
from pathlib import Path
import json
import re

base=Path(__file__).resolve().parents[1]
data=json.loads((base/'data/catalog.json').read_text(encoding='utf-8'))
occ=json.loads((base/'data/occurrences.json').read_text(encoding='utf-8'))
assert data['source']['v4Sha256']==occ['v4Sha256']
for key,count in [('lexemes',192),('relations',75),('relationEvidence',210),('annotations',21),('paragraphs',168),('kanjiLinks',278),('kanjiInventory',578),('scenes',10),('grammars',16)]:
    assert len(data[key])==count,(key,len(data[key]))
assert len(occ['occurrences'])==4304
ps={p['id']:p for p in data['paragraphs']}
terms={t['id']:t for t in data['lexemes']}
assert len(ps)==168 and len(terms)==192
assert len([t for t in terms.values() if t['reading']])==65
for p in ps.values():
    assert re.fullmatch('P[0-9]{3}',p['id'])
    assert re.fullmatch('[0-9]{4}',p['section'])
    assert re.fullmatch('[0-9]{4}',p['scroll'])
for row in occ['occurrences']+data['relationEvidence']:
    assert row['p'] in ps
    assert row['c0']<=row['c1'] and row['g0']<=row['g1']
    assert ps[row['p']]['text'][row['c0']-1:row['c1']]==row['text'],row
for r in data['relations']:
    assert r['lexeme'] in terms
for a in data['annotations']:
    assert any(r['id']==a['relation_id'] for r in data['relations'])
print('PASS: schema, counts, 4,514 original source-coordinate spans, foreign keys, and V4 ID format')