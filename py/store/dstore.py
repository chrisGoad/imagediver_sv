NOT IN USE but keep in main repo since it would be very bad to lose
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

import constants
dbDir = constants.dbDir
verbose = False

theStore = None


    
        
class DStore:
  """ Descriptor store. creates a structure with name,connection; builds a new db if needed """
  def __init__(self,nm):
    if constants.useDynamoTest:
      print "USING DYNAMODB"
      return
    self.name = nm
    path = dbDir + nm
    exists = os.path.exists(path)
    conn = sqlite3.connect(path)
    self.connection = conn
    if not exists:
      self.createSchema()
  
  def closeConnection(self):
    self.connection.close()
    
    
  """ see http://theopensourcery.com/sqlitedocs/sqoptoverview.html for a note about indexes """
  
  def createSchema(self):
    conn = self.connection
    c = conn.cursor()
    c.execute('''create table descriptor
    (topic text,type text,data text,version integer,isCurrent integer,created int,unique (topic,type) on conflict replace)''')
    c.execute('''create  index descriptoridx on descriptor (topic)''')
    c.execute('''create table triple
    (topic text,type text,property text,tvalue text,ivalue integer,fvalue float,jvalue text,version integer,created int,unique (topic,type,property) on conflict replace)''')
    c.execute('''create  index tripidx on triple (topic,type,property)''')
    c.execute('''create table counter (name text,value int)''')
    c.execute('''create  index counteridx on counter (name)''')
    conn.commit()
  
  def isPrim(self,x):
    tp = type(x)
    return (tp == int) or (tp == float) or (tp == str) or (tp == unicode)
  
  
  def tripleSetC(self,cursor,topic,ttype,property,value):
    tm = int(time.time())
    tp = type(value)
    if tp==str or tp==unicode:
      vls=(topic,ttype,property,value,None,None,None,tm)
    elif tp==int:
      vls=(topic,ttype,property,None,value,None,None,tm)
    elif tp==float:
      vls=(topic,ttype,property,None,None,value,None,tm)
    else:
      jvalue = json.dumps(value)
      vls = (topic,ttype,property,None,None,None,jvalue,tm)
    """Logr.log("dstore","tripleSetC topic {0} ttype {1} property {2} value {3}".format(topic,ttype,property,value))"""
    cursor.execute('insert into triple (topic,type,property,tvalue,ivalue,fvalue,jvalue,created) values (?,?,?,?,?,?,?,?)',vls)

  def tripleSet(self,topic,ttype,property,value):
    conn = self.connection
    c = conn.cursor()
    self.tripleSetC(c,topic,ttype,property,value)
    conn.commit()
  
  def deleteTriple(self,topic,ttype,property):
    conn = self.connection
    c = conn.cursor()
    c.execute('delete from triple where topic=? and type=? and property=?',(topic,ttype,property))
    conn.commit()
    
    
  def deleteProperty(self,topic,property):
    conn = self.connection
    c = conn.cursor()
    print "TT [{0}] PP [{1}]".format(topic,property)
    c.execute('delete from triple where topic=?  and property=?',(topic,property))
    conn.commit()
    
  def deleteDescriptor(self,topic,ttype):
    conn = self.connection
    c = conn.cursor()
    c.execute('delete from triple where topic=? and type=?',(topic,ttype))
    conn.commit()    
 
 
  def deleteTopic(self,topic):
    conn = self.connection
    c = conn.cursor()
    c.execute('delete from triple where topic=?',(topic,))
    conn.commit()
 


  def deleteTopics(self,topics):
    conn = self.connection
    c = conn.cursor()
    qtopics = ",".join(["'"+i+"'" for i in topics])
    c.execute('delete from triple where topic in ('+qtopics+')');
    conn.commit()
    
    
  def tripleRowValue(self,tr,offset=0):
    if (tr == None):
      return None
    if tr[offset] != None:
      return tr[offset]
    if tr[offset+1] != None:
      return tr[offset+1]
    if tr[offset+2] != None:
      return tr[offset+2]
    if tr[offset+3] != None:
      return json.loads(tr[offset+3])
           
  
  def tripleGet(self,topic,ttype,property):
    print "tripleGet ",topic
    #traceback.print_stack()
    conn = self.connection
    c = conn.cursor()
    c.execute('select tvalue,ivalue,fvalue,jvalue from triple where topic=? and type=? and property=?',(topic,ttype,property))
    rs = c.fetchone()
    return self.tripleRowValue(rs)
       
    
    
  def insert(self,datum,topic=None,ttype=None):
    """
    datum should be json-serializable dict
    todo delete triples first
    """
    Logr.log("dstore","datum:"+str(datum))
    if not topic:
      topic = datum["topic"]
    if not ttype:
      ttype = datum["type"]
    conn = self.connection
    c = conn.cursor()
    tm = int(time.time())
    #dt = datetime.datetime.today().isoformat()
    for k,v in datum.iteritems():
     if verbose:
       print "setting triple "+topic+"~"+ttype+" "+k+" "+str(v)
     self.tripleSetC(c,topic,ttype,k,v)

    """   for k,v trips.interitems():
      self.tripleSetC(c,
    """
    conn.commit()
  
  
              
  def tripleProperties(self,topic,ttype):
    print "tripleProperties ",topic
    #traceback.print_stack()
    conn = self.connection
    c = conn.cursor()
    Logr.log("dstore","selecting for topic {0} type {1}".format(topic,ttype))
    c.execute('select property,tvalue,ivalue,fvalue,jvalue from triple where topic=? and type=?',(topic,ttype))
    rs = c.fetchall()
    Logr.log("dstore","got "+str(len(rs))+" results")
    if verbose:
      print "PROPERTIES: "+str(rs)
    if len(rs)==0:
      return None
    frs = {"topic":topic,"type":ttype}
    
    for tr in rs:
      pr = tr[0]
      spr = str(pr)
      if spr==pr:
        pr = spr
      vl = self.tripleRowValue(tr,1)
      frs[pr]=vl
    if verbose:
      print "PROPS RESULT "+str(frs)
    return frs
      

      
  
  def descriptor(self,topic,ttype):
    """ topic can be a list 
        for now just cruise the list with a query per element
        later bundle into a single query and pick apart the result """
    print "descriptor ",topic
    #traceback.print_stack()
    if type(topic) == list:
      #qtopics = ",".join(["'"+i+"'" for i in topic]) LATER
      rs = []
      for tp in topic:
        rs.append(self.tripleProperties(tp,ttype))
      return rs
    return self.tripleProperties(topic,ttype)
    

  def descriptors(self,topic):
    print "descriptors ",topic
    #traceback.print_stack()
    conn = self.connection
    c = conn.cursor()
    #c.arraysize=100
    #print "arraysize "+str(c.arraysize)
    
    c.execute('select type,property,tvalue,ivalue,fvalue,jvalue from triple where topic=?',(topic,))
    rs = c.fetchall()
    if verbose:
      print "PROPERTIES: "+str(rs)
    ds = []
    byType={}
    frs = {"topic":topic,"type":type}
    for tr in rs:
      typ = tr[0]
      d = byType.get(typ,None)
      if d==None:
        d = {}
        byType[typ] = d
        ds.append(d)
      
      prop  = tr[1]
      vl = self.tripleRowValue(tr,2)
      d[prop]=vl
    return ds
   
  
  def allTopics(self):
    conn = self.connection
    c = conn.cursor()
    stmt = 'select topic from triple'
    c.execute(stmt)
    rs = c.fetchall()
    #Logr.log("dstore","topicsWithPropertyValue rs "+str(rs))
    def zeroth(x):
      return x[0]
    drs = map(zeroth,rs)
    return drs      

  
  def topicsWithPropertyValue(self,ttype,property,value):
    print "topicsWithPropVal ",ttype,property
    #traceback.print_stack()
    tp = type(value)
    if tp==str or tp==unicode:wv='tvalue'
    elif tp==int:wv="ivalue"
    elif tp==float:wv="fvalue"
    else: return [];
    conn = self.connection
    c = conn.cursor()
    stmt = 'select topic from triple where type=? and property=? and '+wv+'=?'
    c.execute(stmt,(ttype,property,value))
    rs = c.fetchall()
    Logr.log("dstore","topicsWithPropertyValue rs "+str(rs))
    def zeroth(x):
      return x[0]
    drs = map(zeroth,rs)
    return drs      


  def topicsWithType(self,ttype):
    conn = self.connection
    c = conn.cursor()
    stmt = 'select topic from triple where type=?'
    c.execute(stmt,(ttype,))
    rs = c.fetchall()
    Logr.log("dstore","topicsWithPropertyValue rs "+str(rs))
    def zeroth(x):
      return x[0]
    drs = map(zeroth,rs)
    return set(drs)     

  def descriptorsWithPropertyValue(self,ttype,property,value):
    print "descriptorsWithPropVal ",ttype,property
    topics = self.topicsWithPropertyValue(ttype,property,value)
    return self.descriptor(topics,ttype)

  
  def filterTopicsToPropertyValue(self,topics,property,value):
    tp = type(value)
    if tp==str or tp==unicode:wv='tvalue'
    elif tp==int:wv="ivalue"
    elif tp==float:wv="fvalue"
    else: return [];
    conn = self.connection
    c = conn.cursor()
    qtopics = ",".join(["'"+i+"'" for i in topics])
    stmt = 'select topic from triple where topic in ('+qtopics+') and property=? and '+wv+'=?'
    Logr.log("dstore","filterTopicsToPropertyValue "+stmt + " | "+ property + " | " + str(value))
    c.execute(stmt,(property,value))
    #stmt = 'select topic from triple where topic in (?)'
    #Logr.log("dstore","filterTopicsToPropertyValue "+stmt + " | "+ qtopics);
    #c.execute(stmt,(qtopics,))
    rs = c.fetchall()
    Logr.log("dstore","filterTopics rs "+str(rs))
    def zeroth(x):
      return x[0]
    drs = map(zeroth,rs)
    return drs      
  
  def counterValue(self,name):
    conn = self.connection
    c = conn.cursor()
    stmt = 'select value from counter where name=?';
    c.execute(stmt,(name,))
    rs = c.fetchone()
    if rs==None:
      stmt = 'insert into counter (name,value) values (?,?)'
      c.execute(stmt,(name,0))
      conn.commit()
      irs = 0
    else:
      irs = rs[0]
    return irs
  
  def incrementCounter(self, name):
    conn = self.connection
    c = conn.cursor()
    self.counterValue(name) # create the counter if missing
    stmt = 'update counter set value=value+1 where name=?';
    c.execute(stmt,(name,))
    conn.commit()
    return self.counterValue(name)


  def setCounterValue(self,name,value):
    conn = self.connection
    c = conn.cursor()
    stmt = 'select value from counter where name=?';
    c.execute(stmt,(name,))
    rs = c.fetchone()
    if rs==None:
      stmt = 'insert into counter (name,value) values (?,?)'
      c.execute(stmt,(name,value))
    else:
      stmt = 'update counter set value=? where name=?';
      c.execute(stmt,(value,name))
    conn.commit()

  
"""
  def setCounterValue(self, name,value):
    conn = self.connection
    c = conn.cursor()
    #stmt = 'update counter set value=? where name=?';
    stmt = 'replace into counter (name,value) values (?,?)'
    c.execute(stmt,(name,value))
    conn.commit()
"""


       
    
              
  


  

