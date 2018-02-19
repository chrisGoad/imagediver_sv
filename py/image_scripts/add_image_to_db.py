#!/usr/bin/env python
"""

cd /mnt/ebs1/imagediver/cg
wget -O The_Dutch_Proverbs.jpg http://upload.wikimedia.org/wikipedia/commons/b/b3/Pieter_Bruegel_the_Elder_-_The_Dutch_Proverbs_-_Google_Art_Project.jpg

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/add_image_to_db.py vh vintage_1.TIF
python image_scripts/add_image_to_db.py cg astoria_1880_0.jpg
python image_scripts/add_image_to_db.py cg The_Dutch_Proverbs.jpg

sss = subprocess.call('identify /mnt/ebs1/imagediver/image/cg/vintage_1.TIF > ident3.txt',shell=True)

"""

import constants
import re
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import subprocess
import sys
args = sys.argv
user = args[1]
image = args[2]
path = "/mnt/ebs1/imagediver/image/"+user+"/"+image
idfln = path +".identt"
errfln = path +".err"
errfl = open(errfln,"w")
subprocess.call('identify '+path+' > '+idfln,shell=True,stderr=errfl)
ifl = open(idfln)
rrr = ifl.read()
print "READ "+rrr
iemt = re.search("(\d*)x(\d*)",rrr)
print iemt
xd = int(iemt.group(1))
yd = int(iemt.group(2))
print "XD ["+str(xd)+"] YD ["+str(yd)+"]"
def dropExtension(s):
  ldot = s.rindex(".")
  return s[0:ldot]
  
def extension(s):
  ldot = s.rindex(".")
  return s[ldot+1:]
imname = dropExtension(image)
imext = extension(image)
print "IMNAME["+imname+","+imext+"]"
topic = "/image/"+user+"/"+imname

import model.models
models = model.models

Logr.log("dstore","HERE")
"""
im0 = models.loadImageD(topic)
print im0
print str(im0.__dict__)
"""

im = models.ImageD(topic)
im.__dict__.update(
    {"name":imname,
     "extension":imext,
     "owner":"/user/"+user,
     "bucket":"idv_"+user,
     "dimensions":{"x":xd,"y":yd},
     "tilingDepthBump":0,
     "zoomDepthBump":3
     })

print im.__dict__
im.save()
quit()
