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

verbose = True

def vprint(*args):
  if verbose:
    misc.printargs(args,"API/FORUM")

def addPost(webin):

  """
  Handles the api/Post request; this is used for editing snaps too
  """
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
 #  Logr.activeTags = ["dispatch","api"]
#vprint(str(napi.__dict__))
  cob=json.loads(webin.content())
  vprint("COB: "+str(cob))
  topic = cob["topic"]
  text = cob["text"]
  pst = models.PostD()
  pst.topic = topic
  pst.text = text
  pst.user = user
  dyn.savePost(pst)
  return okResponse()

def getPosts(webin):
  posts = dyn.allItems("Post")
  udict = {}
  for p in posts:
    utp = p["user"]
    udict[utp] = 1
  ui = dyn.allItems("User") 
  unms = []
  for u in ui:
    tp = u["topic"]
    if udict.get(tp,None):
      unms.append({"topic":tp,"name":u["name"]})
  rs = {"posts":posts,"users":unms}
  return okResponse(rs)

  
  
  
  
  


