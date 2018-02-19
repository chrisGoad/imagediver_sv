
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python ops/gen_gallery.py


"""


python
execfile("ops/execthis.py")


imnm = "the_dutch_proverbs"

def reszim(imnm): 
  im = image.loadImageD("/image/4294b0e/"+imnm)
  im.reduceImage(("area",100000))
  im.reduceImage(("area",250000))
  im.reduceImage(("area",1000000))
  s3.s3SaveFile("/4294b0e/"+imnm+"/resized/area_100000.jpg",relativeTo="images",contentType="image/jpeg")
  s3.s3SaveFile("/4294b0e/"+imnm+"/resized/area_250000.jpg",relativeTo="images",contentType="image/jpeg")
  s3.s3SaveFile("/4294b0e/"+imnm+"/resized/area_100000.jpg",relativeTo="images",contentType="image/jpeg")

reszim("the_dutch_proverbs")
reszim("the_ambassadors")
reszim("garden_of_earthly_delights")
reszim("astoria_1923")


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
  def loadImage(u,nm):
    tp = imageTopic(u,nm);
    vprint("loading ",tp)
    im = image.loadImageD(tp)
    if im == None: print "MISSING ",tp
    images[tp] = im.__dict__
  def loadAlbum(u,inm,aid):
    tp = albumTopic(u,inm,aid)
    albumList.append(tp)
    vprint("loading ",tp)
    #albums[u+"_"+inm+"_"+aid] = models.loadAlbumD(tp)
    alb = album.loadAlbumD(tp)
    if alb == None: print "MISSING ",tp
    albums[tp] = alb.__dict__
  u0 = "4294b0e"
  loadImage(u0,"the_dutch_proverbs")
  loadAlbum(u0,"the_dutch_proverbs","1")
  
  loadImage(u0,"the_ambassadors")
  loadAlbum(u0,"the_ambassadors","1")
  
  loadImage(u0,"garden_of_earthly_delights")
  loadAlbum(u0,"garden_of_earthly_delights","1")
  
  loadImage(u0,"astoria_1923")
  loadAlbum(u0,"astoria_1923","1")
  
  jrs = json.dumps({"images":images,"albums":albums,"albumList":albumList})
  rs = "idv.data = "+jrs
  fln = "/mnt/ebs0/imagediverdev/www/pages/gallery_data.js"
  fl = open(fln,'w')
  fl.write(rs)
  return rs

genData()
