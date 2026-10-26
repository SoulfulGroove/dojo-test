#!/usr/bin/env python3
"""Rebuild the small in-game EAST sprite atlas from a separately downloaded sample pack.
Usage: python tools/build_east_atlas.py /path/to/east-free-sample.zip
Pillow required. Keep the original EAST sample outside the repository.
"""
import json,sys
from zipfile import ZipFile
from PIL import Image
from io import BytesIO
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
Z=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/mnt/data/east-free-sample.zip')
SOURCES={
  'dojo':'shrines/large/items/worship_hall/worship_hall_1_new.png',
  'torii':'shrines/large/items/vermilion_torii/vermilion_torii_1_new.png',
  'house':'houses/large/buildings/machiya/machiya_1_new.png',
  'minka':'houses/large/buildings/minka/minka_1_new.png',
  'pagoda':'shrines/large/items/pagoda/pagoda_1_new.png',
  'bridge':'gardens/large/items/arched_bridge/arched_bridge_1_new.png',
  'pond':'gardens/large/items/koi_pond/koi_pond_1_new.png',
  'bamboo':'bamboo/large/trees/bamboo_stand/bamboo_stand_1_summer.png',
  'sakura':'bamboo/large/trees/sakura/sakura_1_spring.png',
  'maple':'bamboo/large/trees/japanese_maple/japanese_maple_1_autumn.png',
  'lantern':'gardens/large/items/kasuga_lantern/kasuga_lantern_1_new.png',
  'fox':'shrines/large/items/fox_statues/fox_statues_1_new.png',
}
# pack without trimming or resampling; pixels untouched
W=1024; gap=14; x=gap; y=gap; line_h=0
atlas=Image.new('RGBA',(W,760),(0,0,0,0))
entries={}
with ZipFile(Z) as z:
 for name,relative in SOURCES.items():
  source='east-free-sample/'+relative
  sprite=Image.open(BytesIO(z.read(source))).convert('RGBA')
  w,h=sprite.size
  if x+w+gap>W:
   x=gap;y+=line_h+gap;line_h=0
  atlas.paste(sprite,(x,y),sprite)
  entries[name]={'x':x,'y':y,'w':w,'h':h,'source':relative,'origin':'EAST Free Sample by mmorwynn'}
  x+=w+gap;line_h=max(line_h,h)
atlas=atlas.crop((0,0,W,y+line_h+gap))
# Palette-compress pixel art without resampling; the source sample stays external.
atlas=atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
p=ROOT/'assets/miniature/east-scene.png';p.parent.mkdir(parents=True,exist_ok=True);atlas.save(p,optimize=True)
index={'version':'1.0.0','image':'../assets/miniature/east-scene.png','size':{'width':atlas.width,'height':atlas.height},'license':{'name':'EAST Free Sample','creator':'mmorwynn','homepage':'https://mmorwynn.itch.io/east-free-sample','notes':'Use in projects permitted; do not redistribute raw assets as a standalone asset pack.'},'sprites':entries}
(ROOT/'data/east-atlas.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built',p,atlas.size,p.stat().st_size,'bytes',len(entries),'sprites')
