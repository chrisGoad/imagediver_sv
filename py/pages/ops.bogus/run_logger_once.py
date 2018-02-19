#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""

import urlparse
import threading
import time
import urllib
import os
import json
import Logr
Logr.log("api","HOHOHO8O")
import model.models
models  = model.models
from WebClasses import WebResponse
import gzip
import store.log
logstore = store.log
import datetime
import time
import api.utils
apiutils = api.utils

import constants

"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""


import ops.logs
logger = ops.logs
import datetime

dt = datetime.datetime.utcnow()
print "RUNNING LOGGER ONCE"
bent = logger.readLogs()
logger.storeLogs(bent)
print "COMPLETED RUNNING LOGGER ONCE"


"""
cd /mnt/ebs0/imagediverdev/log
nohup python /mnt/ebs0/imagediverdev/py/scripts.py start&

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python ops/run_logger_once.py


python
import ops.logs
logger = ops.logs
logger.logjob(15,1)

"""
  

  
