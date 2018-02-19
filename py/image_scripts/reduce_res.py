#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/reduce_res.py cg flatiron_1
python image_scripts/reduce_res.py cg vintage_1
python image_scripts/reduce_res.py cg bathing_1
python image_scripts/reduce_res.py cg mulberry_1
python image_scripts/reduce_res.py cg astoria_1923_1
python image_scripts/reduce_res.py cg astoria_2010_1
python image_scripts/reduce_res.py vh vintage_1
python image_scripts/reduce_res.py cg The_Dutch_Proverbs

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

im = models.loadImageD(topic)
#im.extension="TIF"
#im.save()
print str(im.__dict__)

models.reduceImageRes(topic)

 

