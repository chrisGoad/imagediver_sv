#!/usr/bin/env python
"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""

import urlparse
import threading
import time
import urllib
import os
import json
import Logr
import time
import datetime
Logr.log("api","HOHOHO8O")
import model.models
models  = model.models
import model.image
image = model.image

import store.log
logstore = store.log


import api.utils
apiutils = api.utils

import ops.s3
s3 = ops.s3

import api.ses
ses = api.ses

import constants
import misc
__import__("ops.utilization",None,None,[])


"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""

import cgi
import re
import subprocess
import urllib2
import model.image
image = model.image
import misc
import store.jobs
jobs = store.jobs



verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"IMPORT")
   



buffsize = 100000
boundary = None
instream = None
inlength = 0
cpos = 0
lastBuf = ""
uploadId = 0
bufferCount = 0
outFile = None
outlength = 0
uploadId = 0
theUpload = None
outPath = None
import time

# i use the pageStore mechanism for managing global state, since it is built into the implementation

thePageStore = {"iam":"importJobStore"}



def saveFileSizes(dir):
  files = os.listdir(dir)
  #logstore.openConnection()
  for file in files:
    path = dir + "/" + file
    sz = os.path.getsize(path)
    #vprint("saving file size ",path,sz)
    logstore.newFilesizeEntry(path,sz,thePageStore)
  logstore.closeStore(thePageStore)
    

def allocateStore():
  global thePageStore
  vprint("ALLOCATING STORE")
  ns = jobs.storeForJob(autoCreate=True,pageStore=None)
  thePageStore["jobsStore"] = ns
  
def closeStore():
  jobs.closeStore(thePageStore)
  logstore.closeStore(thePageStore)
  
    

  

testMode = False # in which jobs are not saved

def saveJob(job):
  #if testMode:
  #  return
  job.save()
  
  
def jobDone(job):
  job.status = "done"
  tp = job.topic
  #f jobsByTopic[tp]: del jobsByTopic[tp]
  #if testMode:
  #  return
  job.save()




def imageForJob(job):
  topic = jobImtopic(job)
  return image.loadImageD(topic,getattr(job,"pageStore",None))




def whenCanceled(job):
    #if jobsByTopic[tp]: del jobsByTopic[tp]
  imtopic = jobImtopic(job)
  vprint("whenCANCELED JOB",job.topic,"for image ",imtopic,job.kind)
  im = image.loadImageD(imtopic)
  if im==None:
    im = image.ImageD(None)
    im.owner = "/user/"+job.owner
    im.name = jobImname(job)
    imdir = im.imDir()
    imfile = imdir+"import"
    vprint ("CANCELED, deleting ",imfile)
    if os.path.exists(imfile):
      os.remove(imfile)
  else:
    vprint("CANCELED deleting ",imtopic)
    if job.kind == "to_s3":
      vprint("CANCELED deleteFromS3",imtopic)
      im.deleteFromS3()
    im.delete()


 
def checkJobCanceled(job):
  if testMode:
    return False
  tp = job.topic
  vprint("checkJobCanceled",tp)
  sjob = models.getJob(tp,thePageStore)
  rs = sjob.status == 'canceled'
  vprint("CANCELED checked",tp,rs)
  if rs:
    job.status = "canceled"
    whenCanceled(job)
  return rs

   

       
  

# file names are relative to imageRoot
def toS3(job,backend=False):
  vprint("TO S3 **************************")

  frontend = not backend
  s3.s3Init()
  im = imageForJob(job)
  files = im.resizeFiles()
  files.extend(im.tileFiles())
  numfiles = len(files)
  job.total = numfiles
  print "Sending ",numfiles," to S3 for "+im.topic
  job.status = "active"
  if frontend: saveJob(job)
  cnt = 0
  tsz = 0
  stm = time.time()
  cnt = 0
  for fl in files:
    """ sz not used now; determined from the tiling dir size locally """
    updateDb = frontend and (cnt%20 == 0)
    vprint("about to save "+fl)
    sz = s3.s3SaveFile(fl,relativeTo="images",contentType="image/jpeg")
    if updateDb:
      if checkJobCanceled(job): return
    cnt = cnt + 1
    vprint("size "+str(sz))
    if cnt%25 == 0: print "Sent ",cnt
    tsz += sz
    #cnt = cnt+1
    job.so_far = cnt
    if updateDb:
      saveJob(job)
  im = imageForJob(job)
  im.atS3 = 1
  im.dynsave()
  imdir = im.imDir()
  saveFileSizes(imdir+"resized")
  saveFileSizes(imdir+"tiling")
  #im.removeSubdir("resized")
  #im.removeSubdir("tiling")
  job.so_far = numfiles
  job.status = "done"
  job.resources_used  = json.dumps({"time":time.time() - stm,"num_files":len(files)})
  saveJob(job)
  print "Done importing: "+im.topic

  return tsz

"""
structure
idv/tiling/user/image
idv/snap/user/image
idv/snapthumb/user/image
idv/resized/
"""






 

def resizeImage(job,backend=False):
  print("RESIZE IMAGE")
  frontend = not backend
  job.total = 4
  job.so_far = 0
  job.status = "active"
  if frontend: saveJob(job)
  stm = time.time()
  im = imageForJob(job)
  im.jpegify()
  tm1 = time.time()
  jpegify_time = tm1 - stm
  im.stepDownImage()
  tm2 = time.time()
  stepdown_time = tm2-tm1
  #im = image.newImageD(user,imname)
  jsf = 1
  job.so_far = jsf
  if frontend: saveJob(job)
  for d in image.imageResizes: #[("area",50000),("height",100),("width",300)]:
    print "resize",d
    im.reduceImage(d)
    jsf = jsf + 1
    job.so_far = jsf
    if frontend:
      if checkJobCanceled(job): return
    if jsf == 4:
      tm3 = time.time()
      resize_time = tm3 - tm2
      job.resources_used  = json.dumps({"jpegify_time":jpegify_time,"step_downtime":stepdown_time,"resize_time":resize_time})

      job.status = "done"
    if frontend: saveJob(job)
  if backend: saveJob(job)
  im.localStorage = 0
  im.dynsave()
  print "resize done"
                     
                     
                   
                    

def buildTiling(job,backend=False):
  print("BUILDING the TILING **************************")
  frontend = not backend
  job.status = "active"
  if frontend: saveJob(job);
  im = imageForJob(job)
  job.imTopic = im.topic # not saved; used for cancelation
  tl  = image.Tiling(im,256,1);
  stm = time.time()
  tl.createTiles([])
  numtiles = len(tl.tiles)
  print "TEST"
  print "BBuildingg Tiling of ",numtiles," for "+im.topic
  job.total = numtiles
  job.status = "active"
  if frontend: saveJob(job)
  vprint(str(len(tl.tiles)))
  
  def recorder(tile,cnt):
    if backend:
      if cnt%25 == 0: print "created ",cnt," tiles"
      return True
    if checkJobCanceled(job): return False
    vprint(tile.__dict__)
    vprint(job.subject)
    job.so_far = cnt+1
    saveJob(job)
    return True
  tl.createImageFiles(recorder)
  if job.status == "canceled":
    return
  imdir = im.imDir()
  sz = misc.du(imdir+"tiling")
  o = job.owner
  usr = models.loadUserD('/user/'+o,thePageStore)
  alc = usr.allocation()
  sta = alc["storage"]
  sut = usr.storageUtilization()
  vprint(o,"ALLOCATION ",sta,"UTILIZATION ",sut,"SIZE ",sz)
  if (sz + sut) > sta:
     job.status = "storageLimitExceeded"
     im.delete(fromS3=False)
     if getattr(usr,"email"):
       ses.sendStorageAllocationExceededEmail(usr,job.subject,allocation=sta,utilization=sut,size=sz)
  else:
    im.s3Storage = sz
    im.beenTiled = 1  
    im.dynsave()
    job.status = "done"
    #im.removeSubdir("stepdown")
    im.deleteStepdowns(1) # keep the original image 
  job.so_far = numtiles
  job.resources_used  = json.dumps({"time":time.time() - stm,"num_tiles":numtiles})
  saveJob(job)


  

def sendCompletionEmail(job):
  o = job.owner
  u = models.loadUserD('/user/'+o,thePageStore)
  if getattr(u,"email",None):
    ses.sendImportDoneEmail(u,job.subject)
 
""" format of call /run_job?id=N  """

def runJob(job,backend=False):
  k = job.kind;
  vprint("KIND ",k)
  if k=="build_tiling":
    rs = buildTiling(job,backend)
  elif k=="resize_image":
    rs = resizeImage(job,backend)
  elif k=="to_s3":
    rs = toS3(job,backend)
    if backend:
      sendCompletionEmail(job)
    
  vprint("DONE")
 
  

def runNextImport():
  global thePageStore
  allocateStore()
  pn = models.pendingJobs(thePageStore)
  if len(pn) == 0:
    return False
  job = pn[0]
  job.pageStore = thePageStore
  o = job.owner
  sb = job.subject
  job.status = "done"
  job.save()
  jobs = [
  models.allocateAJob(o,sb,"resize_image",pageStore=thePageStore),
  models.allocateAJob(o,sb,"build_tiling",pageStore=thePageStore),
  models.allocateAJob(o,sb,"to_s3",pageStore=thePageStore)]
  for j in jobs:
    runJob(j,True)
    if j.status != "done":
      break
  closeStore()
  return job.idx
    

  
  

def jobImname(job):
  k = job.kind
  sb = job.subject
  if (k=="upload") or (k=="add_image_to_db") or (k == "retrieve"):
    sbo = json.loads(sb)
    return sbo["image_name"]
  else:
    return sb
  # fs = cgi.FieldStorage()

def jobImtopic(job):
  user = job.owner
  imname = jobImname(job)
  return "/image/"+user+"/"+imname 



def impjob(delay,iterations=0):
  cnt = 0
  while (iterations==0) or (cnt < iterations):
    dt = datetime.datetime.utcnow()
    print dt.isoformat(),"iteration number ",cnt
    cnt = cnt+1
    jbn = runNextImport()
    if jbn:
      print "RAN JOB ",jbn
    image.openedImageFiles = {}
    time.sleep(delay)


   
"""
import urllib2

url = "http://uploadd.wikimedia.org/wikipedia/commons/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg"

req = urllib2.Request(url, headers={'User-Agent' : "ImageDiver"}) 
f = urllib2.urlopen( req )
#print con.read()

f = urllib2.urlopen("https://uploadd.wikimedia.org/wikipedia/commons/thumb/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg/1039px-Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg")

f.headers.getheaders("content-length")

bf = f.read(10000)



python
execfile("ops/execthis.py")



import store.log
logstore = store.log
import os

thePageStore = {}


def saveFileSizes(dir):
  cnt = 0
  files = os.listdir(dir)
  for file in files:
    path = dir + "/" + file
    sz = os.path.getsize(path)
    #print "saving file size? ",path,sz
    exsz = logstore.selectFilesize(path,thePageStore)
    if exsz == None:
      #print "saving file size ",path,sz
      logstore.newFilesizeEntry(path,sz,thePageStore)
      cnt = cnt + 1
  return cnt
 


def svfs(imtp):
 im = image.loadImageD(imtp)
 imdir = im.imDir()
 #print "tilint",saveFileSizes(imdir+"tiling")
 #print "resized",saveFileSizes(imdir+"resized")


svfs('/image/5ee275d/aa8')


svfs('/image/4294b0e/the_dutch_proverbs')

svfs('/image/4294b0e/astoria_1923')

svfs('/image/4294b0e/garden_of_earthly_delights')
"""

  
