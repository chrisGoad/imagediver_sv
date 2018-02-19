#!/usr/bin/env python

"""
Handles the api call api/login
http://neochronography.com/topic/image/astoria_1923_0

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
import os


def allImages(webin):
  " featured images; ie images with featured albums "
  cob=json.loads(webin.content())
  includeAlbums = cob.get("includeAlbums")
  forUser = cob.get("forUser")
  featuredOnly = cob.get("featuredOnly",False)
  if includeAlbums:
    rs = album.allImagesForAlbums(featuredOnly=featuredOnly,asDicts=True)
  else:
    rsi = image.allImages(publicOnly=True)
    rs  = [im.__dict__ for im in rsi]
  return okResponse(rs)
  albs = album.allAlbums(featuredOnly=True)
  #ims = image.allImages()
  #cnts = image.albumCounts()
  abyt = {} # albums by topic
  abyi = {} # albums by image topic
  for a in albs:
    itp = a.image
    cab = abyi.get(itp,None)
    if cab==None:
      cab = [a.__dict__]
    else:
      cab.append(a.__dict__)
  imtps = keys(abyi)
  ims = image.getDicts(imtps)
  for i in ims:
    i.albums = abyi[i.topic]
  return okResponse()
  rs = []
  rd = {} # by topic
  if forUser:
    utopic = "/user/"+forUser
  for im in ims:
    if not getattr(im,"atS3",None):
      continue
    if not getattr(im,"isPublic",None):
      continue
    if forUser:
      if getattr(im,"owner",None) != utopic:
        continue
    tp = im.topic
    acnt = cnts.get(tp,0)   
    d = im.__dict__
    rd[tp] = d
    d["albums"] = []
    d["albumCount"]=acnt
    rs.append(d)
  # associate the featured or unique album with each image
  for alb in albs:
    if not getattr(alb,"published",False):
      continue
    imd = rd.get(alb.image,None)
    
    if imd:
      imd["albums"].append(alb.__dict__)
      """
      if im.albumCount == 1:
        im.album = alb.__dict__
      else:
        if getattr(alb,"featured",False):
          im.album = alb.__dict__
      """
  return okResponse(rs)

# now image and album editing are unified.
def editImage(webin):

  """
  Handles the api/addSnap request; this is used for editing snaps too
  """
  cks = webin.checkSessionResponse()
  if cks: return cks

  sess = webin.session;
  user = sess.user
  uname = models.pathLast(user)
#  Logr.activeTags = ["dispatch","api"]
#Logr.log("api",str(napi.__dict__))
  cob=json.loads(webin.content())
  Logr.log("api","COB: "+str(cob))
  imagetopic= cob["image"]
  albumTopic = cob.get("albumTopic",None)
  albumTitle = cob.get("albumTitle","")
  albumDescription = cob.get("albumDescription","")
  imD = image.loadImageD(imagetopic,webin.pageStore)
  Logr.log("api","IMD "+str(imD.__dict__))
  imowner = getattr(imD,"owner",None)
  Logr.log("api","OWNER "+str(imowner))
  if not imowner:
    imowner=getattr(imD,"user",None)
    imD.owner = imowner
  if user != imowner:
    return failResponse("notOwner")
  imD.title = cob["title"]
  imD.description = cob["description"]
  imD.author = cob.get("author",None)
  imD.year = cob.get("year",None)
  imD.externalLink = cob.get("externalLink",None)
  imD.isPublic = cob.get("isPublic",None)
  imD.license = cob.get("license",None)
  imD.tags = cob.get("tags",None)
  imD.dynsave()
  if albumTopic:
    albumD = album.loadAlbumD(albumTopic,webin.pageStore)
    albumD.caption = albumTitle
    albumD.description = albumDescription;
    albumD.dynsave()
    
  return okResponse({"title":imD.title,"description":imD.description})


 
def deleteImage(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  Logr.log("api","DELETE SNAP COB: "+str(cob))
  topic = cob["topic"]
  imageD = image.loadImageD(topic,webin.pageStore)
  if not imageD:
    return failResponse("missing")
  if user != imageD.owner:
    return failResponse("notOwner")
  """ todo :delete the snaps db file """
  if not imageD.deleteable():
    return failResponse("notDeleteable")
  imageD.delete()
  return okResponse()
  
  

def albumsForImage(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  Logr.log("api","DELETE SNAP COB: "+str(cob))
  topic = cob["image"]
  rso = album.albumsForImage(topic,user)
  #rs = [alb.__dict__ for alb in rso]
  return okResponse(rso)




def albumsForImageJsonP(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  qs = getattr(webin,"queryString",None)
  if qs:
    qsp = urlparse.parse_qs(qs)
  clb = qsp["callback"][0]
  topic = qsp["image"][0]
  rso = album.albumsForImage(topic,user)
  jr = json.dumps({"status":"ok","value":rso})
  rs = clb+"("+jr+")"
  return WebResponse("200 OK","application/json",rs);    





def albumTopicsForImage(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  cob=json.loads(webin.content())
  topic = cob["image"]
  rso = dynamo.albumTopicsForImage(topic,user)
  #rs = [alb.__dict__ for alb in rso]
  return okResponse(rso)

  

def imageDeleteable(webin):
  cob=json.loads(webin.content())
  topic = cob["topic"]
  imageD = image.loadImageD(topic,webin.pageStore)
  if not imageD:
    return failResponse("missing")
  rs = imageD.deleteable()
  return okResponse(int(rs))
  
  
  

  
  


