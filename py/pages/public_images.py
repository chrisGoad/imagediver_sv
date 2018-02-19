
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
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


def emitPage(webin):
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user; 
  
  pg0= gen.pageHeader(webin,"the depths of high resolution images, annotated",facebook=False) + "<body>"
  pageName = 'images'
  if constants.compressJs:
    pg0 += commonCjsInclude +  cjsForPage(pageName)
  else:
    pg0 +=  commonJsIncludes + jsForPage(pageName)

  """
  var loading = $('<div style="margin:40px"><center>LOADING...  <img src="/ajax-loader.gif"/></center></dir>');
page.loadingDiv = loading;
$('body').append(loading);
 """
  pg1 = """


idv.util.commonInit();
var jsonUrl = "/api/allImages"
idv.util.get(jsonUrl,function (rs) {
  var images = rs.value;
  $('document').ready(
    function () {
      page.initialize(images,loggedInUser,"all");
    });

});
 


</script>
</body>
</html>
"""
  otxt = pg0 + \
    "<script>" + \
     "var loggedInUser='"+str(user)+"';\n" 
  otxt += constants.emitConstants()
  otxt += pg1

  return htmlResponse(otxt)
 
  
  
  

