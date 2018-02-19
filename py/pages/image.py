
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse,htmlResponse
import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsIncludes,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import pages.gen
gen = pages.gen
import model.models
models = model.models
import model.image
image = model.image
import model.album
album = model.album
import json
import Logr

import misc

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args)
   


def genImagePage(options):
  vprint("OPTIONS",options)
  user = options["loggedInUser"] # the visitor's imageidver user name
  im = options["imageD"]
  imAuthor = im.get("author",None)
  if imAuthor:
    imAuthor = ","+imAuthor
  else:
    imAuthor = ""
  imTitle = im.get("title",None)
  optionsJson = json.dumps(options)
  path = options["path"]
 
  if imTitle:
    ttl = imTitle
  else:
    ttl = im["name"]
  imt = ttl+imAuthor
  pg0= gen.pageHeader(path,"ImageDiver: "+imt,imt+", Zoomable and Annotated") + "<body>"
  pageName = 'image'
  if constants.compressJs:
    pg0 += commonCjsInclude +  cjsForPage(pageName)
  else:
    pg0 +=  commonJsIncludes + jsForPage(pageName)
  """
  if constants.compressJs:
    pg0 +=  jsPreamble + constants.toJsInclude("/ncjs/common.js") +  cjsForPage(pageName)
  else:
    pg0 +=  constants.commonJsIncludes + jsForPage(pageName)
  """


  pg1 = """
<script>
page.initialize({0});
</script>
</body>
</html>
""".format(optionsJson)
  return pg0 + pg1





def emitImagePage(webin,parsedPath):
  import model.album
  album = model.album
  vprint("emitImagePage")
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user;

  name = parsedPath.name
  if len(name) < 3:
    return gen.emitNotFound(webin)

  Logr.log("newdb",str(name))
  imowner = name[0]
  imname=name[1]
  imTopic = "/image/"+imowner+"/"+imname
  imD = image.loadImageD(imTopic,webin.pageStore)
  if not imD:
    #todo add error page here
    return gen.genStaticPage(webin,"ImageDiver Message","<center><b>No such image</b></center>");
  
  ownerD = models.loadUserD(imD.owner,webin.pageStore)
  ownerName = getattr(ownerD,"name",None)
  
  albums =  album.albumsForImage(imTopic)
  #theStore.topicsWithPropertyValue('/type/albumD','image',imageTopic)
  vprint("ALBUMS "+str(albums))
  albumDs = album.getAlbums(albums)
  #albumDicts = models.toDicts(albumDs,["topic","name"])
  #vprint("ALBUMDS "+str(albumDicts)
  #vprint(albumDs
  #vprint("ALBUMDS",[albumD.__dict__ for albumD in albumDs]
  usrs = models.loadUserDs([albumD["owner"] for albumD in  albumDs],webin.pageStore)
  vprint("USRS ",usrs)
  for albumD in albumDs:
    owner = albumD["owner"]
    vprint("owner ",owner)
    usr = usrs.get(owner,None)
    if usr:
      vprint("USR",usr.__dict__)
      nm = getattr(usr,"name",None)
      if nm:
        vprint("NM******",nm)
        albumD["ownerName"]= nm
  imDict = models.toDict(imD,["dimensions","title","name","author","year","externalLink","description","source","owner","topic","tilingDepthBump","zoomDepthBump","isPublic","license"])
  imDict["ownerName"] = ownerName;
  options = {"albums":albumDs,"imageD":imDict,"loggedInUser":user,"path":webin.path}
  #vprint("OPTIONS", options
  otxt = genImagePage(options)
  return  htmlResponse(otxt)
 
  
 
  
  

