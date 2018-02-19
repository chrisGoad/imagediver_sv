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
from sqlite_utils import writeToDb,readFromDb
import constants
dbDir = constants.dbDir
import misc
import traceback


from sqlite_utils import writeToDb,readFromDb

snapStore = None


verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"JOBSSTORE")
   


jobProps = ["start_time","kind","owner","status","so_far","total","subject","retries","error","resources_used"]

""" jobs are for sharing connections  among python threads (and also keeping a record of activity). So connections
are closed on each write """

class JStore:
  """ Job store. creates a structure with name,connection; builds a new db if needed """
  def __init__(self,nm,autoCreate=True):
    vprint("NEW JSTORE")
    self.name = nm
    #udir = dbDir + uname
    #path = udir +"/" + nm
    path = dbDir + "jobs"
    exists = os.path.exists(path)
    if (not exists) and (not autoCreate):
      vprint("NO STORE at ",path)
      self.connection = None
      return
    """
    if not exists:
      if not os.path.exists(udir):
        os.mkdir(udir)
    """
    self.path = path
    vprint("CONNECTING TO ",path)
    conn = sqlite3.connect(path)
    self.connection = conn
    if not exists:
      self.createSchema()
  
  
  def closeConnection(self):
    tm = time.time()
    if self.connection:
      self.connection.close()
      self.connection = None
      etm = int(1000*(time.time() - tm))
      
  
  def openConnection(self):
    tm = time.time()
    if self.connection:
      return self.connection
    self.connection = sqlite3.connect(self.path)
    etm = int(1000*(time.time() - tm))
    return self.connection

    
    
  """ see http://theopensourcery.com/sqlitedocs/sqoptoverview.html for a note about indexes """
  
              


  def createSchema(self):
    conn = self.connection
    c = conn.cursor()
    c.execute('''create table jobs
    (idx integer primary key,start_time int,kind text,owner text,status text,so_far int,total int,subject text,retries int,error text, resources_used text)''')
    c.execute("create index {0}_idx on jobs({0})".format('start_time'))
    c.execute("create index {0}_idx on jobs({0})".format('owner'))
    c.execute("create index {0}_idx on jobs({0})".format('kind'))
    conn.commit()
    self.closeConnection()
 
 
  
  
  def newJob(self,jb):
    global snapProps
    conn = self.openConnection()
    tm = int(time.time()*1000)
    jb["start_time"] = tm
    jb["so_far"]=0
    if jb.get("status") == None:
      jb["status"] = "not_started"
    jb["error"] = None
    jb["resources_used"] = None
    if jb.get("retries",None) == None:
      jb["retries"] = 0
    sp = jobProps
    vls = (jb[sp[0]],jb[sp[1]],jb[sp[2]],jb[sp[3]],jb[sp[4]],jb[sp[5]],jb[sp[6]],jb[sp[7]],jb[sp[8]],jb[sp[9]])
    stmt = 'insert into jobs ('
    qmarks = []
    for p in jobProps:
      qmarks.append("?")
    stmt += ",".join(jobProps)
    stmt = stmt + ") values (" + ",".join(qmarks)
    stmt += ")"
    vprint("newJob",stmt)
    rs = writeToDb(conn,stmt,vls,True)
    jb["topic"] = "/job/"+jb["owner"]+"/"+str(rs)
    self.closeConnection()
     
  
  def updateJob(self,jb):
    
    tp = jb["topic"]
    idx = pathLast(tp)
    global jobProps
    conn = self.openConnection()
    tm = int(time.time()*1000)
    cls = []
    vls = []
    for sp in jobProps:
      vl = jb.get(sp,None)
      if vl != None:
        vls.append(vl)
        cl = sp +  " = ?"
        cls.append(cl)
    stmt = "update jobs set "+(",".join(cls))+" where idx="+str(idx)
    vprint("updateJob",vls)
    writeToDb(conn,stmt,vls)
    self.closeConnection()
    
    #cursor.execute(stmt,vls)
    #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
    #conn.commit()
    return idx
  
  
  
 


def storeForJob(autoCreate=True,pageStore=None):
#tps = topic.split("/")
  vprint("storeForJob",autoCreate,pageStore)
  if pageStore:
    st = pageStore.get("jobsStore",None)
    if st:
      return st
  nm = "jobs"
  rs = JStore(nm,autoCreate)
  if rs.connection == None:
    return None
  if pageStore:
    pageStore["jobsStore"] = rs
  return rs


def pathLast(s):
  rf = s.rfind("/")
  return s[rf+1:]

def topicNumberAtEnd(itm):
  tp = itm["topic"]
  rf = tp.rfind("/")
  return int(tp[rf+1:])

  



def dictFromArray(a,props,s):
  rs = {}
  n = s;
  for p in props:
    rs[p] = a[n]
    n = n + 1
  return rs

# form of topic /job/<owner>/idx

def getJob(topic,pageStore=False):
  ts = topic.split("/")
  o = ts[2];
  idx = ts[3]
  store = storeForJob(False,pageStore=pageStore)
  vprint("getJob",topic)
  if store==None: return None
  conn = store.openConnection()
  sp = jobProps
  stmt = 'select '
  stmt += ",".join(jobProps)
  stmt += " from jobs where idx = "+idx
  qr = readFromDb(conn,stmt,fetchKind="fetchone")
  #c.execute(stmt)
  #qr = c.fetchone()
  if qr == None: return None
  ns = dictFromArray(qr,sp,0)
    #vprint(ns
    #ns = dictFromArray(qr,["created","owner","caption","cropid","description","coverage"],1)
  ns["topic"] = topic
  store.closeConnection()
  return ns


def pendingJobs(pageStore=None):
  store = storeForJob(False,pageStore=pageStore)
  vprint("pendingJobs")
  if store==None: return None
  conn = store.openConnection()
  sp = ["idx"]
  sp.extend(jobProps)  
  stmt = 'select '
  stmt += ",".join(sp)
  stmt += " from jobs where status='pending' order by idx";
  qrs = readFromDb(conn,stmt,fetchKind="fetchall")
  #c.execute(stmt)
  #c.execute('select idx,created,owner,caption,cropid,description,coverage from snaps where isCurrent=1',())
  #qrs = c.fetchall()
  rs = []
  for qr in qrs:
    d = dictFromArray(qr,sp,0)
    rs.append(d)
  store.closeConnection()
  return rs
  

def closeStore(pageStore):
  st = pageStore.get("jobsStore",None)
  
  if st:
    vprint("CLOSING JOBSSTORE")
    st.closeConnection()
    pageStore["jobsStore"] = None
  else:
    vprint("no JOBSSTORE to close")



