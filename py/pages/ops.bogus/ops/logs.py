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
from WebClasses import WebResponse
import gzip
import store.log
logstore = store.log
import datetime
import time
import api.utils
apiutils = api.utils

import constants

"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""

deleteLogFiles = True # maybe someday move the log files so their details are available

import cgi
import re
import subprocess
import urllib2

logsDir = "/mnt/ebs1/imagediver/logs"
cf_logDir = "/mnt/ebs1/imagediver/cf_logs"

import ops.s3
s3 = ops.s3

import time

import boto.s3.bucketlistresultset



sample = "https://s3.amazonaws.com/cloudfront_imagediver_log/imagediver_static/E27HBLO6YLTRAW.2012-06-07-16.IPlxKPjZ.gz"

def logKeys():
  bk = s3.s3Init("cloudfront_imagediver_log")
  rs = boto.s3.bucketlistresultset.BucketListResultSet(bk)
  return rs

def filesize(pth):
  logstore.initStore()
  exf = logstore.selectFilesize(pth)
  if exf == None:
    fln = "/mnt/ebs1/imagediver"+pth
    if os.path.exists(fln):
      rs = os.path.getsize(fln)
    else:
      rs = 0
    logstore.newFilesizeEntry(pth,rs)
    return rs
  return exf
  
def readLog(byentry,ky):
  lgfn = logsDir + "/temp.gz"
  ky.get_contents_to_filename(lgfn)
  f = gzip.open(lgfn,"rb")
  cn = f.read()
  f.close()
  if deleteLogFiles:
    ky.delete()
  cns = cn.split("\n")
  fns = []
  cnsln = len(cns)
  for i in range(2,cnsln-1):
    ll = cns[i].split("\t")
    dt = ll[0]
   
    fn = ll[7]
    sz = filesize(fn)
    
    fns = fn.split("/")
    if len(fns) > 2:
      owner = fns[2]
      eqp = fn.find("=")
      if eqp == -1:
        albums = owner+".0"
      else:
        albums = fn[eqp+1:]
      ky = dt+"."+albums
      csz = byentry.get(ky,None)
      if csz == None:
        byentry[ky] = sz
      else:
        byentry[ky] = sz + csz
    fns.append(ll[7])
    return cn
  #return fns

def readLogs():
  acn = ""
  kys = logKeys()
  byentry = {}
  someLog = False
  for k in kys:
    cn = readLog(byentry,k)
    acn += "\n\n:"+cn
    someLog = True
    #rs.extend(readLog(k))
  " save what's been read"
  if someLog:
    svf = open(cf_logDir+"/"+str(int((time.time()/10)-134046326)),"w")
    acn += "\n"
    svf.write(acn)
    svf.close()
  return byentry

def storeLogs(byentry):
  logstore.initStore()
  for k,v in byentry.iteritems():
    ks = k.split(".")
    dt=ks[0]
    owner = ks[1]
    album = int(ks[2])
    dts = dt.split("-")
    pdt = datetime.date(int(dts[0]),int(dts[1]),int(dts[2]))
    dto = pdt.toordinal()    
    logstore.addToLogEntry(dto,owner,album,v)
  logstore.closeStore()

def logjob(delay,iterations):
  cnt = 0
  while cnt < iterations:
    dt = datetime.datetime.utcnow()
    print dt.isoformat(),"iteration number ",cnt
    cnt = cnt+1
    bent = readLogs()
    storeLogs(bent)
    print dt.isoformat(),"completed\n"
    time.sleep(delay)


"""
cd /mnt/ebs0/imagediverdev/log
nohup python /mnt/ebs0/imagediverdev/py/scripts.py start&

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python
import ops.logs
logger = ops.logs
logger.logjob(15,1)

"""
  

  
