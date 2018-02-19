#

import constants

import re
import math
import time
import hashlib
#theStore = None
import Logr
import os
import subprocess
import traceback
import store.dynamo
dynamo = store.dynamo
import constants

import store.jobs
jobs = store.jobs
import math
import model.models
models = model.models
import model.image
image = model.image
#import pages.album
#albumpage = pages.album
import misc
import pdb
import json
import ops.s3
s3 = ops.s3
import pages.gen as gen
import time


import urllib2


import misc
verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"SNAP")
    


class Composite:
  
  def compute_json(self):    
    rs  = self.images
    return json.dumps(rs)




  

  def genPage(self,sendToS3=True):
    txt = "<script>page.initialize();</script>"
    
    headLines = []
    styleSheets = ["/css/faq.css"]
    
    jsFiles = '<script type="text/javascript" src="/ncjs/composite.js"></script>\n';

    headerTitle = "Composite: "+self.name
    pageTitle = headerTitle

    pg = gen.genHtmlPage(None,jsFiles,headerTitle,headLines,txt,pageTitle=pageTitle)
    #fl = "/mnt/ebs1/imagediver/temp/snap.html"
    name = self.name
    #topicdir = "/topicd" if constants.publishToS3Dev else "/topic"
    s3path = constants.compositeDir+"/"+name+"/index.html" #the path where the page will finally end up
    if sendToS3:
      s3.s3SetContents(s3path,contents=pg,relativeTo="",contentType="text/html")
    return pg

 
  
  


  def publish(self):
    #vprint("PUBLISHING ",self.__dict__)
    """ the snap images appear under the image directory (/imagowner/imagename). pageOnly means don't bother with generating json"""
   
    js = self.compute_json()
    name = self.name
    #topicdir = "/topicd/" if constants.publishToS3Dev else "/topic/"
    s3path = constants.compositeDir+"/"+name+"/main.json" #the path where the page will finally end up
    s3.s3SetContents(s3path,contents=js,relativeTo="",contentType="application/json")
    self.genPage()
   
  



