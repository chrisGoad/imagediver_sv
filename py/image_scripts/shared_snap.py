#!/usr/bin/env python
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python image_scripts/shared_snap.py cg The_Dutch_Proverbs 1 1
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 8 7
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 9 7
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 13 12
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 16 15
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 48 47
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 50 49
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 74 71
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 76 75
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 78 77

python image_scripts/shared_snap.py cg The_Dutch_Proverbs 85 84
python image_scripts/shared_snap.py cg The_Dutch_Proverbs 97 96

missing speak like a child herbie hancock talking heads
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
snap = args[3]
target = int(args[4])
album = "1"
topic = "/snap/"+user+"/"+image+"/"+snap

albumTopic = "/album/"+user+"/"+image+"/"+album;

import model.models
models = model.models
"""
import store.theStore
theStore = store.theStore
snaps = models.snapsInAlbum(albumTopic)
"""

Logr.log("dstore","HERE")
"""
im0 = models.loadImageD(topic)
print im0
print str(im0.__dict__)


snapDs = theStore.descriptor(snaps,'/type/snapD')

print snapDs[0]
"""
snap = models.loadSnapD(topic)

snap.__dict__.update({"shares_coverage":target})
    
print snap.__dict__
snap.save()
