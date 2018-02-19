"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""


import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonJsFiles,commonCjsIncludes,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import pages.gen
gen = pages.gen
import model.models
models = model.models
import json
import Logr

import model.snap as snapm
import model.image
image = model.image
import misc

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"ALBUM PAGE")
   
import urlparse


from WebClasses import WebResponse,okResponse,failResponse,htmlResponse



def emitSnapPage(webin,parsedPath,parsedQuery,forHomePage):
  #print "PPPP",parsedPath
  #this is only used for debugging 
  nm = parsedPath.name[0:-1]
  tp = "/snap/"+"/".join(nm)
  print "TOPIC ",tp
  sn = snapm.SnapD(tp)
  otxt = sn.genPage(sendToS3=False,compressJs=False)
  #print "OTXT",otxt
  #snaps.closeStore(webin.pageStore)
  return  htmlResponse(otxt)

 
  
  
  

