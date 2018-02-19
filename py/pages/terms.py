
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""





import constants
execfile(constants.pyDir+"common_includes.py")

import store.dynamo
dynamo = store.dynamo

import model.models
models = model.models

""" an ordinary import was failing here. I have no idea why """
__import__("ops.utilization",None,None,[])

#import ops.remove_me
import json
import Logr
import pages.gen
gen = pages.gen
import urlparse
import misc

headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""




headerTitle = "Welcome"


"""
pageName = 'terms'
js = ""
if constants.compressJs:
  js += commonCjsIncludes() +  cjsForPage(pageName)
else:
  js +=  commonJsIncludes() + jsForPage(pageName)
"""

"""
if constants.compressJs:
    jsIncludes = constants.jsPreamble + constants.toJsInclude("/ncjs/common.js") +  constants.toJsInclude("/ncjs/me.js")
else:
    jsIncludes =  constants.commonJsIncludes +  constants.toJsIncludes(["/pages/me.js"])
"""

def emitPage(webin):
  sess = webin.session;
  if sess:
    #return gen.genHtmlPage(webin,"",headerTitle,headLines,"You are already logged in.")
    return gen.genHtmlPage(webin,"",styleSheets=styleSheets,pageTitle="You are already logged in.")
  else:
    qs = webin.queryString
    if not qs:
      return gen.genHtmlPage(webin,"",styleSheets=styleSheets,pageTitle="Expected '?user=<uid>'")
    qsp = urlparse.parse_qs(qs)
    uid = qsp.get("user",None)
    if not uid:
      return gen.genHtmlPage(webin,"",styleSheets=styleSheets,pageTitle="Expected '?user=<uid>'")
    uid = uid[0]
    user = "/user/"+uid
    usrd = models.loadUserD(user)
    if not usrd:
      return gen.genHtmlPage(webin,"",styleSheets=styleSheets,pageTitle="No such user.")
    opts = {"uid":uid,"name":usrd.name,"accepted_terms":getattr(usrd,"accepted_terms"),"tumblr_name":getattr(usrd,"tumblr_name",""),
            "twitter_name":getattr(usrd,"twitter_name","")}
    return gen.genStdPage(webin,'terms',options=opts,pageTitle="Welcome",staticSize=True)
  




