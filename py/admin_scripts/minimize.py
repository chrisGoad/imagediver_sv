#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/minimize.py

"""
import constants

from admin_scripts.jsmin import jsmin

minrs = ""

def minimizeFile(fln):
  print "minimizing "+fln
  global minrs
  f = open("/mnt/ebs0/imagediverdev/www/"+fln)
  fc = f.read()
  fmin = jsmin(fc)
  minrs += fmin
  minrs += "\n"

"""
for me this is a first in my many varieties of "belated": belated facebook comment in thanks for a birthday greeting. thanks! i did have a good birthday
"""
  
def minimizeFiles(files,dstd,dstf):
  print "\n\n"
  global minrs
  minrs = ""
  for f in files:
    minimizeFile(f)
  dstp = dstd+"/"+dstf
  ofl = open(dstp,"w")
  ofl.write(minrs)
  ofl.close()


#minimizeFiles(["pages/browser","pages/albumdiv"])
#exit();
dstd = "/mnt/ebs0/imagediverdev/www/cjs"


minimizeFiles(constants.commonJsFiles,dstd,"common.js")

minimizeFiles(constants.imageJsFiles,dstd,"image.js")


minimizeFiles(constants.albumJsFiles,dstd,"album.js")
minimizeFiles(constants.albumPageJsFiles,dstd,"album_page.js")


minimizeFiles(["/pages/dual.js"],dstd,"dual.js")

minimizeFiles(["/pages/gallery.js"],dstd,"gallery.js")

print "done"
