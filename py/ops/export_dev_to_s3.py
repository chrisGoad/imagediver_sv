#!/usr/bin/env python

"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH


cd /mnt/ebs0/imagediverdev/py
python ops/export_dev_to_s3.py


python
"""


import constants
import ops.s3
s3 = ops.s3


s3fls = ["/ncjs/modernizr.custom.43258.js","/ncjs/common.js","/ncjs/album.js","/ncjs/swfobject.js","/ncjs/jquery-ui-1.8.21.custom.min.js"]





def sendFile(fl,contentType):
  srcDir = "/mnt/ebs0/imagediverdev/www"
  dstDir = "/devjs7921"
  path = dstDir + fl;
  srcFile = srcDir + fl 
  print "sending ",srcFile,"to",path
  s3.s3SetContents(path,srcFile,relativeTo="/",contentType=contentType)
  print "sent "


for fl in s3fls:
  sendFile(fl,"application/javascript")
# should have dev version of css too 
sendFile("/css/imagestyle.css","text/css")
sendFile("/hx/canvas.swf","application/x-shockwave-flash")
sendFile("/minus.png","image/png")
sendFile("/plus.png","image/png")


