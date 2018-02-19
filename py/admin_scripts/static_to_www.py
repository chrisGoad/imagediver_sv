#!/usr/bin/env python
"""
Tranfers files from dev to their static homes on imagediver/www

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python admin_scripts/static_to_www.py /index.html /index.html

python admin_scripts/static_to_www.py /missing.html

python admin_scripts/static_to_www.py /gallery/index.html 

cp /mnt/ebs0/imagediverdev/www/album/example.html /mnt/ebs0/imagediver/www/album
cp /mnt/ebs0/imagediverdev/www/album/example.css /mnt/ebs0/imagediver/www/album

http://imagediver.s3-website-us-east-1.amazonaws.com/topic/album/cg/The_Dutch_Proverbs/1/index.html

"""

import sys
args = sys.argv
path = args[1]
idest = None
if len(args)>2:
  idest = args[2]
  
import shutil
import os

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
  fln = "/mnt/ebs0/imagediverdev/static"+path
  print "local file: "+fln
  if idest:
    dest = "/mnt/ebs0/imagediver/www"+idest
  else:
    dest  = "/mnt/ebs0/imagediver/www"+path
  print "saved "+fln+" to "+dest
  createDir(dest)
  shutil.copyfile(fln,dest)

saveFile(path,idest)

