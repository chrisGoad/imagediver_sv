#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python admin_scripts/new_store.py
"""
import sys
import store.dstore
dstore = store.dstore


dstore.DStore('descriptors0')
print "done"



