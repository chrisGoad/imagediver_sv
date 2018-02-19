#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/js_to_www.py 


"""

import shutil
import os
import constants

def createDir(path):
  """ creates the directories if needed """
  pr = path.rsplit("/")
  cdir = "/"
  ln = len(pr)
  print path,pr
  for i in range(0,ln-1):
    p = pr[i]
    cdir = cdir + p + "/";
    if not os.path.exists(cdir):
      os.mkdir(cdir)
  
  
  
def saveFile(path,idest=None):
  fln = "/mnt/ebs0/imagediverdev/www"+path
  print "local file: "+fln
  if idest:
    dest = idest
  else:
    dest  = "/mnt/ebs0/imagediver/www"+path
  print "saved "+fln+" to "+dest
  createDir(dest)
  
  shutil.copyfile(fln,dest)




fls = ['/lib/modernizr.custom.43258.js']
fls.extend(constants.commonJsFiles)
fls.extend(constants.albumJsFiles)
fls.extend(constants.imageJsFiles)
fls.append('/js/swfobject.js')
fls.append('/js/excanvas.compiled.js')
fls.append('/js/flashcanvas.js')
fls.append('/pages/gallery.js')

for fl in fls:
  saveFile(fl)
saveFile("/pages/imagestyle.css")
saveFile("/hx/canvas.swf")
saveFile("/js/flashcanvas.swf")
saveFile("/favicon.ico")
saveFile("/plus.png")
saveFile("/minus.png")
saveFile('/cjs/common.js')
saveFile('/cjs/image.js')
saveFile('/cjs/album.js')
saveFile('/cjs/album_page.js')
saveFile('/cjs/gallery.js')


quit()

