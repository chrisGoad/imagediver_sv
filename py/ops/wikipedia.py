#!/usr/bin/env python

"""



PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python /mnt/ebs0/imagediverdev/py/ops/run_importer.py


python
execfile("ops/execthis.py")

"""

execfile("ops/execthis.py")

alb = "/album/4294b0e/Saint_Francis_Bellini/1"


albumD = album.loadAlbumD(alb)
snapDs = albumD.snaps()

byOrdinal = {}
byCaption = {}

def aspectRatio(sn):
  xt = sn["coverage"]["extent"]
  return xt["y"]/xt["x"]

 
def setup(snapDs):
  for sn in snapDs:
    id = int(misc.pathLast(sn["topic"]))
    byOrdinal[id] = sn
    cap = sn["caption"]
    if cap:
      byCaption[cap] = sn


     

setup(snapDs)

# compute a set of widths such that when scaled to these widths, the heights will be ht
def matchHeights(snaps,ht):
  rs = []
  for s in snaps:
    art = aspectRatio(s)
    wd = ht / art
    rs.append(wd)
  return rs


def scaleWidths(wds,total):
  atwd = 0
  for w in wds:
    atwd += w
  rt = total/atwd
  rs = []
  for w in wds:
    rs.append(w  * rt)
  return rs


fileBase = "Saint Francis in Ecstasy-Bellini.jpg"

def genMultiImage(caps,height,totalWd):
  sns = []
  for cp in caps:
    sn = byCaption[cp]
    sns.append(sn)
  iwds = matchHeights(sns,height)
  wds = scaleWidths(iwds,totalWd)
  print wds
  rs = """{{multiple images

|title  = Details 
|align=left

"""
  ln = len(caps)
  for i in range(0,ln):
    sn = sns[i]
    cp = sn["caption"]
    wd = wds[i]
    cls = "| image{0} = {1}\n"
    cls += "| width{0} = {2}\n"
    cls += "| caption{0} = {3}\n"
    rs += cls.format(i+1,"Detail-"+cp+"-"+fileBase,int(wd),cp)+"\n\n"
  rs += "}}"
  return rs

caps = ["Head of Saint Francis","Donkey","Skull","Heron","Hare","Stigmata, Right Hand","Stigmata, Left Hand" ]

vv =genMultiImage(caps,200,800)
  

print vv

caps = ["Pattens","Heavenly Jerusalem","Signature of the Painter"]


vv =genMultiImage(caps,200,700)
  

print vv


{{multiple images

|title  = Details
|align=center

| image1 = Detail-Pattens-Saint Francis in Ecstasy-Bellini.jpg
| width1 = 251
| caption1 = Pattens


| image2 = Detail-Jerusalem-Saint Francis in Ecstasy-Bellini.jpg
| width2 = 184
| caption2 = Heavenly Jerusalem


| image3 = Detail-Signature-Saint Francis in Ecstasy-Bellini.jpg
| width3 = 264
| caption3 = Signature of the Painter


}}


| image1 = Detail-Head-Saint Francis in Ecstasy-Bellini.jpg
| width1 = 154
| caption1 = Head of Saint Francis


| image2 = Detail-Donkey-Saint Francis in Ecstasy-Bellini.jpg
| width2 = 126
| caption2 = Donkey


| image3 = Detail-Skull-Saint Francis in Ecstasy-Bellini.jpg
| width3 = 162
| caption3 = Skull


| image4 = Detail-Heron-Saint Francis in Ecstasy-Bellini.jpg
| width4 = 123
| caption4 = Heron


| image5 = Detail-Hare-Saint Francis in Ecstasy-Bellini.jpg
| width5 = 133
| caption5 = Hare



   
  


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
s3_logDir = "/mnt/ebs1/imagediver/s3_logs"

import ops.s3
s3 = ops.s3

import time
import misc

import boto.s3.bucketlistresultset

verbose = False


def vprint(*args):
  if verbose:
    misc.printargs(args,"S3LOGS")


#sample = "https://s3.amazonaws.com/imagediver_log/s3_imagediver2012-06-21-02-55-06-58E5423BA89D6FF4"

def logKeys():
  bk = s3.s3Init("imagediver_log")
  rs = boto.s3.bucketlistresultset.BucketListResultSet(bk)
  return rs

def readLog(byentry,cn,k):
  global logcnt,cf_logDir
  vcnt = 0
  cns = cn.split("\n")
  fns = []
  cnsln = len(cns)
  #print "LINES ",cnsln
  for ln in cns:
    #print "LINE",ln
    dm = re.search('\[(\d*)\/(\w*)\/(\d*)',ln)
    if dm:
      grps = dm.groups()
      dt = grps[0]+"-"+grps[1]+"-"+grps[2]
      pdt =  datetime.datetime.strptime(dt,"%d-%b-%Y")
      dto = pdt.toordinal()
      #print "DATE",dt,"ORDINAL",dto
      if dto < 734716:
        print "DELETE"
        k.delete()
        return
      m=re.search('\"GET ([^"]*)\"',ln)
      if m:
        pass
        #print m.groups()

      m=re.search('\"GET \/topic\/album\/(\w*)\/(\w*)\/(\d*)\/index.html',ln)
      if m:
        grps = m.groups()
        if len(grps)==3:
          owner=grps[0]
          im = grps[1]
          albumIdx = grps[2]
         
          dm = re.search('\[(\d*)\/(\w*)\/(\d*)',ln)
          if not dm:
            raise Exception("MISSING DATE")
          grps = dm.groups()
          dt = grps[0]+"-"+grps[1]+"-"+grps[2]
          enkey = dt+"."+owner+"."+im+"."+albumIdx
          cv = byentry.get(enkey,None)
          if cv==None:
            byentry[enkey] = 1
          else:
            byentry[enkey] = cv + 1
          vcnt = vcnt + 1
          print vcnt
        #print byentry
        vprint("VISIT DATE",dt,"OWNER",owner,"image",im,"albumIdx",albumIdx)

        
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
  logcnt = 0
  kys = logKeys()
  byentry = {}
  someLog = False
  archiveName = str(int((time.time()/10)-134046326))
  dk = 0
  for k in kys:
    kn = k.name
    if kn[0:13] != "s3_imagediver":
      k.delete()
      dk = dk + 1
      print "UNEXPECTED key",kn
      continue
    cn = k.get_contents_as_string()
    logcnt = logcnt + 1
    #if logcnt > 4:break
    if deleteLogFiles:
      k.delete()
    #vprint("CONTENT LENGTH",len(cn))
   
    try:
      readLog(byentry,cn,k)
    except Exception as ex:
      print "EXCEPTION IN readlog",k,ex
  return byentry

def storeLogs(byentry):
  #logstore.initStore(thePageStore)
  for k,v in byentry.iteritems():
    ks = k.split(".")
    dt=ks[0]
    owner = ks[1]
    im = ks[2]
    album = int(ks[3])
    dts = dt.split("-")
    pdt =  datetime.datetime.strptime(dt,"%d-%b-%Y")
    dto = pdt.toordinal()
    vprint("DATE",dt,"DATE O",dto,"Owner",owner,"IM",im,"ALBUM",album,"VISITS ",v)
    #logstore.addToLogEntry(dto,owner,album,v,thePageStore)
    #print "Entry ",k,v
  #logstore.closeStore(thePageStore)
  return

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


cd /mnt/ebs0/imagediverdev/py


python
execfile("ops/execthis.py")
execfile("ops/s3log.py")

aa = readLogs()


storeLogs(aa)


kk = logKeys()

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

aa = logger.readArchive("E27HBLO6YLTRAW.2012-08-09-17.sjAKGf6n.gz")


aa = logger.readLogs()





aa = logger.readArchive("391187")



aa = logger.readArchive("392384")


logger.readLog(byent,unrec,
bent = logger.readLogs()

logger.storeLogs(bent[0])


logger.logjob(15,2)

"""
  

  
