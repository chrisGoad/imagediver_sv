#!/usr/bin/env python
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python
execfile("ops/execthis.py")
import json
import urllib2
aurl = "http://s3.imagediver.org/topic/album/4294b0e/the_dutch_proverbs/1/main.json"
albs = urllib2.urlopen(aurl).read()
als = json.loads(albs)

ss = als["value"]["snaps"]
dpn = '/album/4294b0e/the_dutch_proverbs/1'
dp = album.loadAlbumD(dpn)

def addAsnap(s):
  print "ADDING ",s["topic"]
  sn = snapm.dictToSnapD(s)
  sn.album = dpn
  dp.addSnap(sn,publishInAlbum=False,scaleCoverage=False)
  dynamo.addSnapToAlbumsToSnaps(sn)

#addAsnap(ss[1])
ln = len(ss)
for i in range(4,ln):
  addAsnap(ss[i])

dp.toS3(includeSnaps=True)



aurl = "http://s3.imagediver.org/topicd/album/4294b0e/the_dutch_proverbs/1/main.json"
albs = urllib2.urlopen(aurl).read()
ss = als["value"]["snaps"]


alb= "/album/4294b0e/the_dutch_proverbs/1"
constants.snapsInDynamo = False

albd = album.loadAlbumD(alb)
snaps = albd.snaps()
snpd = snaps[0]
snp = snapm.SnapD(snpd["topic"])
snp.__dict__.update(snpd)
constants.snapsInDynamo = True

def xferSnaps(alb):
constants.snapsInDynamo = False
snaps = albd.snaps()
  
