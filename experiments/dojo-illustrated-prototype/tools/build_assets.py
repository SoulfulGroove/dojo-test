#!/usr/bin/env python3
"""Extract derivative IN-GAME image assets from user-approved original mockups.

Requires source PNGs supplied with the project at specific paths. The output is
not full-screen mockups: backgrounds, reusable cards, medallions, a book spread,
and navigational artwork are separately packed into WebP images.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import json
SRC=Path('/mnt/data')
OUT=Path(__file__).resolve().parents[1]/'assets'
OUT.mkdir(exist_ok=True,parents=True)
paths={
 'hall': SRC/'adhd_dojo_midnight_training_hub.png',
 'quests': SRC/'adhd_dojo_lanternlit_quest_menu.png',
 'skills': SRC/'moonlit_dojo_skills_tree.png',
 'codex': SRC/'adhd_dojo_codex_hiragana_k_row.png',
 'map': SRC/'a_wide_high_detail_ui_mockup_collage_of_a_japanes.png',
}
src={k:Image.open(v).convert('RGBA') for k,v in paths.items()}
entries=[]
def save(key,img,source,region,purpose,quality=83):
    fp=OUT/f'{key}.webp'
    im=img.convert('RGBA') if img.mode!='RGBA' else img
    im.save(fp,'WEBP', quality=quality, method=6)
    entries.append(dict(id=key,path='assets/'+fp.name,source=source,region=region,purpose=purpose,width=im.width,height=im.height,bytes=fp.stat().st_size,derivative=True))
    print(fp.name, im.size,fp.stat().st_size)
def crop(key,source,rect,purpose,quality=83):
    save(key,src[source].crop(rect),source,rect,purpose,quality)
# Visual source art, sliced into reusable independent assets; text in decorative artwork is not editable.
crop('shared-header','hall',(0,0,941,122),'Branded top header, demonstration-only statistics')
crop('hall-environment','hall',(0,120,941,555),'Moonlit Dojo hero illustration')
crop('hall-training','hall',(24,550,910,916),'Framed illustrated featured training card')
crop('hall-quest','hall',(24,920,909,1129),'Framed current quest progress illustration')
crop('hall-profile','hall',(23,1320,911,1489),'Character HUD artwork (demo values)')
for i,(a,b) in enumerate([(26,244),(244,461),(462,680),(682,908)]):
    crop(['tile-skills','tile-quests','tile-codex','tile-map'][i],'hall',(a,1133,b,1308),'Reusable quick-navigation card')
crop('quest-header','quests',(0,120,941,395),'Lanternlit quest courtyard banner and tabs')
crop('quest-feature','quests',(24,394,909,749),'Main quest illustrated card')
for i,(y0,y1) in enumerate([(757,939),(949,1127),(1134,1319),(1326,1510)]):
    crop(f'quest-row-{i+1}','quests',(24,y0,909,y1),'Individual illustrated quest-card art')
crop('skills-header','skills',(0,120,941,357),'Skills header scenic artwork')
# A patch of detailed environment without menus makes an atmospheric skill-board background.
crop('skills-scenery','skills',(0,123,941,478),'Skill tree atmospheric landscape (used behind discrete node art)')
crop('skills-detail','skills',(28,1099,915,1461),'Selected skill detail panel original artwork (reference preview)')
centers={'skill-sound':(469,381),'skill-recall':(227,543),'skill-recognition':(704,540),'skill-reading':(225,799),'skill-pronunciation':(708,798),'skill-writing':(465,933),'skill-kana':(464,677)}
for k,(x,y) in centers.items():
    rad=76 if k!='skill-kana' else 132
    left,top=x-rad,y-rad
    icon=src['skills'].crop((left,top,x+rad,y+rad))
    mask=Image.new('L',icon.size); dr=ImageDraw.Draw(mask); dr.ellipse((2,2,icon.width-2,icon.height-2),fill=255)
    icon.putalpha(mask)
    save(k,icon,'skills',(left,top,x+rad,y+rad),'Separated circular skill node with illustrated icon')
crop('codex-header','codex',(0,120,941,501),'Lanternlit archive with books')
crop('codex-spread','codex',(18,493,927,1321),'Illustrated open K-row codex pages')
crop('codex-next','codex',(26,1321,917,1499),'Illustrated codex next-chapter card')
# Transparent navigation icon sprites: no clickable text is part of the sprite.
for name,x in [('dojo',113),('quests',298),('skills',467),('codex',641),('map',820)]:
    r=src['hall'].crop((x-36,1520,x+36,1592))
    save('nav-'+name,r,'hall',(x-36,1520,x+36,1592),'Painted menu icon')
# A painted parchment texture crop from open-book paper, later used for interactive text panels.
crop('paper-texture','codex',(140,748,340,876),'Small washi texture tile')
# A fully painted gold action button from the UI artwork, independently composited.
crop('button-gold','hall',(87,774,606,870),'Gold ornate CTA artwork for a live button')
# Map thumbnail stays a dedicated action rather than embedding screenshot composition.
if paths['map'].exists():
    crop('world-thumbnail','map',(0,64,500,525),'Illustrated Japan atlas thumbnail; separate world app opens on tap')
meta={'schemaVersion':'1.0.0','kind':'mockup-derived-production-art','title':'Dojo Illustrated UI Prototype v0.1','art_source':'User-approved original concept mockups created in conversation','assets':entries,'note':'Decorative art is rasterized; menu navigation, selection, and interactive states are live controls. Embedded text and fake XP in concept art are not canonical app data.'}
(OUT.parent/'data'/'manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL', len(entries), sum(x['bytes'] for x in entries))
