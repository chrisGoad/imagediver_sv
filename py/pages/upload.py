
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

  
  
import constants
execfile(constants.pyDir+"common_includes.py")



import model.models
models = model.models
""" an ordinary import was failing here. I have no idea why """
__import__("ops.utilization",None,None,[])

import json
import Logr
import gen

__import__("ops.utilization",None,None,[])

def emitPage(webin):
  
  sess = webin.session;
  if sess==None:
    return gen.genHtmlPage(webin,"","ImageDiver session timeout",[],"Your session has expired. Please log in again.")

    user = "";
  else:
    user = sess.user
    usrd = models.loadUserD(user,webin.pageStore)
    hasEmail = 1 if getattr(usrd,"email",None) else 0
    opts = {"loggedInUser":user,"utilization":usrd.storageUtilization(),"allocation":usrd.allocation()["storage"],"hasEmail":hasEmail}
    return gen.genStdPage(webin,'upload',opts,'import',staticSize=True)
    return gen.genDynPage(webin,js,{"topbarTitle":"<i>Import</i>"},opts)



 