"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
http://dev.imagediver.com/api/image/cg/astoria_1923_1

"""

from WebClasses import WebResponse,okResponse,failResponse


import time
import constants
import model.models
models = model.models
import json
import Logr
from api.utils import parseApiPath
import math
import model.image
image = model.image
import model.album
album = model.album
import model.snap as snapm
import store.dynamo as dynamo



import misc


verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"EMITJSON")
  
  
  
def emitJson(webin):
  itm = time.time()
  sess = getattr(webin,"session",None)
  user = None
  if sess:
    user = sess.user
  jsonMimeType = "application/json";
  #jsonMimeType = "text/plain";
  jsonMissing = json.dumps({"status":"error","id":"missing"})
  path = webin.path
  parsedPath = parseApiPath(webin.path)
  name = parsedPath.name
  category = parsedPath.category
  owner = parsedPath.owner
  vprint("category",category);
  if category == "image":
    imageTopic = "/image/"+owner+"/"+name
    #albumTopic = "/album/"+imowner+"/"+imname+"/"+album;
    Logr.log("api","imageTopic="+imageTopic)
    im = image.loadImageD(imageTopic,webin.pageStore)
    if not im:
    #todo add error page here
      return  WebResponse('200 OK',jsonMimeType,jsonMissing)
    #Logr.log("api","IMAGE "+str(im.__dict__))
    #print "IMAGE",im.__dict__
    imob = {}
    improps = ["topic","externalLink","dimensions","author","title","owner","tags",
              "description","name","year","tilingDepth","license","shared",
              "beenTiled","atS3","current_item_create_time","source","isPublic","s3Storage"]



    misc.setDictPropsFromObject(imob,im,improps);
    #imob = {"id":im.topic,"dimensions":im.dimensions,"title":getattr(im,"title",""),"owner":"/user/"+owner,
    #      "author":getattr(im,"author",""),"source":getattr(im,"source",""),"externalLink":getattr(im,"externalLink","")}
    #js = json.dumps(im.__dict__)
    #Logr.log("api","IMAGEJS"+js)
    js = json.dumps(imob);
    Logr.log("api","IMAGEJS2"+js)
    return  WebResponse('200 OK',jsonMimeType,js)
  if category == "album":
    """ the album id "-" means the snaps album of the current user """
    imname = getattr(parsedPath,"name",None)
    id = getattr(parsedPath,"id",None)
    if not id:
      js = json.dumps({"status":"error","id":"bad_path"})
      return  WebResponse('200 OK',jsonMimeType,js)
    albumTopic = "/album/"+owner+"/"+imname+"/"+id
    imTopic = "/image/"+owner+"/"+imname
    #ofl = open("/mnt/ebs0/imagediverdev/static"+albumTopic+"/topic.json","w")
    if id == "-": # the snaps album, if any
      if not user:
        return failResponse("missing")
      sna = dynamo.getSnapsAlbumTopic(imTopic,user)
      if sna:
        albumTopic = sna
      else:
        return failResponse("missing")
    
    albumD = album.loadAlbumD(albumTopic,webin.pageStore)
    js = albumD.compute_json(wrapInStatus=True)
    #snapst.closeStore(webin.pageStore)
    return  WebResponse('200 OK',jsonMimeType,js)
  if category == "snap":
    imname = getattr(parsedPath,"name",None)
    id = getattr(parsedPath,"id",None)
    subid = getattr(parsedPath,"subid",None) 
    if (not id) or (not subid):
      js = json.dumps({"status":"error","id":"bad_path"})
      return  WebResponse('200 OK',jsonMimeType,js)
    snapTopic = "/snap/"+owner+"/"+imname+"/"+id+"/"+subid
    #ofl = open("/mnt/ebs0/imagediverdev/static"+albumTopic+"/topic.json","w")
    snapD = snapm.loadSnapD(snapTopic,webin.pageStore)
    js = snapD.compute_json(wrapInStatus=True)
    #snapst.closeStore(webin.pageStore)
    return  WebResponse('200 OK',jsonMimeType,js)    
    
  OBSOLETE()
  #ds  = dstore.DStore(constants.descriptorStore)
  #imds = ds.descriptor(topicpath,'/type/imageD')
  snaps = models.snapsInAlbum(albumTopic)
  #theStore.topicsWithPropertyValue('/type/snapD','album',albumTopic)
  albums =  models.albumsForImage(imageTopic)
  Logr.log("image","snaps: "+str(snaps));
  Logr.log("image","image: "+str(im.__dict__))
  Logr.log("image","albums: "+str(albums))
  snapDs = theStore.descriptor(snaps,'/type/snapD')
  albumDs = theStore.descriptor(albums,'/type/albumD')
  Logr.log("image","albumDs"+str(albumDs))
  thisAlbumD = None
  for albumD in albumDs:
    if albumD["topic"] == albumTopic:
      thisAlbumD = albumD
      break
  
  if im:
    otxt = pg0 + \
      "<script>" + \
      "var imD="+json.dumps(im.__dict__)+";\n" + \
      "var snapDs="+json.dumps(snapDs)+";\n" + \
      "var albumDs="+json.dumps(albumDs)+";\n"+ \
      "var albumD="+json.dumps(thisAlbumD)+";\n"+ \
      "var loggedInUser='"+str(user)+"';\n";
    if forHomePage:
      otxt += "page.thisIsHomePage=1;\n";
    otxt += pg1
    
  else:
    otxt = "NO SUCH IMAGE for "+topicpath
  snapst.closeStore(webin.pageStore)

  #Logr.log("image","description: "+str(imds))
  return  WebResponse('200 OK','text/html',otxt)
 
  
  
  

