#!/usr/bin/env python
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py



python
execfile("ops/execthis.py")
twoGig = 2*1000*1000*1000
uu = models.loadUserD("/user/725f81a")
uu2 = models.loadUserD("/user/4294b0e")
uu.storage_allocation = twoGig
uu.bandwidth_allocation = twoGig

uu.dynsave(False)
