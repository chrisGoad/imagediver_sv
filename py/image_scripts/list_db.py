#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/list_db.py

"""

import constants
import re

constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import store.theStore
theStore = store.theStore

topics = theStore.allTopics()

def topicsWithType(tps,ttp):
  rs = set()
  for tp in tps:
    stp = tp.split("/");
    if stp[1]== ttp:
      rs.add(tp)
  return list(rs)
    
print str(topicsWithType(topics,"album"))

