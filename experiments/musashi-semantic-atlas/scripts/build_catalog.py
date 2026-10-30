#!/usr/bin/env python3
"""Compile compact, provenance-preserving GitHub Pages JSON from Musashi v0.3.

Usage: python scripts/build_catalog.py /path/to/Musashi_Historical_Grammar_Semantic_v03.json \
        /path/to/"musashi-structural-index-master 2.json" \
        /path/to/Musashi_Semantic_Vocabulary_Database.json

This is a static export. It does NOT infer readings, word boundaries, morphology,
semantic roles, historical pronunciations, or modern transferability.
"""
import json
import sys
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))

def dump(name, value):
    target = ROOT/'data'/name
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    print(f'{name}: {target.stat().st_size:,} bytes')

def main():
    if len(sys.argv)!=4:
        raise SystemExit('Provide v03.json, structural-index.json, and prior semantic-v01.json')
    src=load(sys.argv[1]); index=load(sys.argv[2]); prior=load(sys.argv[3]);
    old=src['existing_v02'];new=src['new_layers'];meta=src['metadata']
    assert len(old['lexemes'])==192, 'Investigate changed schema before publishing'
    assert len(old['source_relation_patterns'])==75
    assert len(old['seed_occurrences'])==4304
    assert len(index['records'])==24517
    # Check source hash and paragraph identities; do not silently merge mismatched editions.
    assert meta['v4_sha256']==prior['metadata']['source_sha256']
    assert index['source']['sha256']==meta['v4_sha256']
    chars=defaultdict(list)
    globals_by_number={}
    for row in index['records']:
        chars[row['paragraph']].append(row)
        globals_by_number[row['global_character']]=row
    paragraph_text={}
    for pid,rows in chars.items():
        rows.sort(key=lambda x:x['paragraph_character'])
        assert [r['paragraph_character'] for r in rows]==list(range(1,len(rows)+1))
        paragraph_text[pid]=''.join(r['character'] for r in rows)
    assert len(paragraph_text)==168

    def validate_occ(row, start_field, end_field, matched_field, p_start='paragraph_char_start', p_end='paragraph_char_end'):
        pid=row['paragraph_id']; a=row[p_start]; b=row[p_end]
        s=paragraph_text[pid][a-1:b]
        if s!=row[matched_field]:
            raise ValueError(f'Mismatch {pid} {a}-{b}: {s!r} vs {row[matched_field]!r}')
        assert row[end_field]-row[start_field]+1==len(s)
        assert globals_by_number[row[start_field]]['paragraph']==pid
        assert globals_by_number[row[end_field]]['paragraph']==pid
        return True

    for r in old['seed_occurrences']:
        validate_occ(r,'global_start','global_end','matched_string')
    for r in old['source_relation_evidence']:
        validate_occ(r,'global_start','global_end','matched_source')
    # The prior 65 are curated *working guides*, not independently validated readings.
    priormap={r['lexeme_id']:r for r in prior['lexemes']}
    lexemes=[]
    for r in old['lexemes']:
        p=priormap.get(r['lexeme_id'])
        lexemes.append({
            'id':r['lexeme_id'],'text':r['written_form'],'reading':r.get('study_reading'),
            'romaji':r.get('romaji'),'gloss':r.get('gloss'),
            'family':r['semantic_family'],'category':r['subcategory'],'ontology':r['ontology'],
            'status':r['status'],'readingStatus':r['reading_status'],
            'sourceSeed':r['source_seed'],'imageApproach':r['image_approach'],
            'modernTransfer':r['modern_transfer'],
            'matches':r['indexed_occurrences'],'paragraphCount':r['paragraphs_found'],
            'firstParagraph':r['first_paragraph'],'firstSection':r['first_section'],
            'firstScroll':r['first_scroll'],'firstParagraphChar':r['first_para_char'],
            'firstGlobal':r['first_global_char'],'scrollCounts':r['scroll_counts'],
            'visualBrief':p.get('visual_prompt') if p else None,
            'primaryScene':p.get('primary_scene') if p else None,
        })
    occurrences=[{
        'lexeme':r['lexeme_id'],'p':r['paragraph_id'], 'section':r['section_id'],
        'scroll':r['scroll_id'],'g0':r['global_start'],'g1':r['global_end'],
        'c0':r['paragraph_char_start'],'c1':r['paragraph_char_end'],
        'text':r['matched_string']
    } for r in old['seed_occurrences']]
    evidence=[{
        'relation':r['relation_id'],'p':r['paragraph_id'],'section':r['section_id'],
        'scroll':r['scroll_id'],'g0':r['global_start'],'g1':r['global_end'],
        'c0':r['paragraph_char_start'],'c1':r['paragraph_char_end'],
        'text':r['matched_source'],'context':r['context_source']
    } for r in old['source_relation_evidence']]
    relations=[{
        'id':r['relation_id'],'lexeme':r['lexeme_id'],'pattern':r['source_exact_pattern'],
        'predicate':r['predicate_as_written'],'modernGuide':r['predicate_modern_guide'],
        'gloss':r['relation_gloss'],'role':r['role'],'cue':r['particle_or_cue'],
        'class':r['relation_class'],'matches':r['exact_source_occurrences'],
        'firstParagraph':r['first_paragraph'],'firstGlobal':r['first_global_character'],
        'annotationStatus':r['annotation_status']
    } for r in old['source_relation_patterns']]
    paragraphs=[{'id':p['paragraph_id'],'section':p['section_id'],'scroll':p['scroll_id'],
                 'title':p['section_title'],'text':paragraph_text[p['paragraph_id']]}
                for p in old['paragraph_audit']]
    data={
        'schema':'musashi-semantic-browser-v0.1',
        'source':{'v4Sha256':meta['v4_sha256'],'coordinateSystem':meta['coordinate_system'],
                  'sourceScope':meta['scope'],'sourceVersion':'Musashi Historical Grammar + Semantic v0.3',
                  'note':'Indexed counts are raw written-string matches, not verified lexical frequencies.'},
        'lexemes':lexemes,'relations':relations,'relationEvidence':evidence,
        'annotations':new['Context_Interpretations_21'],
        'grammars':new['Grammar_Rules_16'],'readingGuides':new['Historical_Reading_Guides_12'],
        'kanjiLinks':new['Kanji_Lexeme_Links'],'kanjiInventory':old['kanji_inventory'],
        'scenes':old['source_scenes'],'contrasts':old['contrasts_editorial'],
        'paragraphs':paragraphs,
        'qualityGates':new['Quality_Gates_7'],
        'sourceRegister':new['Source_Register']
    }
    dump('catalog.json',data)
    dump('occurrences.json',{'schema':'musashi-source-occurrences-v0.1','v4Sha256':meta['v4_sha256'],
                             'occurrences':occurrences})
    print('PASS: 4,304 seed occurrence and 210 relation evidence coordinate checks')

if __name__=='__main__': main()