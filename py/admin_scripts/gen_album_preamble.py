
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python admin_scripts/gen_album_preamble.py
"""

import constants
import re
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import subprocess
import sys
"""
args = sys.argv
imowner = args[1]
imname = args[2]
album = args[3]
"""

compress = False

import model.models
models = model.models
import json
import Logr
import store.theStore
theStore = store.theStore


pg0= '<script src="/lib/modernizr.custom.43258.js"></script>\n'
if compress:
  pg0 += constants.jsPreamble + constants.toJsInclude("/cjs/common.js") +  constants.toJsInclude("/cjs/album_page.js")
else:
  pg0 +=  constants.commonJsIncludes + constants.albumPageJsIncludes
  
 
print pg0


  

