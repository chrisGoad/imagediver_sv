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
from sqlite import Store



from sqlite_utils import writeToDb,readFromDb


# date is unix time stamp of its beginning at midnight

# this is a general implementation of SQLite access.  @todo employ this as the basis for the other stores: snaps and jobs

verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"S3STORE")
   
    
# the date is the proleptic gregorian ordinal
theTables = {"log":[["date","int",1],["owner","text",1],["referrer","text",0],["album","int",1],["visits","int",0]]}

def initStore(pageStore=None):
  vprint("initStore",pageStore)
  if pageStore:
    st = pageStore.get("s3logStore",None)
    if st:
      return st
  rs = Store("s3log",theTables)
  if pageStore:
    pageStore["s3logStore"] = rs
  return rs



def closeStore(pageStore):
  st = pageStore.get("s3logStore",None)
  if st:
    vprint("CLOSING LOGSTORE")
    st.closeConnection()
    pageStore["logStore"] = None
  else:
    vprint("no LOGSTORE to close")
    
    
def newLogEntry(date,owner,album,bytes,pageStore):
  st = initStore(pageStore)
  st.newEntry("log",(date,owner,album,bytes))


def newFilesizeEntry(path,size,pageStore):
  st = initStore(pageStore)
  st.newEntry("filesize",(path,size))

def updateLogEntry(idx,bytes,pageStore):
  st = initStore(pageStore)
  st.updateEntry("log",idx,{"bytes":bytes})
  
  
def selectLogEntry(date,owner,album,pageStore):
  st = initStore(pageStore)
  vls = {"date":date,"owner":owner,"album":album}
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


def selectFilesize(path,pageStore):
  st = initStore(pageStore)
  vls = {"path":path}
  rs =  st.selectEntries("filesize",vls)
  if len(rs) == 1:
    return rs[0]["size"]
  if len(rs) > 1:
    return "UNEXPECTED"
  return None


def addToLogEntry(date,owner,album,bytes,pageStore):
  ce = selectLogEntry(date,owner,album,pageStore)
  if ce:
    idx = ce["idx"]
    exb = ce["bytes"]
    updateLogEntry(idx,bytes + exb,pageStore)
  else:
    newLogEntry(date,owner,album,bytes,pageStore)
  
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

