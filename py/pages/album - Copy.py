
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""


import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonJsFiles,commonCjsInclude,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import pages.gen
gen = pages.gen
import model.models
models = model.models
import json
import Logr

import model.image
image = model.image
import misc
import store.snaps
snaps = store.snaps

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"ALBUM PAGE")
   
import urlparse


from WebClasses import WebResponse,okResponse,failResponse,htmlResponse


def genAlbumPage(options,forS3Dev=False):
  vprint("OPTIONSSS",options)
  vprint("CONSTANTS.COMPRESS",constants.compressJs)
  if forS3Dev:
    options["forS3Dev"]=1
  forHomePage = options.get("forHomePage",False)
  user = options["loggedInUser"] # the visitor's imageidver user name
  albumOwner = options["albumOwner"]
  imD = options["imageD"]
  imAuthor = imD.get("author","")
  imTitle = imD.get("title","")
  published = options["published"]
  albumTopic = options.get("albumTopic",None)
  imageTopic = options.get("imageTopic",None)
  compressJs = options.get("compressJs",False)
  del options["imageD"]
  optionsJson = json.dumps(options)
  if albumTopic:
    sp = albumTopic.split("/")
  else:
    sp = imageTopic.split("/")
  imowner = sp[2]
  imname = sp[3]
  #if albumTopic:
  #  albumname = sp[4]
  
  path = options["path"]
  pagetext = "" # LATER fix this; pagetext is for custom pages
  
 
 
  #imageTopic = "/image/"+imowner+"/"+imname
  #albumTopic = "/album/"+imowner+"/"+imname+"/"+albumname;
  #albumD = album.loadAlbumD(albumTopic)
  #imageTopic = albumD.image
  #http://static.imagediver.org/images/4294b03/astoria_1923/resized/width_300.jpg
  
  if forHomePage:
    imt = "the depths of high-resolution images, annotated"
  else:
  #albumD = album.loadAlbumD(albumTopic)
    if imTitle:
      ttl = imTitle.encode('utf-8')
    else:
      ttl = imname
    #print "TTL",ttl,imAuthor
    imt = ttl+", "+imAuthor.encode('ascii',errors='ignore') if imAuthor else ttl  # WORKAROUND - what's wrong here?
  #print "IMT ",imt
  
  fttl = "ImageDiver" if (path=="/") else "ImageDiver: "+imt
  fdes = "the depths of high-resolution images, annotated" if (path=="/") else imt+", Zoomable and Annotated"
  """fbim = "http://imagediver.s3-website-us-east-1.amazonaws.com/resized300/"+imowner+"/"+imname+".jpg"""
  #fbim = "http://static.imagediver.org/resized300/"+imowner+"/"+imname+".jpg"""
  fbim = "http://static.imagediver.org/images/"+imowner+"/"+imname+"/resized/width_300.jpg"""
  pg0= gen.pageHeader(path,fttl,fdes,facebook=True,facebookImage=fbim) + "<body>" 
  if compressJs or constants.compressJs:
    pg0 += jsPreamble + cjsForPage("common") +  cjsForPage("album")
  else:
    if pagetext:
      pg0 +=  constants.commonJsIncludes + constants.albumPageJsIncludes # option not maintained
    else:
      pg0 +=  constants.jsPreamble + toJsIncludes(commonJsFiles,forS3Dev) + toJsIncludes(jsFiles['album'],forS3Dev)

  pg1 = """
<script>
page.initialize({0});
</script>
{1}
<div class="outerDiv">
  <div class="topDiv">
      <div class="topDivTop"></div>
     <div class="titleDiv"> {2} </div>
  </div>
</div>
{3}
</body>
</html>
""".format(optionsJson,pagetext,imt,constants.noScript)
  return pg0 + pg1

def emitAlbumPage(webin,parsedPath,parsedQuery,forHomePage):
  pageStore = {}
  import model.album
  album = model.album
  vprint("parsedQuery "+str(parsedQuery))
  vprint("emitAlbumPage")
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user;
    
  qs = getattr(webin,"queryString",None)
  published = 0  # is this the published version?
  """
  now, if we're here its unpublished 
  if qs:
    qsp = urlparse.parse_qs(qs)
    published = 0 if qsp.get('unpublished',False) else 1
  """
  
  name = parsedPath.name
  Logr.log("newdb",str(name))
  if len(name) < 3:
    return gen.emitNotFound(webin)

    #return gen.genStaticPage(webin,"ImageDiver Message"," <center><b>404</b></center><p><center>No such page</center></p>");
    
  imowner = name[0]
  imname=name[1]
  albumname=name[2]
  albumTopic = "/album/"+imowner+"/"+imname+"/"+albumname;
  imageTopic = "/image/"+imowner+"/"+imname
  if albumname == "-":
    albumD = "-"
  else:
    albumD = album.loadAlbumD(albumTopic,webin.pageStore)
  
  if not albumD:
    #todo add error page here
    return gen.genStaticPage(webin,"ImageDiver Message","<center><b>No such album</b></center>");
  im = image.loadImageD(imageTopic,webin.pageStore)
  imHasAlbums = album.hasAlbums(imageTopic,user) # does this user have albums on this image
  imDict = models.toDict(im,["dimensions","title","name","author","year","externalLink","description","owner","topic","tilingDepthBump","zoomDepthBump","source"])

  if albumD == "-":
    ownerD = models.loadUserD(user,webin.pageStore)
    ownerName = getattr(ownerD,"name",None)

    options = {"imageD":imDict,"imageTopic":imageTopic,"loggedInUser":user,"ownerName":ownerName,"albumOwner":user,
               "published":False}
    otxt = genAlbumPage(options)
    return  htmlResponse(otxt)

    
  #print "IMDICT ",imDict
  author = getattr(im,"author",None)
  if author==None:
    author = ""
  else:
    author = ", "+author
  ttl = getattr(im,"title","")
  albowner = albumD.owner
  vprint("OWNER ",albowner,user)
  if (not constants.devVersion) and (albowner != user):
    return gen.genStaticPage(webin,"ImageDiver Message","<center><b>This is an unpublished album</b></center>");

  beenPublished = getattr(albumD,"published",0)
  vprint("beenPublished",beenPublished)
  ownerD = models.loadUserD(albowner,webin.pageStore)
  ownerName = getattr(ownerD,"name",None)
  apub = getattr(albumD,"published",None)
  if published and (not apub): 
    return gen.genStaticPage(webin,"ImageDiver Message","<center><b>This album has not yet been published</b></center>");
  
  #imageTopic = albumD.image
   #options = {"imageD":imDict,"albumOwner":albumD.owner,"albumOwnerName":ownerName,"loggedInUser":user,"hasAlbums":imHasAlbums,
  #          "albumTopic":albumD.topic,"published":published,"beenPublished":beenPublished,"path":"/"}
   
  options = {"imageD":imDict,"albumOwner":albumD.owner,"albumOwnerName":ownerName,"loggedInUser":user,"imTitle":ttl,"imAuthor":author,
            "albumTopic":albumD.topic,"imageTopic":imageTopic,"published":published,"beenPublished":beenPublished,"path":webin.path}
  vprint("OPTIONS", options)
  otxt = genAlbumPage(options)
  #snaps.closeStore(webin.pageStore)

  return  htmlResponse(otxt)
 
  
  
  

