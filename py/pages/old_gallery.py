
"""
http://neochronography.com/topic/image/cg/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse,htmlResponse

import constants
from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsInclude,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import pages.gen
gen = pages.gen
import model.models
models = model.models
import json
import Logr
import model.image
image = model.image
import model.album
album = model.album



#Logr.log("home",str(im0.__dict__))



def emitPage(webin):
  Logr.log("page","EMITTING GALLERY PAGE")
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user;
  images = {}
  albums = {}


  pg0= gen.pageHeader(webin,"imageDiver") + """
<body>
"""
 
  pageName = 'gallery'
  
  if constants.compressJs:
    pg0 += commonCjsInclude +  cjsForPage("gallery") +  toJsInclude("/pages/gallery_data.js")
  else:
    pg0 +=  commonJsIncludes + toJsIncludes(jsFiles['gallery'])  + toJsInclude("/pages/gallery_data.js")
    
    
  """
  
      pg0 +=  commonJsIncludes + jsForPage(pageName)

  if constants.compressJs:
    pg0 += constants.jsPreamble + constants.toJsInclude("/cjs/common.js") +  constants.toJsInclude("/cjs/gallery.js")
  else:
    pg0 +=  constants.commonJsIncludes + constants.toJsInclude("/pages/gallery.js")
  """
  pg0 += """

<script>
$(document).ready(function () {
  page.initialize({loggedInUser:'"""+user+"""'});

});

</script>
<div class="outerDiv">
  <div class="topDiv">
      <div class="topDivTop"></div>
     <div class="titleDiv">the depths of high-resolution images, annotated</div>
  </div>
</div>

</body>
</html>
"""
  
  
  return htmlResponse(pg0)

 
"""
  def imageTopic(u,nm):
    return "/image/"+u+"/"+nm
  
  def albumTopic(u,inm,aid):
    return "/album/"+u+"/"+inm+"/"+aid
  
  def loadImage(u,nm):
    tp = imageTopic(u,nm);
    images[tp] = image.loadImageD(tp,webin.pageStore)

  def loadAlbum(u,inm,aid):
    tp = albumTopic(u,inm,aid)
    #albums[u+"_"+inm+"_"+aid] = models.loadAlbumD(tp)
    albums[tp] = album.loadAlbumD(tp,webin.pageStore)
 
  loadImage("cg","mulberry_1");
  loadAlbum("cg","mulberry_1","1");
  
  #cn["im2"] = models.loadImageD("/image/cg/mulberry_1")
  #cn["im2a0"]= models.loadAlbumD("/album/cg/mulberry_1/1");
  
  
  loadImage("cg","bathing_1")
  loadAlbum("cg","bathing_1","1")
  
  #cn["im3"] =   models.loadImageD("/image/cg/bathing_1")
  #cn["im3a0"] = models.loadAlbumD("/album/cg/bathing_1/1");
  
  
  loadImage("vh","vintage_1")
  
  #cn["im4"] =   models.loadImageD("/image/vh/vintage_1")
  
  
  loadImage("cg","astoria_1923_1")
  loadAlbum("cg","astoria_1923_1","1")
  
  
  #cn["im0"] =   models.loadImageD("/image/cg/astoria_1923_1")
  #im0a0 =   models.loadAlbumD("/album/cg/astoria_1923_1/1")
  
  loadImage("cg","astoria_2010_1")
  
  loadImage("cg","earthly_delights_1")
  loadAlbum("cg","earthly_delights_1","1")
  loadAlbum("cg","earthly_delights_1","2")
  loadAlbum("cg","earthly_delights_1","3")
  loadAlbum("cg","earthly_delights_1","4")


  loadImage("cg","The_Dutch_Proverbs")
  loadAlbum("cg","The_Dutch_Proverbs","1")

  loadImage("cg","The_Ambassadors")
  loadAlbum("cg","The_Ambassadors","1")

  #im1 =   models.loadImageD("/image/cg/astoria_2010_1")
  
  #imged =  models.loadImageD("/image/cg/earthly_delights_1")
  #imged_a0 =   models.loadAlbumD("/album/cg/earthly_delights_1/1")

  
  #im4 = models.loadImageD("/image/cg/flatiron_1")

  #impair = models.loadImagePairD("/imagepair/astoria_1923_2010_1")
"""


