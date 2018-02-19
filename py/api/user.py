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


def allUsers(webin):
  cks = webin.checkSessionResponse()
  #f cks: return okResponse("virtual")
  if cks: return cks
  sess = webin.session;
  user = sess.user
  rsi = models.allUsers()
  rsf = []
  for u  in rsi:
    ctm = getattr(u,"current_item_create_time",0)
    nm = getattr(u,"name","none").lower()
    if (ctm >=  1351028738215) and (nm != "chrisgoad"): #1344880615724: 
      rsf.append(u)
  rs  = [d.__dict__ for d in rsf]
  return okResponse(rs)

  
  

  
  


