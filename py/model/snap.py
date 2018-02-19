#!/usr/bin/env python
# python /var/www/neo.com/store/createdb.py fub
# this is the wiki version
# in the db, and in main.jsons, snaps are scaled to image width, but at model/snap level, they are unscaled
# (ie they reflect the actual pixel extent in the image, rather than that extent scaled by image width. I'll
# change this some time; a bad design choice)

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
    
  
class SnapD():
  
  def __init__(self,topic=None):
    if topic:self.topic = topic
    
    
  mytype = "/type/albumD"
  
  def dynsave(self,forXfer=False):
    vprint("ENTER snap dynsave",self.__dict__)
    cv  = self.coverage
    if type(cv)==str:
      cvv = cv
    else:
      cvv = json.dumps(cv)
      vprint("CVV",cvv)
      self.coverage = cvv
    dynamo.saveSnap(self,forXfer)
    self.coverage = cv
    return self
  
  
  def setOrdinal(self,v):
    dynamo.putAttribute("Snap",self.topic,"ordinal",v)
    
  
  def delete(self):
    self.deleteFromPublishedAlbum()
    return dynamo.deleteSnap(self)




  """
  def newVersion(self,id):
    snp = self.getSnap0(id)
    #ctm = snp.get("current_item_create_time")
    idx = snp.get("idx")
    tm = int(time.time() * 1000)
    vprint("SNP",snp)
    rs = self.newSnap(snp,None,id)
    stmt = "update snaps set is_current_version = 0 where idx="+str(idx)
    writeToDb(self.connection,stmt)
    return rs
  """
  
  def externalize(self): # as a pared down dict
    rs = {}
    misc.setDictProps(rs,self.__dict__,["album","cropid","topic","caption","description","coverage","owner","ordinal","image"]);
    return rs
     

  def compute_json(self,wrapInStatus=False):    
    rs  = self.externalize()
    """
    rs = {}
    alb = self.album
    im = misc.albumTopicToImageTopic(alb)
    #misc.scaleRectDict(snp["coverage"],imx)
    models.setProperties(rs,self.__dict__,["album","cropid","topic","caption","description","coverage","owner"])
    if imageWidth:
      rs["coverage"] =  misc.scaleRectDict(rs["coverage"],1.0/imageWidth)
    rs["image"] = im
    """
    if wrapInStatus:
      rs = {"status":"ok","value":rs}
    return json.dumps(rs)




  

  def genPage(self,sendToS3=True,compressJs=True):
    #vprint("CONSTANTS.COMPRESS",constants.compressJs)
    pagetext = "" # LATER fix this; pagetext is for custom pages
    pg0= gen.pageHeader("","ImageDiver") + "<body>"
    svdv = constants.devVersion
    if sendToS3: constants.devVersion = 0
    if  (sendToS3 or constants.compressJs):
      pg0 += constants.jsPreamble + constants.cjsForPage("common") +  constants.cjsForPage("snap")
    else:
      pg0 +=  constants.jsPreamble + constants.toJsIncludes(constants.commonJsFiles) + constants.toJsIncludes(constants.jsFiles['snap'])
    constants.devVersion = svdv
    pg1 = """
    <script>
    page.initialize();
    </script>
    <div class="outerDiv">
      <div class="topDiv">
          <div class="topDivTop"></div>
         <div class="titleDiv"></div>
      </div>
    </div>
    </body>
    </html>
    """
    pg =  pg0 + pg1
    #fl = "/mnt/ebs1/imagediver/temp/snap.html"
    tp = self.topic
    #topicdir = "/topicd" if constants.publishToS3Dev else "/topic"
    s3path = constants.topicDir+tp+"/index.html" #the path where the page will finally end up
    #models.writeFile(fl,pg)
    #print "publishing to ",s3path
    #return pg
    if sendToS3:
      s3.s3SetContents(s3path,contents=pg,relativeTo="",contentType="text/html")
    return pg

 
  
  


  def publish(self,includeImages=True,pageStore=None):
    #vprint("PUBLISHING ",self.__dict__)
    """ the snap images appear under the image directory (/imagowner/imagename). pageOnly means don't bother with generating json"""
    alb = self.album
    tpo = misc.topicOb(alb)
    imtopic = tpo.imageTopic()
    imdir = tpo.imageOwner + "/" + tpo.imageName
    vprint("PUBLISH SNAP",self.topic," with IMAGE ",imtopic,"imdir",imdir)
    js = self.compute_json(False)
    tp = self.topic
    #topicdir = "/topicd/" if constants.publishToS3Dev else "/topic/"
    s3path = constants.topicDir+tp+"/main.json" #the path where the page will finally end up
    s3.s3SetContents(s3path,contents=js,relativeTo="",contentType="application/json")
    self.genPage(True)
    if not includeImages:
      return
    imageD = image.loadImageD(imtopic,getattr(self,"pageStore",None))
    """
    public = getattr(imageD,"isPublic",None)
    if not public:
      imageD.isPublic = 1
      imageD.dynsave(False)
    """
    crid = self.cropid;
    fls = [imdir+"/snap/"+str(crid)+".jpg",imdir+"/snapthumb/"+str(crid)+".jpg"]
    for fl in fls:
      vprint("about to save "+fl)
      s3.s3SaveFile(fl,relativeTo="images",contentType="image/jpeg")
  
  
  def publishInAlbum(self):
    """ grab the album main.json file and update the snap that appears within it """
    tm = time.time()
    alb = self.album
    aurl = "http://s3.imagediver.org"+constants.topicDir+alb+"/main.json"
    albs = urllib2.urlopen(aurl).read()
    albd = json.loads(albs)
    byt = {}
    sns = albd["snaps"]
    mxo = 0
    for sn in sns:
      tp = sn["topic"]
      o = int(sn.get("ordinal",0))
      #print "TP ",tp,"ORD",o
      if o > mxo: mxo = o
      byt[tp] = sn
    exv = self.externalize()
    cv = byt.get(self.topic,None)
    #print "CV",cv," mxo ",mxo
    if cv:
      nord = cv.get("ordinal",mxo+1)
    else:
      nord = mxo+1
    exv["ordinal"] = nord
    byt[self.topic] = exv
    s3path = constants.topicDir+alb+"/main.json" #the path where the page will finally end up
    nsns = []
    for sn in byt.itervalues():
      nsns.append(sn)
    albd["snaps"]= nsns
    js = json.dumps(albd)
    s3.s3SetContents(s3path,contents=js,relativeTo="",contentType="application/json")
    etm = time.time() - tm
    vprint("publishInAlbum ",self.topic," took ",etm,"seconds")


  def deleteFromPublishedAlbum(self):
    """ grab the album main.json file and update the snap that appears within it """
    tm = time.time()
    alb = self.album
    aurl = "http://s3.imagediver.org"+constants.topicDir+alb+"/main.json"
    albs = urllib2.urlopen(aurl).read()
    albd = json.loads(albs)
    rs = []
    sns = albd["snaps"]
    mxo = 0
    myt = self.topic
    isDelete = False
    for sn in sns:
      tp = sn["topic"]
      if tp==myt:
        isDelete = True
      else:
        rs.append(sn)
    if not isDelete:
      return
    s3path = constants.topicDir+alb+"/main.json" #the path where the page will finally end up
    albd["snaps"]= rs
    js = json.dumps(albd)
    s3.s3SetContents(s3path,contents=js,relativeTo="",contentType="application/json")
    etm = time.time() - tm
    vprint("deleteFromPublishedAlbum ",self.topic," took ",etm,"seconds")




  def externalize(self):
    snap = self.__dict__.copy()
    snap["type"] = "/type/Snap"
    misc.removeProp(snap,"shares_coverage")
    misc.removeProp(snap,"current_item_create_time")
    ord = snap["ordinal"]
    snap["coverage"] = misc.reduceRectDigits(snap["coverage"])
    if ord < 0:
      id = int(misc.pathLast(snap["topic"]))
      snap["ordinal"] = id
    return snap
         

  def drawRect(self):
    area = 250000
    cv = self.coverage
    cvr = image.dictToRect(cv)
    alb = self.album
    tpo = misc.topicOb(alb)
    imt = tpo.imageTopic()
    im = image.loadImageD(imt)
    dm = im.dimensions
    # determine scaling to the 250000 area
    ua = dm["x"] * dm["y"]
    ssq = ua/float(area)
    sc = math.sqrt(ssq)
    isc = 1/sc
    wx = isc * dm["x"] # width of the 250000 area
    rect = cvr.scale(wx)
    tp = self.topic
    snapnum = int(misc.pathLast(tp))
    im.drawRect(snapnum,rect,area)
    return im

    
    
    
    

def dictToSnapD(d):
  rs = SnapD()
  rs.__dict__ = d
  return rs

  

# this returns snap dictionaries, not snap objects; alb is the topic
def getSnaps(alb,getAllVersions=False):
  tps = dynamo.snapTopicsForAlbum(alb,getAllVersions)
  snps = dynamo.getSnaps(tps)
  """
  if imx:
    for snp in snps:
      cv = misc.scaleRectDict(snp["coverage"],imx)
      snp["coverage"] = cv
  """
  return [dictToSnapD(s) for s in snps]
  

def loadSnapD(topic,pageStore=None):
  d = dynamo.getSnap(topic)
  vprint("LOADED SNAP FROM DYNAMO ",d)
  if not d:
    return None
  rs = dictToSnapD(d)
  rs.pageStore = pageStore
  #rs.imageD = image.loadImageD(rs.image)
  return rs
   

def copySnap(snapDict,forAlbum): # note: assumes scaled coords, and dict
  rs = SnapD()
  misc.setDictProps(rs.__dict__,snapDict,["cropid","caption","description","coverage","owner","ordinal"])
  rs.album=forAlbum
  return rs
    


  """ now versioning is done in wikimode. a slightly less than optimal method is used. First the snap is cloned, then modified. """
  
  """ scheme: the first version of a snap has id=-1; the idx is the effective id in this case. Later versions
have id = the idx of version 1 
    
 
  def newVersion(self,id):
    snp = self.getSnap0(id)
    #ctm = snp.get("current_item_create_time")
    idx = snp.get("idx")
    tm = int(time.time() * 1000)
    vprint("SNP",snp)
    rs = self.newSnap(snp,None,id)
    stmt = "update snaps set is_current_version = 0 where idx="+str(idx)
    writeToDb(self.connection,stmt)
    return rs

    
  def updateSnap(self,snp,imx=None):
    tp = snp.get("topic",None)
    if tp:
      id = int(pathLast(tp))
    else:
      raise Exception("internal error: missing id")
    if constants.wikiMode:
      idx = self.newVersion(id)
    global snapProps
    conn = self.connection
    tm = int(time.time()*1000)
    cv = snp.get("coverage",None)
    cvv = None
    if type(cv)==str:
      cvv = cv
    elif cv:
      if imx:
        cv = scaleRectDict(cv,1.0/imx)
      cvv = json.dumps(cv)
    cls = []
    vls = []
    for sp in snapProps:
      if sp == "coverage":
        vl = cvv
      else:
        vl = snp.get(sp,None)
      if vl != None:
        vls.append(vl)
        cl = sp +  " = ?"
        cls.append(cl)
    if constants.wikiMode:
      idxv = idx  # index of the new version
    else:
      idxv = id
    stmt = "update snaps set "+(",".join(cls))+" where idx="+str(idxv)    
    writeToDb(conn,stmt,vls)

    #cursor.execute(stmt,vls)
    #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
    #conn.commit()
    return idx
  

  def setOrdinal(self,idx,ord):
    stmt = "update snaps set ordinal = ? where idx=?"
    vls = [ord,idx]
    writeToDb(self.connection,stmt,vls)
  
"""  

  
  
 

def dictFromArray(a,props,s):
  rs = {}
  n = s;
  for p in props:
    rs[p] = a[n]
    n = n + 1
  return rs

# if imx is supplied, scale output using this
"""
def getSnaps(alb,imx=None):
  nm = alb.replace("/",".")[1:]
  als = alb.split("/")
  uname = als[2]
  imname = als[3]
  aidx = als[4]
  store = storeForAlbum(alb,pageStore=pageStore)
  conn = store.connection
  
  sp = snapProps
  if oldSchema:
    sp = sp[:len(sp)-1]
  stmt = 'select idx,'
  stmt += ",".join(sp)
  stmt += " from snaps where created=-1"
  vprint(stmt)
  qrs = readFromDb(conn,stmt,fetchKind="fetchall")
  #c.execute(stmt)
  #c.execute('select idx,created,owner,caption,cropid,description,coverage from snaps where isCurrent=1',())
  #qrs = c.fetchall()
  rs = []
  for qr in qrs:
    #print qr
    tp = "/snap/"+uname+"/"+imname+"/"+aidx+"/"+str(qr[0])
    ns = dictFromArray(qr,sp,1)
    #print ns
    #ns = dictFromArray(qr,["created","owner","caption","cropid","description","coverage"],1)
    ns["topic"] = tp
    cv = json.loads(ns["coverage"])
    if imx:
      cv = scaleRectDict(cv,imx)
    ns["coverage"] = cv
    rs.append(ns)
  return rs

def scalePointDict(p,s):
  return {"x":s * p["x"],"y":s * p["y"]}
  
def scaleRectDict(d,s):
  crn = d["corner"]
  xt = d["extent"]
  return  {"corner":scalePointDict(crn,s),"extent":scalePointDict(xt,s)}
  
  

  
def snapTopicToAlbumTopic(tp):
  tps = tp.split("/")
  uname = tps[2]
  imname = tps[3]
  aidx = tps[4]
  return "/album/"+uname+"/"+imname+"/"+aidx
 
def getSnap(tp,imx=None,pageStore=None):
  snidx = pathLast(tp)
  alb = snapTopicToAlbumTopic(tp)
  store = storeForAlbum(alb,False,pageStore=pageStore)
  vprint("STORE ",store)
  if store==None: return None
  conn = store.connection
  sp = snapProps
  stmt = 'select '
  stmt += ",".join(snapProps)
  stmt += " from snaps where idx = "+snidx+" and created=-1"
  qr = readFromDb(conn,stmt,fetchKind="fetchone")
  vprint(stmt)
  #c.execute(stmt)
  #c.execute('select idx,created,owner,caption,cropid,description,coverage from snaps where isCurrent=1',())
  #qr = c.fetchone()
  vprint(qr)
  if qr == None: return None
  #print "QR",qr
  ns = dictFromArray(qr,sp,0)
  #print ns
    #ns = dictFromArray(qr,["created","owner","caption","cropid","description","coverage"],1)
  ns["topic"] = tp
  cv = json.loads(ns["coverage"])
  if imx:
    cv = scaleRectDict(cv,imx)
  ns["coverage"] = cv
  return ns



def deleteSnap(tp,pageStore=None):
  snidx = pathLast(tp)
  alb = snapTopicToAlbumTopic(tp)
  store = storeForAlbum(alb,False,pageStore=pageStore)
  vprint("STORE ",store)
  if store==None: return False
  conn = store.connection
  sp = snapProps
  stmt = "delete from snaps where idx = "+snidx+" and created=-1"
  vprint(stmt)
  writeToDb(conn,stmt)
  #c.execute(stmt)
  #conn.commit()
  return True


"""
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")
ss = snapm.loadSnapD('/snap/4294b0e/the_ambassadors/1/3')


albn = '/album/4294b0e/one_dollar_bill_obverse/3'

ii = dynamo.getItems("Snap",['/snap/4294b0e/one_dollar_bill_obverse/3/2|1349306695361'])

ss = snapm.getSnaps(albn,getAllVersions=True)


dynamo.snapTopicsForAlbum(albn,True)


  
  getItems(tnm,topics)
)
alb = album.loadAlbumD(albn)

ss = snaps.storeForAlbum(albn,True)
sn1 = ss.getSnap0(1)
ss.newVersion(1)

ss =snaps.getSnaps(albn)
ss = snaps.getSnap("/snap/4294b0e/one_dollar_bill_reverse/1/1")

"""
models.SnapD = SnapD


