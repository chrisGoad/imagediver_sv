#!/usr/bin/env python
"""
ONLY FOR FIXING UP FIRST GEN IMAGES
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/set_image_user.py cg astoria_1923_1
python image_scripts/set_image_user.py cg astoria_2010_1


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

topic = "/image/"+user+"/"+image

import model.models
models = model.models

Logr.log("dstore","HERE")

im = models.loadImageD(topic)
print im
print str(im.__dict__)

quit()
im.__dict__.update(
    {"user":"/user/"+user
    
     })

print im.__dict__
im.save()
quit()
