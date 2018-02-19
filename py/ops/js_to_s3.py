#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH


cd /mnt/ebs0/imagediverdev/py
python admin_scripts/js_to_s3.py 


python
"""


import constants
import ops.s3
s3 = ops.s3


fromDev = True
toDev = True

def sendFile(fl,contentType):
  global fromDev,toDev
  if fromDev:
    srcDir = "/mnt/ebs0/imagediverdev/www"
  else:
    srcDir = "/mnt/ebs0/imagediver/www"
  if toDev:
    dstDir ="/devjs7921"
  else:
    dstDir = "/"
  path = dstDir + fl;
  srcFile = srcDir + fl 
  print "sending ",srcFile,"to",path
  s3.s3SetContents(path,srcFile,relativeTo="/",contentType=contentType)
  print "sent "


fls = []
fls.extend(constants.commonJsFiles)
fls.extend(constants.jsFiles["album"])
fls.extend(["/ncjs/common.js","/ncjs/album.js"])
for fl in fls:
  sendFile(fl,"application/javascript")
quit()

toDev = False
sendFile("/css/ui-darkness/jquery-ui-1.8.21.custom.css","text/css")
sendFile("/js/jquery-ui-1.8.21.custom.min.js","application/javascript")
sendFile("/hx/canvas.swf","application/x-shockwave-flash")
sendFile("/ajax-loader.gif","image/gif")

"""
saveFile(bk,"/pages/imagestyle.css","text/css")
saveFile(bk,"/hx/canvas.swf","application/x-shockwave-flash")
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
"""

