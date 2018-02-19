#!/usr/bin/env python
# python /var/www/neo.com/script_tests/dstoretest2.py
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
import store.theStore
theStore = store.theStore
import store.dynamo
dyn = store.dynamo
import model.models
models = model.models
import store.snaps
snaps = store.snaps
import store.jobs
jobs = store.jobs
import ops.logs
logs = ops.logs
import store.log
logstore = store.log
import api.register
import boto

#api.register.connectToSes()


test9 = models.loadUserD('/user/test9')


api.register.sendValidationEmail(test1)

