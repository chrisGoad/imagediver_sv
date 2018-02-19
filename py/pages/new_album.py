NOT IN USE
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




def emitPage(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  user = sess.user
  qs = getattr(webin,"queryString",None)
  qsp = urlparse.parse_qs(qs)
  im = qsp["image"][0]
  a = album.newAlbum(im,user,'')
  return redirectResponse("/topic"+a.topic+"/index.html?new=1"
 
  
  
  

