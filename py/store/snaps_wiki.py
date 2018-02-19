#!/usr/bin/env python
# python /var/www/neo.com/store/createdb.py fub
import sqlite3
import sys
import time
import os.path
import json
#sys.path.append("/var/www/imagediver.com")
import traceback
import Logr
import constants
import store.dynamo
dynamo = store.dynamo

import constants
dbDir = constants.dbDir
verbose = True

from sqlite_utils import writeToDb,readFromDb

import misc

def vprint(*args):
  if verbose:
    misc.printargs(args,"SNAPSTORE")
   
""" published means that the snap images (snap, and snapthumb) have been sent over to s3  """

snapProps = ["idx","created","caption","owner","cropid","description","shares_coverage","coverage","published","ordinal","talk","replicates","is_current_version","id"]
 
        
class SStore:
  """ Snap store. creates a structure with name,connection; builds a new db if needed """
  def __init__(self,username,nm,autoCreate=True):
    self.name = nm
    udir = dbDir + username
    path = udir + "/" + nm
    exists = os.path.exists(path)
    if (not exists) and (not autoCreate):
      self.connection = None
      return
    if not exists:
      if not os.path.exists(udir):
        os.mkdir(udir)
    conn = sqlite3.connect(path)
    vprint("SNAPS"," connecting to store ",path)
    self.connection = conn
    if not exists:
      self.createSchema()
  
  def closeConnection(self):
    self.connection.close()
    
    
  """ see http://theopensourcery.com/sqlitedocs/sqoptoverview.html for a note about indexes """
  

  def createSchema(self):
    def idxstmt(colname):
       return "create index {0}_idx on snaps({0})".format(colname)
    conn = self.connection
    c = conn.cursor()
    c.execute('''create table snaps
    (idx integer primary key,created int,caption text,owner text,cropid int,description text,shares_coverage int,coverage text,published int,ordinal int,talk text,replicates int,is_current_version int,id int)''')
    c.execute(idxstmt("ordinal"))
    c.execute(idxstmt("cropid"))
    conn.commit()
    
  # For the first version of a snap, the thread is -1
  # For subseqent versions, the thread is the idx of the first version
  
  def newSnap(self,snp,imx=None,id=-1):
    global snapProps
    vprint("SNP in newSnap",snp)
    conn = self.connection
    tm = int(time.time()*1000)
    cv = snp["coverage"]
    pb = snp.get("published",0)
    ord = snp.get("ordinal",-1)
    vprint("CV",cv,imx)
    if type(cv)==str:
      cvv = cv
    else:
      if imx:
        cv = scaleRectDict(cv,1.0/imx)
      cvv = json.dumps(cv)
      vprint("CVV",cvv)
    sp = snapProps
    #                  ["idx","created","caption"2,"owner"3,"cropid"4,"description"5,"shares_coverage","coverage"6,"published","ordinal","talk","replicates","id"]
    #(idx integer primary key,created int,caption text 2,owner text 3,cropid int4,description text5,shares_coverage int6,coverage text,published int,ordinal int,talk text,replicates int,id int)''')

    vls = (tm,snp[sp[2]],snp[sp[3]],snp[sp[4]],snp[sp[5]],snp[sp[6]],cvv,pb,ord,"",-1,1,id)
    stmt = 'insert into snaps ('
    qmarks = []
    
    for p in snapProps:
      if p != "idx":
        qmarks.append("?")
    stmt += ",".join(snapProps[1:])
    stmt = stmt + ") values (" + ",".join(qmarks)
    stmt += ")"
    #print stmt
    rs = writeToDb(conn,stmt,vls,True) # this returns the 
    #cursor.execute(stmt,vls)
    #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
    #rs = cursor.lastrowid
    #conn.commit()
    
    return rs
  
  def setPublished1(self,snaps,v):
    conn = self.connection
    cursor = conn.cursor()
    for sn in snaps:
      tp = sn.get("topic",None)
      idx = int(pathLast(tp))
      sv = str(v)
      stmt  = "update snaps set published="+sv+" where idx="+str(idx)
      #print "STMNT",stmt
      cursor.execute(stmt)
    conn.commit()
  
  def setPublished(self,snaps,v):
    for i in range(0,3):
      try:
        self.setPublished1(snaps,v)
        return
      except Exception as excp:
        print "EXCEPTION",excp




  """ now versioning is done in wikimode. a slightly less than optimal method is used. First the snap is cloned, then modified. """
  
  """ scheme: the first version of a snap has id=-1; the idx is the effective id in this case. Later versions
have id = the idx of version 1 """
    
  # a version of getSnap for use in  newVersion
  def getSnap0(self,id):
    conn = self.connection
    sp = snapProps
    stmt = 'select '
    stmt += ",".join(snapProps)
    stmt += " from snaps where ((idx = "+str(id)+" and id=-1) or  id = "+str(id)+") and is_current_version=1"
    qr = readFromDb(conn,stmt,fetchKind="fetchone")
    vprint(stmt)
    #c.execute(stmt)
    #c.execute('select idx,created,owner,caption,cropid,description,coverage from snaps where isCurrent=1',())
    #qr = c.fetchone()
    vprint(qr)
    if qr == None: return None
    ns = dictFromArray(qr,sp,0)
    return ns
  
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
  
  

  
def fixSnap(snap):
  tp = snap["topic"]
  sc = snap.get("shares_coverage",None)
  if sc == None:
    snap["shares_coverage"] = 0
  tpl = pathLast(tp)
  """
  if sc == None:
    cropid = tpl
  else:
    cropid = sc
  """
  snap["cropid"] = int(tpl)
  
 


def pathLast(s):
  rf = s.rfind("/")
  return s[rf+1:]

def topicNumberAtEnd(itm):
  tp = itm["topic"]
  rf = tp.rfind("/")
  return int(tp[rf+1:])


""" @todo WATCH OUT assumes only one album open at a time """

def storeForAlbum(alb,autoCreate=True,forFix=False,pageStore = None):
  vprint("storeForAlbum",alb,"pageStore",pageStore)
  if pageStore:
    st = pageStore.get("snapStore",None)
    if st:
      return st
  sp = alb.split("/")
  uname = sp[2]
  imname = sp[3]
  anum = sp[4]
  nm = "album."+imname+"."+anum
  if forFix:
    nm = "new_"+nm
  #nm = alb.replace("/",".")[1:]
  rs = SStore(uname,nm,autoCreate)
  if rs.connection == None:
    return None
  if pageStore:
    pageStore["snapStore"] = rs
  return rs

def closeStore(pageStore):
  sn = pageStore.get("snapStore",None)
  
  if sn:
    vprint("CLOSING SNAPSTORE")
    sn.closeConnection()
  else:
    vprint("no SNAPSTORE to close")

""" archaic
def xferSnaps(alb):
  store = storeForAlbum(alb)
  #store=SStore("foobb")
  items = theStore.descriptorsWithType('/type/snapD')
  items.sort(key=topicNumberAtEnd)
  mxcropid = 0
  for itm in items:
    ial = itm["album"]
    if ial !=  alb:
      continue
    fixSnap(itm)
    mxcropid = max(itm["cropid"],mxcropid)
    store.newSnap(itm)
  als = alb.split("/")
  uname = als[2]
  imname = als[3]
  cridx = "/image/"+uname+"/"+imname+"/crops"
  ccrp = dynamo.getCount(cridx)
  if ccrp:
    mxcropid = max(ccrp,mxcropid)
  vprint("setting count of "+cridx+" to "+str(mxcropid))
  dynamo.setCount(cridx,mxcropid)
    
""" 

def dictFromArray(a,props,s):
  rs = {}
  n = s;
  for p in props:
    rs[p] = a[n]
    n = n + 1
  return rs

# if imx is supplied, scale output using this 
def getSnaps(alb,imx=None,oldSchema=False,pageStore=None):
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
    """
    ns.created = qr[1];
    ns.owner = qr[2]
    ns.caption = qr[3]
    ns.cropid = qr[4]
    ns.description = qr[5]
    ns.coverage = json.loads(qr[6])
    """
    rs.append(ns)
  return rs

def scalePointDict(p,s):
  return {"x":s * p["x"],"y":s * p["y"]}
  
def scaleRectDict(d,s):
  crn = d["corner"]
  xt = d["extent"]
  return  {"corner":scalePointDict(crn,s),"extent":scalePointDict(xt,s)}
  
  
def fixSnaps(alb,imx):
  snaps = getSnaps(alb,oldSchema=True)
  nstore = storeForAlbum(alb,forFix=True)
  sc = 1.0/imx
  def ptimes(p,s):
    return {"x":s * p["x"],"y":s * p["y"]}
  for sn in snaps:
    vprint("fixing ",sn["topic"],sn["coverage"])
    cv = sn["coverage"]
    ncv = scaleRectDict(cv,sc)
    vprint("CV",cv,"NCV",ncv)
    sn["coverage"] = ncv
    sn["owner"] = "/user/4294b0e"
    nstore.newSnap(sn)
  

  
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


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

albn = '/album/4294b0e/one_dollar_bill_reverse/7'
alb = album.loadAlbumD(albn)
ss = snaps.storeForAlbum(albn)
sn1 = ss.getSnap0(1)
ss.newVersion(1)

ss =snaps.getSnaps(albn)
ss = snaps.getSnap("/snap/4294b0e/one_dollar_bill_reverse/1/1")

"""

