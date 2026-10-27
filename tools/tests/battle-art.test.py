"""Validate shipped battle art, not just its manifest entries."""
from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parents[2]
ids=set(json.loads((ROOT/'docs/art/boss-sprite-concepts.json').read_text()))
sheets=list((ROOT/'img/boss-motion').glob('*.webp'))
assert {p.stem for p in sheets}==ids, 'All 57 stable boss IDs need sheets'
hashes=set()
sw=(ROOT/'sw.js').read_text()
for path in sheets:
    raw=path.read_bytes(); digest=hashlib.sha256(raw).digest()
    assert digest not in hashes, f'Reused sheet: {path.stem}'
    hashes.add(digest)
    im=Image.open(path)
    assert im.size==(1152,768) and im.mode=='RGBA', path
    poses=[]; bottoms=[]
    for i in range(6):
        tile=im.crop(((i%3)*384,(i//3)*384,(i%3+1)*384,(i//3+1)*384))
        alpha=tile.getchannel('A'); hist=alpha.histogram()
        assert sum(hist[:10])/(384*384)>.12, f'Opaque backdrop: {path.stem} pose{i}'
        bounds=alpha.point(lambda x:255 if x>32 else 0).getbbox()
        assert bounds, f'Empty pose: {path.stem}/{i}'
        assert bounds[0]>=12 and bounds[2]<=372, f'Clipped pose: {path.stem}/{i}: {bounds}'
        bottoms.append(bounds[3]);poses.append(hashlib.sha256(tile.tobytes()).digest())
    assert len(set(poses))==6, f'Duplicate poses: {path.stem}'
    assert max(bottoms)-min(bottoms)<=3, f'Unanchored poses: {path.stem}: {bottoms}'
    assert f"'/RCPStudyGame/img/boss-motion/{path.name}'" in sw, path
arenas=list((ROOT/'img/arenas').glob('*.webp'))
assert {p.stem for p in arenas}=={'rcp103','rcp104','rcp201','rcp202','rcp203','rcp2xx'}
assert len({hashlib.sha256(p.read_bytes()).digest() for p in arenas})==6
for p in arenas:
    assert Image.open(p).size==(1440,960), p
    assert f"'/RCPStudyGame/img/arenas/{p.name}'" in sw, p
print('PASS 57 unique six-pose transparent anchored sheets and six distinct precached arenas')
