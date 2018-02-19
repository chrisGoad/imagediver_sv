#!/usr/bin/env python

import math
import time
import hashlib
import store.theStore
theStore = store.theStore
import Logr
import os
import subprocess
"""
bridget senior vp
dana project manager
galena quality control
health care synergy = backoffice system
"""

def writeFile(path,txt):
  """ creates the directories if needed """
  pr = path.rsplit("/")
  cdir = "/"
  ln = len(pr)
  print path,pr
  for i in range(0,ln-1):
    p = pr[i]
    cdir = cdir + p + "/";
    if not os.path.exists(cdir):
      os.mkdir(cdir)
  ofl = open(path,"w")
  ofl.write(txt)
  ofl.close()
  

    
class Descriptor:
  def __init__(self,topic,loadIt=False):
    self.topic = topic
    mytype = self.__class__.mytype
    self.type = mytype
    if loadIt:
      self.load()
    
  def load(self):
    tp = self.topic
    cl = self.__class__
    mytype = cl.mytype
    d = theStore.descriptor(tp,mytype)
    Logr.log("model","LOADED "+str(d))
    if d==None:
      self.__notFound__=True
      return False
    self.__dict__.update(d)
    return True
  
  def save(self):
    if getattr(self,"__notFound__",None):
      del self.__notFound__
    theStore.insert(self.__dict__)
  
  def setProperty(self,property,value):
    tp = self.topic
    cl = self.__class__
    mytype = cl.mytype
    setattr(self,property,value)
    theStore.tripleSet(tp,mytype,property,value)
  
  
  def getProperty(self,property):
    tp = self.topic
    cl = self.__class__
    mytype = cl.mytype
    rs = theStore.tripleGet(tp,mytype,property)
    setattr(self,property,rs)
    return rs
  

def loadDescriptor(topic,cl):
  if type(topic)==list:
    rs = []
    for tp in topic:
      rs.append(loadDescriptor(tp,cl))
    return rs
  d = theStore.descriptor(topic,cl.mytype)
  Logr.log("model","LOADED "+str(d))
  if d==None:
    return None
  rs = cl(topic)
  rs.__dict__.update(d)
  return rs

  


def genId():
  import hashlib
  tm = time.time()
  tm = str(tm)+"n98235J"
  sid = hashlib.sha224(tm).hexdigest()
  return sid


class SessionD(Descriptor):
  mytype = "/type/SessionD"



def loadSessionD(sessionId):
  topic = "/session/"+sessionId;
  return loadDescriptor(topic,SessionD)
  
  
def hashPassword(pw):
  pwe = pw+" W26Pux7"
  return hashlib.sha224(pwe).hexdigest()



def pathLast(path):
  lsl = path.rindex("/")
  return path[lsl+1:]
  

class UserD(Descriptor):
  mytype = "/type/userD"



  def createUserDirs(self,knd):
    pth = "/mnt/ebs1/imagediver/"
    nm = self.name
    ud = pth + knd + "/" + nm
    if not os.path.exists(ud): os.mkdir(ud)
  
  
  def createDirs(self):
    self.createUserDirs("image")
    self.createUserDirs("resized")
    self.createUserDirs("snapthumb")
    self.createUserDirs("snap")
    self.createUserDirs("tilings")

  def setPassword(self,pw):
    hp = hashPassword(pw)
    self.setProperty("hashed_password",hp)
    
  def checkPassword(self,pw):
    hp = hashPassword(pw)
    return hp == self.hashed_password
  
  def newSession(self):
    id = genId()
    stopic = "/session/"+id
    rs = SessionD(stopic)
    rs.user = self.topic
    tm = int(time.time())
    rs.start_time = tm
    rs.save()
    return rs


def loadUserD(topic):
  return loadDescriptor(topic,UserD)
  
  


class ImageD(Descriptor):
  mytype = "/type/imageD"

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
  
  def createImDirs(self,knd,isdir):
    u = self.ownerId()
    pth = "/mnt/ebs1/imagediver/"
    ud = pth + knd + "/" + u
    nm = self.name
    if isdir:
      imd = ud+ "/" + nm
      if not os.path.exists(imd):
        os.mkdir(imd)
        
  def createDirs(self):
    u = self.ownerId()
    nm = self.name
    pth = "/mnt/ebs1/imagediver/"
    self.createImDirs("image",False)
    self.createImDirs("resized",False)
    self.createImDirs("snap",True)
    self.createImDirs("snapthumb",True)
    self.createImDirs("tilings",True)    
    
    

def loadImageD(topic):
  return loadDescriptor(topic,ImageD)
  

def reduceImageRes(topic):
  """ scale down to something web displayable: shoot for about 50,000 pixels """
  im = loadImageD(topic)
  #print im
  dim = im.dimensions
  x = dim["x"]
  y = dim["y"]
  sz = x * y
  #print x
  #print y
  #factor  = math.sqrt(700000.0/sz)
  factor  = math.sqrt(200000.0/sz)
  
  rx = int(x*factor)
  ry = int(y*factor)
  im.setProperty("untiledDimensions",{"x":rx,"y":ry})
  bx = str(rx)+"x"+str(ry)
  #print bx
  u = im.ownerId()
  name = im.name
  ext = im.extension
  ifln =  "/mnt/ebs1/imagediver/image/"+u+"/"+name+"."+ext
  rfln = "/mnt/ebs1/imagediver/resized/"+u+"/"+name+".jpg"
  #print ifln
  #print rfln
  subprocess.call(["convert",ifln,"-resize",bx,rfln]);



def reduceImageWidth(topic,width):
  """ eg scale down to something suitable for facebook; 300px """
  im = loadImageD(topic)
  #print im
  dim = im.dimensions
  x = dim["x"]
  y = dim["y"]
  sz = x * y
  #print x
  #print y
  #factor  = math.sqrt(700000.0/sz)
  factor  = float(width)/x
  
  rx = int(x*factor)
  ry = int(y*factor)
  #im.setProperty("untiledDimensions",{"x":rx,"y":ry})
  bx = str(rx)+"x"+str(ry)
  #print bx
  u = im.ownerId()
  name = im.name
  ext = im.extension
  ifln =  "/mnt/ebs1/imagediver/image/"+u+"/"+name+"."+ext
  rfln = "/mnt/ebs1/imagediver/resized"+str(width)+"/"+u+"/"+name+".jpg"
  print "REDUCING RES ",ifln,rfln,width
  #print ifln
  #print rfln
  subprocess.call(["convert",ifln,"-resize",bx,rfln]);
   
  
class ImagePairD(Descriptor):
  mytype = "/type/imagePairD"


def loadImagePairD(topic):
  return loadDescriptor(topic,ImagePairD)
  

class AlbumD(Descriptor):
  mytype = "/type/albumD"
  


def loadAlbumD(topic):
  return loadDescriptor(topic,AlbumD)

def newAlbum(imageTopic,user):
  imname = pathLast(imageTopic)
  uname = pathLast(user)
  albumid = str(theStore.incrementCounter("album."+imageTopic))
  topic = "/album/" +  uname + "/" + imname +"/"+albumid
  Logr.log("api","CREATING ALBUM "+topic)
  rs = AlbumD(topic)
  rs.image = imageTopic
  return rs
  
  

class SnapD(Descriptor):
  mytype = "/type/snapD"
      
      

def loadSnapD(topic):
  return loadDescriptor(topic,SnapD)
  

def deleteTopic(topic):
  """ just to avoid need to delve down to the Store level """
  theStore.deleteTopic(topic)



def deleteTopics(topic):
  """ just to avoid need to delve down to the Store level """
  theStore.deleteTopics(topic)

def numberAtEnd(s):
  rf = s.rfind("/")
  return int(s[rf+1:len(s)])


def snapsInAlbum(albumTopic):
  snaps = theStore.topicsWithPropertyValue('/type/snapD','album',albumTopic)
  snaps.sort(key=numberAtEnd)
  return snaps

def albumsForImage(imageTopic):
  return theStore.topicsWithPropertyValue('/type/albumD','image',imageTopic)
  
  
class UploadD(Descriptor):
  mytype = "/type/uploadD"
  

def loadUploadD(topic):
  return loadDescriptor(topic,UploadD)
  

def newUpload(name,user,exists=False):
  """ name is the name under which to save the upload; user is the name of the user (not eg the topic or object) """
  id = str(theStore.incrementCounter("upload"))
  Logr.log("upload","NEW UPLOAD "+id)
  topic = "/upload/" + id
  rs = UploadD(topic)
  rs.startTime = int(time.time())
  rs.name = name
  rs.user = user
  if exists:
    existInt=1
  else:
    existInt=0
  rs.exists = existInt
  rs.status = "notStarted"
  rs.save()
  return rs


def loadUpload(topic):
  return loadDescriptor(topic,UploadD)

""" the Tiling code is the python translation of routines in javascript in www/js/image.js
see these files for docs """


class Tiling:
  def __init__(self,image,tileImageSize,aspectRatio=1.0,depthIncrement=0):
    di=depthIncrement
    self.image = image;
    imxt = image.dimensions
    imext = image.extension
    imname = image.name
    
    height = imxt["y"]
    width = imxt["x"]
    # specialized to images whose actual aspect ratio is less than the stated value (eg panoramas)
    ln2 = math.log(2)
    topTileSizeH = math.pow(2,math.ceil(math.log(height)/ln2));
    topTileSizeW= math.pow(2,math.ceil(math.log(width)/ln2));
    topTileSize = max(topTileSizeH,topTileSizeW);
    """ recursion depth
        subdivide until tile size = target image size (ie no loss in resolution)
    """
    self.depth =   math.ceil(math.log(topTileSize/tileImageSize)/ln2)+di;# -1 for this app
    self.aspectRatio = aspectRatio; # of the tiles
    self.topTileSize = topTileSize;
    self.tiles = [];
    self.tilesById = {}
    u = self.ownerId()
    fln =  "/mnt/ebs1/imagediver/image/"+u+"/"+imname+"."
    if not os.path.exists(fln+"mpc"):
      subprocess.call(["convert",fln+imext,fln+"mpc"]);
    self.filename = fln + "mpc"
    dir = "/mnt/ebs1/imagediver/tilings/"+u+"/"+imname+"/"
    if not os.path.isdir(dir):
      os.mkdir(dir)
    self.directory = dir
    
    self.tileImageSize = tileImageSize; # the  dimension of the jpg (or png) for a tile.

  def ownerId(self):
    im = self.image
    return im.ownerId()
    
    #lsl = ut.rindex("/")
    #return ut[lsl+1:]
  
  def newTile(self,path):
    def pathJoin(p):
      rs = ""
      for pe in p:
        rs += str(pe)
      return rs
    id = "r"+pathJoin(path)
    byId = self.tilesById;
    tl = byId.get(id,None)
    if tl: return tl;
    rs = Tile(self,path);
    rs.id = id;
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
    rs.corner = Point(cx,cy);
    rs.size = csz; # this is the size without taking into consideration that the tile might be chopped off at the edget of the image
    
    rs.id = id;
    outside = (cx >= timxt["x"]) or (cy >= timxt["y"]) # this tile is outside of the original image
    byId[id] = rs;
    if not outside: self.tiles.append(rs);
    rs.outsideImage = outside;
    rs.computeExtent();
    return rs;
  

  def createTiles(self,path):
    if path==None: path = []
    tl = self.newTile(path);
    if tl.outsideImage: return;
    ln = len(path)
    d = self.depth;
 
    if ln < d:
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
 

  def createImageFiles(self):
    tiles = self.tiles
    for tile in tiles:
      tile.createImageFile()
         
  

class Point:
  def __init__(self,x,y):
    self.x=x
    self.y=y



class Tile:
  def __init__(self,tiling,path):
    
    self.tiling = tiling;
    self.path = path;


  def computeExtent(self):
    if self.outsideImage:
      return
    tl = self.tiling;
    ar = tl.aspectRatio;
    tim = tl.image;
    imxt = tim.dimensions
    imwd = imxt["x"]
    imht = imxt["y"]
    imsz = tl.tileImageSize;
    srcszx = self.size;
    srcszy = ar * srcszx;
    cr = self.corner;
    x = cr.x;
    y = cr.y;
    ex = min(imwd-x,srcszx); # only grab as many pixels as there are
    ey = min(imht-y,srcszy);
    imszx = math.floor(imsz * (ex/srcszx));
    imszy = math.floor(ar*imsz * (ey/srcszy));
    self.extent = Point(imszx,imszy); # the extent of the tile image
    self.coverage = Point(ex,ey);  #the number of pixels covered in the originl image by this tile
    
    
    
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
    tim = tl.image;
    imxt = tim.dimensions
    imwd = imxt["x"]
    imht = imxt["y"]
    imsz = tl.tileImageSize;
    cr = self.corner;
    x = cr.x;
    y = cr.y;
    dstfile = (tl.directory)+(self.id)+".jpg";
    """ fl = new File(dstfile);
    if (fl.exists()) {
      system.stdout(dstfile + " exists\n\n");
      return;
    }
    """
    tilefile =tl.directory+self.id+".jpg"
    if not os.path.exists(tilefile):
      cmd = "convert -quiet -size {imwd}x{imht} -depth 8 -extract {cx}x{cy}+{x}+{y} \
           -resize {ex}x{ey} {fname} {tilefile}".format(
      imwd=imwd,imht=imht,cx=int(cx),cy=int(cy),x=int(x),y=int(y),ex=int(ex),ey=int(ey),fname=tl.filename,tilefile=tilefile)
      cmda =  cmd.split()
      #print cmd
      subprocess.call(cmda)
    # cmd = "convert -quiet -size "+imwd+"x"+imht+" -depth 8 -extract "+cx+"x"+cy+"+"+x+"+"+y+ \
    #      " -resize "+ex+"x"+ey+" "+(tim.filename)+" "+(tl.directory)+(self.id)+".jpg";
    """ if (typeof system=="undefined") return cmd;
     system.stdout(cmd + "\n");
     lib.system(cmd);
     system.stdout("done\n\n");
    """
  
