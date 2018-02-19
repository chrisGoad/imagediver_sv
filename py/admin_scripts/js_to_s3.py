#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/js_to_s3.py 


"""

import constants
import re
import boto
import boto.s3
import boto.s3.connection
from boto.s3.key import Key
import os
import sys

bucket = "s3.imagediver.org"
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
def saveFile(bucket,file,ctype="application/javascript",useDev=True):
  if useDev:
    fln = "/mnt/ebs0/imagediverdev/www"+file;
  else:
    fln = "/mnt/ebs0/imagediver/www"+file;
    
  print "writing ",file
  s3path = file
  k = Key(bucket)
  k.key = s3path
  k.set_contents_from_string("hello helllo") # seems a bug, but this is needed
  k.set_contents_from_filename(fln,headers={"Content-Type":ctype,'Cache-Control':'max-age=120,must-revalidate'})
  k.set_acl('public-read')
  print "saved "+s3path+" from "+fln

fls = ['/lib/modernizr.custom.43258.js']
fls.extend(constants.commonJsFiles)
fls.extend(constants.albumJsFiles)
fls.extend(constants.imageJsFiles)
fls.append('/js/swfobject.js')
fls.append('/js/excanvas.compiled.js')
fls.append('/js/flashcanvas.js')
fls.append('/pages/gallery.js')

for fl in fls:
  saveFile(bk,fl)
saveFile(bk,"/pages/imagestyle.css","text/css")
saveFile(bk,"/hx/canvas.swf","application/x-shockwave-flas")
saveFile(bk,"/js/flashcanvas.swf","application/x-shockwave-flas")
saveFile(bk,"/favicon.ico"," image/vnd.microsoft.icon")
saveFile(bk,"/plus.png","image/png")
saveFile(bk,"/minus.png","image/png")
saveFile(bk,'/cjs/common.js')
saveFile(bk,'/cjs/image.js')
saveFile(bk,'/cjs/album.js')
saveFile(bk,'/cjs/album_page.js')
saveFile(bk,'/cjs/gallery.js')


quit()

