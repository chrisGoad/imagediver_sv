#!/usr/bin/env python

"""
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap
/etc/init.d/apache2 restart

"""
import time
import urlparse
from WebClasses import WebInput,WebResponse

import re
import time

import constants
print "THEHOST",theHost
if theHost == "imagediver.org":
  constants.logDir = "/mnt/ebs0/imagediver/log/"
  constants.dbDir = "/mnt/ebs0/imagediver/dbs/"
  constants.domain = "imagediver.org"
  constants.compressJs = True
else:
  constants.logDir = "/mnt/ebs0/imagediverdev/log/"
  constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
  constants.domain = "dev.imagediver.org"
  constants.compressJs = constants.writePageMode or constants.forceJsCompression
constants.theHost = theHost
import Logr
Logr.log("dispatch","LOADED DISPATCH.WSGI")
import json
import store.theStore
theStore = store.theStore

import model.models
models = model.models

import api.utils
apiutils = api.utils
from pages.album import emitAlbumPage

from api.contact import contactHandler

from api.topic import topicHandler
#reload('neoapi.addSnap')
from api.album import addAlbum,editAlbum,deleteAlbum
from api.snap import addSnap,editSnap,deleteSnap
from api.login import login
from api.upload import upload,allocateUpload
from api.loadcount import imageLoads
from api.editImage import editImage
from api.emitJson import emitJson
from api.file import putFile,getFile,listDir

methods = {"addSnap":addSnap,"editSnap":editSnap,"deleteSnap":deleteSnap,"addAlbum":addAlbum,"editAlbum":editAlbum,"deleteAlbum":deleteAlbum,"login":login,"upload":upload,"topic":topicHandler,
           "allocateUpload":allocateUpload,"imageLoads":imageLoads,"editImage":editImage,"putFile":putFile,"getFile":getFile,"listDir":listDir,
           "contact":contactHandler}  # could be done with eval, but this localizes the connection

from pages.login import emitLoginPage
from pages.cloak import emitCloak

from pages.home import emitHomePage
from pages.gallery import emitGalleryPage
from pages.contents import emitContentsPage
from pages.justhtml import emitWhy,emitAboutPage,emitNoSuchPage,emitUnsupportedBrowserPage,emitOverCapacity,emitContactPage,emitEmbedTest,emitLikeButtonTest,emitWikipediaNotes

from pages.upload import emitUploadPage,emitUploadIframe
def startResponse(wr,start_response):
  status = wr.status
  ctype = wr.contentType
  content = wr.content
  """ @todo no-cache when logged in otherwise specify a max-age """
  response_headers = [('Cache-Control', 'no-cache, must-revalidate'),('Content-type', ctype),
                        ('Content-Length', str(len(content)))]
  Logr.log("dispatch","about to start response fromm "+theHost);
  start_response(status, response_headers)
  #Logr.log("dispatch","response started:" + str(content));
  theStore.closeConnection()
  Logr.log("dispatch","connection closed");
  return [content]
  
def redirectResponse(dest,start_response):
  print "REDIRECTION TO ",dest
  status = "307 Temporary Redirect"
  ctype = "text/html"
  body = "<!DOCTYPE html><html><head><title>Moved</title></head><body><p>Moved</p></body></html>"
  response_headers = [('Location',dest),('Content-type', ctype),
                        ('Content-Length', str(len(body)))]
  start_response(status, response_headers)
  #Logr.log("dispatch","response started:" + str(content));
  Logr.log("dispatch","connection closed");
  return [body]
  

"""
def checkOverCapacity(): 
  totalCountFile = "/mnt/ebs0/imagediver/log/total_images.txt"
  tcf = open(totalCountFile,"r")
  cnt = int(tcf.read())
  " assume an average of 33k for image files. So 30000 per gig. 300K images per dollar
  (transfer from s3 is ten cents per gigabyte). Allocate 1000 dollars. So 300 million images.
  "
  Logr.log("dispatch","capacity used so far "+str(cnt));

  return cnt > 300000000
"""
pageEmitters = {"/contact":emitContactPage,"/gallery":emitGalleryPage,"/gallery/index.html":emitGalleryPage,"/contents":emitContentsPage,"/about":emitAboutPage,
         "/upload":emitUploadPage,"/why":emitWhy,"/wikipedia_notes":emitWikipediaNotes,"/upload_iframe":emitUploadIframe,"/embedTest":emitEmbedTest,"/like_button_test":emitLikeButtonTest}

redirect = {"/topic/album/cg/The_Dutch_Proverbs/1/index.html":1,
           "/topic/album/cg/The_Ambassadors/1":1,"/gallery/index.html":1,
           "/topic/album/cg/earthly_delights_1/1/index.html":1,
            "/topic/album/cg/earthly_delights_1/2/index.html":1,
           "/topic/album/cg/earthly_delights_1/3/index.html":1,
           "/topic/album/cg/earthly_delights_1/4/index.html":1,
           "/topic/album/cg/bathing_1/1/index.html":1,
           "/topic/album/cg/astoria_1923_1/1/index.html":1,
           "/topic/album/cg/astoria_1923_1/2/index.html":1,
            "/topic/image/cg/astoria_1923_1/index.html":1,
           "/topic/image/cg/earthly_delights_1/index.html":1}

#rootPage = "/topic/album/cg/The_Dutch_Proverbs/1"
#nowCloaking = False

def ieVersion(ua):
  msie = re.search("MSIE (\d*)",ua)
  if not msie: return None
  v = int(msie.group(1))
  return v
  
def application(environ, start_response):
  startTime = time.time()
  host = environ['HTTP_HOST']
    

  #req.write("Heeello World!"+req.uri)
  #qs = environ["QUERY_STRING"]
  ua = environ["HTTP_USER_AGENT"]
  print "BROWSER****",ua
  iev = ieVersion(ua)
  print "VERSION",iev
  print "CLOAKING", constants.nowCloaking
  constants.ieVersion = iev
  ruri = environ["REQUEST_URI"]
  print "DISPATCH ruri = "+str(ruri)
  prsu = urlparse.urlparse(ruri)
  qs = prsu.query
  nocloak = False
  if qs:
    qsp = urlparse.parse_qs(qs)
    print "QS",qs,"QSP",qsp
    nocloak = qsp.get('nocloak',False)#for debugging
  print "PRSU",prsu
  print "ZZZZ"
  path = prsu.path
  if host == "imagediver.org":
    redir = redirect.get(path,None)
    if redir:
      return redirectResponse("http://s3.imagediver.org"+path,start_response)
      
  if iev:
    if iev < 7:
      webin = WebInput(path,qs,None,None,0)
      webout = emitUnsupportedBrowserPage(webin,iev)
      return startResponse(webout,start_response)
  #if path == "/":
  #  path = rootPage
  """
  CLOAKING GONE
  cloakedPath = cloaked.get(path,None)
  clk = (not nocloak) and constants.nowCloaking and cloakedPath
  if clk:
    print "CLOAK",path
    webout = emitCloak(path,qs)
    print "ELAPSED TIME IS ",time.time() - startTime
    return startResponse(webout,start_response)
  host = environ['HTTP_HOST']
  """
  Logr.log("dispatch","\n\n\n"+host)
  #Logr.log("dispatch",str(environ))
  #overCapacity = checkOverCapacity()
  ua = environ['HTTP_USER_AGENT']
  Logr.log("dispatch",ua)
  #iemt = re.search("MSIE (\d)",ua)
  #iev = None

  cookie = environ.get("HTTP_COOKIE",None)
  if cookie:
    Logr.log("dispatch","cookie: ["+cookie+"]")
  isdev = host.find("dev.")==0
  constants.devVersion = isdev
  theStore.cStore = None # modules persist through invocations
  session = None
  if cookie:
    mt = re.search("sessionId\=(\w*)",cookie)
    if mt:
      sessionId = mt.group(1)
      Logr.log("api","SESSIONID =["+sessionId+"]")
      session = models.loadSessionD(sessionId)
      if session:
        Logr.log("api","SESSION: "+str(session.__dict__))
      else:
        Logr.log("api","SESSION "+sessionId+" not found")        
  #Logr.log("test","TEST CONSTANT in LOGIN "+str(constants.__dict__.keys()))
  cln = environ.get("CONTENT_LENGTH",None)
  #cln = environ.get("HTTP_REFERER",None)
  Logr.log("dispatch","contentt length:"+str(cln))
  cn = None
  istr = None
  if cln!=None:
    Logr.log("dispatch","content length:"+cln)
    istr = environ["wsgi.input"]
    cln = int(cln)
    #cn = istr.read(int(cln))
    #return startResponse(WebResponse("200 OK","text/plain","ookk"),start_response)
  #Logr.log("dispatch","content:"+cn) 
  webin = WebInput(path,qs,istr,session,cln)
  Logr.log("dispatch","pathh = [{0}] qs = {1} session= {2} contentLength {3}".format(path,qs,session,cln)) # watch out this requires stringifying webin, whether or not he dispatch tag is asserted
  if path=="/login":
    webout = emitLoginPage(webin)
    return startResponse(webout,start_response)
  if path=="/":
    webout = emitGalleryPage(webin)
    return startResponse(webout,start_response)
    """
    pp = apiutils.parsePath("/topic/album/cg/astoria_1923_1/1")
    if overCapacity:
      webout = emitOverCapacity(webin)
    else:
      webout = emitAlbumPage(webin,pp,True)
    return startResponse(webout,start_response)
    """
  print "WHY"
  pageEmitter = pageEmitters.get(path,None);
  if pageEmitter:
    webout = pageEmitter(webin)
    return startResponse(webout,start_response)    
  if iev and path=="/unsupported_browser":
    webout = emitUnsupportedBrowserPage(iev)
    return startResponse(webout,start_response)
  isTopic = (path.find("/topic/")==0) and (path.find("topic.json")<0) # topic.json's are handled by the api
  if isTopic:
    #if overCapacity:
    #  webout = emitOverCapacity(webin)
    #else:
    webout = topicHandler(webin)
    print "ELAPSED TIME IS ",time.time() - startTime

    return startResponse(webout,start_response)
  isApiCall = (path.find("/api/")==0) or (path.find("topic.json")>0)
  if isApiCall:
    hasMethod = path.find("()")>0
    ps = path.split("/")
    Logr.log("api","dispatch to api "+str(ps))
    lnps = len(ps)
    if lnps > 3:
      webout = emitJson(webin)
      return startResponse(webout,start_response)
    if len(ps)==3:
      methodName=ps[2]
      Logr.log("api","callingg method ["+methodName+"]");
      method = methods.get(methodName,None);
      if method == None:
        js = json.dumps({"status":"error","msg":"no such method"})
        webout = WebResponse('200 OK',"application/json",js)
      else:
        webout = method(webin)
      Logr.log("api","WEBOUT "+str(webout.__dict__))
      return startResponse(webout,start_response)
      #return startResponse(WebResponse("200 OK","text/plain","ok"),start_response)
  webout = emitNoSuchPage(webin) 
  return startResponse(webout,start_response)

  """ the old mod_python code
  
  theRequest = webRequest()
  theRequest.request=req
  puri = urlparse.urlparse(req.unparsed_uri)
  Logr.log("dispatch","puri "+puri.query)
  Logr.log("dispatch","pid:"+str(os.getpid()))
  p = puri.path
  theRequest.path=p
  Logr.log("dispatch","path ["+p+"]");
  isTopic = p.find("/topic/")==0;
  if isTopic:
    from neoapi.topic import topicHandler
    trs = topicHandler(path)  
    fp = "/var/www/neo.com/neoapi/topic.py"
    execfile(fp)
    return apache.OK
  isApiCall = p.find("/api/")==0;
  if isApiCall:
    sys.path.append("/var/www/neo.com/api")
    import constants
    reload(constants)
    ps = p.split("/")
    Logr.log("api","dispatch to api "+str(ps))
    Logr.log("api","ACTIVE TAGS:" +str(Logr.activeTags))

    if len(ps)==3:
      method=ps[2]
      fp="/var/www/neo.com/neoapi/"+method+".py"
      Logr.log("api","dispatch to "+fp);

      execfile(fp)
      return apache.OK
    else:
      emitError("bad form for api call "+p)
  fp = "/var/www/neo.com"+p
  #req.write(fp+"\n")
  q = puri.query
  #req.write("query:["+q+"]");
  if q:
    Logr.log("dispatch","query "+q);
    theRequest.query = dict(urlparse.parse_qsl(q))
    #req.write(theQuery['movie']);
  execfile(fp)
  return apache.OK
"""
