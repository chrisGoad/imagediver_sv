
"""
http://neochronography.com/topic/image/astoria_1923_0

this is where the "annotate" button on albums leads (with ?image=X. The cookie is missing over at s3, so this has the
job of checking if the user is logged in, and if so, checking which albums are associated with the given image. If there are none,
one is created, and the user is directed there. Otherwise, albums already associated with the image are presented for selection.
"""





import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsInclude,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import gen

headLines = []
js = ""
pageName = 'annotate'
if constants.compressJs:
  js += commonCjsInclude +  cjsForPage(pageName)
else:
  js +=  commonJsIncludes + jsForPage(pageName)


def emitPage(webin):
  return gen.genDynPage(webin,js,{},None,headLines,pageTitle="Annotate")



 
  

