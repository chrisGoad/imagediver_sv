
"""
http://neochronography.com/topic/image/astoria_1923_0
"""


import constants
import store.dynamo as dynamo
execfile(constants.pyDir+"common_includes.py")



headLines = []
js = ""
pageName = 'login'
if constants.compressJs:
  js += commonCjsIncludes()+  cjsForPage(pageName)
else:
  js +=  commonJsIncludes() + jsForPage(pageName)

headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "No new users for now"


bodyText = """

  <p>
  ImageDiver is in beta, and  limiting the rate at which new users sign up. Sorry, but the current limit has been reached. The limit
  will be raised periodically, so please check back. Thanks! </p>
</div>
"""

#def genStdPage(webin,pageName,options=None,pageTitle=None,compressJs=None,staticSize=False):

def emitPage(webin):
  uCount = dynamo.getCount('/user/count')
  print "USER COUNT ",uCount
  opts = {}
  if uCount >= constants.maxUsers:
    opts["hit_limit"]=1
  return gen.genStdPage(webin,'login',opts,'login',staticSize=True)

  return gen.genDynPage(webin,js,{},opts,headLines,pageTitle="Log In")



 
  

