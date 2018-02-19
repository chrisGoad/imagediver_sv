
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""


import constants
execfile(constants.pyDir+"common_includes.py")

#import constants
#from constants import jsFiles,toJsIncludes,toJsInclude,commonJsFiles,commonCjsIncludes,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

#import pages.gen
#gen = pages.gen
import model.models
models = model.models


import model.image
image = model.image
import model.album as album

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"ALBUM PAGE")
   
import urlparse


from WebClasses import WebResponse,okResponse,failResponse,htmlResponse


def genAlbumPageee(path,compressJs):
  forS3Dev = False;
  pg0= gen.pageHeader(path,"ImageDiver") + "<body>" 
  if compressJs or constants.compressJs:
    pg0 += constants.jsPreamble + cjsForPage("common") +  cjsForPage("album")
  else:
    pg0 +=  constants.jsPreamble + toJsIncludes(commonJsFiles,forS3Dev) + toJsIncludes(jsFiles['album'],forS3Dev)

  pg1 = """
<script>
page.initialize();
</script>
<div class="outerDiv">
  <div class="topDiv">
      <div class="topDivTop"></div>
     <div class="titleDiv"> </div>
  </div>
</div>
</body>
</html>
"""
  return pg0+pg1

def emitAlbumPage(webin,parsedPath,parsedQuery,forHomePage):
  a = album.AlbumD()
  otxt = a.genPage(webin.path,False)
  #snaps.closeStore(webin.pageStore)

  return  htmlResponse(otxt)
 
  
  
  

