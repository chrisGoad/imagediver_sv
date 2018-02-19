#!/usr/bin/env python
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python ops/gen_static_pages.py



python
"""


execfile("ops/execthis.py")



verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args)
   
   
styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = []
jsFiles = ""

constants.compressJs = True
def genBandwidthExceededPage():
  headerTitle = "Bandwidth Limit Exceeded"
  bodyText = """
<center><b>Bandwidth Limit Exceeded</b></center>
<p>
The bandwidth allocation for this page has been temporarily exceeded. Please check back soon!

</p>
</div>
"""
  rs = gen.genHtmlPage(None,jsFiles,headerTitle,headLines,bodyText,pageTitle="")
  fln = constants.pageRoot+"bandwidth_exceeded.html"
  print "WRITING PAGE",fln
  fl = open(fln,'w')
  fl.write(rs)
  fl.close()

genBandwidthExceededPage()




def genMaintainancePage():
  headerTitle = "Maintainance"
  bodyText = """
<center><b>Maintainance</b></center>
<p>
<center>ImageDiver is down for maintainance. Please check back soon!</center>
</p>
"""
  rs = gen.genHtmlPage(None,jsFiles,headerTitle,headLines,bodyText)
  rs = gen.genSuperStatic(bodyText)
  fln = constants.pageRoot+"maintainance.html"
  print "WRITING PAGE",fln
  fl = open(fln,'w')
  fl.write(rs)
  fl.close()

genMaintainancePage()


homeAlbum = constants.homeAlbum
albumD = album.loadAlbumD(homeAlbum)
otxt = albumD.genPage("",False)
  
def genAlbumHomePage():
  OBSOLETE()
  albumD = album.loadAlbumD(homeAlbume)
  otxt = a.genPage("",False)
  
  
  albowner = albumD.owner
  vprint("OWNER ",albowner,user)
  ownerD = models.loadUserD(albowner,pageStore)
  ownerName = getattr(ownerD,"name",None)
  apub = getattr(albumD,"published",None)
  
  imageTopic = albumD.image
  im = image.loadImageD(imageTopic,pageStore)
  imDict = models.toDict(im,["dimensions","title","name","author","year","externalLink","description","owner","topic","tilingDepthBump","zoomDepthBump"])
  author = getattr(im,"author",None)
  if author==None:
    author = ""
  else:
    author = ", "+author
  ttl = getattr(im,"title","")
  options = {"imageD":imDict,"albumOwner":albumD.owner,"albumOwnerName":ownerName,"loggedInUser":user,"forHomePage":1,
             "albumTopic":albumD.topic,"published":published,"beenPublished":1,"path":'/',"compressJs":True}
  vprint("OPTIONS", options)
  import pages.album
  otxt = pages.album.genAlbumPage(options)
  #print otxt
  fln = constants.pageRoot+"home.html"
  print "WRITING PAGE",fln
  fl = open(fln,'w')
  fl.write(otxt)
  fl.close()
  js = albumD.compute_json(True)
  fln = constants.pageRoot+"home.json"
  print "WRITING PAGE",fln

  fl = open(fln,'w')
  fl.write(js)
  fl.close()  
  return otxt



genAlbumHomePage()
  