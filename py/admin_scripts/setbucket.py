#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/setbucket.py cg vintage_1

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
im.owner = "/user/"+user
im.bucket = "idv_"+user
im.save()

