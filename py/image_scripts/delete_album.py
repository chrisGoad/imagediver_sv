#!/usr/bin/env python
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python image_scripts/delete_album.py cg astoria_1923_1 6



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
album = args[3]


topic = "/album/"+user+"/"+image+"/"+album;

print topic
import model.models
models = model.models



models.deleteTopic(topic)
snaps = models.snapsInAlbum(topic)
if len(snaps)>0:
  models.deleteTopics(snaps)

print "DELETED "+topic
