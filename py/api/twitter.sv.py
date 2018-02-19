#!/usr/bin/env python

"""
Handles the api call api/tumblrRequestToken

http://dev.imagediver.com/topic/image/cg/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""
from WebClasses import WebResponse,okResponse,failResponse

import ops.oauth_twitter as oat

import json
import misc
import model.models
models  = model.models



verbose = True

def vprint(*args):
  if verbose:
    misc.printargs(args,"tumblrAPI")
    
    
def twitterRequestToken(webin):
  #print "tumblrRequestToken"
  """
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session
  user = sess.user
  """
  tk = oat.requestToken()
  return okResponse(tk)
  tkj = json.dumps(tk)
  #print "TKJ",tkj
  " the token needs to be saved for a few minutes: until the user authorizes or declines the app "
  dir = "/mnt/ebs1/imagediver/tokens/"
  uname = misc.pathLast(user)
  fln = dir+uname
  f = open(fln,'w')
  f.write(tkj)
  f.close()
  return okResponse(tk)


  
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

import api.tumblr

params = {"type":"text","state":"draft","body":"Second TEST post"}
params = {"album":"/album/4294b0e/van_eyck_arnolfini/1","snap":9,"crop":12,"blog":"annotatedart.tumblr.com"}


api.tumblr.tumblrPost1("/user/4294b0e",params)


sess = models.loadSessionD('8dca034396f099459e413a415372df7d0c8313e705ae74c7e717922e')
  
  
"""
