#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/createdirs.py vh vintage_1

"""

import constants
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import sys

args = sys.argv
user = args[1]
imname = args[2]

import model.models
models = model.models
ImageD = models.ImageD
UserD = models.UserD

im = ImageD("/image/"+user+"/"+imname)
o = UserD("/user/"+user)
o.name = user
o.createDirs()
im.owner = "/user/"+user
im.name = imname
im.createDirs()


