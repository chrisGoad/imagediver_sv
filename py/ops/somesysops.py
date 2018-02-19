
"""

python

import urllib2
import json
aurl = "http://mapbureau.com/shipwrecks17_orig.json"
albs = urllib2.urlopen(aurl).read()
import json
ao = json.loads(albs)
sws = ao["rdf:RDF"]["rss:item"]
#ss = ao["shipwrecks"][23]

s0 = sws[0]

def fixsw(ss):
  ds = ss.get("rss:description",None)
  if ds:
    del ss["rss:description"]
    ss["description"] = ds
  dt = ss.get("dc:date",None)
  if dt:
    del ss["dc:date"]
    ss["year"] = dt
  if ss.get("-rdf:about",None):
      del ss["-rdf:about"]
  cv = ss.get("dc:coverage",None)
  if cv:
    cvv = cv["geom2d:Point"]
    x = cvv["geom2d:x"]
    y = cvv["geom2d:y"]
    ss["position"] = {"x":int(x),"y":int(y)}
    del ss["dc:coverage"]
  kys = ss.keys()
  for k in kys:
    if k.find("shipwreck:")==0:
      nk = k[10:]
      #print k,nk
      ss[nk] = ss[k]
      del ss[k]

#fixsw(s0)

      
for ss in sws:
  fixsw(ss)
  

rs = {}

rs["notes"] = "Coordinates are UTM-10"
rs["shipwrecks"] = sws
dstfl = "/mnt/ebs0/www/mapbureau.com/shipwrecks.json"
js = json.dumps(rs)
fl = open(dstfl,"write")
fl.write(js)
fl.close()




PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
execfile("ops/execthis.py")





tab = dynamo.getTable("ImageToAlbums")
ss = tab.scan()

ita = [s for s in ss]

obi = {}
for i in ita:
  im = i["image"]
  o = i.get("owner",None)
  if o:
    cv = obi.get(im,None)
    if cv == None:
      obi[im] = set([o])
    else:
      cv.add(o)

for im,owns in obi.iteritems():
  print im
  for o in owns:
    print "    ",o
    imd = image.ImageD(im)
    imd.publishAlbumList(o)
    



anm = '/album/e244d69/Cranach_The_Stag_Hunt/2'
anm = '/album/4294b0e/the_ambassadors/1'

alb = album.loadAlbumD(anm)
alb.publishPage()

oo = [1,2,12,13,14,19,20,15,16,17,18,3,4,5,6,7,8,9,10,11]
oo = [1,2,12,13,14,19,20,15,16,17,18,3,4,5,6,7,8,9,10,11]
oo = [1,12,13,14,2,19,20,15,16,17,18,3,4,5,6,7,8,9,10,11]
ooo = alb.listToOrdinals(oo)

alb.setSnapOrdinals(ooo)
alb.resetSnapOrdinals()

snm = '/snap/e244d69/van_eyck_annunciation/1/4'
ss = snapm.loadSnapD(snm)
dynamo.putAttribute('Snap',snm,'testattr',27)


sns = dynamo.snapTopicsForAlbum(anm)
snapm.loadSnapD('/snap/e244d69/goya_tres_de_mayo/7/1').genPage()

snapm.loadSnapD('/snap/e244d69/millias_the_martyr_of_solway/1/1').genPage()
snapm.loadSnapD('/snap/d73b6a9/StJermome/1/1').genPage()
snapm.loadSnapD('/snap/d73b6a9/StJermome/1/2').genPage()
snapm.loadSnapD('/snap/4294b0e/Georg_Gisze/4/2').genPage()
snapm.loadSnapD('/snap/e244d69/altdorfer_resurrection/1/2').genPage()
snapm.loadSnapD('/snap/e244d69/brugel_tower_of_babel/1/19').genPage()
snapm.loadSnapD('/snap/e244d69/brugel_tower_of_babel/1/10').genPage()
snapm.loadSnapD('/snap/e244d69/goya_tres_de_mayo/7/1').genPage()
snapm.loadSnapD('/snap/4294b0e/carvaggio_judith_beheading_holofernes/3/3').genPage()
snapm.loadSnapD('/snap/e244d69/boticelli_birth_of_venus/1/2').genPage()
snapm.loadSnapD('/snap/4294b0e/durer_melancholy2/2/1').genPage()
snapm.loadSnapD('/snap/e244d69/cranach_melancholy/2/2').genPage()
snapm.loadSnapD('/snap/e244d69/Cranach_The_Close_of_the_Silver_Age/3/2').genPage()
snapm.loadSnapD('/snap/e244d69/cranach_melancholy/1/1').genPage()
snapm.loadSnapD('/snap/e244d69/Delacroix_Liberty_Leading_the_People/1/1').genPage()
snapm.loadSnapD('/snap/4294b0e/van_eyck_arnolfini/3/2').genPage()



snapm.loadSnapD('/snap/e244d69/Cranach_The_Stag_Hunt/1/1').genPage()
snapm.loadSnapD('/snap/e244d69/cranach_the_golden_age/1/1').genPage()
snapm.loadSnapD('/snap/4294b0e/mabuse_adoration_of_kings/4/1').genPage()
snapm.loadSnapD('/snap/e244d69/Cranach_The_Close_of_the_Silver_Age/1/3').genPage()
snapm.loadSnapD('/snap/e244d69/John_Everett_Millais_Ophelia/4/7').genPage()
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')
snapm.loadSnapD('').genPage('')

sn.genPage()


ss = '/snap/e244d69/brugel_tower_of_babel/1/10'
sn = snapm.loadSnapD(ss)
im = sn.drawRect()
im.genSnapInContextV(10,sn.cropid,0.7)


python
execfile("ops/execthis.py")

python
execfile("ops/execthis.py")

ss = '/snap/e244d69/brugel_tower_of_babel/1/19'
sn = snapm.loadSnapD(ss)
im = sn.drawRect()
im.genSnapInContextV(misc.pathLast(ss),sn.cropid,0.7)




ss = '/snap/e244d69/John_Everett_Millais_Ophelia/4/7'

sn = snapm.loadSnapD(ss)
im = sn.drawRect()
im.genSnapInContext(7,sn.cropid)


uu = models.allUsers()

usr = "/user/106ecde"

uu = models.loadUserD(usr)

dynamo.deleteItems("Post")

ii = '/image/e244d69/test_delete3'
id = image.loadImageD(ii)
id.deleteable()
id.delete()


aa = '/album/e244d69/John_Everett_Millais_Ophelia/3'
ad = album.loadAlbumD(aa)
ad.imageFiles()
ad.delete()


ii = image.allImages(publicOnly=True)
for i in ii: print i.topic

ss = '/snap/e244d69/John_Everett_Millais_Ophelia/1/1'
snn = dynamo.getSnap(ss)
snn = dynamo.getDict("Snap",ss)

snn = snapm.loadSnapD(ss)

alb = "/album/4294b0e/the_ambassadors/1"
albd = album.loadAlbumD(alb)
albd.publishPage()

ii = image.allImages(publicOnly=True)

for i in ii:
  i.publish()
 

aa = album.allAlbumTopics()

for a in aa:
  albd = album.loadAlbumD(a)
  print "Publishing ",a
  albd.publishPage()
  
  #albd.toS3(includeSnaps=True)


mnt = album.maintainencePage()

alb = '/album/d73b6a9/moghulartists/1'

alb = '/album/4294b0e/young_knight_in_a_landscape/2'
albd = album.loadAlbumD(alb)
albd.s3backup()

aa = album.allAlbumTopics()

  
for a in aa:
  albd = album.loadAlbumD(a)
  print "taking down ",albd
  albd.publishHtml(mnt)


for a in aa:
  albd = album.loadAlbumD(a)
  print "backing up ",a
  albd.s3backup()
  
  


albd.toS3(includeSnaps=True)
ii = '/image/4294b0e/the_ambassadors'
i = image.loadImageD(ii)
i.publish()


albd.publishPage()

albd.publishHtml(mnt)


def toS3(im):
  aaa = album.albumTopicsForImage(im)
  for a in aaa:
    albd = album.loadAlbumD(a)
    albd.toS3(includeSnaps=True)



ii  = image.allImages(publicOnly=True)

for  i in ii:
  #i.publish()
  print "IMAGE ",i.topic
  toS3(i.topic)





def setFeatured(alb):
  print "setting featured ",alb
  albd = album.loadAlbumD(alb)
  albd.featured = 1
  albd.dynsave()


setFeatured('/album/4294b0e/astoria_1923/1')
setFeatured('/album/4294b0e/the_dutch_proverbs/1')

setFeatured('/album/4294b0e/Saint_Francis_Bellini/1')
setFeatured('/album/4294b0e/garden_of_earthly_delights/5')
setFeatured('/album/4294b0e/garden_of_earthly_delights/4')
setFeatured('/album/4294b0e/virgin_and_child_gerard_david/1')

setFeatured('/album/4294b0e/astoria_1923/1')
setFeatured('/album/4294b0e/astoria_1923/2')
setFeatured('/album/4294b0e/one_dollar_bill_5/1')
setFeatured('/album/d73b6a9/moghulartists/1')
setFeatured('/album/d73b6a9/Boulders/1')


WOW, this is absolutely amazing!!! I just spent five minutes on it and I?m hungry for more! Fantastic job, Chris. I?m going to use it and recommend it to the Tumblr community! Just one question? Is there any way for the snapshots to be on larger versions? The details end up with an amazingly good definition, but they could be a little bigger, to fit the whole photo post space on Tumblr? thank you so much for bringing this to my attention! Paulo
aa = album.loadAlbumD('/album/4294b0e/the_dutch_proverbs/1')
aa.toS3(includeSnaps=True)


import urllib2
im = '/image/4294b0e/the_ambassadors'
im = '/image/4294b0e/vermeer_kitchen_maid'
aa =album.albumTopicsForImage(im)

"""
alb = '/album/4294b0e/young_knight_in_a_landscape/1'
albd = album.loadAlbumD(alb)
albd.toS3(includeSnaps=True)

im = '/image/4294b0e/young_knight_in_a_landscape'


toS3(im)

toS3('/image/4294b0e/virgin_and_child_gerard_david')


"""

im = '/image/4294b0e/young_knight_in_a_landscape'
imd = image.loadImageD(im)
imd.publish()




ii  = image.allImages(publicOnly=True)
for  i in ii:
  i.publish()
  
  

im = '/image/4294b0e/Saint_Francis_Bellini'
def fixI2Aowners(im):
  print "FIXING the image ",im
  tpo = misc.topicOb(im)
  imo = tpo.imageOwner
  aaa = album.albumTopicsForImage(im)
  for a  in aaa:
    ato = misc.topicOb(a)
    aio = ato.imageOwner
    if (aio != imo):
      print "bad album",a
    alb = album.loadAlbumD(a)
    print "fixing ",a
    dynamo.setI2Aowner(alb)


ii  = image.allImages(publicOnly=True)
for  i in ii: fixI2Aowners(i.topic)

im  = '/image/4294b0e/garden_of_earthly_delights'
aa = album.loadAlbumD('/album/4294b0e/garden_of_earthly_delights/2')
fixI2Aowners(im)




def setFeatured(alb):
  print "setting featured ",im
  albd = album.loadAlbumD(alb)
  imd.featured = 0
  alb.dynsave()

setFeatured('/album/4294b0e/Saint_Francis_Bellini/1')

ii = 
fixI2Aowners(im)

ii = image.loadImageD('/image/4294b0e/testd_3');

def clearPublic(im):
  print "clearing public ",im
  imd = image.loadImageD(im)
  imd.isPublic = 0
  imd.dynsave(False)

clearPublic('/image/4294b0e/testd_3')

testims = [
'/image/4294b0e/testd_3',
'/image/eed69c5/testupload2',
'/image/4294b0e/one_dollar_bill_reverse',
'/image/8425a4e/test77',
'/image/5ee275d/sistine1',
'/image/4294b0e/one_dollar_bill_obverse',
'/image/8425a4e/skulls',
'/image/4294b0e/test_topicd',
'/image/e244d69/test001',
'/image/8425a4e/sunset',
'/image/8425a4e/test888',
'/image/5513110/testtest',
'/image/5513110/test00']

for i in testims: clearPublic(i)




'/image/4294b0e/testd_3',
'/image/eed69c5/testupload2',
'/image/4294b0e/young_knight_in_a_landscape',
'/image/4294b0e/patinir_river_styx',
'/image/4294b0e/one_dollar_bill_reverse',
'/image/4294b0e/the_ambassadors',
'/image/8425a4e/test77',
'/image/5ee275d/sistine1',
'/image/4294b0e/bosch_st_anthony',
'/image/d73b6a9/entry_into_the_ark',
'/image/4294b0e/vermeer_kitchen_maid',
'/image/4294b0e/one_dollar_bill_obverse',
'/image/8425a4e/skulls',
'/image/4294b0e/mabuse_adoration_of_kings',
'/image/4294b0e/Georg_Gisze',
'/image/4294b0e/rosetti_beata_beatrix',
'/image/d73b6a9/moghulartists',
'/image/4294b0e/gustave_dore_inferno_1',
'/image/4294b0e/test_topicd',
'/image/e244d69/test001',
'/image/8425a4e/sunset',
'/image/4294b0e/virgin_and_child_gerard_david',
'/image/4294b0e/van_der_Weyden_El_Descendimiento',
'/image/4294b0e/baldung_ages_of_man',
'/image/4294b0e/van_eyck_arnolfini',
'/image/4294b0e/dore_inferno_dante_inferno_plate_65',
'/image/d73b6a9/AstoriaVintageHardware',
'/image/4294b0e/one_dollar_bill_5',
'/image/8425a4e/test888',
'/image/e244d69/goya_tres_de_mayo',
'/image/4294b0e/garden_of_earthly_delights',
'/image/4294b0e/Saint_Francis_Bellini',
'/image/4294b0e/caravaggio_cupid_as_victor',
'/image/4294b0e/astoria_1923',
'/image/d73b6a9/illuminedpleasure',
'/image/d73b6a9/Boulders',
'/image/5513110/testtest',
'/image/4294b0e/Thanka_of_Guhyasamaja_Akshobhyavajra',
'/image/5513110/test00',
'/image/4294b0e/the_dutch_proverbs',
'/image/4294b0e/las_meninas',
'/image/d73b6a9/allegory_of_the_elements',
'/image/4294b0e/carvaggio_judith_beheading_holofernes',





im = '/image/e244d69/goya_tres_de_mayo'
im = '/image/4294b0e/virgin_and_child_gerard_david'

ii  = image.allImages(publicOnly=True)
for  i in ii: print i.topic

imD = image.loadImageD(im)

aa =album.albumTopicsForImage(im,'/user/4294b0e')

alb = '/album/e244d69/goya_tres_de_mayo/3'
albd = album.loadAlbumD(alb)


alb = '/album/4294b0e/test_topicd/2'
albd = album.loadAlbumD(alb)
albd.publishPage()

albd.publishHtml(mnt)


albd.externalize()
albd.externalize_snaps()


albd.toS3(includeSnaps=True,includeImages=True)

alb = '/album/8425a4e/test77/1'
albd = album.loadAlbumD(alb)
albd.externalize()

albd.initialPublish()
albd.compute_json()


alb = '/album/4294b0e/testd_3/2'
albd = album.loadAlbumD(alb)
albd.compute_snaps_json()

sn = "/snap/4294b0e/testd_3/2/2"
snd = snapm.loadSnapD(sn)
aa =snd.publishInAlbum()



#timing tests 

aurl = "http://s3.imagediver.org/topic/album/4294b0e/the_dutch_proverbs/1/main.json"
burl = "/topicd/album/4294b0e/the_dutch_proverbs/1/main.json"
mm = urllib2.urlopen(aurl).read()

def hoob():
  tm = time.time()
  dd = json.loads(mm)
  print time.time()-tm
 
def foob():
  tm = time.time()
  s3.s3SetContents(burl,contents=mm,relativeTo="",contentType="application/json")
  print time.time()-tm



sn = "/snap/4294b0e/mabuse_adoration_of_kings/2/1"
sn = "/snap/4294b0e/young_knight_in_a_landscape/4/3"
sn = "/snap/4294b0e/testd_3/1/1"
ss = snapm.loadSnapD(sn)



im = "/image/4294b0e/young_knight_in_a_landscape"
im = "/image/4294b0e/one_dollar_bill_reverse"

imd = image.loadImageD(im)
imd.publish()


albt = "/album/4294b0e/one_dollar_bill_reverse/15"
alb = album.loadAlbumD(albt)

alb.publish()

http://s3.imagediver.org/topicd/album/4294b0e/one_dollar_bill_reverse/15/index.html


im = "/image/4294b0e/young_knight_in_a_landscape"

imd = image.loadImageD(im)
imd.publish()


sn = "/snap/4294b0e/mabuse_adoration_of_kings/2/1"
sn = "/snap/4294b0e/young_knight_in_a_landscape/4/3"

ss = snapm.loadSnapD(sn)
ss.publish()

ss.genPage()
"""
http://s3.imagediver.org/topicd/snap/4294b0e/young_knight_in_a_landscape/4/3/index.html
"""
ss.compute_json()
#snapm.genSnapPage()

ss.publish()


def setFeatured(alb):
  a = album.loadAlbumD(alb)
  a.featured = 1
  a.dynsave()

setFeatured('/album/4294b0e/the_ambassadors/1')

setFeatured('/album/4294b0e/garden_of_earthly_delights/3')

setFeatured('/album/d73b6a9/AstoriaVintageHardware/1')


import time
def foom():
 tm = time.time()
 aaa = album.allImagesForAlbums(featuredOnly=True,asDicts=True)
 etm = time.time()-tm
 print etm
 return aaa


v = foom()



setFeatured('/album/4294b0e/van_der_Weyden_El_Descendimiento/1')



tab = "Album"
cc= dynamo.countItems(tab)


alb = "/album/4294b0e/mabuse_adoration_of_kings/2"
dynamo.countSnapsInAlbum(alb)

sn = "/snap/4294b0e/mabuse_adoration_of_kings/2/1"
ss = snapm.loadSnapD(sn)

ss.compute_json()
#snapm.genSnapPage()

ss.publish()



im = "/image/d73b6a9/illuminedpleasure"
dynamo.getSnapsAlbumTopic(im,"/user/4294b0e")

im = "/image/4294b0e/one_dollar_bill_5"
imd = image.loadImageD(im)

ims = image.allImages("/user/4294b0e")
ims = image.allImages()



counts = dynamo.allItems("Count")
for c in counts:
  tp = c["topic"]
  if tp.find("snapcount")>0:
    print c



email = "cagoad@yahoo.com"
models.loadUserDbyEmail("cagoad@yahoo.com")

dynamo.emailToUser(email)



def idvU():
  uu = dynamo.allUsers()
  for u in uu:
    if u.get("tumblr_name") == "imagediver":
       return u

idv = idvU()
tp = idv["topic"]
print tp

dynamo.deleteUser(tp)
       


def timd(nm):
  imd = image.loadImageD('/image/eed69c5/'+nm)
  if imd:
    print nm
    imd.delete(force=True)

imms = image.allImages('/user/eed69c5')
nms = [im.name for im in imms]
for nm in nms: timd(nm)


aa = album.allAlbums('eed69c5')

def artify(inm):
  topic = '/image/4294b0e/'+inm
  im = image.loadImageD(topic)
  im.tags = ["art","painting"]
  im.dynsave(False)


artify('Georg_Gisze')

artify('Saint_Francis_Bellini')
artify('las_meninas')



topic = '/image/4294b0e/the_dutch_proverbs'
im = image.loadImageD(topic);
im.tags = ['art','painting']
im.dynsave(False)



topic = '/image/4294b0e/the_ambassadors'
im = image.loadImageD(topic);
im.tags = ['art','painting']
im.dynsave(False)

im2 = image.loadImageD('/image/4294b0e/one_dollar_bill_4')
#im2.finishImport()

 

im0 = image.loadImageD('/image/4294b0e/one_dollar_bill_obverse')
im1 = image.loadImageD('/image/4294b0e/one_dollar_bill_reverse')

#ifl = im0.stepFile(0)
#pim = image.openImageFile(ifl)

image.assembleImages('one_dollar_bill_5','4294b0e',[im0,im1])



aa=album.loadAlbumD('/album/4294b0e/garden_of_earthly_delights/2')


python
execfile("ops/execthis.py")
/user/eed69c5"
im = "/image/4294b0e/Thanka_of_Guhyasamaja_Akshobhyavajra"
album.hasAlbums(im,"/user/eed69c5")

alb = album.loadAlbumD('/album/5ee275d/sistine1/1'
usr = models.loadUserD("/user/5ee275d")
ims = image.allImages("/user/5ee275d")
im = ims[0]
im.deleteAble()

im = image.loadImageD('/image/4294b0e/garden_of_earthly_delights')
im.deleteAble()


for im in ims:
  print "deleting "+im.topic
  im.delete()



  
imd = image.loadImageD("/image/5ee275d/sistine7")


imd.delete()

imd = image.loadImageD("/image/5ee275d/big_ambassadors")

imd.delete()


imd.tileFiles()

imd.resizeFiles()

imd.deleteFromS3()

imd.deleteStepdowns(1)




tl = image.Tiling(imd,depth=imd.tilingDepth)
tl.createTiles()

tl.createTiles([]) #,kind="r",parent=None,recursive=False)
tl.createImageFiles()
"""

""""
ordinals

python
execfile("ops/execthis.py")


alb = album.loadAlbumD('/e244d69/van_eyck_annunciation/1')


alb = album.loadAlbumD('/album/4294b0e/one_dollar_bill_5/1')

alb.resetSnapOrdinals()
alb.setSnapOrdinals(
((7,3),(6,4),(10,5),(6,6),(5,7),(4,10),
(17,12),(14,13),(13,15),(12,16),(21,17),(15,18),(20,19),(16,20),(19,21)))



alb = album.loadAlbumD('/album/4294b0e/virgin_and_child_gerard_david/1')

alb.resetSnapOrdinals()
alb.setSnapOrdinals(((12,3),(3,4),(4,5),(5,6),(6,7),(7,8),(8,9),(9,10),(11,12)))


