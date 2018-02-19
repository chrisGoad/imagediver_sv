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

mm = models.albumCounts()

tab = dyn.getTable("ImageToAlbums")
ss = tab.scan()

cnts = {}
for i in ss:
  im = i["image"]
  cc = cnts.get(im,None)
  if cc==None:
    cnts[im] = 1
  else:
    cnts[im] = cc + 1
    
    
import ops.s3
s3 = ops.s3
"""
ss = logstore.initStore()

logstore.newLogEntry(23,"cg",4,1243)
vv = logstore.selectLogEntries(23,"cg",4)
"""

"""
from api.job import buildTiling,s3Init,s3SaveFile

#rr = logs.logKeys()
#rrr = [ky for ky in rr]
#x = logs.readLog(rrr[0],1)
x = logs.readLogs()

logs.storeLogs(x)

#tt = models.loadImageD("/image/cg/test4")
"""

s3.s3Init()
def rih(im):
  tp = "/image/cg/"+im
  models.reduceImageHeight(tp,100)
  s3.s3SaveFile("/resizedh100/cg/"+im+".jpg")
  print "TOPIC ",tp
  im = models.loadImageD(tp)
  im.atS3 = 1
  im.beenTiled = 1
  im.dynsave()

rih("The_Ambassadors")
rih("The_Dutch_Proverbs")
rih("earthly_delights_1")


models.deleteImage("/image/cg/herb")
models.deleteImage("/image/cg/P1000515mm")
models.deleteImage("/image/cg/P1000515a")
models.deleteImage("/image/cg/P10005158")
models.deleteImage("/image/cg/P1000500")
models.deleteImage("/image/cg/P00")
models.deleteImage("/image/cg/palermo")
models.deleteImage("/image/cg/P1000515rr")
models.deleteImage("/image/cg/palermo7")
models.deleteImage("/image/cg/palermo5")
models.deleteImage("/image/cg/palermo10")

models.deleteImage("/image/cg/the_test")
models.deleteImage("/image/cg/P1000515y")
models.deleteImage("/image/cg/P1000515w")
models.deleteImage("/image/cg/P1000515")
models.deleteImage("/image/cg/P1000515l")
models.deleteImage("/image/cg/P1000515k")
models.deleteImage("/image/cg/P1000515m")


 

jb = models.Job()
jb.total = 1001
jb.kind = "compute_tiling"
jb.owner = "cg"
jb.subject = "/image/cg/the_test"
buildTiling(jb)

jb = models.getJob("/job/cg/4")
jb.status = "started"
jb.so_far = 45
jb.save()

jb.save()



models.addImageToDb("cg","sthellens")

models.loadImageD("/image/cg/sthellens")

dyn.getDict("Album","/album/ccc/bathing_1/8")
ims = models.allImages()


uu = dyn.getUser('/user/cg')
uuu = models.loadUserD('/user/foobmm')

nn = models.UserD(None)
nn.topic = '/user/foob'
nn.name  = "mr foob"
nn.setPassword("abcdef")
nn.email = "a@b.com"
nn.dynsave()



models.deleteSnap("/album/cg/The_Ambassadors/3/1")

models
ss = models.loadSnapD("/album/cg/The_Ambassadors/3/1")

ss = snaps.getSnap("/album/cg/The_Ambassadors/3/1")
dyn.setCount("/album/cg/The_Dutch_Proverbs/count",1)
dyn.setCount("/album/cg/earthly_delights_1/count",4)
dyn.setCount("/album/cg/The_Ambassadors/count",2)
dyn.setCount("/album/cg/astoria_1923_1/count",2)

imd = models.loadImageD('/image/cg/The_Ambassadors')

tab = dyn.countTable()
#sns = snaps.SStore("tsnaps")
#aa = snaps.getSnaps("/album/cg/The_Ambassadors/1")
#iii = snaps.xferSnaps("/album/cg/The_Dutch_Proverbs/1")

iii = snaps.xferSnaps("/album/cg/The_Ambassadors/1")
iii = snaps.xferSnaps("/album/cg/The_Ambassadors/2")



uu = models.UserD('/user/cg')
ss = uu.newSession()
dyn.createCountTable()
#dyn.deleteSessionTable()
#dyn.createSessionTable()
#st = dyn.sessionTable()
sid = '/session/9c60baf173ef3135aa5c2a10f52272f29aeafe0b12bfe19c8e9d6b2f'
sid = '/session/63a6be36afe13bd531777f885a6e88ad14465a1967e92baa7cb3515c'
ssid = '63a6be36afe13bd531777f885a6e88ad14465a1967e92baa7cb3515c'
ss = dyn.getSession(sid)
aa = models.loadSessionD(ssid)
ss = dyn.deactivateSession(sid)

ss = dyn.newSession('/user/cg')

st = dyn.snapTable()
st.update_throughput(40,10)
ss = dyn.snapTopicsInAlbum('/album/cg/The_Dutch_Proverbs/1')
sss = dyn.getTopics('Snap',ss)

sss = dyn.getSnaps(ss)




ff = []
dyn.getTopics1(ff,'Snap',ss,100,119)

"""
dyn.albumTopicsForImage('/image/cg/The_Ambassadors')

dyn.buildImageToAlbums()

dyn.createImageToAlbumsTable()

ss = dyn.snapTopicsInAlbum('/album/cg/The_Ambassadors/1')
rs = dyn.getTopics('Snap',ss)

dyn.addCropids()

dyn.snapsInAlbum('/album/cg/The_Ambassadors/1')
dyn.snapsInAlbum('/album/cg/The_Dutch_Proverbs/1')
dyn.deleteItems(dyn.imageTable())

dyn.deleteTables()
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


 



