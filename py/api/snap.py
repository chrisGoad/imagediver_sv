#!/usr/bin/env python

"""
Handles the api call api/login
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

note the crop count is held under  /image/<user>/<imagename>/crops in the counters table
the snap count (actual crops of images) is held under /album/<user>/<imagename>/<albumnum>/snaps

this is the new way (5/12/12). the old way held the crop/snap count at /image/<user>/<imagename>
(they were the same)
"""

import time
import subprocess

import model.models
models = model.models
from util.to_s3 import s3Conn
import store.dynamo
dyn = store.dynamo

import urllib
import json
from WebClasses import WebResponse,okResponse,failResponse
import Logr
import constants
import os
import model.image
image = model.image
import model.album
import model.snap
snapm = model.snap
import misc
def pathLast(x):
  sp = x.split("/")
  return sp[-1]

verbose = False

testingAddSnap = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"API/SNAP")

def addSnap(webin):

  """
  Handles the api/addSnap request; this is used for editing snaps too
  """
  if testingAddSnap:
    print "TESTINGADDSNAP"
    return failResponse("testing")
  print "ADD SNAPPPPP"
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  uname = models.pathLast(user)
#  Logr.activeTags = ["dispatch","api"]
#vprint(str(napi.__dict__))
  cob=json.loads(webin.content())
  vprint("COB: "+str(cob))
  album = cob["album"]
  albumIdx = pathLast(album)
  albumD = model.album.loadAlbumD(album,webin.pageStore)
  if user != albumD.owner:
    return failResponse("notOwner");
  topic = cob.get("topic",None);
  coverage = cob["coverage"]  # unscaled
  im = str(cob["image"])
  """
  imsplit = im.split("/")
  imuname = imsplit[2]
  imname = imsplit[3]
  imd = image.loadImageD(im,webin.pageStore)
  imdir = imd.imDir()
  imdim = imd.dimensions
  imwd = imdim["x"]
  imht = imdim["y"]
  scoverage = misc.scaleRectDict(coverage,1.0/imwd);
  """
  snap = snapm.SnapD(None)
  
  """
  if newCrop:
    cropid = dyn.bumpCount(cropcnti)
  else:
    cropid = cob["cropid"]
  vprint ("im",im,"imuname",imuname,"cropcnti",cropcnti,"cropid",cropid)
  #return okResponse("testing");

  cropid_s = str(cropid)
  """
  cropid = cob.get("cropid",None)
  caption = cob.get("caption","")
  description = cob.get("description","")
  ordinal = cob.get("ordinal",-1)
  #if newCrop:
  #  crect = image.dictToRect(coverage)
    
  #if not caption:caption=""
  #if not description:description=""
  # d={"topic":tp,"notSaved""type":"/type/snapD","image":im,"caption":caption,"description":description,"coverage":coverage}
  snap.image = im
  snap.album = album
  snap.owner = user
  snap.coverage = coverage
  snap.caption = caption
  snap.description = description
  snap.cropid = cropid
  snap.shares_coverage = 0
  snap.ordinal = ordinal
  snap.topic = topic
  rs =albumD.addSnap(snap,webin.pageStore)
  return okResponse(rs.__dict__);


  if in_snaps:
    snap.in_snaps = 1
  if newCrop:
    snap.published = 0
  if topic:
    snap.topic = topic
  if newSnap:
    #snapid = models.newSnap(album,snap)
    snapid = albumD.newSnap(snap) 
  else:
    albumD.updateSnap(snap)
  if not snap.topic:
    snap.topic =  "/snap/" + uname + "/" + imname + "/" + str(albumIdx) + "/" + str(snapid)

  vprint("saved snap :"+str(snap.__dict__))
  #dst.insert(d) # this does an update, if the topic and type exist
  
   # convert -size 25053x4354 -depth 16 -extract 2000x2000+10000+0 -resize 200x200 Panorama1924.TIF /var/www/neo.com/images/P00.jpg
  if newCrop:
    tl  = image.Tiling(imd,256,1);
    tl.createTiles([],kind="r",parent=None,recursive=False)
    albumD.genSnapImages(imd,tl,snap)

    #snappath = imdir+"snap/"+str(cropid)+".jpg"
    #thumbpath = imdir+"snapthumb/"+str(cropid)+".jpg"
    #cropsize = imd.cropImage(crect,snappath,targetArea=200000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    #thumbsize = imd.cropImage(crect,thumbpath,targetArea=25000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
  
    #tl.createTiles([])
    #cropsize = tl.cropFromTiles(snappath,crect,targetArea=200000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    #thumbsize = tl.cropFromTiles(thumbpath,crect,targetArea=25000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    #cropsize = imd.cropFromTile(tl,crect,snappath,targetArea=200000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    #thumbsize = imd.cropFromTile(tl,crect,thumbpath,targetArea=25000) # the actual crop image will not be blown up, so may be less than the nominal (and returned) cropsize
    """
    this scheme, with iterative reduction, gave inferior results
    thumbsize = cropsize.scaleToArea(25000)
    imdir = imd.imDir()
    src = imdir + snappath+".jpg"
    dst = imdir + "snapthumb/"+str(cropid)+".jpg"
    image.resizeImage(src,dst,thumbsize)
    """


    #cmd = "convert -quiet -size {imwd}x{imht} -depth 8 -extract {cx}x{cy}+{x}+{y} -resize {szx}x{szy} {imFile} {cropFile}"
    #cmdf = cmd.format(imwd=imwd,imht=imht,cx=cx,cy=cy,x=x,y=y,szx=szx,szy=szy,imFile=imFile,cropFile=cropFile)
  
  #              " -resize "+ex+"x"+ey+" "+(tim.filename)+" "+(tl.directory)+(this.id)+";
  #import subprocess
  #subprocess.Popen(cmd)
  cap = getattr(albumD,"caption",None)
  " snaps from the snaps album are published immediately "
  #if cap==".snaps.":
  snap.publish()
  snap.publishInAlbum()
  #snaps.closeStore(webin.pageStore)
  return okResponse(snap.__dict__);

  
def editSnap(webin):
  return addSnap(webin)



def deleteSnap(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  vprint("DELETE SNAP COB: "+str(cob))
  topic = cob["topic"]
  if constants.snapsInDynamo:
    snap = snapm.loadSnapD(topic)
  else:
    snap = models.loadSnapD(topic)
  if user != snap.owner:
    return failResponse("notOwner");
  if constants.snapsInDynamo:
    if snap:
      snap.delete()
  else:
    models.deleteSnap(topic,webin.pageStore)
    snaps.closeStore(webin.pageStore)
  return okResponse()
  
    
  
  
  


