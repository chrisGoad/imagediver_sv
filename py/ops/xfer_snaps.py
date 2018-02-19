#!/usr/bin/env python
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py



python
execfile("ops/execthis.py")

alb= "/album/4294b0e/patinir_river_styx/1"

alb = '/album/4294b0e/garden_of_earthly_delights/4'
def xfer_snap_count(alb):
  print "transfering count ",alb
  albd = album.loadAlbumD(alb)
  constants.snapsInDynamo = False
  snaps = albd.snaps()
  mxi = 0
  for s in snaps:
    tp = s["topic"]
    idx = int(misc.pathLast(tp))
    mxi = max(mxi,idx)
  
  print "xfering",alb,mxi
  ky = alb+ "/snapcount"
  dynamo.setCount(ky,mxi+1)
    
  

  
def xfer_album_snap_count(alb):
  print "transfering count ",alb
  constants.snapsInDynamo = False
  snaps = albd.snaps()
  
  
def xfer_album_snaps(alb):
  print "transfering ",alb
  
  albd = album.loadAlbumD(alb)
  constants.snapsInDynamo = False
  snaps = albd.snaps()
  im = albd.image
  imd = image.loadImageD(im)
  wd = imd.dimensions["x"]
  constants.snapsInDynamo = True
  cnt = 0
  for snpd in snaps:
    #snpd = snaps[0]
    snp = snapm.SnapD(snpd["topic"])
    snp.__dict__.update(snpd)
    if cnt%10 == 0: print "transfering ",snp.topic
    cnt = cnt + 1
    snp.album = alb
    snp.dynsave(wd,forXfer=True)

def xfer_albums(albums):
  for a in albums:
    xfer_album_snaps(a)


#xfer_album_snaps("/album/4294b0e/patinir_river_styx/1")
#xfer_album_snaps('/album/4294b0e/young_knight_in_a_landscape/1')
albums = ["/album/4294b0e/the_ambassadors/2","/album/4294b0e/the_ambassadors/1"]

albums = ['/album/4294b0e/bosch_st_anthony/1']
xfer_albums(albums)

xfer_snap_count('/album/4294b0e/virgin_and_child_gerard_david/1')
xfer_snap_count('/album/4294b0e/van_der_Weyden_El_Descendimiento/1')


xfer_snap_count('/album/4294b0e/van_eyck_arnolfini/1')
xfer_snap_count('/album/4294b0e/the_night_watch/1')
xfer_snap_count('/album/4294b0e/one_dollar_bill_5/1')
xfer_snap_count('/album/4294b0e/garden_of_earthly_delights/3')
xfer_snap_count('/album/4294b0e/garden_of_earthly_delights/5')
xfer_snap_count('/album/4294b0e/garden_of_earthly_delights/1')

xfer_snap_count('/album/4294b0e/Saint_Francis_Bellini/1')

xfer_snap_count('/album/4294b0e/totem_1/1')
xfer_snap_count('/album/4294b0e/totem_1/2')

xfer_snap_count('/album/4294b0e/astoria_1923/2')
xfer_snap_count('/album/4294b0e/robert_campin_merode_alterpiece/1')
xfer_snap_count('/album/4294b0e/Thanka_of_Guhyasamaja_Akshobhyavajra/10')
xfer_snap_count('/album/4294b0e/las_meninas/1')

xfer_snap_count('/album/d73b6a9/entry_into_the_ark/1')


def dx(anm,num=1):
  fnm = '/album/d73b6a9/'+anm+'/'+str(num)
  print fnm
  xfer_album_snaps(fnm)
  
dx('moghulartists')
dx('AstoriaVintageHardware')
dx('illuminedpleasure')
dx('Boulders')
dx('allegory_of_the_elements')
dx('moghulartists')


xfer_album_snaps('/album/4294b0e/the_dutch_proverbs/1')



alb= "/album/4294b0e/patinir_river_styx/1"
albd = album.loadAlbumD(alb)
constants.snapsInDynamo = False
snaps = albd.snaps()
im = albd.image
imd = image.loadImageD(im)
wd = imd.dimensions["x"]
snaps = albd.snaps()
snpd = snaps[0]
snp = snapm.SnapD(snpd["topic"])
snp.__dict__.update(snpd)
constants.snapsInDynamo = True
snp.album = alb
snp.dynsave(wd,forXfer=True)



def xferSnaps(alb):
constants.snapsInDynamo = False
snaps = albd.snaps()
  
