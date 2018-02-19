
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""


import constants
execfile(constants.pyDir+"common_includes.py")

import model.album as album

verbose = False
def vprint(*args):
  if verbose:
    misc.printargs(args,"ALBUM PAGE")
   





def emitPage(webin):
  a = album.AlbumD()
  otxt = a.genPage()
  #snaps.closeStore(webin.pageStore)

  return  htmlResponse(otxt)
 
  
  
  

