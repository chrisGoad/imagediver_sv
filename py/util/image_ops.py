#!/usr/bin/env python




import constants
import re
#constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
#constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import subprocess
import sys

import model.models
from util.to_s3 import s3Conn
models = model.models
ImageD = models.ImageD
UserD = models.UserD


def dropExtension(s):
  ldot = s.rindex(".")
  return s[0:ldot]
  
def extension(s):
  ldot = s.rindex(".")
  return s[ldot+1:]
  
def add_to_db(user,imname,imext):
   #print "IMNAME["+imname+","+imext+"]"
  topic = "/image/"+user+"/"+imname
  path = "/mnt/ebs1/imagediver/image/"+user+"/"+imname+"."+imext
  idfln = path +".identt"
  errfln = path +".err"
  errfl = open(errfln,"w")
  subprocess.call('identify '+path+' > '+idfln,shell=True,stderr=errfl)
  ifl = open(idfln)
  rrr = ifl.read()
  #print "READ "+rrr
  iemt = re.search("(\d*)x(\d*)",rrr)
  #print iemt
  xd = int(iemt.group(1))
  yd = int(iemt.group(2))
  #print "XD ["+str(xd)+"] YD ["+str(yd)+"]"
  im = models.ImageD(topic)
  im.__dict__.update(
    {"name":imname,
     "extension":imext,
     "owner":"/user/"+user,
     "bucket":"idv_"+user,
     "dimensions":{"x":xd,"y":yd},
     "tilingDepthBump":0,
     "zoomDepthBump":3
     })
  im.save()



def createResized(user,imname):
  topic = "/image/"+user+"/"+imname
  im = models.loadImageD(topic)
  models.reduceImageRes(topic)


def resizedToS3(user,imname):
  s3c = s3Conn()
  bkn = "idv_"+user
  bk = s3c.createBucket(bkn)
  dir = "/mnt/ebs1/imagediver/resized/"+user
  s3dir = "/resized"
  fln = imname + ".jpg"
  s3c.saveFile(bk,dir,s3dir,fln)


def createTiles(user,imname):
  topic = "/image/"+user+"/"+imname
  im = models.loadImageD(topic)
  tl  = models.Tiling(im,256,1);
  tl.createTiles([])
  numtiles = len(tl.tiles)
  tl.createImageFiles()
  return numtiles



def tilesToS3(user,imname):
  s3c = s3Conn()
  bkn = "idv_"+user
  bk = s3c.createBucket(bkn)
  dir = "/mnt/ebs1/imagediver/tilings/"+user+"/"+imname
  s3dir = "/tilings/"+imname
  s3c.saveDir(bk,dir,s3dir)
 



def createDirs(user,imname):
  im = ImageD("/image/"+user+"/"+imname)
  im.owner = "/user/"+user
  im.name = imname
  im.createDirs()
  
  
def allSteps(user,imname,ext):
  """
  add_to_db(user,imname,ext)
  createDirs(user,imname)
  createResized(user,imname)
  createTiles(user,imname)
  resizedToS3(user,imname)
  """
  tilesToS3(user,imname)

def printIm(user,imname):
  topic = "/image/"+user+"/"+imname
  im = models.loadImageD(topic)
  print str(im.__dict__)
 
  