#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""
backendThreshold = 60 * 1000 * 1000 #threshold in pixels for using the backend to do the import; IMPORTANT sync this with the corresponding js variable
import urlparse
import threading
import time
import urllib
import os
import json
import Logr
import time
Logr.log("api","HOHOHO8O")
import model.models
models  = model.models
from WebClasses import WebResponse,okResponse,failResponse
import model.image
image = model.image
import model.album
album = model.album
import api.utils
apiutils = api.utils

import ops.s3
s3 = ops.s3

import constants

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
import ops.imp
imp = ops.imp



verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"API/JOB")
  




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


testMode = False # in which jobs are not saved

def saveJob(job):
  #if testMode:
  #  return
  job.save()
  
  
def jobDone(job):
  job.status = "done"
  tp = job.topic
  #f jobsByTopic[tp]: del jobsByTopic[tp]
  if testMode:
    return
  job.save()




def imageForJob(job):
  topic = jobImtopic(job)
  return image.loadImageD(topic,getattr(job,"pageStore",None))




def whenCanceled(job):
    #if jobsByTopic[tp]: del jobsByTopic[tp]
    im = image.ImageD(None)
    im.owner = "/user/"+job.owner
    im.name = jobImname(job)
    imdir = im.imDir()
    imfile = imdir+"import"
    vprint("CANCELED, deleting ",imfile)
    if os.path.exists(imfile):
      os.remove(imfile)
 

 
def checkJobCanceled(job):
  if testMode:
    return False
  tp = job.topic
  sjob = models.getJob(tp,job.pageStore)
  rs = sjob.status == 'canceled'
  vprint("CANCELED checked",tp,rs)
  if rs:
    job.status = "canceled"
    whenCanceled(job)
  return rs

   

       
                   
def retrieveImageThread(job,f,ofile,imname):
  if False:
    testThread(job)
    return
  #url = job.aux
  cln = job.total
  vprint(job.__dict__)
  job.status = "active"
  saveJob(job)
  #bufsize = 2000
  bufsize = 1000000
  sf = 0
  while sf < cln:
    tor = min(bufsize,cln-sf)
    buf = f.read(tor)
    vprint("READ BUFFER",tor,len(buf))
    if checkJobCanceled(job):
      ofile.close()
      return
    ofile.write(buf)
    #time.sleep(0.5)
    sf = sf + tor
    job.so_far = sf
    saveJob(job)

  vprint("READ DONE",job.topic)
  ofile.close()
  job.status = "done"
  job.so_far=cln

  """ NEWUPLOAD put back in  """
  try:
      im = addImageToDb(job)
  except Exception as ex:
      print ex.args
      msg,szx,szy = ex.args
      area = szx*szy
      areast = misc.bytesstring(area,pixels=1)
      errmsg = "Apologies: ImageDiver currently supports images up to 0.5 gigapixels, and this has size "+areast+". Import canceled.";

      #errmsg = json.dumps({"error":"tooBig","size":int(szx * szy)})
      vprint("TOO BIG",errmsg,szx,szy)
      job.error = errmsg
      job.status = 'error'
      saveJob(job)
      return
  
  sbs = job.subject
  #print "SBS",sbs
  sb = json.loads(sbs)
  imd = im.dimensions
  sb["dimensions"]= imd
  area = imd["x"] * imd["y"]
  sbs = json.dumps(sb)
  #print "NEW SBS",sbs,"AREA ",area
  job.subject = sbs
  
  
  saveJob(job)
  if area > backendThreshold: # IMPORTANT sync this with the corresponding js variable
    allocateImportJob(job.owner,imname,pageStore=job.pageStore)  #NEWUPLOAD put this line back in to reverse

                    

def retrieveImage(job):
  vprint("READ RETRIEVE IMAGE")
  vprint("READ SUBJECT "+job.subject)
  


  sb = json.loads(job.subject)
  url = sb["source"]
  imname = sb["image_name"]
  #url = 'http://upload.wikimedia.org/wikipedia/commons/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg';
  #dst = job.subject
  #url = "http://jdil.org"
  #url = "http://dev.imagediver.org/snapthumb/cg/The_Dutch_Proverbs/7.jpg"
  req = urllib2.Request(url, headers={'User-Agent' : "ImageDiver"})
  try:
    f = urllib2.urlopen( req )
  except Exception:
    vprint("Could not open URL")
    return "Could not open URL"
  clnh = f.headers.getheaders("content-length");
  if (not clnh) or (len(clnh)== 0):
    msg = "Could not open Image - probably not an image file"
    return msg
  cln = clnh[0]
    
  cln = int(f.headers.getheaders("content-length")[0])
  job.total = cln
  job.so_far = 0
  job.status = "active"
  saveJob(job)
  jobs.closeStore(job.pageStore)
  user = job.owner
  im = image.newImageD(user,imname)
  im.createDirs()
  imdir = im.imDir()
  opath = imdir+"import"
  #outPath = outDir+"/"+user+"/"+imname
  outFile = open(opath,"w")
  btt = threading.Thread(target=retrieveImageThread,args=(job,f,outFile,imname))
  btt.start()
  return True

def toS3InThread(job):
  th = threading.Thread(target=imp.toS3,args=(job,))
  th.start()
  return True


def resizeImageInThread(job):
  th = threading.Thread(target=imp.resizeImage,args=(job,))
  th.start()
  return True


def buildTilingInThread(job):
  th = threading.Thread(target=imp.buildTiling,args=(job,))
  th.start()
  return True
  

def addImageToDb(job):  
  sb = json.loads(job.subject)
  url = sb["source"]
  imname = sb["image_name"]
  vprint("addImage",imname,url)
  im = image.addImageToDb(job.owner,imname,url)
  #album.newAlbum(im.topic,job.owner,".snaps.") now on demand
  return im


  
def grabBuffer(job):
  vprint("GRABBuffer")
  global bufferCount,lastBuf,boundary,outFile,outlength,outPath
  bufferCount = bufferCount+1
  Logr.log("upload"," grabbing buffer "+str(bufferCount))
  vprint("GRAB START READ")
  buf  = instream.read(buffsize) # blocking may take time
  vprint("GRAB END READ")
  #Logr.log("upload","grabbed buffer ["+buf+"]")
  
  #ln = len(buf)
  last2bufs = lastBuf + buf
  #Logr.log("upload","\n\n\n SEARCH FOR ["+boundary+"] \n ["+last2bufs+"]")
  bndp = last2bufs.find(boundary)
  if bndp >= 0:
    vprint("GRABBED LAST BUFFER")
    if checkJobCanceled(job):
      vprint("UPLOAD CANCELED")
      return

    lastbuf = last2bufs[0:bndp-2]
    #Logr.log("upload","LASTBUF ["+lastbuf+"]")
    outFile.write(lastbuf)
    job.status = "done"
    saveJob(job)
    outFile.close()
    sb = job.subject
    sbo = json.loads(sb)
    imname = sbo["image_name"]
    try:
      im = addImageToDb(job)
    except Exception as ex:
      msg,szx,szy = ex.args
      area = szx*szy
      areast = misc.bytesstring(area,pixels=1)
      errmsg = "Apologies: ImageDiver currently supports images up to 0.5 gigapixels, and this has size "+areast+". Import canceled.";

      #errmsg = json.dumps({"error":"tooBig","size":int(szx * szy)})
      vprint("TOO BIG",errmsg,szx,szy)
      job.error = errmsg
      job.status = "error"
      saveJob(job)
      return False


    sbs = job.subject
  #print "SBS",sbs
    sb = json.loads(sbs)
    imd = im.dimensions
    sb["dimensions"]= imd
    area = imd["x"] * imd["y"]
    sbs = json.dumps(sb)
    job.subject = sbs
    #image.addImageToDb(job.owner,job.subject)
    saveJob(job)
    if job.total > backendThreshold: 
      allocateImportJob(job.owner,imname,pageStore=job.pageStore)
    return False
  if len(buf) < buffsize:
    Logr.log("upload","internal error: no end boundary found in upload")
    vprint("GRAB exception")
    raise Exception("internal error: no end boundary found in upload")
  if checkJobCanceled(job):
    vprint("UPLOAD CANCELED")
    return
  Logr.log("update","BUF ["+lastBuf+"]")
  vprint("GRAB about to write")
  outFile.write(lastBuf)
  outlength = outlength + len(lastBuf)
  job.so_far=outlength
  saveJob(job)
  job = models.getJob(job.topic)
  cr = job.status == "canceled"
  if cr:
    vprint("GRAB canceled")
    Logr.log("upload","canceling upload")
    outFile.close()
    os.remove(outPath)
    return False
    
    
  Logr.log("upload"," uploaded "+str(outlength))

  lastBuf = buf
  vprint("GRABBUF DONE")
  return True
  
    
    
    
  
  
  
""" format of call /run_job?id=N  """

def runJob(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  session = webin.session
  user = session.user.split("/")[-1]
  qs = webin.queryString
  qsp = urlparse.parse_qs(qs)
  jobId  = qsp["id"][0]
  vprint("runJob",jobId)
  #jobId = qs.split("=")[1]
  jobTopic = "/job/"+user+"/"+jobId
  theJob = models.getJob(jobTopic,webin.pageStore)
  theJob.topic = jobTopic
  k = theJob.kind;
  vprint("RUNNING JOB ",jobId,"KIND ",k)
  if theJob.status == "canceled":
    vprint("JOB CANCELED BEFORE IT STARTED")
    return okResponse("canceled")
  if k=="upload":
    rs = upload(theJob,webin)
  if k=="retrieve":
    rs = retrieveImage(theJob)
  """ the rest of these cases no longer occur, due to the separate importer """
  if k=="add_image_to_db":
    rs = addImageToDb(theJob)
  #if k=="build_tiling" or k=="resize_image" or k=="to_s3":
  #  rs = None
  elif k=="build_tiling":
    rs = buildTilingInThread(theJob)
  elif k=="resize_image":
    rs = resizeImageInThread(theJob)
  elif k=="to_s3":
    rs = toS3InThread(theJob)
  #jobs.closeStore(webin.pageStore)
  if type(rs)==str:
    vprint("FAIL FROM RUN JOB",rs)
    return failResponse(rs)
    del jobsByTopic[jobTopic]
  return okResponse()


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

def upload(job,webin):
  global instream,inlength,lastBuf,boundary,outFile,theJob,outPath,outlength
  cks = webin.checkSessionResponse()
  if cks: return cks
  user = job.owner
  vprint("GRAB START UPLOAD")
  qs = webin
  instream = webin.contentStream  
  inlength  = webin.contentLength
  bufsize = 300
  irl = min(inlength,buffsize)
  vprint("GRAB START INIT READ")
  cn = instream.read(irl) # irl = initial read length
  vprint("GRAB  FINISH INIT READ")
  if checkJobCanceled(job):return
  bend = cn.find("\r\n")
  boundary = cn[0:bend]
  payloadStart = cn.find("\r\n\r\n",bend+1)
  pay1 = cn[payloadStart+4:irl]
  Logr.log("upload","CONTENTLENGTH ["+str(inlength)+"]");
  Logr.log("upload","{0} {1}".format(bend,payloadStart))
  Logr.log("upload","BOUNDARY ["+boundary+"]");
  #Logr.log("upload","content ["+cn+"]");
  #Logr.log("upload","pay ["+pay1+"]");
  lastBuf = cn[payloadStart+4:irl]
  #Logr.log("upload","LASTBUF ["+lastBuf+"]");
  #theUpload = models.getJob("/job/"+user+"/"+uploadId)
  job.total = inlength
  job.status = "active"
  saveJob(job)
  sb = job.subject
  sbo = json.loads(sb)
  imname = sbo["image_name"]
  # fs = cgi.FieldStorage()
  job.imTopic = "/image/"+user+"/"+imname # not saved; used for cancelation
  imDir = constants.imageRoot+user+"/"+imname+"/"
  vprint("IMDIR ",imDir)
  image.createImDirs(imDir)
  vprint("IMDIR DONE")
  outPath = imDir+"import"
  outFile = open(outPath,"w")
  outlength = 0
  while grabBuffer(job):
    pass





def allocateImportJob(owner,subject,pageStore=None):
  vprint("ALLOCATE IMPORT JOB",pageStore)
  models.allocateAJob(owner,subject,"import","pending",pageStore=pageStore)
 

"""
   
def allocateImportJobs(owner,subject):
  vprint("ALLOCATE IMPORT JOBS"
  allocateAJob(owner,subject,"resize_image")
  allocateAJob(owner,subject,"build_tiling")
  allocateAJob(owner,subject,"to_s3")


"""
def allocateJob(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  session = webin.session  
  Logr.log("upload","SESSION: "+str(session.__dict__))
  user = session.user.split("/")[-1]
  cobs = json.loads(webin.content())
  rs = []
  vprint("allocateJob")
  for cob in cobs:
    knd = cob["kind"]
    jb = models.Job()
    jb.pageStore = webin.pageStore
    sb = cob["subject"]
    jb.kind = knd
    jb.owner = cob["owner"]
    jb.total = 0
    jb.subject = sb
    vprint("KINDIS "+knd)
    if  (knd == "upload") or (knd == "retrieve"):
      sbo = json.loads(sb)
      imname = sbo["image_name"]
      imtopic = "/image/"+user+"/"+imname
      im = image.loadImageD(imtopic,webin.pageStore)
      vprint("CHECKING EXISTS",imtopic)
      if im:
        vprint("YES EXISTS",imtopic)
        jb.status = "exists"
        jb.save()
        rs = "exists"
        break
    jb.save()
    vprint(" ALLOCATED JOB ",jb.topic)
    jobs.closeStore(webin.pageStore)
    rs.append(jb.__dict__)
  #upload = models.newUpload(nm,user,exists)
  return okResponse(rs)

  
"""
http://dev.imagediver.org/topic/job/cg/4/get()
"""

def emitJob(webin,pp):
  namep = pp.name
  owner=namep[0]
  idx = namep[1]
  theJob = models.getJob("/job/"+owner+"/"+idx,webin.pageStore)
  if getattr(theJob,"pageStore",None):
    del theJob.pageStore
  if not theJob:
    return failResponse("noSuchJob")
  return okResponse(theJob.__dict__)
   

def cancelJob(webin,pp):
  namep = pp.name
  owner=namep[0]
  idx = namep[1]
  topic = "/job/"+owner+"/"+idx
  theJob = models.getJob(topic,webin.pageStore)
  vprint("CANCEL ","["+topic+"]",theJob,theJob.kind,theJob.status)
  if theJob == None:
    vprint("CANCELED could not find ",topic," to cancel")
    return failResponse("noSuchJob")
  
  st = theJob.status
  theJob.status = "canceled"
  saveJob(theJob)
  if st=="done":
    whenCanceled(theJob)
  # there is the bare chance of a race condition: the job is just finishing when the canceled notification is written
  # so check for this
  time.sleep(0.1)
  jb = models.getJob(topic,webin.pageStore)
  if jb.status == "done":
    print "CANCEL very unusual: race condition for ",topic
    whenCanceled(jb)
  #if (k=="retrieve") or (k == "upload"):
  #  whenCanceled(theJob)
  #whenCanceled(theJob)
  theJob.status = "canceled"
  saveJob(theJob)
  return okResponse()

"""
import urllib2

url = "http://uploadd.wikimedia.org/wikipedia/commons/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg"

req = urllib2.Request(url, headers={'User-Agent' : "ImageDiver"}) 
f = urllib2.urlopen( req )
pprint con.read()

f = urllib2.urlopen("https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg/1039px-Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg")


f = urllib2.urlopen("https://www.dropbox.com/lightbox/home/Photos/Sample%20Album")


f.headers.getheaders("content-length")

bf = f.read(10000)


"""

  