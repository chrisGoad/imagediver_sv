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
import constants

def createTables():
dyn.createTable("Count")
dyn.createTable("Image")
dyn.createTable("Album")
dyn.createImageToAlbumsTable()
dyn.createTable("Session")
dyn.createTable("User")
dyn.createTable("Upload")
dyn.xferTable("/type/userD","User")
dyn.xferTable("/type/imageD","Image")
dyn.xferTable("/type/albumD","Album")
dyn.buildImageToAlbums()

constants.useDynamoTest = False

snaps.xferSnaps("/album/cg/The_Ambassadors/1")
snaps.xferSnaps("/album/cg/The_Dutch_Proverbs/1")
snaps.xferSnaps("/album/cg/earthly_delights_1/1")
snaps.xferSnaps("/album/cg/earthly_delights_1/2")
snaps.xferSnaps("/album/cg/earthly_delights_1/3")
snaps.xferSnaps("/album/cg/earthly_delights_1/4")
snaps.xferSnaps("/album/cg/astoria_1923_1/1")
snaps.xferSnaps("/album/cg/astoria_1923_1/2")

dyn.createTables()
ii = dyn.xferUsers()
dyn.createUserTable()

dyn.deleteImageTable()
dyn.createImageTable()
dyn.deleteSnapTable()
dyn.createSnapTable()
dyn.createAlbumToSnapsTable()
dyn.xferSnaps()
dyn.deleteAlbumToSnapsTable()
dyn.createAlbumToSnapsTable()
dyn.buildAlbumToSnaps()

ii = dyn.xferImages()

dyn.createAlbumTable()
"""
dyn.xferAlbums()


ii =  dyn.getUser('/user/cg')

tab = dyn.imageTable()
q  = tab.scan()

for u in q:
  print "V",u
  
,range_key='Chris Goad')

dynamo.getUser('/user/cg')



import model.models
model = model.models
topic = "/album/cg/The_Ambassadors/1"
album = model.loadAlbumD(topic)

snaps = model.snapsInAlbum(topic)


 



