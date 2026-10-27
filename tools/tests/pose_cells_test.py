import importlib.util
from pathlib import Path
from PIL import Image, ImageDraw
import unittest
ROOT=Path(__file__).resolve().parents[2]
class PoseCellsTest(unittest.TestCase):
    def test_wide_strike_crosses_grid_without_cutting_or_neighbour_fragments(self):
        spec=importlib.util.spec_from_file_location('pose_cells', ROOT/'tools/pose_cells.py')
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        image=Image.new('RGBA',(300,200))
        draw=ImageDraw.Draw(image)
        boxes=[(20,10,70,85),(120,10,170,85),(220,10,270,85),
               (10,125,130,185),(145,120,185,190),(225,120,275,190)]
        for index,box in enumerate(boxes):draw.rectangle(box,fill=(index*40,30,80,255))
        frames=module.extract_pose_tiles(image)
        self.assertEqual(len(frames),6)
        self.assertEqual(frames[3].getchannel('A').getbbox()[2],121)
        self.assertEqual(frames[4].getchannel('A').getbbox()[2],41)
        for index,frame in enumerate(frames):
            visible={r for r,g,b,a in frame.getdata() if a>32}
            self.assertEqual(visible,{index*40})
if __name__=='__main__':unittest.main()
