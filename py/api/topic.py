#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""


import urllib

import Logr
Logr.log("api","HOHOHO8O")
import api.utils
apiutils = api.utils
import constants
#reload(constants)


"""
form of url:
http://imagediver.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""

import urlparse

from pages.gen import emitNotFound
import misc

from pages.snap import emitSnapPage
from pages.image import emitImagePage
from pages.album import emitAlbumPage
from pages.history import emitAlbumHistoryPage
#from pages.imagepair import emitImagepairPage
#from api.upload import emitUpload,cancelUpload
from api.job import emitJob,cancelJob
from WebClasses import WebResponse,okResponse,failResponse



verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"TOPIC")
    
def topicHandler(webin):
  vprint("TOPICHANDLER")
  pp = apiutils.parsePath(webin.path)
  vprint("Parsed Path" + str(pp))
  Logr.log('api',"PARSED PATH:"+str(pp))
  qs = getattr(webin,"queryString",None)
  if qs:
    qsp = urlparse.parse_qs(qs)
    vprint("QSSSSSsssSSSP",qsp)
  else:
    qsp = None
  cat = pp.category
  name = pp.name
  format = pp.format
  method=pp.method
  history = pp.history
  vprint("CATEGORY ",cat)
  if cat == "upload":
    print "OBSOLETE: upload"
    return failResponse("obsoleteCallToUpload");

    """
    if method=="get":
      return emitUpload(webin,pp)
    if method=="cancel":
      return cancelUpload(webin,pp)
    """
  if cat == "job":
    if method=="get":
      return emitJob(webin,pp)
    if method=="cancel":
      return cancelJob(webin,pp)
  #if cat=="image"  and format=="html":
  #  return emitImagePage(webin,pp)
  if cat=="album"  and format=="html":
    if history:
      return emitAlbumHistoryPage(webin,pp,qsp)
    return emitAlbumPage(webin,pp,qsp,False)
  if cat=="snap"  and format=="html":
    return emitSnapPage(webin,pp,qsp,False)
  #if cat=="imagepair"  and format=="html":
  # return emitImagepairPage(webin,pp)
  return emitNotFound(webin)

