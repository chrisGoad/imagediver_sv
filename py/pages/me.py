
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




headerTitle = "Account"


pageName = 'me'
js = ""
if constants.compressJs:
  js += commonCjsIncludes() +  cjsForPage(pageName)
else:
  js +=  commonJsIncludes() + jsForPage(pageName)

"""
if constants.compressJs:
    jsIncludes = constants.jsPreamble + constants.toJsInclude("/ncjs/common.js") +  constants.toJsInclude("/ncjs/me.js")
else:
    jsIncludes =  constants.commonJsIncludes +  constants.toJsIncludes(["/pages/me.js"])
"""

def emitPage(webin):
  sess = webin.session;
  
  if sess==None:
    return gen.emitMessagePage(webin,"Not logged in.","Please log in.");

    user = "";
  else:
    user = sess.user;
    usrd = models.loadUserD(user,webin.pageStore)
    uid = models.pathLast(usrd.topic)
    timed_out = sess.timed_out
    opts = {"timed_out":timed_out,"name":usrd.name,"email":getattr(usrd,"email",""),"tumblr_name":getattr(usrd,"tumblr_name",""),"twitter_name":getattr(usrd,"twitter_name",""),
            "utilization":usrd.utilization(),"userId":uid,"allocation":usrd.allocation()}
  
  return gen.genStdPage(webin,'me',opts,'account',staticSize=True)




