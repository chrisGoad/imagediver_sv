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
import model.utilization

import ops.logs
logs = ops.logs
import store.log
logstore = store.log
import time
import ops.imp
imp = ops.imp
from PIL import Image

imd = image.loadImageD("/image/725f81a/big_ambassadors")
tl  = image.Tiling(imd,256,1);
tl.createTiles([],kind="r",parent=None,recursive=False)
rct = Rect(Point(4000,2000), Point(3000,1000))
rct = Rect(Point(4000,2000), Point(30,20))

ii = tl.findIntersectingTiles(rct,5,[])
print [t.id for t in ii]

imdir = imd.imDir()
ofl = imdir+"cfoob.jpg"
afl = imdir+"afoob.jpg"
#tl.assembleTiles(ii,ofl)
tl.cropFromTiles(ofl,rct,targetWidth=500,targetHeight=None,targetArea=None,asmFile=afl)

til = tl.tiles[0]
ifl = til.filename()
pim = image.openImageFile(ifl)



aa = album.loadAlbumD('/album/4294b0e/the_dutch_proverbs/1')
dyn.assertPublished(aa,True)
cnts = image.albumCounts()

albumD = aa
published = getattr(albumD,"published",False)
if published and not force:
  return
albumD.published = 1
saveAlbum(albumD)
im = albumD.image
ii = dyn.getImageToAlbumsItem(albumD)
tab = getTable("ImageToAlbums")
ii["published"] = 1
ii.put()

jt = "/job/725f81a/18"
jb = models.getJob(jt)

ii = imp.imageForJob(jb)

jt = "/job/test22/554"
jb = models.getJob(jt)



uuu = models.loadUserDbyEmail("cagoad@yahoo.com")

tab = dyn.getTable("EmailToUser")

itm = tab.get_item("cagoad@yahoo.com")
itm["user"] = "/user/test22"

im = image.loadImageD("/image/725f81a/big_ambassadors")

#im = image.loadImageD("/image/725f81a/small_ambassadors")
image.verbose = False
tl  = image.Tiling(im,256,1);
rct = Rect(Point(1832.4008817554477, 1040.2200046597736), Point(18899.387308533915,18470.605397520056))
ct = tl.findCoveringTile(rct)






"""
geom = exports.GEOM2D;

rct = geom.internalizeRect({corner:{x:100,y:100},extent:{x:5000,y:5000}});
page.vp.setStrokeWidth(5);
page.vp.drawImRect(rct,"red",2,false,666);

stm = time.time()
tl.createTiles([],kind="r",parent=None,recursive=False)

#tl.createTiles([])
etm = time.time()
print "CREATING TILES TOOK ",etm-stm


rct =Rect(Point(9979.4643535,12822.2391733),Point(574.594176396,784.706972242))
rct =  Rect(Point(10171.5112352,13157.2974933),Point(126.137469434,95.2740460616))

#rct = Rect(Point(8946.15146832,11716.1074189),Point(2446.21329212,3040.29366306))
tl.findCoveringTile(rct)

stm = time.time()
tl.createImageFiles()
etm = time.time()
print "TOOK ",etm

rct = image.Rect(image.Point(10,10),image.Point(100,100))
tl.findCoveringTile(rct)

im.cropFromTile(tl, rct, "tiling/foob",targetWidth=100)

"""
    
 
tl  = image.Tiling(im,256,1);
stm = time.time()
tl.createTiles([])
tl.createImageFiles()

etm = time.time() - stm
print "TOOK ",etm
   

image.verbose = False
image.openedImageFiles ={}
im.stepDownImageOnce(1)
im.stepFile(1)
rct = image.Rect(image.Point(100,100),image.Point(500,500))
im.cropImage(rct,"foob",targetArea=200000)

im = image.loadImageD("/image/725f81a/big_ambassadors")


  def cropImage(im,rct,outfile,targetWidth=None,targetHeight=None,targetArea=None):

imp.runNextImport()

imp.impjob(10,10)



#dyn.unDeleteItem("Image","/image/725f81a/large_ambassadors")

im = image.loadImageD("/image/725f81a/sistine0")
#im.stepDownImage()




j0 = models.Job()
j0.kind = "build_tiling"
j0.owner = "725f81a"
j0.subject = "t13"
j0.subject = "big_test"
j0.subject = "big_ambassadors"
ajob.testMode = True


#ajob.resizeImage(j0)
ajob.buildTiling(j0)



j0 = models.Job()
j0.kind = "to_s3"
j0.owner = "725f81a"
j0.subject = "t13"
j0.subject = "big_test"
j0.subject = "big_ambassadors"
ajob.testMode = True

ajob.toS3(j0)


atp = "/album/test22/binary4/4"

aa = album.loadAlbumD(atp)

jt = "/job/test22/554"
jb = models.getJob(jt)

uu = models.UserD("/user/test22")
uu.utilization()

imtp = "/image/test22/sistine15"
ii = image.loadImageD(imtp)


atp = "/album/test22/sistine15/3"
aa = album.loadAlbumD(atp)

aa.deleteFiles()


itm = dyn.getItem("Album",atp)
zz =  itm["current_item_create_time"]


dyn.pseudoDeleteItem("Album",atp)


tab = dyn.getTable("Album")
ii = tab.get_item(hash_key=atp,range_key=zz)
im =  image.loadImageD("/image/test22/sistine77")


"""

sz = im.size()
rct = image.Rect(image.Point(0,0),im.size())
ofl = "/mnt/ebs1/imagediver/images/test22/sistine25/tiling/r.jpg"
ofl= "tiling/r.jpg"
im.cropImage(rct,ofl,targetWidth=sz.x)


ifl = "/mnt/ebs1/imagediver/images/test22/sistine25/stepdown/s_0.jpg"
pim = image.openImageFile(ifl)
ofl = "/mnt/ebs1/imagediver/images/test22/sistine25/tiling/r.jpg"
pim.save(ofl,"JPEG",quality=95)


//,targetHeight=None,targetArea=None,exactSize=False):

/mnt/ebs1/imagediver/images/test22/sistine25/stepdown/s_0.jpg
def cropImage(ifl,ofl,imsize,croprect,finalsize=None):

im.cropImage(ifln,ofln,srcSz,cropRect,finalsize)

im.cropImage(im,rct,ofl,targetWidth=None,targetHeight=None,targetArea=None,exactSize=False):
"""
"""
ims = image.getImages(["/image/test22/t14","/image/cg/The_Ambassadors"])


im = image.loadImageD("/image/cg/The_Ambassadors")

im = image.loadImageD("/image/test22/t14")

im = image.loadImageD("/image/test22/sistine10")

im.allFiles(False)

im.removeAllFiles()


#im = image.loadImageD("/image/test22/test700")


#image.addImageToDb("test22","t13")
#image.addImageToDb("test22","t14")

crect = image.dictToRect({"corner":{"x":400,"y":400},"extent":{"x":150,"y":150}})
#crect = image.dictToRect({"corner":{"x":100,"y":100},"extent":{"x":600,"y":600}})

im.cropImage(crect,None,None,300,"snap/t3")
imdir = im.imDir()
image.resizeImage(imdir+"snap/t3.jpg",imdir+"snapthumb/t3.jpg",Point(100,100))
"""


j0 = models.Job()
j0.owner = "test22"
j0.subject = "t13"
j0.subject = "big_test"
j0.subject = "sistine25"
ajob.testMode = True

#ajob.resizeImage(j0)
ajob.buildTiling(j0)


ajob.toS3(j0)


from PIL import Image 


#image.addImageToDb("test22","t13")

"""
try:
  im = Image.open("/mnt/ebs0/imagediver/test2.html")
except IOError as err:
  im = "COULDNOTOPEN"
  
  
im = Image.open("/mnt/ebs1/imagediver/image/cg/astoria_1923_1")
im = Image.open("/mnt/ebs1/imagediver/image/cg/astoria_1923_1.jpg")
try:
  im = Image.open("/mnt/ebs1/imagediver/image/cg/erg.err")
except Exception:
  im = "COULDNOTOPEN"
"""

im.createDirs()

im.stepDownImage()
im.reduceImageHeight(77)
im.reduceImageWidth(177)
im.reduceImageArea(10000)

#image.createDirs(im)



#im = models.loadImageD("/image/cg/The_Dutch_Proverbs")

tl  = image.Tiling(im,256,1);
tl.createTiles([])
#tl.createImageFiles()

#tl.tiles[0].createImageFile()
tl.createImageFiles()


for i in range(0,40): print tl.tiles[i]


image.cropImage(im,Rect(Point(200,200),Point(200,200)),100,None,"croptest/t00")


models.cropImage(im,Rect(Point(200,200),Point(200,200)),200,None,"croptest/t0")
models.cropImage(im,Rect(Point(400,200),Point(200,200)),200,None,"croptest/t1")
models.cropImage(im,Rect(Point(400,200),Point(200,200)),100,None,"croptest/t01")

models.reduceImageHeight("/image/cg/The_Dutch_Proverbs",140)


image.stepDownImage(im)

pim = models.PILtest("/image/cg/The_Dutch_Proverbs")


                     
                     
im = models.loadImageD("/image/cg/The_Dutch_Proverbs")
models.stepDownImageOnce(im,0)
models.stepDownImageOnce(im,1)
models.stepDownImageOnce(im,2)

models.reduceImageHeight("/image/cg/The_Dutch_Proverbs",77)
models.reduceImageHeight("/image/cg/The_Dutch_Proverbs",77)


im = models.loadImageD("/image/cg/test12")


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


 



