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
""" this resembles logs.py, but is for ordinary s3 logging, rather than cloudfront logging
for bandwidth """


# i use the pageStore mechanism for managing global state, since it is built into the store implementation

thePageStore = {"iam":"s3logStore"}


deleteLogFiles = False

import cgi
import re
import subprocess
import urllib2

logsDir = "/mnt/ebs1/imagediver/logs"
s3_logDir = "/mnt/ebs1/imagediver/s3_logs/"
s3_logFile = "/mnt/ebs1/imagediver/s3_log"

import ops.s3
s3 = ops.s3

import time
import misc

import boto.s3.bucketlistresultset

deleteKeys = True

verbose = False


def vprint(*args):
  if verbose:
    misc.printargs(args,"S3LOGS")


#sample = "https://s3.amazonaws.com/imagediver_log/s3_imagediver2012-06-21-02-55-06-58E5423BA89D6FF4"

def logKeys():
  bk = s3.s3Init("imagediver_log")
  rs = boto.s3.bucketlistresultset.BucketListResultSet(bk)
  return rs

"""
Bucket Owner	 The canonical user id of the owner of the source bucket.
Bucket	 The name of the bucket, against which the request was processed.
Time	 The time at which the request was proceed.
Remote-IP	 This shows the Internet address of the requestor.
Requestor	 The canonical User Id of the request.
Request-Id	 The request ID is a unique string generated by Amazon  S3 .
Operation	 Either SOAP or REST.
Key	 ?-?when no operation is performed on key, Otherwise name of the key.
Request-URI	 The request-URI of the http request header.
HTTP status	 The numeric http status code of the response.
Error Code	 The Amazon  S3 Error Code , or '-' if no error occurred.
Bytes Sent	 The number of response bytes sent, excluding HTTP protocol overhead, or '-' if zero.
Object Size	 The total size of the object.
Total Time	 The total number of milliseconds from the time your request is received to the time that the last byte of the response is sent.
Turn-Around Time	 The number of milliseconds that Amazon  S3 spent for processing your request.
Referrer	 The value of the HTTP Referrer header, if present. HTTP user-agents (e.g. browsers) typically set this header to the URL of the linking or embedding page when making a request.
User-Agent	 The value of the HTTP User-Agent header.

aa = '0a493deeba5f421843089175bb91c8a79432421dc39f50a7f6e0c83a96852428 s3.imagediver.org [10/Aug/2012:00:02:38 +0000] 75.164.254.138 - 80B242D6CA39BE25 WEBSITE.GET.OBJECT plus.png "GET /plus.png HTTP/1.1" 304 - - 610 16 - "http://s3.imagediver.org/topic/album/4294b0e/the_dutch_proverbs/1/index.html" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.75 Safari/537.1"' 



rep = '(?P<owner>[^\ ]*)\ (?P<bucket>[^\ ]*)\ \[(?P<date>[^\:]*)\:(?P<time>[^\]]*)\]\ (?P<remote_ip>[^\ ]*)\ (?P<requestor>[^\ ]*)\ (?P<request_id>[^\ ]*)\ '+\
'(?P<operation>[^\ ]*)\ (?P<key>[^\ ]*)\ \"(?P<request_uri>[^\"]*)\"\ (?P<http_status>[^\ ]*)\ (?P<error_code>[^\ ]*)\ (?P<bytes_sent>[^\ ]*)\ (?P<object_size>[^\ ]*)\ ' +\
'(?P<total_time>[^\ ]*)\ (?P<turn_around_time>[^\ ]*)\ \"(?P<referrer>[^\"]*)\"\ \"(?P<user_agent>[^\"]*)\"'


m = re.search(rep,aa)
m.groups()

m.group('date')
m.group('time')
m.group('requestor')

m.group('request_id')

"""


rep = '(?P<owner>[^\ ]*)\ (?P<bucket>[^\ ]*)\ \[(?P<date>[^\:]*)\:(?P<time>[^\ ]*)(?:[^\]]*)\]\ (?P<remote_ip>[^\ ]*)\ (?P<requestor>[^\ ]*)\ (?P<request_id>[^\ ]*)\ '+\
'(?P<operation>[^\ ]*)\ (?P<key>[^\ ]*)\ \"(?P<request_uri>[^\"]*)\"\ (?P<http_status>[^\ ]*)\ (?P<error_code>[^\ ]*)\ (?P<bytes_sent>[^\ ]*)\ (?P<object_size>[^\ ]*)\ ' +\
'(?P<total_time>[^\ ]*)\ (?P<turn_around_time>[^\ ]*)\ \"(?P<referrer>[^\"]*)\"\ \"(?P<user_agent>[^\"]*)\"'

def readLog(rsa,cn,k):
  global logcnt,cf_logDir
  vcnt = 0
  cns = cn.split("\n")
  fns = []
  cnsln = len(cns)
  #print "LINES ",cnsln
  for ln in cns:
    #print "LINE",ln
    dm = re.search(rep,ln)
    if dm:
      dt = dm.group('date')
      tm = dm.group('time')
      rq = dm.group('request_uri')
      rfr = dm.group('referrer')
      ua = dm.group('user_agent')
      fromS3Idv = rfr.find("//s3.imagediver.org") >= 0
      if fromS3Idv:
        continue
      isTopic = rq.find("/topic/") >= 0
      if not isTopic:
        continue
      #grps = dm.groups()
      #dt = grps[0]+"-"+grps[1]+"-"+grps[2]
      pdt =  datetime.datetime.strptime(dt,"%d/%b/%Y")
      fim = rfr.find("imagediver.org") >= 0
      dto = pdt.toordinal()
      #if (isgetTopic or isDollar) and not fim:
      rs = "DATE {0} {1} REQUEST {2} REFERRER {3} AGENT {4}\n".format(dt,tm,rq,rfr,ua)
      print "RS",rs
      rsa.append(rs)
      continue
      if isDollar:
        rs = "date ["+dt,"] dto ",dto," request [",rq,"] referrer[",rfr,"] agent [",agent
      if dto < 734729:
        print "DELETE"
        k.delete()
        return
        
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
  print "ZUB"
  global logcnt
  logcnt = 0
  kys = logKeys()
  rsa = []
  someLog = False
  archiveName = str(int((time.time()/10)-134046326))
  for k in kys:
    kn = k.name
    #print "KEYNAME",kn
    if kn[0:13] != "s3_imagediver":
      k.delete()
      print "UNEXPECTED key",kn
      continue
    cn = k.get_contents_as_string()
    fanm = s3_logDir + archiveName + "." + str(logcnt)
    ofl = open(fanm,'w')
    ofl.write(cn)
    ofl.close()
    logcnt = logcnt + 1
    readLog(rsa,cn,k)
    if deleteKeys: k.delete()
    continue
  if len(rsa)  > 0:
    log = open(s3_logFile,"a")
    log.writelines(rsa)
    log.close()
  return rsa

def logjob(delay,iterations):
  global logcnt
  cnt = 0
  while cnt < iterations:
    stm = time.time()
    dt = datetime.datetime.utcnow()
    print dt.isoformat()," s3logs iteration number ",cnt
    cnt = cnt+1
    bent = readLogs()
    etm = time.time() - stm
    print dt.isoformat(),"completed processing of "+str(logcnt)+" s3 log files in "+str(etm)+" seconds \n"
    time.sleep(delay)

""" NOW LOGGING not for bandwidth, but for tracking activity. From imagediver_log """



"""



PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

cd /mnt/ebs0/imagediverdev/py


python
execfile("ops/execthis.py")
execfile("ops/s3log.py")


aa = readLogs()

kk = logKeys()


storeLogs(aa)



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
import ops.s3logs

logger = ops.s3logs

#aa = logger.readArchive("E27HBLO6YLTRAW.2012-08-09-17.sjAKGf6n.gz")


aa = logger.readLogs()





aa = logger.readArchive("391187")



aa = logger.readArchive("392384")


logger.readLog(byent,unrec,
bent = logger.readLogs()

logger.storeLogs(bent[0])


logger.logjob(15,2)


www.imagediver.org/art/dutch_proverbs

"""
  

  
