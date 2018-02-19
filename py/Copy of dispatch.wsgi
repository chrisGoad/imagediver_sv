#!/usr/bin/env python

"""
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap
/etc/init.d/apache2 restart

"""
import sys
import urlparse
sys.path.append("/mnt/ebs0/imagediver/py")
from WebClasses import WebInput,WebResponse

import re
import time
import Logr
Logr.log("dispatch","LOADED DISPATCH.WSGI")

import constants


import store.theStore
theStore = store.theStore

import model.models
models = model.models


from api.topic import topicHandler
#reload('neoapi.addSnap')
from api.addSnap import addSnap
from api.album import addAlbum,editAlbum,deleteAlbum
from api.snap import addSnap,editSnap,deleteSnap
from api.login import login
from api.upload import upload
methods = {"addSnap":addSnap,"editSnap":editSnap,"deleteSnap":deleteSnap,"addAlbum":addAlbum,"editAlbum":editAlbum,"deleteAlbum":deleteAlbum,"login":login,"upload":upload}  # could be done with eval, but this localizes the connection

from pages.login import emitLoginPage
from pages.home import emitHomePage
from pages.gallery import emitGalleryPage
from pages.about import emitAboutPage
from pages.upload import emitUploadPage
from pages.unsupported_browser import emitUnsupportedBrowserPage


def startResponse(wr,start_response):
  status = wr.status
  ctype = wr.contentType
  content = wr.content
  response_headers = [('Content-type', ctype),
                        ('Content-Length', str(len(content)))]
  Logr.log("dispatch","about to start response");
  start_response(status, response_headers)
  Logr.log("dispatch","response started");
  theStore.closeConnection()
  Logr.log("dispatch","connection closed");
  return [content]
  


def application(environ, start_response):
  #req.write("Heeello World!"+req.uri)
  host = environ['HTTP_HOST']
  Logr.log("dispatch",host)
  isdev = host.find("dev.")==0
  theStore.cStore = None # modules persist through invocations
  cookie = environ.get("HTTP_COOKIE",None)
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
  ruri = environ["REQUEST_URI"]
  Logr.log("dispatch","ruri = "+str(ruri))
  prsu = urlparse.urlparse(ruri)
  qs = prsu.query
  path = prsu.path
  webin = WebInput(path,qs,istr,session,cln)
  #Logr.log("dispatch","webin = "+str(webin.__dict__)) # watch out this requires stringifying webin, whether or not he dispatch tag is asserted
  if path=="/login":
    webout = emitLoginPage(webin)
    return startResponse(webout,start_response)
  if path=="/":
    webout = emitHomePage(webin)
    return startResponse(webout,start_response)
  if path=="/gallery":
    webout = emitGalleryPage(webin)
    return startResponse(webout,start_response)
  if path=="/about":
    webout = emitAboutPage(webin)
    return startResponse(webout,start_response)
  if path=="/unsupported_browser":
    webout = emitUnsupportedBrowserPage(webin)
    return startResponse(webout,start_response)
  if path=="/upload":
    webout = emitUploadPage(webin)
    return startResponse(webout,start_response)
  isTopic = path.find("/topic/")==0;
  if isTopic:
    webout = topicHandler(webin)
    return startResponse(webout,start_response)
  isApiCall = path.find("/api/")==0;
  if isApiCall:
    ps = path.split("/")
    Logr.log("api","dispatch to api "+str(ps))

    if len(ps)==3:
      methodName=ps[2]
      Logr.log("api","calling method "+methodName);    
      method = methods[methodName]
      webout = method(webin)
      Logr.log("api","WEBOUT "+str(webout.__dict__))
      return startResponse(webout,start_response)
      #return startResponse(WebResponse("200 OK","text/plain","ok"),start_response)
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
