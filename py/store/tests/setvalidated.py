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

uu = models.loadUserD("/user/cg")
uu.validated = 1
uu.dynsave()


 



