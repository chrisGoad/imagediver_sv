#!/usr/bin/env python
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py



python
import store.dynamo
dyn = store.dynamo
import model.models
models = model.models
import model.image
image = model.image
import model.album
album = model.album
from model.image import Point,Rect

verbose = False
def pathLast(x):
  sp = x.split("/")
  return sp[-1]

def vprint(x):
  if verbose:print x
"""
def genSnapImage(albumD,imd,tl,snap):
  albumTopic = albumD.topic
  imdim = imd.dimensions
  imdir = imd.imDir()
  imwd = imdim["x"]
  imht = imdim["y"]
  cropid = snap["cropid"]
  coverage = snap["coverage"]
  crect = image.dictToRect(coverage)
  print "GENERATING IMAGES FOR SNAP ",snap["topic"], " cropId ",cropid
  snappath = imdir+"snap/"+str(cropid)+".jpg"
  thumbpath = imdir+"snapthumb/"+str(cropid)+".jpg"
  print "SNAPPATH",snappath
  tl.cropFromTiles(snappath,crect,targetArea=200000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
  tl.cropFromTiles(thumbpath,crect,targetArea=25000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
   
"""

def genSnapImages(albumTopic):
  albumD = model.album.loadAlbumD(albumTopic)
  o = pathLast(albumD.owner)
  imt = albumD.image
  imname = pathLast(imt)
  albumIdx = pathLast(albumTopic)
  imd = image.loadImageD(imt)
  allsnaps = albumD.snaps()
  #snaps.getSnaps(albumTopic)
  tl  = image.Tiling(imd,256,1);
  tl.createTiles([],kind="r",parent=None,recursive=False)
  for sn in allsnaps:
    sno = models.SnapD(None)
    sno.__dict__.update(sn)
    albumD.genSnapImages(imd,tl,sno)
    #genSnapImage(albumD,imd,tl,sn)
    

"""
albumTopic = "/album/4294b0e/the_dutch_proverbs/1"

genSnapImages(albumTopic)

albumTopic = "/album/4294b0e/the_ambassadors/1"
genSnapImages(albumTopic)


albumTopic = "/album/4294b0e/garden_of_earthly_delights/1"
genSnapImages(albumTopic)


albumTopic = "/album/4294b0e/garden_of_earthly_delights/3"
genSnapImages(albumTopic)

albumTopic = "/album/4294b0e/garden_of_earthly_delights/4"
genSnapImages(albumTopic)

albumTopic = "/album/4294b0e/garden_of_earthly_delights/5"
genSnapImages(albumTopic)



albumTopic = "/album/4294b0e/astoria_1923/1"
genSnapImages(albumTopic)


albumTopic = "/album/4294b0e/astoria_1923/2"
genSnapImages(albumTopic)



"""


