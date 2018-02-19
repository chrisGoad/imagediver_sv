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
verbose = False
import datetime
import misc

from sqlite_utils import writeToDb,readFromDb
from sqlite import Store


# date is unix time stamp of its beginning at midnight

# this is a general implementation of SQLite access.  @todo employ this as the basis for the other stores: snaps and jobs

verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"LOGSTORE")
   
"""
        
class SStore:
  " Snap store. creates a structure with name,connection; builds a new db if needed "
  def __init__(self,nm,tables,autoCreate=True):
    self.name = nm
    self.tables = tables
    path = dbDir + nm
    exists = os.path.exists(path)
    if (not exists) and (not autoCreate):
      self.connection = None
      return
    conn = sqlite3.connect(path)
    self.connection = conn
    if not exists:
      self.createSchema()
  
  def closeConnection(self):
    self.connection.close()
    self.connection = None
    
    
  " see http://theopensourcery.com/sqlitedocs/sqoptoverview.html for a note about indexes "
  
  def createTable(self,nm,props):
    txt = 'create table '+nm+'(idx integer primary key'
    idxc = []
    for p in props:
      pn = p[0]
      txt += ","+ pn +" "+  p[1]
      if p[2]:
        idxtxt = "create index {0}_idx on {1} ({0})".format(pn,nm)
        #print idxtxt
        idxc.append(idxtxt)
    txt += ")"
    #print txt
    conn = self.connection
    c = conn.cursor()
    c.execute(txt)
    for idxtxt in idxc:
      c.execute(idxtxt)
    c.close()
    conn.commit()    
      
    

  def createSchema(self):
    for ky,vl in self.tables.iteritems():
      self.createTable(ky,vl)
   
  
  def newEntry(self,tb,vls):
    conn = self.connection
    props = self.tables[tb]
    #vls = (day,album,bytes,owner)
    stmt = 'insert into '+tb+' ('
    qmarks = []
    for p in props:
      qmarks.append("?")
    propnames = [p[0] for p in props]
    stmt += ",".join(propnames)
    stmt = stmt + ") values (" + ",".join(qmarks)
    stmt += ")"
    rs = writeToDb(conn,stmt,vls,returnLastRow = True)
    #cursor.execute(stmt,vls)
    #rs = cursor.lastrowid
    #cursor.close()
    #conn.commit()
    return rs
  
  
  def updateEntry(self,tb,idx,updates): 
    conn = self.connection
    cls = []
    vls = []
    props = self.tables[tb]
    for p in props:
      pn = p[0]
      vl = updates.get(pn,None)
      if vl != None:
        vls.append(vl)
        cl = pn +  " = ?"
        cls.append(cl)
    stmt = "update "+tb+" set "+(",".join(cls))+" where idx="+str(idx)
    #print stmt
    #print vls
    writeToDb(conn,stmt,vls)

    #cursor.execute(stmt,vls)
    #cursor.close()
    #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
    #conn.commit()
    return idx

  def entryToDict(self,tb,vls):
    rs = {"idx":vls[0]}
    props = self.tables[tb]
    n = 1
    for p in props:
      pn = p[0]
      rs[pn] = vls[n]
      n = n +1
    return rs
      
  def selectEntries(self,tb,values=None,orderBy = None,where = None): 
    conn = self.connection
    vls = None
    if values:
      cls = []
      vls = []
      props = self.tables[tb]
      for k,v in values.iteritems():
        cls . append(k + "= ?")
        vls.append(v)
      
      
      stmt = "select *  from "+tb+"  where  "+" and ".join(cls)
      if where:
        stmt += " and "+where
      if orderBy:
        stmt += " order by "+orderBy
      vprint("STMNT",stmt)
      rs = readFromDb(conn,stmt,vls,fetchKind="fetchall")
      #cursor.execute(stmt,vls)
    else:
      stmt = "select *  from "+tb
      if where:
        stmt = stmt + " where "+where;
      if orderBy:
        stmt += " order by "+orderBy
      rs = readFromDb(conn,stmt,vls,fetchKind="fetchall")
      #cursor.execute(stmt)
    #rs = cursor.fetchall()
    #cursor.close()
    #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
    return [self.entryToDict(tb,row)for row in rs]

  def closeStore(self):
    conn = self.connection
    conn.close()
    self.connection = None
"""
# the date is the proleptic gregorian ordinal
theTables = {"log":[["date","int",1],["owner","text",1],["image","text",1],["album","int",1],["bytes","int",0]],
             "filesize":[["path","text",1],["size","int",0]]}

def initStore(pageStore=None):
  vprint("initStore",pageStore)
  if pageStore:
    st = pageStore.get("logStore",None)
    if st:
      return st
  rs = Store("log",theTables)
  if pageStore:
    pageStore["logStore"] = rs
  return rs



def closeStore(pageStore):
  st = pageStore.get("logStore",None)
  if st:
    vprint("CLOSING LOGSTORE")
    st.closeConnection()
    pageStore["logStore"] = None
  else:
    vprint("no LOGSTORE to close")
    
    
def newLogEntry(date,owner,image,album,bytes,pageStore):
  st = initStore(pageStore)
  st.newEntry("log",(date,owner,image,album,bytes))


def newFilesizeEntry(path,size,pageStore):
  st = initStore(pageStore)
  st.newEntry("filesize",(path,size))

def updateLogEntry(idx,bytes,pageStore):
  st = initStore(pageStore)
  st.updateEntry("log",idx,{"bytes":bytes})
  
  
def selectLogEntry(date,owner,image,album,pageStore):
  st = initStore(pageStore)
  vls = {"date":date,"owner":owner,"image":image,"album":album}
  rs =  st.selectEntries("log",vls)
  if len(rs) == 1:
    return rs[0]
  if len(rs) > 1:
    return "UNEXPECTED"
  return None

def entriesAfter(date,owner,pageStore):
  st = initStore(pageStore)
  o = date.toordinal()
  vls = {"owner":owner}
  whr = "date >= "+str(o);
  rs = st.selectEntries("log",vls,where=whr)
  closeStore(pageStore)
  return rs
  
def allEntries(pageStore):
  st = initStore(pageStore)
  rs = st.selectEntries("log",None,"date")
  return rs

def selectEntries(pageStore,where=None,orderBy=None):
  st = initStore(pageStore)
  rs = st.selectEntries("log",where=where,orderBy=orderBy)
  return rs
 

def selectFilesize(path,pageStore):
  st = initStore(pageStore)
  vls = {"path":path}
  rs =  st.selectEntries("filesize",vls)
  if len(rs) == 1:
    return rs[0]["size"]
  if len(rs) > 1:
    return "UNEXPECTED"
  return None


def addToLogEntry(date,owner,image,album,bytes,pageStore):
  ce = selectLogEntry(date,owner,image,album,pageStore)
  if ce:
    idx = ce["idx"]
    exb = ce["bytes"]
    updateLogEntry(idx,bytes + exb,pageStore)
  else:
    newLogEntry(date,owner,image,album,bytes,pageStore)
  
def beginningOfMonth(dt):
  mn = dt.month
  yr = dt.year
  bdt = datetime.date(yr,mn,1)
  return bdt

def entriesThisMonth(owner,pageStore):
  td = datetime.date.today()
  bm = beginningOfMonth(td)
  return entriesAfter(bm,owner,pageStore)

def bytesThisMonth(owner,pageStore):
  ents = entriesThisMonth(owner,pageStore)
  rs = 0
  for ent in ents:
    b = ent["bytes"]
    rs += b
  return rs
  
  
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
import constants
import json
import Logr
import store.log
logstore = store.log
import datetime

logstore.initStore()

logstore.entriesThisMonth("4294b0e")

logstore.bytesThisMonth("4294b0e")
logstore.bytesThisMonth("cg")
"""

