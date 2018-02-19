#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""




import constants


import urllib2
import boto

import boto.s3

import boto.s3.connection
import ops.keys as keys
from boto.s3.key import Key
import os
import time
import misc


verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"OPS/S3")
   

imageBucket = None
webBucket = None

#what = images or <anythng else>

bucketsByName = {}

"""
global imageBucket,webBucket
  if what == "images":
    if imageBucket:
      return imageBucket
    bname = "imagediver"
  else:
    if webBucket:
      return webBucket
    bname = "s3.imagediver.org"
"""

def s3Init(bucketName="imagediver"):
  global bucketsByName
  bk = bucketsByName.get(bucketName,None)
  if bk:
    return bk
  keyId = keys.keyId
  secretKey = keys.secretKey
 
  conn = boto.s3.connection.S3Connection(keyId,secretKey)
  
  bk = conn.create_bucket(bucketName)
  bk.set_acl('public-read')
  
  #bk.set_acl('public-read')
  acl = bk.get_acl()
  bucketsByName[bucketName] = bk
  return bk

#def s3SaveFile(category,user,image,file):
# this saves files relative to the images directory, by default
# images go to the imagediver bucket,  which is cloudfronted
# topics and pages go to s3.imagediver.org.s3-website-us-east-1.amazonaws.com, which is websited

def localDirToBucketName(dir):
  if dir == "images":
    bname = "imagediver"
  else:
    bname = "s3.imagediver.org"
  return bname

  


def s3SetContents(path,srcFile=None,contents=None,relativeTo="images",contentType=None):
  """ if srcFile and contents are None, derive the srcFile from path """
  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  vprint("PATH",path,"srcFile",srcFile,"relativeTo",relativeTo)
  stm = time.time()
  bucket = s3Init(localDirToBucketName(relativeTo))
  rs = None
  if contents == None:
    if srcFile:
      fln = srcFile
    else:
      fln = constants.imageDiverStorageRoot+relativeTo+"/"+path
    rs = os.path.getsize(fln)
  else:
    rs = len(contents)
  
  #else:
  # fln = "/mnt/ebs0/imagediverdev/www"+path
  s3path = relativeTo+"/"+path

  k = Key(bucket)
  k.key = s3path
  #k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
  if contentType:
    headers = {'Content-Type': contentType,'x-amz-acl':'public-read'}
    if contentType == "image/jpeg":
      headers['Cache-Control']= 'max-age=31536000, must-revalidate'
      #headers['Cache-Control']= 'max-age=31536000'
  else:
    headers = {'x-amz-acl':'public-read'}
  if contents:
    k.set_contents_from_string(contents,headers=headers)
    fln = "contents"
  else:
    k.set_contents_from_filename(fln,headers=headers)
  #k.set_acl('public-read')
  etm = time.time() - stm
  vprint("SAVED ",fln," TO S3 ",s3path," in ",etm," into bucket "+relativeTo)
  return rs
   

#def s3SetContents(path,srcFile=None,contents=None,relativeTo="images",contentType=None):
    
def s3SaveFile(path,relativeTo="images",contentType=None):
  srcFile = constants.imageDiverStorageRoot+relativeTo+"/"+path
  return s3SetContents(path,srcFile,None,relativeTo,contentType)

def s3Copy(src,dst,contentType):
  vprint("S3 copying ",src," to ",dst)
  url = "http://s3.imagediver.org"+src
  try:
    cn = urllib2.urlopen(url).read()
  except Exception as ex:
    print "could not copy ",src
    return
  s3SetContents(dst,contents=cn,relativeTo="",contentType=contentType)
  





def s3DeleteKey(path,relativeTo="images"):
  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  bucket = s3Init(localDirToBucketName(relativeTo))
  rs = None
  if relativeTo == "topics":
    s3path = "topic/"+path
  else:
    s3path = relativeTo+"/"+path

  k = Key(bucket)
  k.key = s3path
  k.delete()
  vprint("deleted "+s3path+" from bucket "+relativeTo)
  return rs



def s3DeleteKeys(paths,relativeTo="images"):
  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  bucket = s3Init(localDirToBucketName(relativeTo))
  rs = None
  actualRelativeTo = "topic" if relativeTo == "topics" else relativeTo # get rid of this confusing "topics" means "topic" thing some day
  s3paths = [actualRelativeTo+"/"+path for path in paths]
  keys = []
  for p in s3paths:
    k = Key(bucket)
    k.key = p
    keys.append(k)
  bucket.delete_keys(keys,quiet=True)
  vprint("deleted "+str(s3paths)+" from bucket "+relativeTo)
  return rs



