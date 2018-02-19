#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python ops/minimize.py

"""
import constants
from constants import jsFiles


from ops.jsmin import jsmin

minrs = ""

def minimizeFile(fln):
  print "minimizing "+fln
  ln = len(fln)
  if fln[ln-3:ln] == ".js":
    fln = fln[0:ln-3]
  #print "wo js", fln
  global minrs
  f = open("/mnt/ebs0/imagediverdev/www/"+fln+".js")
  fc = f.read()
  fmin = jsmin(fc)
  minrs += fmin
  minrs += "\n"

  
def minimizeFiles(files,dstd,dstf):
  print "\n\n"
  global minrs
  minrs = ""
  for f in files:
    minimizeFile(f)
  dstp = dstd+"/"+dstf+".js"
  ofl = open(dstp,"w")
  ofl.write(minrs)
  ofl.close()


#minimizeFiles(["pages/browser","pages/albumdiv"])
#exit();
dstd = "/mnt/ebs0/imagediverdev/www/dcjs"
minimizeFiles(['/lib/util','/js/topbar'],dstd,'staticpage')
minimizeFiles(constants.commonJsFiles,dstd,"common")

def minimizeFilesForPage(pg):
  minimizeFiles(constants.jsFiles[pg],dstd,pg)

def minimizeFilesForAllPages():
  for pg in constants.jsFiles.keys():
    minimizeFilesForPage(pg)

minimizeFilesForAllPages()
print "done"

"""

minimizeFiles(constants.jsFiles["upload_iframe"],dstd,"upload_iframe.js")


minimizeFiles(constants.jsFiles["upload"],dstd,"upload.js")


minimizeFiles(constants.jsFiles["images"],dstd,"images.js")
minimizeFiles(constants.jsFiles["image"],dstd,"image.js")
minimizeFiles(constants.jsFiles["mywork"],dstd,"mywork.js")
minimizeFiles(constants.jsFiles["album"],dstd,"album.js")
minimizeFiles(constants.jsFiles["me"],dstd,"me.js")
minimizeFiles(constants.jsFiles["gallery"],dstd,"gallery.js")
minimizeFiles(constants.jsFiles["login"],dstd,"login.js")


#minimizeFiles(constants.albumPageJsFiles,dstd,"album_page.js")


#minimizeFiles(["/pages/dual.js"],dstd,"dual.js")

minimizeFiles(["/pages/gallery.js"],dstd,"gallery.js")

print "done"
"""
