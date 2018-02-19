#!/usr/bin/env python
"""
reduce res to something suitable for facebook
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/reduce_res_fb.py cg flatiron_1
python image_scripts/reduce_res_fb.py cg vintage_1
python image_scripts/reduce_res_fb.py cg bathing_1
python image_scripts/reduce_res_fb.py cg mulberry_1
python image_scripts/reduce_res_fb.py cg astoria_1923_1
python image_scripts/reduce_res_fb.py cg astoria_2010_1
python image_scripts/reduce_res_fb.py vh vintage_1
python image_scripts/reduce_res_fb.py cg The_Dutch_Proverbs
python image_scripts/reduce_res_fb.py cg The_Ambassadors
python image_scripts/reduce_res_fb.py cg bathing_1
python image_scripts/reduce_res_fb.py cg earthly_delights_1

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

models.reduceImageWidth(topic,300)

 

