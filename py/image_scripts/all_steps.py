#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python image_scripts/all_steps.py cg earthly_delights_1 jpg

"""

import constants
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import sys
from util.image_ops import allSteps,printIm
args = sys.argv
user = args[1]
imname = args[2]
ext = args[3]
print "ALLSTEPS"
allSteps(user,imname,ext)
printIm(user,imname)

