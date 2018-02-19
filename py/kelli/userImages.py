#!/usr/bin/env python
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python kelli/userImages.py cg

http://imagediver.s3-website-us-east-1.amazonaws.com/topic/album/cg/The_Dutch_Proverbs/1/index.html

"""

import constants
import re
import store.dynamo as dynamo
"""import boto
import boto.s3
import boto.s3.connection
import os
import sys
args = sys.argv
user = args[1]
bucketName = "imagediver"
keyId = "04QAHN33GANWY5FNE782";
secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";
"""
print "store"
print dynamo
dynamo.connect();
ims = dynamo.allImages()
"""
users = dynamo.allUsers()
print users[0]
u0 = users[0]
print u0["email"]
for u in users:
  try:
    e = u[u"email"]
    if e == "kkrenken@gmail.com":
      print u
  except KeyError:
    continue;
quit() 
print ims[5]
"""
for im in ims:
  try:
    o = im["owner"]
    if o == "/user/977916b":
      print "FOUND",im
      
  except KeyError:
    continue
quit() 
tab = dynamo.getTable("Image")
print "tab",tab
qrs = tab.query(owner="/user/f5d34f0")
for qr in qrs:
  print qr.owner;
quit()

