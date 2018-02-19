#!/usr/bin/env python
"""
NOT IN USE

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/userImages.py cg

http://imagediver.s3-website-us-east-1.amazonaws.com/topic/album/cg/The_Dutch_Proverbs/1/index.html

"""

import constants
import re
import boto
import boto.s3
import os
import sys
args = sys.argv
user = args[1]
bucketName = "imagediver"
keyId = "04QAHN33GANWY5FNE782";
secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";

conn = boto.s3.connection.S3Connection(keyId,secretKey)

print conn
bk = conn.create_bucket(bucketName)
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
def saveFile(bucket,user,image,album):
  albumTopic = "/album/"+user+"/"+image+"/"+album+"/index.html"
  fln = "/mnt/ebs0/imagediverdev/static"+albumTopic
  s3path = "/topic/"+albumTopic
  k = boto.s3.Key(bucket)
  k.key = s3path
  k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
  k.set_contents_from_filename(fln,headers={"Content-Type":"text/html"})
  k.set_acl('public-read')
  print "saved "+s3path+" from "+fln+" in bucket "+bucketName


"""
saveFile(bk,user,image,album)
"""
quit()

