
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""

from WebClasses import WebResponse


import constants
constants.commonIncludes(globals())

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"HISTORY PAGE")
   
styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]

pageName = 'history'






def emitAlbumHistoryPage(webin,parsedPath,parsedQuery):
  if constants.compressJs:
    js = commonCjsInclude +  cjsForPage(pageName)
  else:
    js =  commonJsIncludes + jsForPage(pageName)
  qs = getattr(webin,"queryString",None)
  name = parsedPath.name
  if len(name) < 3:
    return gen.emitNotFound(webin)
  imowner = name[0]
  imname=name[1]
  albumname=name[2]
  albumTopic = "/album/"+imowner+"/"+imname+"/"+albumname;
  vprint("album",albumTopic)
  options = {"album":albumTopic}

  return gen.genDynPage(webin,js,{"topbarTitle":"<i>History</i>"},options,headLines)

