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
import model.image
image = model.image
import model.album
album = model.album
from model.image import Point,Rect
import store.snaps
snaps = store.snaps
import store.jobs
jobs = store.jobs
import api.job
ajob = api.job

import ops.logs
logs = ops.logs
import store.log
logstore = store.log


albumD = album.loadAlbumD('/album/test22/t14/8')
dyn.assertPublished(albumD,True)

tab = dyn.getTable("ImageToAlbums")
ss = tab.scan()
for i in ss:
  if i.get("published"):
    print i["topic"]
    
    
    
    
image.albumCounts()


js = albumD.compute_json()
print js
rs = albumD.publish()


print rs


http://s3.imagediver.org/topics/album/test22/t14/12/index.html
https://s3.amazonaws.com/imagediver/topics/album/test22/t14/12/index.html


