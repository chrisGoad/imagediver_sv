#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

cp /mnt/ebs0/imagediverdev/www/album/example.html /mnt/ebs0/imagediverdev/static/album/example.html
cp /mnt/ebs0/imagediverdev/www/album/example.css /mnt/ebs0/imagediverdev/static/album/example.css

python admin_scripts/static_to_s3.py /index.html

python admin_scripts/static_to_s3.py /topic/album/cg/The_Dutch_Proverbs/1/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/The_Dutch_Proverbs/1/topic.json
python admin_scripts/static_to_s3.py /topic/album/cg/The_Ambassadors/1/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/The_Ambassadors/1/topic.json
python admin_scripts/static_to_s3.py /topic/image/cg/The_Ambassadors/index.html

python admin_scripts/static_to_s3.py /topic/image/cg/earthly_delights_1/index.html

python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/1/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/1/topic.json


python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/2/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/2/topic.json



python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/3/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/3/topic.json


python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/4/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/earthly_delights_1/4/topic.json


python admin_scripts/static_to_s3.py /topic/album/cg/bathing_1/1/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/bathing_1/1/topic.json


python admin_scripts/static_to_s3.py /topic/image/cg/astoria_1923_1/index.html

python admin_scripts/static_to_s3.py /topic/album/cg/astoria_1923_1/1/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/astoria_1923_1/1/topic.json


python admin_scripts/static_to_s3.py /topic/album/cg/astoria_1923_1/2/index.html
python admin_scripts/static_to_s3.py /topic/album/cg/astoria_1923_1/2/topic.json
python admin_scripts/static_to_s3.py /plus.png
python admin_scripts/static_to_s3.py /minus.png

python admin_scripts/static_to_s3.py /gallery/index.html

python admin_scripts/static_to_s3.py /album/example.html
python admin_scripts/static_to_s3.py /album/example.css


http://imagediver.s3-website-us-east-1.amazonaws.com/topic/album/cg/The_Dutch_Proverbs/1/index.html

"""

import constants
import re
import boto
import boto.s3
import boto.s3.connection
from boto.s3.key import Key
import os
import sys
args = sys.argv
path = args[1]

bucketName = "s3.imagediver.org"
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
def saveFile(bucket,path,dest=None):
  fln = "/mnt/ebs0/imagediverdev/static"+path
  print "local file: "+fln
  if dest:
    s3path = dest
  else:
    s3path = path
  k = Key(bucket)
  k.key = s3path
  k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
  k.set_contents_from_filename(fln,headers={"Content-Type":"text/html",'Cache-Control':'max-age=120,must-revalidate'})
  k.set_acl('public-read')
  print "saved "+s3path+" from "+fln+" in bucket "+bucketName
  if (dest==None) and (path == (constants.homePage)+"/index.html"):
    print "SAVING HOME PAGE"
    saveFile(bucket,path,"/index.html")


saveFile(bk,path)
quit()

