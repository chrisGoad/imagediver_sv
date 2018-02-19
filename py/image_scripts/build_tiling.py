#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/build_tiling.py cg astoria_1880_0
python image_scripts/build_tiling.py cg astoria_1880_0


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python image_scripts/build_tiling.py cg The_Dutch_Proverbs

"""

import constants
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import sys

args = sys.argv
user = args[1]
imname = args[2]

topic = "/image/"+user+"/"+imname

import model.models
models = model.models

print "TOPIC "+topic
im = models.loadImageD(topic)
print str(im.__dict__)
tl  = models.Tiling(im,256,1);
print str(tl.__dict__)

tl.createTiles([])
print str(len(tl.tiles))
tl.createImageFiles()
 

