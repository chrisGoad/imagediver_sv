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
import misc


verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"DISPATCH")

mverbose = True
def mprint(*args):
  if mverbose:
    misc.printargs(args,"DISPATCH")
  


def setDomainVars(host):
    
  mprint("setDomainVars",host)
  if host.find("dev.imagediver.org") < 0:
    constants.logDir = "/mnt/ebs0/imagediver/log/"
    constants.domain = "imagediver.org"
    constants.compressJs = True
    constants.devVersion = False
    constants.wikiMode = False
    constants.pyDir = "/mnt/ebs0/imagediver/py/"
  else:
    constants.logDir = "/mnt/ebs0/imagediverdev/log/"
    constants.domain = "dev.imagediver.org"
    constants.compressJs =  constants.forceJsCompression
    constants.devVersion = True
    constants.pyDir = "/mnt/ebs0/imagediverdev/py/"

  constants.theHost = host
  print "COMPRESS JS",constants.compressJs,constants.devVersion

import json

"""
import boto
vprint("BOTO ",boto.Version)
vprint(boto.connect_dynamodb)
"""
import model.models
models = model.models

import api.utils
apiutils = api.utils
methods = None

emitNotFound = None


from pages.gen import emitMessagePage,emitNotFound,emitUnsupportedBrowserPage

from api.topic import topicHandler
from api.album import addAlbum,editAlbum,deleteAlbum,publishAlbum,newAlbum,newAlbumJsonP
from api.snap import addSnap,editSnap,deleteSnap
from api.login import login,forgotPassword,logout
from api.job import runJob,allocateJob
from api.image import editImage,deleteImage,imageDeleteable,albumsForImage,albumTopicsForImage,albumsForImageJsonP
from api.emitJson import emitJson
from api.updateUser import updateUser,newPassword,acceptedTerms
from api.register import register
from api.checkUser import checkUser
from api.image import allImages
from api.user import allUsers
from api.album import allAlbums,albumsAndImages,albumHistory
from api.resend import resend
from api.forum import addPost,getPosts
from api.tumblr import tumblrRequestToken,tumblrPost,setTumblrToken
from api.twitter import twitterRequestToken,setTwitterToken

methods = {"addSnap":addSnap,"editSnap":editSnap,"deleteSnap":deleteSnap,"addAlbum":addAlbum,"allUsers":allUsers,
         "editAlbum":editAlbum,"deleteAlbum":deleteAlbum,"albumHistory":albumHistory,"newAlbum":newAlbum,"newAlbumJsonP":newAlbumJsonP,
         "login":login,"logout":logout,"forgotPassword":forgotPassword,"topic":topicHandler,
         "allocateJob":allocateJob,"editImage":editImage,"addPost":addPost,"getPosts":getPosts,
         "tumblrRequestToken":tumblrRequestToken,"tumblrPost":tumblrPost,"twitterRequestToken":twitterRequestToken,"setTumblrToken":setTumblrToken,
         "setTwitterToken":setTwitterToken,
         "checkUser":checkUser,"runJob":runJob,"resend":resend,
         "register":register,"updateUser":updateUser,"newPassword":newPassword,"acceptedTerms":acceptedTerms,
         "allImages":allImages,"deleteImage":deleteImage,"albumsForImage":albumsForImage,"albumsForImageJsonP":albumsForImageJsonP,
         "publishAlbum":publishAlbum,"allAlbums":allAlbums,"albumsAndImages":albumsAndImages}  # could be done with eval, but this localizes the connection


def redirectTo(dest,start_response):
  vprint("REDIRECTION TO ",dest)
  status = "307 Temporary Redirect"
  ctype = "text/html"
  body = "<!DOCTYPE html><html><head><title>Moved</title></head><body><p>Moved</p></body></html>"
  response_headers = [('Location',dest),('Content-type', ctype),
                        ('Content-Length', str(len(body)))]
  start_response(status, response_headers)
  return [body]
  

redirectMap = {
  "/test/test":"http://s3.imagediver.org/topic/album/4294b0e/the_dutch_proverbs/1/index.html"
}

def startResponse(wr,start_response):
  status = wr.status
  ctype = wr.contentType
  content = wr.content
  redirect = getattr(wr,"redirect",None)
  if redirect:
    return redirectTo(redirect,start_response)
  response_headers = [('Cache-Control', 'no-cache, must-revalidate'),('Content-type', ctype),
                        ('Content-Length', str(len(content)))]
  start_response(status, response_headers)
  st = getattr(wr,"startTime",None)
  if st:
    etm = time.time() - wr.startTime
    mprint("ELAPSED TIMEE ",etm)
  content = content.encode('utf-8')
  return [content]
  

thePages = set(["apitest","reset_password","tos","license","contact","faq","logout","login","gallery","images","hituserlimit",
                "authorize_tumblr","authorize_twitter","terms","test_snap","test_album","home","users","googlee28c8d08ee2e2f69.html",
                "upload","upload_iframe","logged_out","timeout","embed_test","embed","forum","annotate","tumblr_oauth","twitter_oauth","post_to_tumblr",
                "logs","verify_email","copyright","privacy","me","mywork","binary","bandwidth_exceeded"])


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


def ieVersion(ua):
  msie = re.search("MSIE (\d*)",ua)
  if not msie: return None
  v = int(msie.group(1))
  return v


def application(environ, start_response):
  startTime = time.time()
  if constants.maintainenceMode:
    webout = WebResponse("200 OK","text/html",constants.maintainencePage)
    webout.startTime = startTime
    return startResponse(webout,start_response)
  host = environ['HTTP_HOST']
  setDomainVars(host)
  raddr = environ['REMOTE_ADDR']
  constants.remote_addr = raddr
  ua = environ["HTTP_USER_AGENT"]
  vprint("BROWSER****",ua)
  iev = ieVersion(ua)
  vprint("VERSION",iev)
  constants.ieVersion = iev
  ruri = environ["REQUEST_URI"]
  mprint("RURI ",ruri)
  prsu = urlparse.urlparse(ruri)
  qs = prsu.query
  cookie = environ.get("HTTP_COOKIE",None)
  sessionId = None
  if cookie:
    mt = re.search("sessionId\=(\w*)",cookie)
    if mt:
      sessionId = mt.group(1)
  vprint("PRSU",prsu)
  path = prsu.path
  if path == "/env":
    rs = ['{0}: {1}'.format(key,value) for key,value in sorted(environ.items())]
    frs = "\n".join(rs)
    webout = WebResponse("200 OK","text/plain",frs)
    webout.startTime = startTime
    return startResponse(webout,start_response) 
  rdir = redirectMap.get(path,None)
  if rdir:
    return redirectTo(rdir,start_response)
  """
  if 0 and (path == constants.homeJsonPath):
    fl = open(constants.pageRoot+"home.json")
    cn = fl.read()
    fl.close()
    webout =  WebResponse('200 OK',"application/json",cn)
    webout.startTime = startTime
    return startResponse(webout,start_response)
  """
  ua = environ['HTTP_USER_AGENT']
  session = None
  if sessionId:
    session = models.loadSessionD(sessionId)
  if path == "/":
    #if session:
    #  path  = "/mywork"
    #else:
    path = "/home"
  cln = environ.get("CONTENT_LENGTH",None)
  cn = None
  istr = None
  if cln!=None:
    istr = environ["wsgi.input"]
    cln = int(cln)
  webin = WebInput(path,qs,istr,session,cln)
  if iev:
    if iev < 7:
      webout = emitUnsupportedBrowserPage(webin,iev)
      return startResponse(webout,start_response)
  constants.webin = webin
  pathsplit = path.split("/")
  path1 = pathsplit[1]
  vprint("PATH ",path,path1)
  if path1 in thePages:
    if (path1 === "googlee28c8d08ee2e2f69.html")
      path1 = "googlee28c8d08ee2e2f69"
    pim = __import__("pages."+path1,None,None,"emitPage")
    webout = pim.emitPage(webin)
    webout.startTime = startTime
    return startResponse(webout,start_response)
  if iev and path=="/unsupported_browser":
    webout = emitUnsupportedBrowserPage(webin,iev)
    return startResponse(webout,start_response)
  isTopic = ((path.find("/topic/")==0) or (path.find("/topicd/")==0)) and (path.find("main.json")<0) # main.json's are handled by the api
  if isTopic:
    webout = topicHandler(webin)
    webout.startTime = startTime
    return startResponse(webout,start_response)
  isApiCall = (path.find("/api/")==0) or (path.find("main.json")>0)
  if isApiCall:
    hasMethod = path.find("()")>0
    ps = path.split("/")
    vprint("api","dispatch to api "+str(ps))
    lnps = len(ps)
    if lnps > 3:
      webout = emitJson(webin)
      webout.startTime = startTime
      return startResponse(webout,start_response)
    if len(ps)==3:
      methodName=ps[2]
      method = methods.get(methodName,None);
      if method == None:
        js = json.dumps({"status":"error","msg":"no such method"})
        webout = WebResponse('200 OK',"application/json",js)
      else:
        webout = method(webin)
      webout.startTime = startTime
      return startResponse(webout,start_response)
  webout = emitNotFound(webin);
  webout.startTime = startTime
  return startResponse(webout,start_response)

