#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/set_image_title.py cg bathing_1 "Bathing at Belle Isle (in 1910s)"
python image_scripts/set_image_title.py cg mulberry_1 "Mulberry Street (in about 1900)"


"""

import constants
import re
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import sys
args = sys.argv
user = args[1]
image = args[2]
title = args[3]

topic = "/image/"+user+"/"+image

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
    {"title":title
    
     })

print im.__dict__
im.save()
quit()
