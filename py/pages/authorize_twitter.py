




import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsInclude,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import gen

headLines = []
js = ""
pageName = 'authorize_twitter'
if constants.compressJs:
  js += commonCjsInclude +  cjsForPage(pageName)
else:
  js +=  commonJsIncludes + jsForPage(pageName)


def emitPage(webin):
  return gen.genDynPage(webin,js,{},None,headLines,pageTitle="Authorize Twitter Access")



 
  

