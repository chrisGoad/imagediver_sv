#!/usr/bin/env python
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py



python
execfile("ops/execthis.py")

alb= "/album/4294b0e/patinir_river_styx/1"
albd = album.loadAlbumD(alb)
snaps = albd.snaps()
snpd = snaps[0]
snp = snapm.SnapD(snpd["topic"])
snp.__dict__.update(snpd)
constants.snapsInDynamo = True

def xferSnaps(alb):
constants.snapsInDynamo = False
snaps = albd.snaps()
  
