#!/usr/bin/env python

"""
Handles the api call api/login
http://dev.imagediver.com/topic/image/cg/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""

import time
import subprocess
import urlparse

import model.models
models = model.models
import model.image
image = model.image
import model.album
album = model.album
import urllib
import json
from WebClasses import WebResponse,okResponse,failResponse
import Logr
import constants
import model.snap
snapm = model.snap
import misc
import store.dynamo as dynamo

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"API/ALBUM")

def addAlbum(webin):
  raise Exception("Obsolete function addAlbum")
  """
  HOW IS THIS DIFFERENT FROM NEWALUM? It is the one that is in use.
  Handles the api/addAlbum request
  """
  raise exc
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session
  user = sess.user
  cob=json.loads(webin.content())
  im = str(cob["image"])  # the topic name /image/whatever
  importSnaps = cob.get("importSnaps",None)
  albumD = album.AlbumD(None)
  albumD.image = im
  albumD.owner = user
  imD = image.loadImageD(im,webin.pageStore)
  if (not getattr(imD,"shared",False)) and (imD.owner != user):
    imD.shared = 1
    imD.dynsave(False)
  caption = cob.get("caption",None)
  if caption==None:
    caption = "unnamed"
  description = cob.get("description",None)
  if description==None:
    description=""
  albumD.caption = caption
  albumD.description = description
  albumD.dynsave()
  if importSnaps:
    sna = dynamo.getSnapsAlbumTopic(im,user)
    if sna:
      albumD.importSnaps(sna)
  return okResponse(albumD.__dict__)

  
 
def allAlbums(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  cob=json.loads(webin.content())
  sess = webin.session;
  user = cob.get("user",None)
  if not user:
    user = sess.user
  albums = album.allAlbums(user)
  rs  = [a.__dict__ for a in albums]     
  toemit = {"status":"ok","value":rs}
  return okResponse(rs)

def albumsAndImages(webin):
  """ both kinds of entities for the logged in user. Includes images mentioned in albums, and images owned by the user"""
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  albums = album.allAlbums(user)
  images = image.allImages(user)
  imbytopic = {}
  for im in images:
    tp = im.topic
    imbytopic[tp] = im
  missingIms = {}
  for a in albums:
    aim = a.image
    if imbytopic.get(aim,None)==None:
      missingIms[aim] = 1
  mlist = missingIms.keys()
  if len(mlist) > 0:
    getem = image.getImages(mlist)
    images.extend(getem)
  adicts = [a.__dict__ for a in albums]
  imdicts = [i.__dict__ for i in  images]
  rs = {"albums":adicts,"images":imdicts}
  return okResponse(rs)
  
 
def albumHistory(webin):
  """ both kinds of entities for the logged in user. Includes images mentioned in albums, and images owned by the user"""
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  
  cob=json.loads(webin.content())
  Logr.log("api","COB: "+str(cob))

  albn = str(cob["album"])  # the topic name /image/whatever
  rs = snapm.getSnaps(albn,getAllVersions=True)
  return okResponse(rs)


    
    
      
    
    
  


def editAlbum(webin):

  """
  Handles the api/editAlbum request
  """
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  Logr.log("api","COB: "+str(cob))

  topic = cob.get("topic",None);
  albumD = album.loadAlbumD(topic,webin.pageStore)
  Logr.log("api","ALBUM: "+str(album.__dict__))

  if albumD.owner != user:
    return failResponse("notOwner")
  Logr.log("api","EDITING ALBUM "+topic)

  caption = cob.get("caption",None)
  if caption==None:
    caption = "unnamed"
  description = cob.get("description",None)
  if description==None:
    description=""
  albumD.caption = caption
  albumD.description = description
  albumD.externalLink = cob.get("externalLink",None)
  albumD.dynsave()
  albumD.updateS3()
  return okResponse(albumD.__dict__)


def publishAlbum(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  Logr.log("api","COB: "+str(cob))

  topic = cob.get("topic",None);
  albumD = album.loadAlbumD(topic,webin.pageStore)

  if albumD.owner != user:
    failResponse("notOwner")
  Logr.log("api","EDITING ALBUM "+topic)
  albumD.publish() #compressJs=constants.compressJs)
  #snaps.closeStore(webin.pageStore)
  return okResponse()



def newAlbum(webin):
 
  cks = webin.checkSessionResponse()
  #f cks: return okResponse("virtual")
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  vprint("NEW ALBUM COB: ",str(cob))
  im = cob.get("image",None)
  cap = cob.get("caption",'Untitled')
  if (not im) or (not cap):
    return failResponse("missingArguments")
  # for a very unlikely case
  #ha = album.hasAlbums(im,user)
  #if 0 and ha:
  # return failResponse("hasAlbums")
  newa = album.newAlbum(im,user,cap)  
  ntp = newa.topic
  imD = image.loadImageD(im,webin.pageStore)
  if (not getattr(imD,"shared",False)) and (imD.owner != user):
    imD.shared = 1
    imD.dynsave(False)
  #js = newa.compute_json(wrapInStatus=True)
    #snapst.closeStore(webin.pageStore)
  exv = newa.externalize()
 #js = json.dumps(exv)
  return okResponse(exv)
  #return okResponse(ntp);
  
def newAlbumJsonP(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  qs = getattr(webin,"queryString",None)
  if qs:
    qsp = urlparse.parse_qs(qs)
  clb = qsp["callback"][0]
  im = qsp["image"][0]
  newa = album.newAlbum(im,user,'Untitled')  
  ntp = newa.topic
  jr = json.dumps({"status":"ok","value":ntp})
  rs = clb+"("+jr+")"
  return WebResponse("200 OK","application/json",rs);    

 
def deleteAlbum(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  Logr.log("api","DELETE SNAP COB: "+str(cob))
  topic = cob["topic"]
  albumD = album.loadAlbumD(topic,webin.pageStore)
  if not albumD:
    return okResponse("already deleted")
  if user != albumD.owner:
    return failResponse("notOwner")
  """ todo :delete the snaps db file """
  albumD.delete()
  #snaps.closeStore(webin.pageStore)
  return okResponse()
  
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

sess = models.loadSessionD('8dca034396f099459e413a415372df7d0c8313e705ae74c7e717922e')
  
  
"""
