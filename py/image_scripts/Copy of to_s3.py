#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/to_s3.py tilings cg astoria_2010_1
python image_scripts/to_s3.py tilings cg bellvue_towers_1
python image_scripts/to_s3.py snap cg astoria_1923_1
python image_scripts/to_s3.py snapthumb cg astoria_1923_1
python image_scripts/to_s3.py snapthumb cg mulberry_1
python image_scripts/to_s3.py tilings cg flatiron_1
python image_scripts/to_s3.py tilings cg bathing_1
python image_scripts/to_s3.py snapthumb cg bathing_1
python image_scripts/to_s3.py snap cg bathing_1
python image_scripts/to_s3.py snap cg vintage_1
python admin_scripts/setbucket.py cg vintage_1
python image_scripts/to_s3.py tilings cg astoria_1880_0
python image_scripts/to_s3.py tilings cg vintage_1

"""

import constants
import re
import boto
import boto.s3
import os
import sys
args = sys.argv
category = args[1]
user = args[2]
image = args[3]
bucket = "idv_"+user
keyId = "04QAHN33GANWY5FNE782";
secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";

conn = boto.s3.connection.S3Connection(keyId,secretKey)

print conn
bk = conn.create_bucket(bucket)
print bk
bk.set_acl('public-read')

#bk.set_acl('public-read')
acl = bk.get_acl()
print acl
#quit()
"""
structure
idv/tiling/user/image
idv/snap/user/image
idv/snapthumb/user/image
idv/resized/
"""
""" works for everything  but resized """
def saveFile(bucket,category,user,image,file):
  fln = "/mnt/ebs1/imagediver/"+category+"/"+user+"/"+image+"/"+file
  s3path = "/"+category+"/"+user+"/"+image+"/"+file
  k = boto.s3.Key(bucket)
  k.key = s3path
  k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
  k.set_contents_from_filename(fln)
  k.set_acl('public-read')
  print "saved "+s3path+" from "+fln

def saveDir(bucket,category,user,image):
  dir = "/mnt/ebs1/imagediver/"+category+"/"+user+"/"+image
  cn = os.listdir(dir)
  for fln in cn:
    saveFile(bucket,category,user,image,fln)
    

saveDir(bk,category,user,image)
quit()
"""
k = boto.s3.Key(bk)
k.key = "/Panorama1923_3/r00.jpg"
print "HOO"
print k.get_acl()
  

print bk
tls = bk.list("cg/mulberry")
itr = tls.__iter__()
print "HEY"
print itr.next()
#quit()
"""

dir = "/mnt/ebs1/imagediver/tilings/"+user+"/"+image
cn = os.listdir(dir)
print cn[1]
print dir
saveFile(bk,category,user,image,cn[1])
"""
http://idv.s3.amazonaws.com/tilings/cg/mulberry_1/r031233.jpg
http://tilings.s3.amazonaws.com/Panorama1923_3/r00.jpg

"""
#def storeFile(fl):
  