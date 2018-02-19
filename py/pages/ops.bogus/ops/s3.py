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

from boto.s3.key import Key








theBucket = None

def s3Init(bucket="imagediver"):
  global theBucket
  if theBucket:
    return theBucket
  keyId = "04QAHN33GANWY5FNE782"
  secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";
  
  conn = boto.s3.connection.S3Connection(keyId,secretKey)
  
  #print conn
  bk = conn.create_bucket(bucket)
  #print bk
  bk.set_acl('public-read')
  
  #bk.set_acl('public-read')
  acl = bk.get_acl()
  #print acl
  theBucket = bk
  return bk

#def s3SaveFile(category,user,image,file):

def s3SaveFile(path):

  #path = "/"+category+"/"+user+"/"+image+"/"+file
  #if category=="tilings":
  fln = "/mnt/ebs1/imagediver"+path
  #else:
  # fln = "/mnt/ebs0/imagediverdev/www"+path
  s3path = path
  k = Key(theBucket)
  k.key = s3path
  k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
  k.set_contents_from_filename(fln)
  k.set_acl('public-read')
  #print "saved "+s3path+" from "+fln


