
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python ops/gen_gallery.py


# need this too
python ops/export.py
"""
import constants
import model.models
models = model.models
import json
import Logr
import model.image
image = model.image
import model.album
album = model.album
import misc
import json


verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args)

#Logr.log("home",str(im0.__dict__))

def imageTopic(u,nm):
  return "/image/"+u+"/"+nm


def albumTopic(u,inm,aid):
  return "/album/"+u+"/"+inm+"/"+aid
 

def genData():
  images = {}
  albums = {}
  albumList = []
  def loadImage(u,nm,altCaption=None):
    tp = imageTopic(u,nm);
    vprint("loading ",tp)
    im = image.loadImageD(tp)
    if im == None: print "MISSING ",tp
    if altCaption!=None:
      im.title = altCaption
    images[tp] = im.__dict__
  def loadAlbum(u,inm,aid,altCaption=None):
    tp = albumTopic(u,inm,aid)
    albumList.append(tp)
    vprint("loading ",tp)
    #albums[u+"_"+inm+"_"+aid] = models.loadAlbumD(tp)
    alb = album.loadAlbumD(tp)
    if alb == None: print "MISSING ",tp
    if altCaption!=None:
      alb.caption = altCaption
    albums[tp] = alb.__dict__
  u0 = "4294b0e" #cg
  u1 = "d73b6a9"
  
  loadImage(u0,"the_dutch_proverbs")
  loadAlbum(u0,"the_dutch_proverbs","1","")
  
  
  
  loadImage(u0,"garden_of_earthly_delights")
  loadAlbum(u0,"garden_of_earthly_delights","1")

  
  
  loadImage(u0,"the_ambassadors")
  loadAlbum(u0,"the_ambassadors","1","")
  
  
  
  loadImage(u0,"Saint_Francis_Bellini")
  loadAlbum(u0,"Saint_Francis_Bellini","1")
  
  
  loadImage(u0,"las_meninas")
  loadAlbum(u0,"las_meninas","1")
  
  
  loadImage(u0,"astoria_1923")
  loadAlbum(u0,"astoria_1923","1")
  
  
  loadImage(u1,"AstoriaVintageHardware")
  loadAlbum(u1,"AstoriaVintageHardware","1")
  
  loadImage(u0,"one_dollar_bill_5","The Dollar Bill Explained")
  loadAlbum(u0,"one_dollar_bill_5","1","A low-resolution (3 megapixel) example")
  
  
  jrs = json.dumps({"images":images,"albums":albums,"albumList":albumList})

  rs = "idv.data = "+jrs
  fln = "/mnt/ebs0/imagediverdev/www/pages/gallery_data.js"
  fl = open(fln,'w')
  fl.write(rs)
  return rs

genData()
