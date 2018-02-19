
import shutil
import re
import math
import time
import constants
import os
import store.dynamo
dynamo = store.dynamo
import model.models
models = model.models
import model.image
image = model.image
import model.album
album = model.album
import store.log
logstore = store.log
import api.ses
ses = api.ses
import misc



verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args)
   

def storageUtilization(usr):
  images = usr.images()
  sz = 0
  for im in images:
    #localsz  = getattr(im,"localStorage",0)
    s3sz = getattr(im,"s3Storage",0)
    sz = sz + s3sz
  return sz

models.UserD.storageUtilization = storageUtilization

 
def utilization(usr):
  stu = storageUtilization(usr)
  bw = logstore.bytesThisMonth(usr.id(),usr.pageStore)
  return {"storage":stu,"bandwidth":bw}
  
  

models.UserD.utilization = utilization

def allocation(usr):
  gig = 1000 * 1000 * 1000;
  storage = getattr(usr,"storage_allocation",2*gig)
  bandwidth = getattr(usr,"bandwidth_allocation",5*gig)
  return {"storage":storage,"bandwidth":bandwidth}
  
models.UserD.allocation = allocation

def setAllocation(usr,bandwidth=None,storage=None):
  if bandwidth:
    usr.bandwidth_allocation = bandwidth
  if storage:
    usr.storage_allocation = storage
  usr.dynsave(isNew=False)

models.UserD.setAllocation = setAllocation

def bandwidthExceededToS3(alb):
  fln = constants.pageRoot+"bandwidth_exceeded.html"
  alb.sendPageToS3(fln)
  


def whenBandwidthExceeded(usr,bwa=None,bwu=None):
  if getattr(usr,"bandwidth_exceeded",False):
    return False# already known to be exceeded
  if bwa: # this print is for the log. For use of this funtion from a shell, bwa,bwu, and this print, are optional
    print "Bandwidth Exceeded for User "+(usr.topic)+" allocation "+misc.bytesstring(bwa)+" used "+misc.bytesstring(bwu)
  albums = album.allAlbums(usr.topic,onlyPublished=True)
  for a in albums:
    vprint( "bandWidthExceeded "+a.topic)
    bandwidthExceededToS3(a)
  
  ses.sendBandwidthEmail(usr)
  usr.bandwidth_exceeded = 1
  usr.dynsave(isNew=False)
  return True
  
def clearBandwidthExceeded(usr):
  if not getattr(usr,"bandwidth_exceeded",False):
    if getattr(usr,"bandwidth_warning",False):
      usr.bandwidth_warning = 0
      usr.dynsave(isNew=False)
    return; # already cleared
  usr.bandwidth_warning = 0
  usr.bandwidth_exceeded = 0
  usr.dynsave(isNew=False)
  tp = usr.topic
  albums = album.allAlbums(usr.topic,onlyPublished=True)
  for a in albums:
    vprint( "clearWidthExceeded "+a.topic)
    a.sendPageToS3()
  

def bandwidthCheck(usr,pageStore):
  bwu = logstore.bytesThisMonth(usr.id(),pageStore)
  a = allocation(usr)
  bwa =a["bandwidth"]
  vprint("CHECKING BANDWIDTH ",usr.topic,"allocated",bwa,"used",bwu)
  if bwu > bwa:
    whenBandwidthExceeded(usr,bwa,bwu)
  else:
    clearBandwidthExceeded(usr)
    if bwu > bwa * 0.75:
      if not getattr(usr,"bandwidth_warning_sent",False):
        ses.sendBandwidthWarning(usr)
        usr.bandwidth_warning_sent = 1
        usr.dynsave(isNew=False)
    else:
      if getattr(usr,"bandwidth_warning_sent",False):
        usr.bandwidth_warning_sent = 0
        usr.dynsave(isNew=False)
     
    
    

def bandwidthCheckAll(pageStore):
  usrs = models.allUsers("bandwidth_allocation")
  for u in usrs:
    bandwidthCheck(u,pageStore)



def bandwidthCheckSome(userTopics,pageStore):
  usrs = models.loadUserDs(userTopics).values()
  cnt = 0
  for u in usrs:
    if (u):
      bandwidthCheck(u,pageStore)
    else:
      print "MISSING USER ",userTopics[cnt]
    cnt = cnt + 1



def bandwidthClearAll():
  usrs = models.allUsers("bandwidth_allocation")
  for u in usrs:
    clearBandwidthExceeded(u)
    

  

  
  
  
  """


  
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
execfile("ops/execthis.py")
utz = ops.utilization

pageStore = {}
utz.bandwidthCheckSome(["/user/4294b0e"],pageStore)


uu = models.loadUserD("/user/4294b0e")
uu.pageStore = pageStore
uu.utilization()


logstore.bytesThisMonth(usr.id(),usr.pageStore)
uu = models.loadUserD("/user/eed69c5")
uu.setAllocation(bandwidth=5000000000,storage=2000000000)

" DO THIS WHEN CHANGING ALLOCATION FOR A USER "

uu.setAllocation(bandwidth=5000000000)
utz.bandwidthCheck(uu,pageStore)

uu.setAllocation(storage=uu.storageUtilization() + 100000)


uu.setAllocation(storage=10000000000)

utz.bandwidthCheck(uu,pageStore)


uu = models.loadUserD("/user/5ee275d")
uu.setAllocation(storage=2000000000)

utz.bandwidthCheckAll()


utz.clearBandwidthExceeded(uu)

utz.bandwidthCheckAll()


aa = models.allUsers("bandwidth_allocation")

uu = models.loadUserD("/user/4294b0e")

aa = album.allAlbums(uu.topic,onlyPublished=True)

utz = model.utilization
utz.whenBandwidthExceeded(uu)
utz.clearBandwidthExceeded(uu)


alb = album.loadAlbumD("/album/725f81a/vintage_1/1")
alb.dyndelete()

utz.bandwidthExceededToS3(alb)
utz.clearBandwidthExceeded(uu)
alb.sendPageToS3()

uu = models.loadUserD("/user/725f81a")
dynamo.deleteUser(uu.topic)
"""
  
  
  
