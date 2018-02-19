#!/usr/bin/env python

"""
file structure:

/mnt/ebs1/imagediver/images = constants.imageRoot

a subdirectory for each user,  eg <imageroot>/cg
under this:

stepdown/s_0.jpg,s_1.jpg,s_3.jpg ...
  s_<n> is stepped down by a factor of 2**n

imported
tiling
snap
snapthumb
resized/width_<n> height_<n> area_<n>

"""

import shutil
import re
import math
import time
import constants
import os
import store.dynamo
dynamo = store.dynamo
import model.models as models
import subprocess
import misc
import pdb
import ops.s3 as s3

from constants import imageRoot
import json


from PIL import Image
from PIL import ImageChops
from PIL import ImageDraw


#nowTesting = True

verbose = True
  
  
def vprint(*args):
  if verbose:
    misc.printargs(args,"IMAGE")
   
    

usePIL = True # alternative: imagemagick

class Point:
  def __init__(self,x,y):
    self.x=x
    self.y=y


  def scale(self,factor):
    return Point(factor * self.x, factor * self.y)

  def difference(self,pnt):
    return Point(self.x-pnt.x,self.y-pnt.y)
  
  
  def minus(self):
    return Point(-self.x,-self.y)
  

  def plus(self,pnt):
    return Point(self.x+pnt.x,self.y+pnt.y)
   
  def scaleToWidthScale(self,width):
    wd = self.x
    fc = width/wd
    return fc
  
  def scaleToWidth(self,width):
    return self.scale(self.scaleToWidthScale(width));


  def scaleToHeightScale(self,height):
    ht = self.y
    fc = height/ht
    return fc
    

  def scaleToHeight(self,width):
    return self.scale(self.scaleToHeightScale(width));
  
  

  def scaleToAreaScale(self,area):
    wd = self.x
    ht = self.y
    carea = wd*ht
    fc = area/carea
    return fc


  def scaleToArea(self,width):
    return self.scale(self.scaleToAreaScale(width));
  
  def tuple(self):
    return (self.x,self.y)


  def ituple(self):
    return (int(self.x + 0.5),int(self.y+0.5))
    
    
  def __repr__(self):
    return "Point({0},{1})".format(self.x,self.y)

  def toPIL(self):
    x = self.x
    y = self.y
    return (int(round(x)),int(round(y)))
    
    
    
  def toInt(self):
    x = self.x
    y = self.y
    return Point(int(round(x)),int(round(y)))
    
class Rect:
  def __init__(self,corner,extent):
    self.corner = corner
    self.extent = extent
    
  def scale(self,factor):
    return Rect(self.corner.scale(factor),self.extent.scale(factor))
  
  
  def scaleToWidth(self,width):
    fc = self.extent.scaleToWidthScale(width)
    return self.scale(fc)

  def area(self):
    xt = self.extent
    return xt.x * xt.y

  def scaleToHeight(self,height):
    fc = self.extent.scaleToHeightScale(height)
    return self.scale(fc)

  def translate(self,pnt):
    cs = self.corner
    nc = cs.plus(pnt)
    return Rect(nc,self.extent)


  def scaleToArea(self,area):
    fc = self.extent.scaleToAreaScale(area)
    return self.scale(fc)
    
  
  def containsRect(self,r):
    cr = self.corner
    xt = self.extent
    rcr = r.corner
    rxt = r.extent
    if rcr.x < cr.x: return False
    if (rcr.x + rxt.x) > (cr.x + xt.x): return False
    if rcr.y < cr.y: return False
    if (rcr.y + rxt.y) > (cr.y + xt.y): return False
    return True
       

  def intersects(self,r):
    cr = self.corner
    xt = self.extent
    rcr = r.corner
    rxt = r.extent
    if (rcr.x + rxt.x) < cr.x: return False
    if (rcr.x) > (cr.x + xt.x): return False
    if (rcr.y + rxt.y) < cr.y: return False
    if (rcr.y) > (cr.y + xt.y): return False
    return True
  
  """ the smallest rect that contains self and a """
  
  def extend(self,a):
    sc = self.corner
    ac = a.corner
    sxt = self.extent
    axt = a.extent
    rcx = min(sc.x,ac.x)
    rcy = min(sc.y,ac.y)
    mxx = max(sc.x+sxt.x,ac.x+axt.x)
    mxy = max(sc.y+sxt.y,ac.y+axt.y)
    return Rect(Point(rcx,rcy),Point(mxx-rcx,mxy-rcy))
    
    
  def __repr__(self):
    return "Rect({0},{1})".format(self.corner.__repr__(),self.extent.__repr__())
    
  def toPIL(self):
    crn = self.corner
    ext = self.extent
    x0 = crn.x
    y0 = crn.y
    x1 = x0 + ext.x
    y1 = y0 + ext.y
    return (int(round(x0)),int(round(y0)),int(round(x1)),int(round(y1)))
  
  
  def crop(self,minAspectRatio):
    ext = self.extent
    art = ext.y/ext.x
    if art >= minAspectRatio:
      return self
    
    alwd =  (ext.y)/minAspectRatio
    lftdiff = (ext.x - alwd)*0.5
    nxt = Point(alwd,ext.y)
    crn = self.corner
    ncrn = Point(crn.x + lftdiff,crn.y)
    rs =  Rect(ncrn,nxt)
    #print "CROPPED",self.__dict__,"to",rs.__dict__
    return rs
    
    

def containerOfRects(rects):
  rs = rects[0]
  for rct in rects[1:]:
    rs = rs.extend(rct)
  return rs

def dictToPoint(d):
  return Point(d["x"],d["y"])

def dictToRect(d):
  return Rect(dictToPoint(d["corner"]),dictToPoint(d["extent"]))


def createIfMissing(dir):
  if not os.path.exists(dir):
    vprint("CREATING ",dir)
    os.mkdir(dir)




stepFromSource = False # image quality degrades in PIL with repeated resizing, this option starts from the source
  
""" drct is the rectangle into which the crop should fit

one of targetHeight, targetWidth is defined, and represents the number of screen pixels in which
the crop will be displayed """


def scalePoint(p,f):
  return Point(f*p.x,f*p.y)



def scaleRect(r,f):
  return Rect(scalePoint(r.corner,f),scalePoint(r.extent,f))






def saveFileSizes(dir,pageStore):
  import store.log
  logstore = store.log
  files = os.listdir(dir)
  for file in files:
    path = dir + "/" + file
    sz = os.path.getsize(path)
    vprint("saving file size ",path,sz)
    logstore.newFilesizeEntry(path,sz,pageStore)
    
    
  
jpegQuality = 90
jpegSubsampling = 2



def resizeImage(ifln,ofln,size):
  if usePIL:
    pim = openImageFile(ifln)
    nsz = (size.x,size.y)
    stm = time.time()

    rsz = pim.resize(nsz,Image.ANTIALIAS)
    # rsz = pim.resize(nsz,Image.BILINEAR)
    ntm = time.time()
    vprint ("RESIZE of ",ifln," TO ",size," took ",ntm-stm)
    rsz.save(ofln,"JPEG",quality=jpegQuality)
    vprint ("SAVE TOOK ",time.time()-ntm)
  else:
    bx = str(int(size.x))+"x"+str(int(size.y))
    cmd = ["convert",ifln,"-resize",bx,ofln]
    vprint("RESIZE ",cmd)
    subprocess.call(["convert",ifln,"-resize",bx,ofln]);
    


def cropImage(ifl,ofl,imsize,croprect,finalsize=None):
  """ finalsize == None means this is a pure crop, with no scaling to finalsize afterwards  """
  vprint("CROPIMAGE",ifl,ofl,"imsize",imsize,"croprect",croprect,"finalsize",finalsize)
  if finalsize==None:  
    factor = 1.0
    finalsize = croprect.extent
  else:
    factor = float(finalsize.x)/(croprect.extent.x)
  vprint("CRECT in cropImage",factor,finalsize)
  if usePIL:
    print type(ifl)
    if (type(ifl) == str) or (type(ifl) == unicode):
      print "STR OR UNICODE"
      pim = openImageFile(ifl)
    else:
      print "NOT STR OR UNICODE"
      pim = ifl  
    prct = croprect.toPIL()
    stm = time.time()
    cim = pim.crop(prct)
    tm2 = time.time()
    vprint ("CROP TOOK ",tm2-stm)
    if abs(factor - 1.0) < 0.1:
      fim = cim
    else:
      nsz =  (int(round(finalsize.x)),int(round(finalsize.y)))
      fim = cim.resize(nsz,Image.ANTIALIAS)
      vprint ("RESIXE TOOK ",time.time()-tm2)

    fim.save(ofl,"JPEG",quality=jpegQuality)
    return finalsize
    
  else:
    cr = croprect.corner
    cv = croprect.extent
    xt = finalsize
    
    cx = cv.x
    cy = cv.y
    ex = xt.x
    ey = xt.y
    
    x = int(cr.x)
    y = int(cr.y)
    
    
    cmd = "convert -quiet -size {imwd}x{imht} -depth 8 -extract {cx}x{cy}+{x}+{y} \
           -resize {ex}x{ey} {ifl} {ofl}".format(
      imwd=imsize.x,imht=imsize.y,cx=int(cx),cy=int(cy),x=int(x),y=int(y),ex=int(ex),ey=int(ey),ifl=ifl,ofl=ofl)
    cmda =  cmd.split()
    vprint(cmd)
    subprocess.call(cmda)
    return finalsize



def createImDirs(imdir):
  createIfMissing(imdir)
  createIfMissing(imdir + "tiling")
  createIfMissing(imdir + "snap")
  createIfMissing(imdir + "snapthumb")
  createIfMissing(imdir + "resized")
  createIfMissing(imdir + "stepdown")


cropFromSource = False
onlyRtiles = True  # the simple way, without overlaps


maxBlowup = 10  # for posting to Tumblr, we allow images to be blown up; was 1

def cropFactor(ext,targetWidth=None,targetHeight=None,targetArea=None):
   wd = ext.x
   ht = ext.y
   area = wd*ht
   aratio = float(ht)/wd
   if targetWidth:
     factor = min(targetWidth/float(wd),maxBlowup)
   elif targetHeight:
     factor = min(targetHeight/float(ht),maxBlowup)
   else:
     factor = min(math.sqrt(targetArea/float(area)),maxBlowup)
   return factor


imageResizes =   [("area",50000),("area",100000),("area",250000),("area",1000000),("height",100),("width",300)]
  
class ImageD():
  
  
  def __init__(self,topic=None):
    if topic:self.topic = topic
    
  mytype = "/type/imageD"


  def size(im):
    dim = im.dimensions
    x = dim["x"]
    y = dim["y"]
    return Point(x,y)

  
  def dynsave(self,isNew=True):
    self.publish() # keep the s3 version up to date
    tags = getattr(self,"tags",None)
    if tags:
      # boto seems to have a problem with "[]". Hard to believe, but there we are.
      jtags = json.dumps(tags)
      self.tags = jtags
    else:
      self.tags = ""
    dynamo.saveImage(self,isNew)
    self.tags = tags

  """
{'tilingDepthBump': 0, 'zoomDepthBump': 3, 'tags': [], 'isPublic': 1, 'topic': '/image/4294b0e/young_knight_in_a_landscape', 'create_time': -1, 'year': '1510', 'owner': '/user/4294b0e',
  'current_item_create_time': 1349655074865, 'description': '', 's3Storage': 179043813,
  'dimensions': {u'y': 23911, u'x': 16641}, 'license': 'none', 'author': 'Vittore Carpaccio', 'tilingDepth': 7, 'untiledDimensions': {u'y': 1198, u'x': 834},
    'name': 'young_knight_in_a_landscape', 'source': 'http://upload.wikimedia.org/wikipedia/commons/0/0e/Vittore_Carpaccio_-_Young_Knight_in_a_Landscape_-_Google_Art_Project.jpg', 'localStorage': 0, 'atS3': 1,
    'beenTiled': 1, 'title': 'Portrait of a Knight', 'type': '/type/imageD', 'externalLink': 'http://en.wikipedia.org/wiki/Portrait_of_a_Knight_(Carpaccio)'}


tableProps["Image"] = ["externalLink","dimensions","untiledDimensions","author","title","owner","extension","tags",
              "tilingDepthBump","description","name","zoomDepthBump","year","tilingDepth","license","shared",
              "beenTiled","atS3","current_item_create_time","source","isPublic","deleted","localStorage","s3Storage"]
"""
  def compute_json(self,wrapInStatus=False):
    vprint("compute_json")
    itm = time.time()
    rs = {}

    models.setProperties(rs,self.__dict__,["topic","title","description","dimensions","owner","author","tags",
                                           "year","license","shared","current_item_create_time","source","s3Storage"])
    if wrapInStatus:
      rs = {"status":"ok","value":rs}
    return json.dumps(rs)
  
  
  
  def publish(self):
    js = self.compute_json(False)
    #wd = self.genWidget()
    tp = self.topic
    #tp = tp[1:] # get rid of extra slash
    #tps = tp.split("/")
    #rpath = tps[1]+"/"+tps[2]  # relative path to the image's directory
    #topicdir = "/topicd/" if constants.publishToS3Dev else "/topic/"

    s3path = constants.topicDir+tp+"/main.json" #the path where the page will finally end up
    vprint("Publishing to ",s3path)
    #wpath = tp +"/widget.js"
    #fln = constants.topicRoot + jpath
    #vprint("WRITING TO ",fln)
    #models.writeFile(fln,js)
    #models.writeFile(constants.topicRoot + wpath,wd)
    s3.s3SetContents(s3path,contents=js,relativeTo="",contentType="application/json")
  
    
  def fixIncomingTags(self):
    jtags = getattr(self,"tags",None)
    if jtags:
      tags = json.loads(jtags)
      self.tags = tags
    else:
      self.tags = []


  def userId(self):
    """ deprecated """
    ut= self.user
    lsl = ut.rindex("/")
    return ut[lsl+1:]

  def ownerId(self):
    ot = self.owner
    if not ot: ot = self.user # for backward compatibility
    lsl = ot.rindex("/")
    return ot[lsl+1:]
  
  
  # relative imageRoot
  def rimDir(self):
    u = self.ownerId()
    name = self.name
    return u +"/" + name + "/"
  
   
  def imDir(self):
    return imageRoot + self.rimDir()
  
    
  def createDirs(im):
    imdir = im.imDir()
    u = im.ownerId()
    vprint("IMDIR",im.name,u,imdir)
    createIfMissing(imageRoot + u)
    createImDirs(imdir)
  
  
    

  
  """ "stepped down images", by factors of 2,4,8 etc are in <imdir>/step1, <imdir>/step2 etc
  resizeName is the name of the directory into which to put the result, eg "resizeh100"
  if step is defined, then this is a step-down operation, and factor will always be 2  """

  

  def numStepsDown(im) :
    """ get the area down to thumbnail size: 10000  """
    dim = im.dimensions
    x = dim["x"]
    y = dim["y"]
    area = x * y
    if area < 10000:
      return 0
    afactor = area/float(10000)
    rs =  int(math.ceil(math.log(afactor,4)))
    vprint(area/math.pow(4,rs))
    return rs
  
  """ when reducing image res, reduce from the next larger stepped down version"""
  
  def whichStepForFactor(im,factor):
    if factor >= 1:
      return 0
    tns = im.numStepsDown()
    ifactor = 1.0/factor
    return max(min(int(math.floor(math.log(ifactor,2))),tns)-1,0) # -1 for conservatism
      
  
  
  
  def stepFile(im,step):
    return im.imDir() + "stepdown/s_" + str(step)+".jpg"
   
  
  def resizeFile(im,resizeName):
    return  im.imDir() + "resized/" + resizeName+".jpg"
  
  
  
  # relative to imageRoot
  def allFiles(im,forS3=True,tilesOnly=False):
    def addFiles(files,rimdir,subdir):
      dir = constants.imageRoot + rimdir + subdir
      def isFile(fl):
        ffl = constants.imageRoot + fl
        return os.path.isfile(ffl)
      if os.path.exists(dir):
        cn = os.listdir(dir)
        dfiles = [rimdir+subdir+"/"+fl for fl in cn]
        vprint("DFILES",dfiles)
        files.extend(filter(isFile,dfiles))
        #files.extend([rimdir+subdir+"/"+fl for fl in cn])
    files = []
    rim = im.rimDir()
    if not tilesOnly:
      addFiles(files,rim,"")
      addFiles(files,rim,"resized")
    addFiles(files,rim,"tiling")
    if not forS3:
      addFiles(files,rim,"snap")
      addFiles(files,rim,"snapthumb")
      addFiles(files,rim,"stepdown")
    return files

  def tileFiles(self):
    dp = getattr(self,"tilingDepth",None)
    if dp == None:
      return []
    tl = Tiling(self,depth=dp)
    tl.createTiles()
    rim = self.rimDir()
    return [rim + "tiling/" + tile.id + ".jpg" for tile in tl.tiles]
      
  
  def resizeFiles(self):
    rim = self.rimDir()
    return [rim  + "resized/" +rsz[0] + "_" + str(rsz[1]) + ".jpg" for rsz in imageResizes]
  
  def stepdownFiles(self):
    rim  = self.rimDir()
    imdir = imageRoot + rim
    rs = []
    for idx in range(0,20):
      rpth = rim + "stepdown/s_"+str(idx)+".jpg"
      fpth = imageRoot + rpth
      if os.path.exists(fpth):
        rs.append(rpth)
      else:
        return rs
  
  def removeSubdir(self,name):
    # keep step 0
    imdir = self.imDir()
    dr = imdir + name
    if os.path.exists(dr):
      shutil.rmtree(dr)
      
  def removeAllFiles(im):
    for nm in ["resized","stepdown","tiling","snap","snapthumb"]:
      im.removeSubdir(nm)
  

      
    
  
  
  def reduceImageResByFactor(im,factor,resizeName):
    """ never expand an image; just copy it if factor > 1. src= in a web page will size if needed """
    ofln = im.resizeFile(resizeName)
    vprint("reduceImageResByFactor",factor,ofln)
    if factor >= 0.75: # not worth it to reduce by small amount
      ifln = im.stepFile(0)
      pim = openImageFile(ifln)
      pim.save(ofln,"JPEG",quality=jpegQuality)
      return  
    dim = im.dimensions
    x = dim["x"]
    y = dim["y"]
    if cropFromSource:
      ws=0
    else:
      ws = im.whichStepForFactor(factor)
    ifln = im.stepFile(ws)
    rx = int(x*factor)
    ry = int(y*factor)
    factor = factor * math.pow(2,ws)# start with an image that has already been reduced by this factor
    name = im.name
  
    vprint("WS",ws,"IFL",ifln,"OFL",ofln)
  
    stm = time.time()
    
    resizeImage(ifln,ofln,Point(rx,ry))
    """
    pim = openImageFile(ifln)
    sz = pim.size
    nsz = (rx,ry)
    
    rsz = pim.resize(nsz,Image.ANTIALIAS)
    rsz.save(ofln,"JPEG",quality=jpegQuality)
    """
   
    etm = time.time() - stm
    vprint("REDUCED "+ifln+"by factor ",factor," in ",etm)
    return
  
  def drawRect(im,snapnum,rect,area):
    rszn = "area_"+str(area)
    fln = im.imDir() + "resized/"+rszn+".jpg"
    pim =  Image.open(fln)
    crn = rect.corner
    xt = rect.extent
    p0 = (crn.x,crn.y)
    p1 = (crn.x+xt.x,crn.y)
    p2 = (crn.x+xt.x,crn.y+xt.y)
    p3 = (crn.x,crn.y+xt.y)
    prct = rect.toPIL()
    draw = ImageDraw.Draw(pim)
    draw.line((p0,p1,p2,p3,p0),fill=(200,0,255),width=2)
    rfl = im.rimDir() + "snap/"+str(area)+"_"+str(snapnum)+".jpg"
    ofl = imageRoot+rfl
    print "OFLeee",ofl
    pim.save(ofl,"JPEG",quality=jpegQuality)
    s3.s3SaveFile(rfl,relativeTo="images",contentType="image/jpeg")

    
    
    
    
    
    

  
  def stepDownImageOnce(im,step,returnSize = True):
    dim = im.dimensions
    x = dim["x"]
    y = dim["y"]
    if stepFromSource:
      factor = 1/math.pow(2,step+1)
    else:
      factor = 0.5
    if not stepFromSource: # start with an image that has already been reduced by this factor
      factor = factor / math.pow(2,step)
    rx = int(x*factor)
    ry = int(y*factor)
    bx = str(rx)+"x"+str(ry)
  
    u = im.ownerId()
    name = im.name
    if stepFromSource:
      ifl = im.stepFile(0)
    else:
      ifl = im.stepFile(step)
   
    ofl = im.stepFile(step+1)
    vprint("IFL",ifl,"OFL",ofl)
    stm = time.time()
    pim = openImageFile(ifl)
    nsz = (rx,ry)
  
    #sz = pim.size
    rsz = pim.resize(nsz,Image.ANTIALIAS)
    rstm = time.time()
    vprint("REDUCED "+ifl+"by factor ",factor," in ",rstm-stm)
    rsz.save(ofl,"JPEG",quality=jpegQuality)
    vprint("SAVED in ",time.time() - rstm)
    rs  = 0
    if returnSize:
      rs = os.path.getsize(ofl)
    etm = time.time() - stm
    #vprint("REDUCED "+ifl+"by factor ",factor," in ",etm)
    return rs
  
  def stepDownImage(im,returnSize=True):
    
    ifl = im.stepFile(0)
    sz = 0
    if returnSize:
      sz = os.path.getsize(ifl)
    ns = im.numStepsDown()
    for i in range(0,ns):
      sz += im.stepDownImageOnce(i)
    return sz
   
    
  def reduceImageArea(im,area):
    """ scale down to something web displayable, for the gallery page: shoot for about 50,000 pixels """
    dim = im.dimensions
    x = dim["x"]
    y = dim["y"]
    sz = x * y
   
    factor  = math.sqrt(float(area)/sz)
    rx = int(x*factor)
    ry = int(y*factor)
    im.untiledDimensions = {"x":rx,"y":ry}
    im.dynsave()
    rszn = "area_"+str(area)
    im.reduceImageResByFactor(factor,rszn)
   
  
  def reduceImageWidth(im,width):
    """ eg scale down to something suitable for facebook; 300px """
    dim = im.dimensions
    x = dim["x"]
    factor  = float(width)/x
    rszn = "width_"+str(width)
    im.reduceImageResByFactor(factor,rszn)
    
    
    
  
  def reduceImageHeight(im,height):
    dim = im.dimensions
    y = dim["y"]
    factor  = float(height)/y
    rszn = "height_"+str(height)
    im.reduceImageResByFactor(factor,rszn)

  def reduceImage(im,d):
    """ d is a tuple (what,value), eg "area",50000 """
    what = d[0]
    value = d[1]
    if what=="width":
      im.reduceImageWidth(value)
    elif what=="height":
      im.reduceImageHeight(value)
    elif what == "area":
      im.reduceImageArea(value)
    else:
      raise Exception("bad call to reduceImage")
  
   # outfile is relative to imDir(im)
   # exactSize argument gone
   
 
  
  def cropImage(im,rct,outfile,targetWidth=None,targetHeight=None,targetArea=None,fromSource=True):
    """
    one of targetWidth,targetHeight, targetArea should be set
    
    the factor is set to the ratio of rct width or height or area to targetWidth,targetHeight,targetArea which ever is defined.
    choose as source the stepdown with the factor next less than what is desired
    
    """
    ext = rct.extent
    """
    wd = ext.x
    ht = ext.y
    area = wd*ht
    aratio = float(ht)/wd
    if targetWidth:
      factor = min(targetWidth/float(wd),1.0)
    elif targetHeight:
      factor = min(targetHeight/float(ht),1.0)
    else:
      factor = min(targetArea/float(area),1.0)
    vprint("factor",factor)
    """
    factor = cropFactor(rct.extent,targetWidth,targetHeight,targetArea)

    #NEEDS WORK I THINK: case where cropFromSource = False
    if fromSource:
      ws = 0
      srcSz = im.size()
      vprint("SOURCE SIZE ",srcSz)
      cropRect = rct
      efactor = factor # the actual amount of scaling done
    else:
      ws =  im.whichStepForFactor(factor) # which step down to use; we need to scale down the crop rect appropriately
    #efactor = factor*(math.pow(2,ws))
      cropRect = rct.scale(1.0/math.pow(2,ws))  # scale the crop rect down as much as the image has been in stepdown
      imsz = im.size()
      srcSz = scalePoint(imsz,1.0/math.pow(2,ws))
      efactor = factor/math.pow(2,ws)
    finalsize = scalePoint(ext,factor)
    ifln = im.stepFile(ws)
    stm = time.time()
    ofln = im.imDir() + outfile+".jpg"
    #vprint("CROP",ws,area,targetArea,"factor",factor,"efactor",efactor,ifln,ofln,"croprect",cropRect,"FINALSIZE",finalsize)
    
    rs = cropImage(ifln,ofln,srcSz,cropRect,finalsize)
    """
    pim = openImageFile(ifln)
    prct = srct.toPIL()
    cim = pim.crop(prct)
    if abs(efactor - 1.0) < 0.001:
      fim = cim
    else:
      nsz =  (int(round(fwd)),int(round(fht)))
      fim = cim.resize(nsz,Image.ANTIALIAS)
    ofln = im.imDir() + outfile+".jpg"
    fim.save(ofln,"JPEG",quality=jpegQuality,optimize=1)
    """
    etm = time.time() - stm
    vprint("CROPPED "+ifln+"to ",ofln,rct," scaled to ",targetWidth,targetHeight," factor ",factor," in ",etm)
    return rs
 
  # do the cropping out of a tile at subrect; tile is assumed to contain rect
  def cropFromTile(im,tiling,rct,outfile,targetWidth=None,targetHeight=None,targetArea=None):
    tile = tiling.findCoveringTile(rct)
    vprint("COVERINGTILE ",tile,"RECT",rct)
    tex = tile.extent # extent of the tile image
    vprint("TEX ",tex)
    tc = tile.corner
    tcv = tile.coverage # in image coords
    rc = rct.corner
    rcr = rc.difference(tc) # corner of relative rect
    vprint("RCR ",rcr)
    sc = tile.scaling()
    vprint("SCALING ",sc)
    srcr = rcr.scale(sc) # scaled relative corner
    srext = rct.extent.scale(sc) # scaled extent of the crop
    rrect = Rect(srcr,srext)
    vprint("RRECT",rrect)
    imDir = im.imDir()
    tilefile = imDir + "tiling/" + tile.id + ".jpg"
    r = tile.rect()
    factor = cropFactor(rrect.extent,targetWidth,targetHeight,targetArea)

    ofln = imDir + outfile+".jpg"
    finalsize = rrect.extent.scale(factor)
    vprint("FACTOR ",factor,"FINALSIZE ",finalsize)
    vprint("OFLN",ofln)
    rs = cropImage(tilefile,ofln,tex,rrect,finalsize)
  
 
  def deleteFromS3(im):
    """  @todo delete the resized files too. but they are tiny so no hurry """
    files = im.tileFiles()
    files.extend(im.resizeFiles())
    vprint("deleting from s3",files)
    s3.s3DeleteKeys(files)
  
  """ just a bit crude, but so what? """
  def deleteStepdowns(self,fromIdx=0):
    imdir = self.imDir()
    for idx in range(fromIdx,20):
      try:
        pth = imdir + "stepdown/s_"+str(idx)+".jpg"
        os.unlink(pth)
      except Exception:
        pass    
    
    
    

    
  def delete(im,fromS3=True,force=False):
    if (not force) and (not im.deleteable()):
      return
    vprint("DELETE DELETING THE ALBUMS ",im.topic)
    im.deleteAlbums()
    vprint("DELETING FILES FOR ",im.topic)
    if fromS3: im.deleteFromS3()
    im.removeAllFiles()
    vprint("DELETE DELETING THE IMAGE ",im.topic)
    dynamo.deleteImage(im.topic)




  def albumTopics(im):
    return dynamo.albumTopicsForImage(im.topic)
    
  def deleteAlbums(im):
    import model.album
    album = model.album
    atps = im.albumTopics()
    albs = []
    imtp = im.topic
    for atp in atps:
      alb = album.AlbumD(atp)
      alb.image = imtp
      #albs.append(alb)
      vprint("DELETING "+atp)
      alb.delete()
    return atps
  
  """ check for the case of an image which has albums owned by users other than the owner of the image """
  """ the shared property of an image should reflect this, but just to be sure """
  
  def deleteable(im):
    import model.album
    album = model.album
    imowner = im.owner
    atps = im.albumTopics()
    for atp in atps:
      alb = album.loadAlbumD(atp)
      if alb:
        albowner = alb.owner
        vprint("im",im.topic,"alb",alb.topic,"imowner",imowner,"albowner",albowner)
        if albowner != imowner:
          return False
    return True
  
    

  """ move a jpeg form of the image to the s0 stepdown """
  def jpegify(im):
    imDir = im.imDir()
    fln = imDir + "import"
    vprint("FILE",fln)
    try:
      pim = openImageFile(fln)
    except IOError as err:
      return False
    frm = pim.format
    ofln = im.stepFile(0)
    if frm == "JPEG":
      shutil.move(fln,ofln)
    else:
      pim.save(ofln,"JPEG",quality=jpegQuality)
    

  def finishImport(im,pageStore={}):
    #pdb.set_trace()
    im.jpegify()
    im.stepDownImage()
    for d in imageResizes: #[("area",50000),("height",100),("width",300)]:
      im.reduceImage(d)
    tl  = Tiling(im,256,1);
    tl.createTiles([])
    tl.createImageFiles()
    files = im.resizeFiles()
    files.extend(im.tileFiles())
    for fl in files:
      sz = s3.s3SaveFile(fl,relativeTo="images",contentType="image/jpeg")
    imdir = im.imDir()
    
    saveFileSizes(imdir+"resized",pageStore)
    saveFileSizes(imdir+"tiling",pageStore)
    im.beenTiled = 1
    im.atS3  = 1
    im.dynsave()
 

  def toS3(im):
    files = im.resizeFiles()
    files.extend(im.tileFiles())
    cnt = 0
    ln = len(files)
    for fl in files:
      if cnt%10 == 0:
        print "Sent "+str(cnt)+" of "+str(ln)+" files"
      cnt = cnt + 1
      s3.s3SaveFile(fl,relativeTo="images",contentType="image/jpeg")
     
 
  def genSnapInContextH(self,snapnum,cropnum,ssc=0.4,area=250000):
    #pdb.set_trace()
    idr = self.imDir()
    nmp = "snap/"+str(area)+"_"+str(snapnum)
    imwsnapf = idr + nmp + ".jpg"
    snapimf = idr + "snap/"+str(cropnum)+".jpg"
    snapim =  Image.open(snapimf)
    imwsnap = Image.open(imwsnapf)
    x1 = imwsnap.size[0]
    x2 = snapim.size[0]
    y1 = imwsnap.size[1]
    y2 = snapim.size[1]
    hgap = 40
    vgap = 40
    #ssc = 0.7
    sx2 = int(x2*ssc)
    sy2 = int(y2 * ssc)
    snapresized = snapim.resize((sx2,sy2),Image.ANTIALIAS)
    wd = x1 + sx2 + 3 * hgap;
    ht = max(y1,sy2) + 2*vgap
    y1d = (ht - y1)/2
    y2d = (ht - sy2)/2
    rsim = Image.new('RGB',(wd,ht))
    rsim.paste(imwsnap,(hgap,y1d))
    rsim.paste(snapresized,(2*hgap + x1,y2d))
    rpath = nmp+"_ctxh.jpg"
    ofln =  idr + rpath
    rfl = self.rimDir()  + rpath
    rsim.save(ofln,"JPEG",quality=jpegQuality)
    s3.s3SaveFile(rfl,relativeTo="images",contentType="image/jpeg")





  def genSnapInContextV(self,snapnum,cropnum,ssc=0.4,area=250000):
    #pdb.set_trace()
    idr = self.imDir()
    nmp = "snap/"+str(area)+"_"+str(snapnum)
    imwsnapf = idr + nmp + ".jpg"
    snapimf = idr + "snap/"+str(cropnum)+".jpg"
    snapim =  Image.open(snapimf)
    imwsnap = Image.open(imwsnapf)
    x1 = imwsnap.size[0]
    x2 = snapim.size[0]
    y1 = imwsnap.size[1]
    y2 = snapim.size[1]
    gap = 40
    #ssc = 0.7
    sx2 = int(x2*ssc)
    sy2 = int(y2 * ssc)
    snapresized = snapim.resize((sx2,sy2),Image.ANTIALIAS)
    wd = max(x1,sx2) + 100
    x1d = (wd - x1)/2
    x2d = (wd - sx2)/2
    rsim = Image.new('RGB',(wd,y1+sy2+3*gap))
    rsim.paste(imwsnap,(x1d,gap))
    rsim.paste(snapresized,(x2d,y1+2*gap))
    rpath = nmp+"_ctxv.jpg"
    ofln =  idr + rpath
    rfl = self.rimDir()  + rpath
    rsim.save(ofln,"JPEG",quality=jpegQuality)
    s3.s3SaveFile(rfl,relativeTo="images",contentType="image/jpeg")


def loadImageD(topic,pageStore=None):
  vprint("loadImageD",topic,pageStore)
  rs = "missing"
  if pageStore:
    ibt = pageStore.get("imagesByTopic",None)
    if ibt:
      rs = ibt.get(topic,"missing")
    if rs != "missing":
      return rs
  d = dynamo.getImage(topic)
  if d == None:
    rs = None
  else:
    rs = ImageD(topic)
    rs.__dict__.update(d)
    rs.fixIncomingTags()
  if pageStore:
    if not ibt:
      ibt = {}
      pageStore["imagesByTopic"] = ibt
    ibt[topic] = rs
  return rs

def allImages(userId = None,publicOnly=False):
  rs = []
  ims = dynamo.allImages()
  for im in ims:
    if userId:
      if im.get("owner",None) != userId:
        continue
    if publicOnly:
      if not im.get("isPublic",None):
        continue
    #if (not onlyAtS3) or im.get("atS3",None):
    imr = ImageD(im["topic"])
    imr.__dict__.update(im)
    imr.fixIncomingTags()
    rs.append(imr)
  return rs


def userImages(user):
  tp = user.topic
  return allImages(tp)
  
models.UserD.images = userImages # make this a method of UserD


def getImages(topics):
  rs = []
  ims = dynamo.getImages(topics)
  for im in ims:
    imr = ImageD(im["topic"])
    imr.__dict__.update(im)
    rs.append(imr)
  return rs  



def albumCounts():
  cnts = {}
  tab = dynamo.getTable("ImageToAlbums")
  ss = tab.scan()
  for i in ss:
    im = i["image"]
    published = i.get("published",None)
    if published:
      cc = cnts.get(im,None)
      if cc==None:
        cnts[im] = 1
      else:
        cnts[im] = cc + 1
  return cnts
    

  
  

" @todo check if there are albums associated with this image, and delete them too"
"""
def deleteImage(topic):
  tps = topic.split("/")
  usr = tps[2]
  imn = tps[3]
  path = "/mnt/ebs1/imagediver/image/"+usr+"/"+imn
  def deleteExt(ext):
    fp = path+ext
    if os.path.exists(fp):
      os.unlink(fp)
  deleteExt("")
  deleteExt(".err")
  deleteExt(".identt")
  deleteExt(".cache")
  dynamo.deleteImage(topic)
"""

def addImageToDb(user,imname,source=None):
  im = newImageD(user,imname)
  imDir = im.imDir()
  fln = imDir + "import"
  vprint("FILE",fln)
  try:
    pim = openImageFile(fln)
  except IOError as err:
    return False
  frm = pim.format
  sz = pim.size
  area = sz[0] * sz[1]
  if 0 and (area > 500000000):
  #if area > 10000:
    raise Exception("toBig",sz[0],sz[1])
  im.dimensions = {"x":sz[0],"y":sz[1]}
  im.source = source
  im.dynsave(True)
  return im
  
  

  

openedImageFiles = {}

def openImageFile(fl):
  #return Image.open(fl)
  ofl = openedImageFiles.get(fl,None)
  if ofl == None:
    #vprint("opening image file ",fl)
    ofl = Image.open(fl)
    #vprint ("opened image file ",fl)
    openedImageFiles[fl] = ofl
  return ofl

def newImageD(user,name,dimensions=None):
  topic = "/image/"+user+"/"+name
  rs = ImageD(topic)
  rs.owner = "/user/"+user
  rs.name = name
  # 2 obsolete fields - axe them soon
  rs.tilingDepthBump = 0
  rs.zoomDepthBump = 3
  rs.beenTiled = 0
  rs.atS3 = 0
  if dimensions:
    rs.dimensions = dimensions
  return rs
"""
def importImage(user,imname,ifl)
  ffl = imDir(im)
"""  
  

def PILtest(topic):
  tps = topic.split("/")
  fln = "/mnt/ebs1/imagediver"+topic+".jpg"
  pim = Image.open(fln)
  return pim

  

""" the Tiling code is the python translation of routines in javascript in www/js/image.js
see these files for docs """
"""
now we generate two other sets of tiles for fast snapping.
these tiles have resolution 1024 x 1024, and start at a lower depth
there are three sets, the first "s" just a high res version of the original tiling, the too other "t" and "w" form a crosshair within the tile

"""

def pathJoin(p):
     rs = ""
     for pe in p:
       rs += str(pe)
     return rs

maxTilingDepth = 7
class Tiling:
  def __init__(self,image,tileImageSize=256,aspectRatio=1.0,depthIncrement=0,depth=None):
    di=depthIncrement
    self.image = image;
    imxt = image.dimensions    
    height = imxt["y"]
    width = imxt["x"]
    # specialized to images whose actual aspect ratio is less than the stated value (eg panoramas)
   
    #ln2 = math.log(2)
    topTileSizeH = math.pow(2,math.ceil(math.log(height,2)));
    topTileSizeW= math.pow(2,math.ceil(math.log(width,2)));
    topTileSize = max(topTileSizeH,topTileSizeW);
    """ recursion depth
        subdivide until tile size = target image size (ie no loss in resolution)
    """
    if depth:
      self.depth = depth
    else:
      self.depth =   min(maxTilingDepth,int(math.ceil(math.log(topTileSize/tileImageSize,2))+di));
    vprint("DEPTH ",self.depth)
    self.aspectRatio = aspectRatio; # of the tiles
    self.topTileSize = topTileSize;
    self.tiles = [];
    self.tilesById = {}
    self.tileImageSize = tileImageSize; # the  dimension of the jpg (or png) for a tile.

  def ownerId(self):
    im = self.image
    return im.ownerId()
    
    #lsl = ut.rindex("/")
    #return ut[lsl+1:]
  
  def newTile(self,path,k,parent):
   
    id = k+pathJoin(path)
    byId = self.tilesById;
    tl = byId.get(id,None)
    if tl: return tl;
    rs = Tile(self,list(path));
    rs.id = id;
    rs.kind = k;
    tim = self.image;
    timxt = tim.dimensions
    tts = self.topTileSize;
    csz = tts;
    cx = 0;
    cy = 0;
    ar = self.aspectRatio;
    for cpe in path:
      csz = csz/2;
      if cpe==1:
        cx = cx + csz
      elif cpe==2:
        cy = cy + ar*csz
      elif cpe==3:
        cx = cx + csz;
        cy = cy + ar*csz;
    hsz = 0.5 * csz
    rs.size = csz
    if k=="r":
      rs.corner = Point(cx,cy)
      rs.coverage = Point(csz,csz)
    elif k=="s":
      rs.corner = Point(cx,cy)
      rs.coverage = Point(csz,csz)
    elif k=="o": # "offset
      rs.corner = Point(cx+hsz,cy+hsz)
      rs.coverage = Point(csz,csz)
    elif k=="t":
      rs.corner = Point(cx+hsz,cy)
      rs.coverage = Point(csz,hsz)
    elif k=="l":
      rs.corner = Point(cx,cy+hsz)
      rs.coverage = Point(hsz,csz)
    rs.id = id;
    outside = (rs.corner.x >= timxt["x"]) or (rs.corner.y >= timxt["y"]) # this tile is outside of the original image
    byId[id] = rs;
    if not outside: self.tiles.append(rs);
    rs.outsideImage = outside;
    rs.computeExtent();
    return rs;
 

  def tilesForSnap(self,path):
    pj = pathJoin(path)
    sid = "s"+pj
    byid = self.tilesById
    st = byid.get(sid,None)
    
    if st:
      rs = [st,byid["o"+pj]]
      if st.onTopRow():
        rs.append(byid["t"+pj])
      if st.onLeftColumn():
        rs.append(byid["l"+pj])
      return rs
    return None
  
  
  """ path with last x position incremented; ie square just to right """
  def pathX1Y0(self,path):
    ln = len(path)
    if ln==0: return None
    lst  = path[ln-1]
    rs = None
    if lst == 0:
      rs = path[0:ln-1]
      rs.append(1)
    if lst == 2:
      rs = path[0:ln-1]
      rs.append(3)
    return rs
  
  def pathX0Y1(self,path):
    ln = len(path)
    if ln==0: return None
    lst  = path[ln-1]
    rs = None
    if lst == 0:
      rs = path[0:ln-1]
      rs.append(2)
    if lst == 1:
      rs = path[0:ln-1]
      rs.append(3)
    return rs  
   
    
    
  def pathX1Y1(self,path):
    ln = len(path)
    if ln==0: return None
    lst  = path[ln-1]
    rs = None
    if lst == 0:
      rs = path[0:ln-1]
      rs.append(3)
    return rs

  def smallestTile(self,tls):
    rs = None
    maxlen = -1
    for tl in tls:
      if tl==None:
        continue
      plen = len(tl.path)
      if plen > maxlen:
        maxlen = plen
        rs = tl
    return rs
    
  def findCoveringTile(self,rct,path=[]):
    #if len(path) > 2:return None
    self.createTiles(path,"r",None,False)
    tfs = self.tilesForSnap(path)
    if tfs==None: return None
    
    def fprint(*args):
      if False: printargs(args)
   
    def copyAndAppend(path,v):
      npath = []
      npath.extend(path)
      npath.append(v)
      return npath
    cnd = None # candidate
    ctile = tfs[0]
    if ctile.area() < rct.area(): return None
    srect = ctile.rect()
    intr = srect.intersects(rct)
    for tl in tfs:
      if tl.outsideImage:
        continue
      tlr = tl.rect()
      fprint("TILERECT",tl.id,tlr)
      fprint("RECTINPUT",rct)
      if tlr.containsRect(rct):
        fprint(tl.id,"CONTAINS")
        cnd = tl
        break
    def lookInSubTiles(path):
      if path==None: return None
      for idx in range(0,4):
        a0 = self.findCoveringTile(rct,copyAndAppend(path,idx))
        if a0: return a0
    if intr:
      fprint("CANDIDATE ",cnd)
      rs00 = lookInSubTiles(path)
      rs10 = lookInSubTiles(self.pathX1Y0(path))
      rs01 = lookInSubTiles(self.pathX0Y1(path))
      rs11 = lookInSubTiles(self.pathX1Y1(path))
      return self.smallestTile([cnd,rs00,rs10,rs01,rs11])
    return None
        
 
  def findIntersectingTiles(self,rct,depth,path=[]):
    #if len(path) > 2:return None
    self.createTiles(path,"r",None,False)
   
    def fprint(*args):
      if 0: printargs(args)
    
    pj = pathJoin(path)
    rid = "r"+pj
    fprint("RID",rid)
    byid = self.tilesById
    ctile = byid.get(rid,None)
    if ctile.outsideImage:
      return []
    srect = ctile.rect()
    intr = srect.intersects(rct)
    if not intr:
      fprint("INTERSECTS")
      return []
    if depth == len(path):
      return [ctile]
    rs = []
    for idx in range(0,4):
      epth = path[:]
      epth.append(idx)
      rs.extend(self.findIntersectingTiles(rct,depth,epth))
    return rs
        
      
         
    

  def createTiles(self,path=[],kind="r",parent=None,recursive=True):
    
    id = kind+pathJoin(path)
    byId = self.tilesById;
    extl = byId.get(id,None)
    if extl:return
    
    d = self.depth
    cd = len(path)
    if path==None: path = []
    tl = self.newTile(path,"r",parent);
    if tl.outsideImage: return;
  
    if (not onlyRtiles) and (cd < d):
      self.newTile(path,"s",parent)
      self.newTile(path,"o",tl)
      if tl.onTopRow():
        self.newTile(path,"t",tl)
      if tl.onLeftColumn():
        self.newTile(path,"l",tl)
    ln = len(path)
    d = self.depth;
 
    if (ln < d) and recursive:
      path.append(0);
      self.createTiles(path);
      path.pop();
      path.append(1);
      self.createTiles(path);
      path.pop();
      path.append(2);
      self.createTiles(path);
      path.pop();
      path.append(3);
      self.createTiles(path);
      path.pop();
 

  def createImageFiles(self,recorder=None):
    tiles = self.tiles
    cnt = 0
    for tile in tiles:
      tile.createImageFile()
      cnt = cnt + 1
      if recorder and (cnt%10==0):
        if not recorder(tile,cnt):
          return
    self.image.tilingDepth = self.depth
        
         
  
  def assembleTiles(self,tiles,ofln=None):
    rects = [tile.rect() for tile in tiles]
    crect = containerOfRects(rects)
    crc = crect.corner
    mcr = crc.minus()
    rrects = [r.translate(mcr) for r in rects]
    tls = tiles[0].scaling()
    srrects = [r.scale(tls) for r in rrects]
    rsim = Image.new('RGB',crect.extent.scale(tls).ituple())
    ln = len(tiles)
    for i in range(0,ln):
      tile = tiles[i]
      rr = srrects[i]
      fln = tile.filename()
      tim = openImageFile(fln)
      rsim.paste(tim,rr.corner.ituple())
    if ofln: rsim.save(ofln,"JPEG",quality=jpegQuality)
    return (crect,rsim)

  def cropFromTiles(self,ofl,rct,targetWidth=None,targetHeight=None,targetArea=None,asmFile=None):
    #depth = 5
    
    def fprint(*args):
      if 0: printargs(args)
   
    """ computation of depth. Without loss of generality assume a squarish rect. We want targetWidth to cross over targetWidth/256 tiles.
    Call this dcnt (desired count)
    So we want tiles whose width (in TileSpeak)  is  dwd = width(rct)/dcnt. So the depth should be logbase2( topTileWidth/dwd)"""
    if targetWidth:
      tdim = targetWidth
    elif targetHeight:
      tdim = targetHeight
    else:
      tdim = math.sqrt(targetArea)
    dcnt = tdim/256.0
    rxt = rct.extent
    dwd = max(rxt.x,rxt.y)/dcnt
    ttl = self.tiles[0] # top tile
    ttodwd = (ttl.size)/dwd
    depth = min(self.depth,math.ceil(math.log(ttodwd,2)))
    fprint("tdim",tdim,"dcnt",dcnt,"dwd",dwd,"ttodwd",ttodwd,"depth",depth)
    
    itiles = self.findIntersectingTiles(rct,depth,[])
    vprint([itl.id for itl in itiles])
    asm = self.assembleTiles(itiles,asmFile)
    arect = asm[0]
    aim = asm[1]
    trct = rct.translate(arect.corner.minus())
    tls = itiles[0].scaling()
    strct = trct.scale(tls)
    imrect = arect.scale(tls)
    cropsize = strct.extent
    factor = cropFactor(cropsize,targetWidth,targetHeight,targetArea)
    finalsize = cropsize.scale(factor)
    imsize = imrect.extent
    fprint("rct",rct,"strct",strct,"arect",arect,"imrect",imrect,"finalsize",finalsize)
    cropImage(aim,ofl,imsize,strct,finalsize)

    #def cropImage(ifl,ofl,imsize,croprect,finalsize=None):

    


  


class Tile:
  def __init__(self,tiling,path):
    
    self.tiling = tiling;
    self.path = path;

  def __repr__(self):
    return repr(self.__dict__)
  
  
  def rect(self):
    return Rect(self.corner,self.coverage)
  
  def area(self):
    cv = self.coverage
    return cv.x * cv.y
  
  
  def scaling(self):
    " 1 pixel in image space maps to this many pixels in  tile space"
    cv = self.coverage
    ex = self.extent
    if cv.x > cv.y:
      return ex.x/cv.x
    else:
      return ex.y/cv.y
  
  def onTopRow(self):
    pth = self.path
    if len(pth)==0: return False
    for p in pth:
      if (p == 2) or (p == 3):
        return False
    return True
  
  
  def onLeftColumn(self):
    pth = self.path
    if len(pth)==0: return False
    for p in pth:
      if (p == 1) or (p == 3):
        return False
    return True
  
  
  """ computes the image extent of the tile in pixels. crops against the image """
  def computeExtent(self):
    if self.outsideImage:
      return
    tl = self.tiling;
    tim = tl.image;
    imxt = tim.dimensions
    imwd = imxt["x"]
    imht = imxt["y"]
    tsz = tl.tileImageSize;
    if self.kind != "r":
      tsz = tsz*4 # imdim size of the tile, along its longest dimension, uncropped
    sc = min(1.0,tsz/float(self.size)) # scaling from image pixels to tile pixels
    " now, crop the coverage against the image "
    cropx = min(imwd - self.corner.x,self.coverage.x)
    cropy = min(imht - self.corner.y,self.coverage.y)
    self.extent = Point(cropx * sc,cropy * sc)
    self.coverage = Point(cropx,cropy)
 
    
  def filename(self):
    im = self.tiling.image
    imdir = im.imDir()
    id = self.id
    return imdir + "tiling/" + id +".jpg"
  
  
  def createImageFile(self):
    if self.outsideImage: return;
    xt = self.extent;
    cv = self.coverage;
    cx = cv.x;
    cy = cv.y;
    ex = xt.x; 
    ey = xt.y;
    tl = self.tiling;
    ar = tl.aspectRatio;
    im = tl.image;
    imxt = im.dimensions
    imwd = imxt["x"]
    imht = imxt["y"]
    imsz = tl.tileImageSize;
    rct = Rect(self.corner,self.coverage)
    xt = self.extent
    dstfile = "tiling/"+self.id
    vprint("create image for",self," image ",im)
    im.cropImage(rct,dstfile,targetWidth=xt.x,fromSource=cropFromSource)
    return
  



#23m7dk5z
#https://www.dropbox.com/s/msrn1on0vy8la5z/Eve%20Pan%204.TIF
#https://www.dropbox.com/s/yfr9du0l3n1x7wt/Boston%20City%20Flow.jpg
def assembleImages(dstImName,dstImUser,images,options={"orientation":"vertical"},pageStore={}):
  #pdb.set_trace()
  dims = []
  hts = []
  pims = []
  for im in images:
    p = dictToPoint(im.dimensions)
    dims.append(p)
    hts.append(p.y)
    ifl = im.stepFile(0)
    pim = openImageFile(ifl)
    pims.append(openImageFile(ifl))
  # scale to the smallest of the relevant dimension (x for horizontal, y for vertical)
  mnht = min(hts)
  ln = len(pims)
  scdims = []
  sims = []
  #pdb.set_trace()
  for i in range(0,ln):
    cdim = dims[i]
    cim = pims[i]
    if mnht == cdim.y:
      sims.append(cim)
      scdims.append(cdim)
    else:
      sc = mnht/float(cdim.y)
      scdim = cdim.scale(sc).toInt()
      scdims.append(scdim)
      rsz = cim.resize(scdim.toPIL(),Image.ANTIALIAS)
      sims.append(rsz)
  " now, stack them up "
  #pdb.set_trace()
  rsx = max(dim.x for dim in scdims)
  rsy = ln * mnht
  rsim = Image.new('RGB',(rsx,rsy))
  rsim.paste((247,247,247),(0,0,rsx,rsy)) #specialhack for dollar bills
  for i in range(0,ln):
    rsim.paste(sims[i],(0,i*mnht))
  rs = newImageD(dstImUser, dstImName)
  rs.dimensions = {"x":rsx,"y":rsy}
  rs.dynsave(True)
  rs.createDirs()
  imDir = rs.imDir()
  fln = imDir + "import"
  rsim.save(fln,"JPEG",quality=jpegQuality)
  rs.finishImport()
  return im 
    

    
  

"""



PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

from model.image import Rect,Point
im = image.loadImageD('/image/e244d69/batoni_gidean')
im.publishAlbumList("/user/e244d69")


ofl = im.imDir()+ "/snap/200000_17.jpg"
#def drawRect(im,snapnum,rect,area):

rect = Rect(Point(120,120),Point(50,60))
im.drawRect(15,rect,250000)


image.loadImageD('/image/4294b0e/one_dollar_bill_4').toS3()
image.loadImageD('/image/4294b0e/the_dutch_proverbs').toS3()
image.loadImageD('/image/4294b0e/garden_of_earthly_delights').toS3()
image.loadImageD('/image/4294b0e/the_ambassadors').toS3()

image.loadImageD('/image/4294b0e/las_meninas').toS3()
image.loadImageD('/image/4294b0e/').toS3()


files = im.resizeFiles()
files.extend(im.tileFiles())

for fl in files:
   sz = s3.s3SaveFile(fl,relativeTo="images",contentType="image/jpeg")
 
 
  
topic = '/image/4294b0e/garden_of_earthly_delights'
d = dynamo.getImage(topic)

im = image.loadImageD(topic);


def artify(inm):
  topic = '/image/4294b0e/'+inm
  im = image.loadImageD(topic)
  im.tags = ["art","painting"]
  im.dynsave(False)


artify('Georg_Gisze')

artify('Saint_Francis_Bellini')
artify('las_meninas')



topic = '/image/4294b0e/the_dutch_proverbs'
im = image.loadImageD(topic);
im.tags = ['art','painting']
im.dynsave(False)



topic = '/image/4294b0e/the_ambassadors'
im = image.loadImageD(topic);
im.tags = ['art','painting']
im.dynsave(False)

im2 = image.loadImageD('/image/4294b0e/one_dollar_bill_4')
#im2.finishImport()

 

im0 = image.loadImageD('/image/4294b0e/one_dollar_bill_obverse')
im1 = image.loadImageD('/image/4294b0e/one_dollar_bill_reverse')

#ifl = im0.stepFile(0)
#pim = image.openImageFile(ifl)

image.assembleImages('one_dollar_bill_5','4294b0e',[im0,im1])



album.loadAlbumD('/album/4294b0e/garden_of_earthly_delights/2')


alb = album.loadAlbumD('/album/5ee275d/sistine1/1'
usr = models.loadUserD("/user/5ee275d")
ims = image.allImages("/user/5ee275d")
im = ims[0]
im.deleteAble()

im = image.loadImageD('/image/4294b0e/garden_of_earthly_delights')
im.deleteAble()


for im in ims:
  #print "deleting "+im.topic
  im.delete()



  
imd = image.loadImageD("/image/5ee275d/sistine7")


imd.delete()

imd = image.loadImageD("/image/5ee275d/big_ambassadors")

imd.delete()


imd.tileFiles()

imd.resizeFiles()

imd.deleteFromS3()

imd.deleteStepdowns(1)




tl = image.Tiling(imd,depth=imd.tilingDepth)
tl.createTiles()

tl.createTiles([]) #,kind="r",parent=None,recursive=False)
tl.createImageFiles()
"""
