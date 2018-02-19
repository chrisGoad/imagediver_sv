#!/usr/bin/env python
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py



python image_scripts/delete_album_prop.py cg astoria_1923_1 2 description 

"""

import constants
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import re
import store.theStore
theStore = store.theStore

import Logr
import subprocess
import sys
args = sys.argv
user = args[1]
image = args[2]
album = args[3]
prop = args[4]


topic = "/album/"+user+"/"+image+"/"+album;
print theStore.deleteTriple(topic,'/type/albumD','description')

print "DELETED {0} of {1}".format(prop,topic)