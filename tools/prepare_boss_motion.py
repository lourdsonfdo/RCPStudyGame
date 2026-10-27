#!/usr/bin/env python3
"""Package generated 3x2 alpha pose grids for the game's fixed-cell renderer.

This only crops/resamples generated art; no new pose pixels are synthesized.
All six poses use one scale and a shared visible-silhouette baseline.
"""
from pathlib import Path
from PIL import Image
import json, sys
from pose_cells import extract_pose_tiles
ROOT=Path(__file__).resolve().parents[1]
source, boss_id=sys.argv[1:]
if boss_id not in json.loads((ROOT/'docs/art/boss-sprite-concepts.json').read_text()):
    raise SystemExit('Unknown boss ID')
im=Image.open(source)
if im.mode!='RGBA' or im.getchannel('A').getextrema()[0]!=0:
    raise SystemExit('Sheet needs genuine alpha')
w,h=im.size
if w%3 or h%2 or w//3!=h//2:
    raise SystemExit(f'Expected square cells in 3x2 grid, got {im.size}')
frames=extract_pose_tiles(im)
scale=min(344/max(frame.width for frame in frames),340/max(frame.height for frame in frames))
atlas=Image.new('RGBA',(1152,768),(0,0,0,0))
for i,tile in enumerate(frames):
    piece=tile.resize((max(1,round(tile.width*scale)),max(1,round(tile.height*scale))),Image.Resampling.LANCZOS)
    visible=piece.getchannel('A').point(lambda x:255 if x>32 else 0).getbbox()
    x=(384-piece.width)//2
    y=358-visible[3]
    atlas.alpha_composite(piece,((i%3)*384+x,(i//3)*384+y))
path=ROOT/'img/boss-motion'/f'{boss_id}.webp'
path.parent.mkdir(parents=True,exist_ok=True)
temporary=path.with_suffix('.tmp')
atlas.save(temporary,format='WEBP',quality=85,method=5)
temporary.replace(path)
with Path('/private/tmp/rcp-motion-sources.jsonl').open('a') as f:
    f.write(json.dumps({'id':boss_id,'source':source,'size':im.size,'scale':scale})+'\n')
print(boss_id, path.stat().st_size)
