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
Logr.log("api","HOHOHO8O")
import model.models
models  = model.models
import gzip
import store.log
logstore = store.log
import datetime
import time
import api.utils
apiutils = api.utils

import constants
import ops.utilization
utz = ops.utilization

"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""


# i use the pageStore mechanism for managing global state, since it is built into the store implementation

thePageStore = {"iam":"logStore"}


deleteLogFiles = True

import cgi
import re
import subprocess
import urllib2

logsDir = "/mnt/ebs1/imagediver/logs"
cf_logDir = "/mnt/ebs1/imagediver/cf_logs"

import ops.s3
s3 = ops.s3

import time
import misc

import boto.s3.bucketlistresultset

verbose = False


def vprint(*args):
  if verbose:
    misc.printargs(args,"LOGS")


sample = "https://s3.amazonaws.com/cloudfront_imagediver_log/imagediver_static/E27HBLO6YLTRAW.2012-06-07-16.IPlxKPjZ.gz"

def logKeys():
  bk = s3.s3Init("cloudfront_imagediver_log")
  rs = boto.s3.bucketlistresultset.BucketListResultSet(bk)
  return rs

def filesize(pth):
  logstore.initStore(thePageStore)
  exf = logstore.selectFilesize(pth,thePageStore)
  if exf == None:
    fln = "/mnt/ebs1/imagediver"+pth
    if os.path.exists(fln):
      rs = os.path.getsize(fln)
    else:
      rs = 0
    logstore.newFilesizeEntry(pth,rs,thePageStore)
    return rs
  return exf

logcnt = 0
""" don't bother reporting on accesses to knownPaths """
knownPaths = set(["/","/crossdomain.xml","/favicon.ico","/robots.txt"])

def readLog(byentry,unrec,cn):
  global logcnt,cf_logDir
  cns = cn.split("\n")
  fns = []
  cnsln = len(cns)
  " find the fields line "
  fieldLine = -1
  for n in range(0,cnsln):
    cln = cns[n]
    if cln[0:8] == "#Fields:":
      fieldLine = n
      break
  if fieldLine == -1:
    raise Exception("FIELD LINE NOT FOUND")
  fldln = cns[fieldLine]
  flds = fldln.split(" ")
  vprint(flds)
  ln = len(flds)
  dateIdx = None
  uriIdx = None
  for i in range(0,ln):
    f = flds[i]
    if f=="date":dateIdx = i-1
    if f=="cs-uri-stem":uriIdx = i-1
    if f=="cs-uri-query":queryIdx = i-1
  if (dateIdx==None) or (uriIdx==None) or (queryIdx==None):
    raise Exception("FIELD LINE COULD NOT BE INTERPRETED")
  maxIdx = max(dateIdx,uriIdx,queryIdx)
  def addUnrec(unrec,pth,reason=None):
    if pth in knownPaths: return
    if reason:
      unrec.append(reason+": "+pth)
    else:
      unrec.append(pth)
  vprint("CNSLN",cnsln)
  for i in range(fieldLine+1,cnsln-1):
    vprint(cns[i])
    ll = cns[i].split("\t")
    if (len(ll)-1) < maxIdx:
      vprint("UNEXPECTED LINE["+cns[i]+"]")
      break
    #dt = ll[0]
    dt = ll[dateIdx]
    fn = ll[uriIdx]
    qr = ll[queryIdx]
    vprint("QR ",qr)
    #fn = ll[7]
    " check to see if the file is a jpg "
    dtp = fn.rfind(".")
    if dtp > 0:
      adot = fn[dtp+1:]
      if adot != "jpg":
        addUnrec(unrec,fn)
        continue
    else:
      addUnrec(unrec,fn)
      continue     
    sz = filesize(fn)
    if sz==0:
      addUnrec(unrec,fn,reason="UNKNOWN SIZE")
      continue          
    vprint(fn)
    owner = None
    """ first, the case of a query string of the form album=<owner>.<albumidx> """
    imm=re.search('\/images\/\w*\/(\w*)\/',fn)
    #print fn,imm
    image = "unknown_image"
    if imm:
      grps = imm.groups()
      if len(grps)==1:
        image = grps[0]
      
    if qr != "_":
      vprint("QR ",qr)
      m=re.search('album=(\w*).(\d*)',qr)
      if m:
        grps = m.groups()
        if len(grps)==2:
          owner=grps[0]
          albumIdx = grps[1]
          vprint("FROM QS OWNER",owner,"image",image,"albumIdx",albumIdx)
    """ for files other than new style references from albums """
    if  owner == None:
      fns = fn.split("/")
      if len(fns) > 2:
        owner = fns[2]
        albumIdx = 0
      else:
        addUnrec(unrec,fn)
        continue
    ky = dt+"."+owner+"."+image+"."+str(albumIdx)
    vprint("KEY ",ky)
    " this is the owner of "
    csz = byentry.get(ky,None)
    if csz == None:
      byentry[ky] = sz
    else:
      byentry[ky] = sz + csz
  return cn
  #return fns

def readArchive(k):
  byent = {}
  unrec = []
  f = open(cf_logDir+"/"+k)
  cn = f.read()
  f.close()
  readLog(byent,unrec,cn)
  return (byent,unrec)

def readLogs():
  global logcnt
  unrec = []
  logcnt = 0
  acn = ""
  kys = logKeys()
  byentry = {}
  someLog = False
  archiveName = str(int((time.time()/10)-134046326))
  for k in kys:
    kn = k.name
    kns = kn.split("/")
    if kns[0] != "imagediver_static":
      print "UNEXPECTED key",kn
      continue
    kn1 = kns[1]
    
    lgfn = logsDir + "/temp.gz"
    try:
      k.get_contents_to_filename(lgfn)
    except Exception as ex:
      print "EXCEPTION ",ex," on key ",kn
      continue
    f = gzip.open(lgfn,"rb")
    logcnt = logcnt + 1
    if deleteLogFiles:
      k.delete()
    cn = f.read()
    f.close()
    vprint("CONTENT LENGTH",len(cn))
    svf = open(cf_logDir+"/"+kn1,"w")
    svf.write(cn)
    svf.close()
    try:
      readLog(byentry,unrec,cn)
    except Exception as ex:
      print "EXCEPTION IN readlog",k,ex
  return (byentry,unrec)

def safeInt(s):
  try:
    rs = int(s)
  except Exception:
    rs = -1
  return rs

def storeLogs(byentry):
  logstore.initStore(thePageStore)
  who = {}
  for k,v in byentry.iteritems():
    ks = k.split(".")
    dt=ks[0]
    owner = ks[1]
    who[owner] = 1
    image = ks[2]
    album = safeInt(ks[3])
    dts = dt.split("-")
    pdt = datetime.date(int(dts[0]),int(dts[1]),int(dts[2]))
    dto = pdt.toordinal()    
    logstore.addToLogEntry(dto,owner,image,album,v,thePageStore)
    print "Entry ",k,v
  logstore.closeStore(thePageStore)
  return who

def logjob(delay,iterations):
  global logcnt
  cnt = 0
  while cnt < iterations:
    stm = time.time()
    dt = datetime.datetime.utcnow()
    print dt.isoformat(),"iteration number ",cnt
    cnt = cnt+1
    bent = readLogs()
    etm = time.time() - stm
    who = storeLogs(bent[0])
    whot = ["/user/"+o for o in who]
    print "WHOT",whot
    utz.bandwidthCheckSome(whot,thePageStore)
    print dt.isoformat(),"completed processing of "+str(logcnt)+" log files in "+str(etm)+" seconds \n"
    unrec = bent[1]
    if len(unrec) > 0:
      print "UNRECOGNIZED ACCESSES "
      for u in unrec:
        print "  "+u
    time.sleep(delay)


""" NOW LOGGING not for bandwidth, but for tracking activity. From imagediver_log """



"""
for k,v in byentry.iteritems():
   ks = k.split(".")
   dt=ks[0]
   owner = ks[1]
   album = int(ks[2])
   dts = dt.split("-")
   pdt = datetime.date(int(dts[0]),int(dts[1]),int(dts[2]))
   dto = pdt.toordinal()    


cd /mnt/ebs0/imagediverdev/log
nohup python /mnt/ebs0/imagediverdev/py/scripts.py start&

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python
import ops.logs

logger = ops.logs

aa = logger.readArchive("E27HBLO6YLTRAW.2012-08-17-18.d86dQK83.gz")

logger.storeLogs(aa[0])

aa = logger.readLogs()





aa = logger.readArchive("391187")



aa = logger.readArchive("392384")


logger.readLog(byent,unrec,
bent = logger.readLogs()

logger.storeLogs(bent[0])


logger.logjob(15,2)

"""
  

  
