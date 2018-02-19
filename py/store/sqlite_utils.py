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
import misc

verbose = False


  
def vprint(*args):
  if verbose:
    misc.printargs(args,"SQLITE")
   
   
def writeToDb1(conn,stmt,vls=None,returnLastRow=False):
  vprint("writeToDb1",stmt,vls,returnLastRow)

  try:
    cursor = conn.cursor()
    if vls == None:
      cursor.execute(stmt)
    else:
      cursor.execute(stmt,vls)
  #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
    rs = None
    if returnLastRow:
      rs = cursor.lastrowid
    #cursor.close()
    conn.commit()
    return rs
  except Exception as excp:
    print "EXCEPTION",excp
    return "exception"
   
def writeToDb(conn,stmt,vls=None,returnLastRow=False):
  for i in range(0,3):
    rs = writeToDb1(conn,stmt,vls,returnLastRow)
    if rs!="exception":
      return rs
    print "DB EXCEPTION ",stmt," try number ",i
    time.sleep(0.5)
  raise Exception("DB FAIL "+stmt)
  return None


def readFromDb1(conn,stmt,vls=None,fetchKind="fetchone"):
  vprint("readFromDb1",stmt,vls,fetchKind)
  try:
    cursor = conn.cursor() 
    if vls == None:
      cursor.execute(stmt)
    else:
      cursor.execute(stmt,vls)
    #cursor.close()
    if fetchKind == "fetchone":
      return cursor.fetchone()
    if fetchKind == "fetchall":
      return cursor.fetchall()
  
  #'insert into snaps (created,isCurrent,owner,caption,cropid,description,coverage) values (?,?,?,?,?,?,?)',vls)
  except Exception as excp:
    print "EXCEPTION",excp
    return "exception"
  
def readFromDb(conn,stmt,vls=None,fetchKind="fetchone"):
  for i in range(0,3):
    rs = readFromDb1(conn,stmt,vls,fetchKind)
    if rs!="exception":
      return rs
    print "DB EXCEPTION ",stmt," try number ",i,rs
    time.sleep(0.5)
  raise Exception("DB FAIL "+stmt)
  return None


