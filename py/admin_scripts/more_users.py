#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/more_users.py vh duane "Astoria Vintage Hardware"

"""

import constants

constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"

import model.models
models = model.models
import sys
args = sys.argv
user = args[1]
passwd = args[2]
name = args[3]


u = models.UserD("/user/"+user)
u.name=name
print str(u.__dict__)

u.save()

u.setPassword(passwd)

