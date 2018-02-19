#!/usr/bin/env python

import constants
execfile(constants.pyDir+"common_includes.py")

import re
import math
import hashlib
import os
import store.dynamo
dynamo = store.dynamo

import store.jobs
jobs = store.jobs
import math
import misc
import urllib
import ops.oauth_tumblr as oauth_tumblr
import ops.oauth_twitter as oauth_twitter





verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args)
   
    
def setProperties(dst,src,props):
  for p in props:
    pv = src.get(p,None)
    if pv != None:
      dst[p] = pv
      


def setPropertiesEscape(dst,src,props):
  for p in props:
    pv = src.get(p,None)
    if pv != None:
      if type(pv) == str or type(pv) == unicode:
        dst[p] = urllib.quote(pv)
      else:
        dst[p] = pv
      
def toDict(src,props):
  rs = {}
  setProperties(rs,src.__dict__,props)
  return rs


def toDictEscape(src,props):
  rs = {}
  setPropertiesEscape(rs,src.__dict__,props)
  return rs

def toDicts(src,props):
  return [toDict(srce,props) for srce in src]

def writeFile(path,txt):
  """ creates the directories if needed """
  pr = path.rsplit("/")
  cdir = "/"
  ln = len(pr)
  vprint(path,pr)
  for i in range(0,ln-1):
    p = pr[i]
    cdir = cdir + p + "/";
    if not os.path.exists(cdir):
      os.mkdir(cdir)
  ofl = open(path,"w")
  ofl.write(txt.encode('utf-8'))
  ofl.close()
  

  


def genId(seed=None):
  import hashlib
  tm = time.time()
  tm = str(tm)+"n98235J"
  if seed:
    tm += seed
  sid = hashlib.sha224(tm).hexdigest()
  return sid


class SessionD():


  def __init__(self,topic=None):
    if topic:self.topic = topic
    
  mytype = "/type/SessionD"

    
  def deactivate(self):
    tp = self.topic
    dynamo.deactivateSession(tp)
    



def loadSessionD(sessionId):
  topic = "/session/"+sessionId;
  d = dynamo.getSession(topic)
  if d==None:
    return None
  rs = SessionD(topic)
  rs.__dict__.update(d)
  constants.session = rs
  vprint("SETTING SESSION")
  return rs

  
def hashPassword(pw):
  pwe = pw+" W26Pux7"
  return hashlib.sha224(pwe).hexdigest()



def pathLast(path):
  lsl = path.rindex("/")
  return path[lsl+1:]
  

class UserD():
  mytype = "/type/userD"

  
  def __init__(self,topic=None):
    if topic:self.topic = topic
    

  def id(self):
    tp = self.topic
    return pathLast(tp)
    
  def createUserDirs(self,knd):
    pth = "/mnt/ebs1/imagediver/"
    nm = pathLast(self.topic)
    ud = pth + knd + "/" + nm
    if not os.path.exists(ud): os.mkdir(ud)
  
  
  def createDirs(self):
    self.createUserDirs("images")
    

  def setPassword(self,pw):
    hp = hashPassword(pw)
    self.hashed_password = hp
    
  def checkPassword(self,pw):
    hp = hashPassword(pw)
    return hp == self.hashed_password
  
  def newSession(self):
    s =  dynamo.newSession(self.topic)
    rs = SessionD(s["topic"])
    rs.user = s["user"]
    rs.start_time = s["start_time"]
    rs.active = s["active"]
    return rs
    


  def dynsave(self,isNew=True):
    if isNew:
      self.createDirs()
    return dynamo.saveUser(self,isNew)
  
  def tumblrInfo(self):
    tk = getattr(self,"tumblr_token",None)
    if not tk: return None
    tko = json.loads(tk)
    rs = oauth_tumblr.getUserInfo(tko["oauth_token"],tko["oauth_token_secret"])
    rso = json.loads(rs)
    return rso["response"]['user']
    
    
  def twitterInfo(self):
    tk = getattr(self,"twitter_token",None)
    if not tk: return None
    tko = json.loads(tk)
    rs = oauth_twitter.getUserInfo(tko["oauth_token"],tko["oauth_token_secret"])    
    rso = json.loads(rs)
    return uinf["screen_name"]



class PostD:
  mytype = "/type/userD"


def loadUserD(topic,pageStore=None):
  rs = "missing"
  if pageStore:
    ubt = pageStore.get('usersByTopic',None)
    if ubt:
      rs = ubt.get(topic,"missing")
  if rs == "missing":
    d = dynamo.getUser(topic)
    vprint("LOADED USER FROM DYNAMO ",d)
    if d == None:
      rs = None
    else:
      rs = UserD(topic)
      rs.__dict__.update(d)
    if pageStore:
      if not ubt:
        ubt = {}
        pageStore['usersByTopic'] = ubt
      ubt[topic] = rs
  if rs:
    rs.pageStore = pageStore
  return rs
  

def dictToUserD(d):
  rs = UserD()
  rs.__dict__.update(d)
  return rs

  
def allUsers():
  rsd = dynamo.allUsers()
  rs = [dictToUserD(d) for d in rsd]
  return rs
  
  
def loadUserDbyEmail(email,pageStore=None):
  u = dynamo.emailToUser(email)
  if u == None:
    return
  return loadUserD(u,pageStore)
  

def loadUserDbyTumblr(tumblr,pageStore=None):
  u = dynamo.tumblrToUser(tumblr)
  if u == None:
    return
  return loadUserD(u,pageStore)
  
  
def loadUserDbyTwitter(twit,pageStore=None):
  u = dynamo.twitterToUser(twit)
  if u == None:
    return
  return loadUserD(u,pageStore)
  
def allUsers(withField=None):
  """ userId = /user/<id>; later there will be a index table giving albums per user """
  """ @todo someday a userToAlbums table will be good to have, so that the entire albums table need not be scanned """
  rs = []
  users = dynamo.allUsers()
  for u  in users:
    if withField:
      iu = u.get(withField,None)
    else:
      iu = True
    if iu != None:
      usr = UserD(u["topic"])
      usr.__dict__.update(u)
      rs.append(usr)
  return rs

"""  @this should be a batch request """

def loadUserDs(userTopics,pageStore=None):
  rs = {}
  for ut in userTopics:
    cv = loadUserD(ut,pageStore)
    rs[ut] = cv
  return rs



def snapTopicToAlbumTopic(tp):
    stp = tp.split("/")
    return "/album/"+tps[2]+"/"+tps[3]+"/"+tps[4]




  

def loadSnapD(topic):
  snd = snaps.getSnap(topic)
  if snd==None: return None
  rs = SnapD(None)
  rs.__dict__.update(snd)
  return rs
  

def deleteSnap(topic,pageStore=None):
  snaps.deleteSnap(topic,pageStore)



def numberAtEnd(s):
  rf = s.rfind("/")
  return int(s[rf+1:])


class Upload:
  def __init__(self,topic=None):
    if topic:
      self.topic = topic
    
  def save(self,isNew=True):
    return dynamo.saveUpload(self,isNew)
  

def getUpload(topic):
  d = dynamo.getUpload(topic)
  if d == None:
    return None
  rs = Upload(topic)
  rs.__dict__.update(d)
  return rs
  

def newUpload(name,user,exists=False):
  """ name is the name under which to save the upload; user is the name of the user (not eg the topic or object) """
  id = str(dynamo.bumpCount("upload"))
  Logr.log("upload","NEW UPLOAD "+id)
  topic = "/upload/" + id
  rs = Upload(topic)
  rs.start_time = int(time.time())
  rs.name = name
  rs.user = user
  if exists:
    existInt=1
  else:
    existInt=0
  rs.exists = existInt
  rs.status = "notStarted"
  rs.save(True)
  return rs



class Job:
  def __init__(self,topic=None):
    if topic:
      self.topic = topic
    
  def save(self):
    tp = getattr(self,"topic",None)
    st = jobs.storeForJob(pageStore=self.pageStore)
    if tp:
      st.updateJob(self.__dict__)
    else:
      st.newJob(self.__dict__)



def getJob(topic,pageStore=None):
  d = jobs.getJob(topic,pageStore)
  if d == None:
    return None
  rs = Job(topic)
  rs.__dict__.update(d)
  rs.pageStore = pageStore
  return rs

def dictToJob(d,pageStore=None):
  topic = "/job/"+(d["owner"])+"/"+str(d["idx"])
  rs = Job(topic)
  rs.__dict__.update(d)
  rs.pageStore = pageStore
  return rs
  
def pendingJobs(pageStore=None):
  ds = jobs.pendingJobs(pageStore)
  return [dictToJob(d,pageStore) for d in ds]
  

def allocateAJob(owner,subject,kind,status="not_started",pageStore=None,saveIt=True):
  jb = Job()
  jb.kind = kind
  jb.owner = owner
  jb.total = 0
  jb.subject = subject
  jb.status = status
  jb.pageStore = pageStore
  if saveIt:
    jb.save()
  return jb

  



"""
  
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
execfile("ops/execthis.py")

ut = "/user/4294b0e"

uu = models.loadUserD(ut)

vv =uu.tumblrInfo()
   
  
"""

