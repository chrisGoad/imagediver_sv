#!/usr/bin/env python


import constants
execfile(constants.pyDir+"common_includes.py")

import hashlib
import os
import subprocess
import traceback
import store.dynamo
dynamo = store.dynamo
import urllib2
import store.jobs as jobs

import model.models as models
import model.image as image
import model.snap as snapm
import ops.s3 as s3



verbose = True
def vprint(*args):
  if verbose:
    misc.printargs(args)
   
SnapD = snapm.SnapD



class AlbumD():
  
  def __init__(self,topic=None):
    if topic:self.topic = topic
    
    
  mytype = "/type/albumD"
  
  def dynsave(self):
    return dynamo.saveAlbum(self)
    
  def dyndelete(self):
    return dynamo.deleteAlbum(self)

  # assumptions: the snap code keeps the snaps data in an album up to date.  Publishing an album only sets the album data.


  def computeTitle(self,imd):
    ittl = getattr(imd,"title",None)
    auth = getattr(imd,"author",None)
    attl = getattr(self,"caption")
    if not ittl: return None
    rs = ittl
    if auth:
      rs += ", "+auth
    if attl and (attl != "Untitled"):
      rs += ": "+attl
    return rs
    
    
    
  
  def externalize_snaps(album): # only used for a transition; 
    #snapm.getSnaps(album.topic)
    snapDs = album.snaps()
    return [s.externalize() for s in snapDs]
  
  
  def externalize(album,includeSnaps=False):
    vprint("compute_json")
    albumOb = {"type":"/type/Album","snaps":[]} #except in initialization, snaps will be replaced
    misc.setDictPropsFromObject(albumOb,album,["topic","published","caption","description","owner","image","published","current_item_create_time"])
    if includeSnaps:
      sns = album.externalize_snaps()
      albumOb["snaps"]=sns
    return albumOb
  
    
  def publishHtml(self,cn):
    tp = self.topic
    s3path = constants.topicDir+tp+"/index.html" #the path where the page will finally end up
    vprint("PUBLISH HTML TO ",s3path)
    s3.s3SetContents(s3path,contents=cn,relativeTo="",contentType="text/html")    
  
  
  def publishPage(self,compressJs=True):
    alb = self.topic
    tpo = misc.topicOb(alb)
    imtopic = tpo.imageTopic()
    imageD = image.loadImageD(imtopic,getattr(self,"pageStore",None))
    ttl = self.computeTitle(imageD)
    if ttl:
      ttl += ", Zoomable and Annotated"
    pg = self.genPage(compressJs=compressJs,title=ttl)
    self.publishHtml(pg)
    
    
  def publishJson(self,cn):
    tp = self.topic
    s3path = constants.topicDir+tp+"/main.json" #the path where the page will finally end up
    s3.s3SetContents(s3path,contents=cn,relativeTo="",contentType="application/json")    
  
  
  def toS3(self,includeSnaps=False,includeImages=False):  # take an existing album, and generate its s3 files ; mostly for the transition and initialPublish
    cap = getattr(self,"caption","")
    vprint("Sending ",cap,self.topic,"To S3");
    
    exv = self.externalize(includeSnaps)
    js = json.dumps(exv)
    self.publishJson(js)
    # now the html
    self.publishPage()
    # now the individual snap files
    if includeSnaps:
      snapDs = self.snaps()
      for snp in snapDs:
        snp.publish(includeImages)

  def updateS3(self):
    """ grab the album main.json file and update the snap that appears within it """
    tm = time.time()
    tp = self.topic
    aurl = "http://s3.imagediver.org"+constants.topicDir+tp+"/main.json"
    albs = urllib2.urlopen(aurl).read()
    albd = json.loads(albs)
    exv = self.externalize()
    exv["snaps"] = albd["snaps"]
    s3path = constants.topicDir+tp+"/main.json" #the path where the page will finally end up
    js = json.dumps(exv)
    s3.s3SetContents(s3path,contents=js,relativeTo="",contentType="application/json")
    etm = time.time() - tm
    vprint("publishInAlbum ",self.topic," took ",etm,"seconds")

  
  
    
  def importSnaps(self,fromAlbumTopic):
    vprint( "IMPORTING SNAPS FROM ",fromAlbumTopic)
    asnaps = snapm.getSnaps(fromAlbumTopic) # scaled; dicts
    topic = self.topic
    # @todo maybe a batch put would be in order
    for snd in asnaps:
      cs = snapm.copySnap(snd,self.topic)
      cs.dynsave()
  
  # for a while, i just grabbed the json from s3, but there is a delay in the update of s3,so back to compute-on-the-fly
  def compute_json(self,wrapInStatus=False):  # ignoring wrapInStatus
    exv = self.externalize(includeSnaps=True)
    js = json.dumps(exv)
    return js
  
    
  
  def s3path(self):
    tp = self.topic
    tp = tp[1:] # get rid of extra slash
    tps = tp.split("/")
    rpath = tps[1]+"/"+tps[2]  # relative path to the image's directory
    return tp+"/index.html" #the path where the page will finally end up
  
  def sendPageToS3(self,srcFile=None):
    s3p = self.s3path()
    if srcFile:
      s3.s3SetContents(s3p,srcFile,relativeTo="topic",contentType="text/html")
    else:
      s3.s3SaveFile(s3p,relativeTo="topic",contentType="text/html")
 
 
  # path is sort of obsolete ; only used for the currently-disabled facebook stuff
  
  def genPage(self,compressJs=None,title=None):
    rs = gen.genStdPage(None,'album',compressJs=compressJs,pageTitle=title)
    return rs
   


  def initialPublish(self):
    self.toS3()
    

  def s3backup(self):
    src = constants.topicDir+self.topic+"/main.json"
    dst = "/backup"+src
    s3.s3Copy(src,dst,contentType="application/json")
    src = constants.topicDir+self.topic+"/index.html"
    dst = "/backup"+src
    s3.s3Copy(src,dst,contentType="text/html")
  """ ye olde publishing method; not in use """

  def publish(self,pageStore=None):
    OBSOLETE
    vprint("PUBLISHING ",self.__dict__)
    alb = self.topic
    tpo = misc.topicOb(alb)
    imtopic = tpo.imageTopic()
    imdir = tpo.imageOwner + "/" + tpo.imageName
    vprint("PUBLISH ALBUM",self.topic," with IMAGE ",imtopic,"imdir",imdir)
    js = self.compute_json(False)
    self.publishJson(js)
    tp = self.topic
    imageD = image.loadImageD(imtopic,getattr(self,"pageStore",None))
    pg = self.genPage(self.computeTitle(imageD))
    self.publishHtml(pg)
    snapDs = self.snaps()
    cropids = []
    newPubs = []
    fls = []
    for snap in snapDs:
      if snap["published"]:
        continue
      crid = snap["cropid"]
      cropids.append(crid)
      fls.append(imdir+"/snap/"+str(crid)+".jpg")
      fls.append(imdir+"/snapthumb/"+str(crid)+".jpg")
      newPubs.append(snap)
    for fl in fls:
      vprint("about to save "+fl)
      s3.s3SaveFile(fl,relativeTo="images",contentType="image/jpeg")
    dynamo.assertPublished(self)
    self.setSnapsPublished(newPubs,1)
    
  
    
    

  def snapTopics(self):
    return dynamo.snapTopicsInAlbum(self.topic)

  def getImageD(self):
    rs = getattr(self,"imageD",None)
    if rs:
      return rs
    imd = image.loadImageD(self.image,getattr(self,"pageStore",None))
    self.imageD = imd
    return imd

  def snaps(album):
    return snapm.getSnaps(album.topic)
    
  def newSnap(self,snapD):
    """ album is the album topic """
    snapD.album = self.topic
    return snapD.dynsave()
    


  def updateSnap(self,snapD):
    return snapD.dynsave()
  
  
  # ords are pairs (snapidx,ordinal)
  def setSnapOrdinals(self,ords):
    anm = self.topic
    sns = dynamo.snapTopicsForAlbum(anm)
    sbyi = {}
    for snt in sns:
      idx = int(misc.pathLast(snt))
      sbyi[idx] = snt
    for o in ords:
      idx = o[0]
      ov = o[1]
      tp = sbyi[idx]
      dynamo.putAttribute("Snap",tp,"ordinal",ov)



  def resetSnapOrdinals(self):
    anm = self.topic
    sns = dynamo.snapTopicsForAlbum(anm)
    ln  = len(sns)
    snps = self.snaps()
    ords = [(i+1,i+1) for i in range(0,ln)]
    self.setSnapOrdinals(ords)
  
  def listToOrdinals(self,nums):
    cidx = 1
    rs = []
    for n in nums:
      rs.append((n,cidx))
      cidx = cidx + 1
    return rs
      
 
  
  def ownerId(self):
    ot = self.owner
    if not ot: ot = self.user # for backward compatibility
    lsl = ot.rindex("/")
    return ot[lsl+1:]
  
  
  def imageFiles(album):
    sns = album.snaps()
    tp = album.topic
    tps = tp.split("/")
    adir = "/".join(tps[2:4])+"/"
    snapdir = adir + "snap/"
    thumbdir = adir + "snapthumb/"
    rs = []
    for sn in sns:
      crid = sn.cropid
      crnm = str(crid)+".jpg"
      rs.append(snapdir+crnm)
      rs.append(thumbdir+crnm)
    return rs
      
  def topicFiles(album):
    tpd = album.topic[1:] + "/"
    return [tpd+"index.html",tpd+"main.json"]
       
     
  def deleteFiles(album):
    vprint("deleting files for ",album.topic)
    files = album.imageFiles()
    for file in files:
      pth = constants.imageRoot + file
      vprint("deleting ",pth)
      os.remove(pth)
    s3.s3DeleteKeys(files)
    tpfiles  = album.topicFiles()
    vprint("deleteing ",tpfiles)
    s3.s3DeleteKeys(tpfiles,relativeTo="topics")

  def delete(album):
    album.deleteFiles()
    album.dyndelete()
    im = album.image
    imd = image.ImageD(im)
    vprint("PUBLISHING ALBUM LIST after delete of an album of ",im)
    
  



  def genSnapImages(albumD,imd,tl,snap):
    def fprint(*args):
      if 1: misc.printargs(args)
    fprint("GENSNAPIMAGES ",albumD,imd,tl,snap.coverage)
    albumTopic = albumD.topic
    imdim = imd.dimensions
    imdir = imd.imDir()
    imwd = imdim["x"]
    imht = imdim["y"]
    cropid = snap.cropid
    scoverage = snap.coverage # scaled to im wid
    coverage = misc.scaleRectDict(scoverage,imwd)
    crect = image.dictToRect(coverage)
    minAspectRatio = 0.60;
    crectCropped = crect.crop(minAspectRatio)  
    vprint("GENERATING IMAGES FOR SNAP ",snap.topic, " cropId ",cropid)
    bigsnappath = imdir+"bigsnap/"+str(cropid)+".jpg"
    snappath = imdir+"snap/"+str(cropid)+".jpg"
    thumbpath = imdir+"snapthumb/"+str(cropid)+".jpg"
    vprint("SNAPPATH",snappath)
    tl.cropFromTiles(snappath,crect,targetArea=400000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    tl.cropFromTiles(thumbpath,crectCropped,targetArea=25000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    
         
    
# sn normally comes from the api, and may not have topic nor cropid; coverage unscaled
  def addSnap(self,sn,pageStore=None,publishInAlbum=True,scaleCoverage=True):
    albumId = misc.pathLast(self.topic)
    im  = self.image
    cropcnti = im + "/crops"
    topic = getattr(sn,"topic",None)
    cropid = getattr(sn,"cropid",None)
    newSnap = topic==None
    coverage = sn.coverage  # assumed unscaled
    imsplit = im.split("/")
    imuname = imsplit[2]
    imname = imsplit[3]
    imd = image.loadImageD(im)
    imdir = imd.imDir()
    imdim = imd.dimensions
    imwd = imdim["x"]
    imht = imdim["y"]
    svcov = sn.coverage
    if scaleCoverage:
      sn.coverage = misc.scaleRectDict(svcov,1.0/imwd);
    newCrop = False
    newSnap = False
    if topic == None:
      newCrop = True
      newSnap = True
    else:
      if cropid==None:
        newCrop = True
      snapid = misc.pathLast(topic)
      vprint("EDITING SNAPID "+snapid)
      newSnap = False
    if newCrop:
      cropid = dynamo.bumpCount(cropcnti)
      sn.cropid = cropid
    vprint ("im",im,"imuname",imuname,"cropcnti",cropcnti,"cropid",cropid)
    if newSnap:
      sn = self.newSnap(sn)
      
    else:
      self.updateSnap(sn)
    #if not topic:
    #  sn.topic =  "/snap/" + imuname + "/" + imname + "/" + str(albumId) + "/" + str(snapid)
    if newCrop:
      tl  = image.Tiling(imd,256,1);
      tl.createTiles([],kind="r",parent=None,recursive=False)
      self.genSnapImages(imd,tl,sn)
    #cap = getattr(albumD,"caption",None)
    sn.publish()
    if publishInAlbum:
      sn.publishInAlbum()
    sn.coverage = svcov # this is what is wanted externally
    #snaps.closeStore(webin.pageStore)
    return sn






  

def loadAlbumD(topic,pageStore=None):
  d = dynamo.getAlbum(topic)
  #vprint("LOADED ALBUM FROM DYNAMO ",d)
  if not d:
    return None
  rs = AlbumD(topic)
  rs.__dict__.update(d)
  rs.pageStore = pageStore
  #rs.imageD = image.loadImageD(rs.image)
  return rs
  
     
def getAlbums(topics):
  return dynamo.getAlbums(topics)
 
"""
def albumsForImage(imageTopic):
    return dynamo.albumTopicsForImage(imageTopic)
"""

def allAlbums(userTopic=None,onlyPublished=False,featuredOnly=False):
  """ userId = /user/<id>; later there will be a index table giving albums per user """
  """ @todo someday a userToAlbums table will be good to have, so that the entire albums table need not be scanned """
  
  rs = []
  albums = dynamo.allAlbums()
  for a  in albums:
    if userTopic:
      if a["owner"] != userTopic:
        continue
    if onlyPublished:
      if  not a.get("published",False):
        continue
    if featuredOnly:
      if not a.get("featured",False):
        continue
    album = AlbumD(a["topic"])
    album.__dict__.update(a)
    cap = a.get("caption",None)
    if cap ==".snaps.":
      album.snapCount = dynamo.countSnapsInAlbum(album.topic)
    rs.append(album)
  return rs

""" so that we need not worry so much about whether inputs are "joe" or "/user/joe" """
def userToTopic(u):
  if u.find("/") >= 0:
    return u
  return "/user/"+u


def topicToUser(u):
  f = u.find("/")
  if f >= 0:
    return misc.pathLast(u)
  else:
    return u
  

  
def newAlbum(im,owner,caption):
  vprint("NEW ALBUM ",im,caption);
  albumD = AlbumD(None)
  albumD.image = im
  albumD.owner =userToTopic(owner)
  albumD.caption = caption
  #Logr.log("api","NEW ALBUM "+album.topic)
  #albumD.caption = ".snaps."
  albumD.dynsave()
  albumD.initialPublish()
  imd = image.ImageD(im)
  vprint("PUBLISHING ALBUM LIST")
  return albumD


  
def hasAlbums(im,owner):
  albums = dynamo.albumTopicsForImage(im,owner)
  return len(albums) > 0



def albumTopicsForImage(im,owner=None):
  return dynamo.albumTopicsForImage(im,owner)
 

def albumsForImage(im,owner):
  """ returns dicts """
  return dynamo.getAlbums(dynamo.albumTopicsForImage(im,owner))

# the images are associated with albums meeting the given conditions

def allImagesForAlbums(userTopic=None,featuredOnly=False,asDicts=False):
  albs = allAlbums(userTopic=userTopic,featuredOnly=featuredOnly)
  abyt = {} # albums by topic
  abyi = {} # albums by image topic
  for a in albs:
    itp = a.image
    cab = abyi.get(itp,None)
    if asDicts: a = a.__dict__
    if cab==None:
      abyi[itp] = [a]
    else:
      cab.append(a)
  imtps = abyi.keys()
  ims = image.getImages(imtps)
  rs  =[]
  for i in ims:
    a = abyi[i.topic]
    if asDicts:
      id = i.__dict__
      id["albums"]=a
      rs.append(id)
    else:
      i.albums = a
  return rs if asDicts else ims




def allAlbumTopics(): # sort of: all albums of public images
  ii  = image.allImages(publicOnly=True)
  rs = []
  for i in ii:
    rs.extend(albumTopicsForImage(i.topic))
  return rs


  
  
"""



PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")


aa = album.first
alb = album.loadAlbumD('/album/4294b0e/garden_of_earthly_delights/1')


alb = album.loadAlbumD('/album/4294b0e/one_dollar_bill_5/1')

alb.resetSnapOrdinals()
alb.setSnapOrdinals(
((7,3),(6,4),(10,5),(6,6),(5,7),(4,10),
(17,12),(14,13),(13,15),(12,16),(21,17),(15,18),(20,19),(16,20),(19,21)))



alb = album.loadAlbumD('/album/4294b0e/virgin_and_child_gerard_david/1')

alb.resetSnapOrdinals()
alb.setSnapOrdinals(((12,3),(3,4),(4,5),(5,6),(6,7),(7,8),(8,9),(9,10),(11,12)))



  
"""
