"""
http://neochronography.com/topic/image/astoria_1923_0

http://dev.imagediver.org/post_to_tumblr?topic=/snap/4294b0e/van_eyck_arnolfini/1/9
http://dev.imagediver.org/post_to_tumblr?topic=/snap/4294b0e/the_ambassadors/1/2
http://dev.imagediver.org/post_to_tumblr?topic=/snap/4294b0e/the_ambassadors/1/2
http://dev.imagediver.org/post_to_tumblr?topic=/snap/4294b0e/one_dollar_bill_obverse/4/1


http://dev.imagediver.org/post_to_tumblr?topic=/snap/4294b0e/the_ambassadors/1/2
"""





import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsInclude,commonJsIncludes,jsForPage,cjsForPage,jsPreamble
from WebClasses import WebResponse,okResponse,failResponse,redirectResponse

import ops.oauth_tumblr
oauth_tumblr = ops.oauth_tumblr
import json
import misc

import model.models
models = model.models
import model.snap
snapm = model.snap
import pages.gen
gen = pages.gen
import urlparse


headLines = []
js = ""
pageName = 'post_to_tumblr'
if constants.compressJs:
  js += commonCjsInclude +  cjsForPage(pageName)
else:
  js +=  commonJsIncludes + jsForPage(pageName)


def authorizeTumblr(user,topic):
  tk = oauth_tumblr.requestToken()
  if topic:
    tk["topic"] = topic
  tkj = json.dumps(tk)
  #print "TKJ",tkj
  " the token needs to be saved for a few minutes: until the user authorizes or declines the app "
  dir = "/mnt/ebs1/imagediver/tokens/"
  uname = misc.pathLast(user)
  fln = dir+uname
  f = open(fln,'w')
  f.write(tkj)
  f.close()
  return tk
  #localStorage.tumblrToken = tkj
  tktk = tk["oauth_token"]
  url = 'http://tumblr.com/oauth/authorize?oauth_token='+str(tktk)
  return url

def emitError():
    body = """
<div>Something is amiss: bad post data</div>"""
    return gen.genStaticPage(webin,"ImageDiver Message",body);

def emitRedirect(
def emitPage(webin):
  qs = webin.queryString
  print "WEBIN", webin.__dict__
  cn = webin.content()
  if not cn:
    emitError()
  print "CN",cn
  cnd = cn[cn.find("=")+1:]
  print "CND ",cnd
  qd=json.loads(cnd)

  if not ("topic" in qd):
    emitError()
  topic = qd["topic"][0]
  sess = webin.session
  if not sess:
    body = """
<div>To post an annotation to Tumblr, you need to be logged in. (Registering at ImageDiver is free)</div>"""
    return gen.genStaticPage(webin,"ImageDiver Message",body);
  user = sess.user;
  userD = models.loadUserD(user)
  url = authorizeTumblr(user,topic)
  
  tk = getattr(userD,"tumblr_token",None)
  if not tk:
    url = authorizeTumblr(user,topic)
    return redirectResponse(url)
  try:
    uinf = userD.tumblrInfo()
  except Exception as ex: # case where tumblr access has been revoked
    url = authorizeTumblr(user,topic)
    return redirectResponse(url)
  blogs = uinf['blogs']
  blogUrls = [b['url'] for b in blogs]
  print "topic",topic
  #snapD = snapm.loadSnapD(topic)
  #if not snapD:
  #  body = "<div>Something amiss: no such topic.</div>"
  #  return gen.genStaticPage(webin,"ImageDiver Message",body);
  #print "snapD",snapD
  qd["blogs"] = blogUrls
  #options = {"blogs":blogUrls,"topic":topic} #,"snap":snapD.__dict__}
  return gen.genDynPage(webin,js,{},qd,headLines,pageTitle="Post to Tumblr")



 
  

