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


# date is unix time stamp of its beginning at midnight

# this is a general implementation of SQLite access.  @todo employ this as the basis for the other stores: snaps and jobs

verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"LOGSTORE")
   
    
        
class Store:
  """ creates a structure with name,connection; builds a new db if needed """
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
    self.path = path
    if not exists:
      self.createSchema()
  
  def closeConnection(self):
    self.connection.close()
    self.connection = None
  
  def openConnection(self):
    if self.connection:
      return self.connection
    self.connection = sqlite3.connect(self.path)
    return self.connection
    
    
    
  """ see http://theopensourcery.com/sqlitedocs/sqoptoverview.html for a note about indexes """
  
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
    conn = self.openConnection()
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
    conn = self.openConnection()
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
    conn = self.openConnection()
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
    if conn:
      conn.close()
    self.connection = None

  
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

