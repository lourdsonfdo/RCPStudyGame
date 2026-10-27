"""Extract six separate silhouettes even when a wide pose crosses a grid line.

Transparent PNGs have six main connected bodies. Small detached details are
assigned to the nearest body. Ambiguous sheets fail rather than mix figures.
No pixels or poses are synthesized by this packaging step.
"""
from array import array
from PIL import Image, ImageChops, ImageFilter

def extract_pose_tiles(image):
    alpha=image.getchannel('A')
    small=alpha.copy();small.thumbnail((768,512),Image.Resampling.NEAREST)
    width,height=small.size
    todo=bytearray(1 if value>32 else 0 for value in small.tobytes())
    labels=array('H',[0])*(width*height)
    regions=[]
    for start in range(width*height):
        if not todo[start]:continue
        label=len(regions)+1
        if label>65535:raise ValueError('Too many disconnected details')
        todo[start]=0;stack=[start];count=0;sx=0;sy=0
        while stack:
            point=stack.pop();y,x=divmod(point,width)
            labels[point]=label;count+=1;sx+=x;sy+=y
            for ny in range(max(0,y-1),min(height,y+2)):
                for nx in range(max(0,x-1),min(width,x+2)):
                    neighbour=ny*width+nx
                    if todo[neighbour]:todo[neighbour]=0;stack.append(neighbour)
        regions.append((count,sx/count,sy/count,label))
    bodies=sorted(regions,reverse=True)[:6]
    if len(bodies)!=6 or bodies[-1][0]<100:
        raise ValueError('Expected six separate guardian bodies')
    ordered={}
    for region in bodies:
        count,cx,cy,label=region
        cell=min(2,int(cx/(width/3)))+3*min(1,int(cy/(height/2)))
        if cell in ordered:raise ValueError('Ambiguous guardian grid')
        ordered[cell]=region
    owners={}
    for _,cx,cy,label in regions:
        owners[label]=min(ordered,key=lambda cell:(cx-ordered[cell][1])**2+(cy-ordered[cell][2])**2)+1
    owner_image=Image.frombytes('L',(width,height),bytes(owners.get(label,0) for label in labels))
    frames=[]
    for index in range(6):
        mask=owner_image.point(lambda value:255 if value==index+1 else 0)
        # Restore soft fringes around the connected opaque body while excluding neighbours.
        mask=mask.filter(ImageFilter.MaxFilter(3)).resize(image.size,Image.Resampling.NEAREST)
        frame=image.copy();frame.putalpha(ImageChops.multiply(alpha,mask))
        bounds=frame.getchannel('A').point(lambda value:255 if value>32 else 0).getbbox()
        if not bounds:raise ValueError('Empty extracted guardian')
        frames.append(frame.crop(bounds))
    return frames
