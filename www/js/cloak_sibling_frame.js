
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebResponse import WebResponse

import constants
import model.models
models = model.models
import json
import Logr
domain = 'http://imagediver.s3-website-us-east-1.amazonaws.com';
nocloak=""
#domain = 'http://dev.imagediver.org'; # for debugging
#nocloak="?nocloak=1"

def emitCloak(path):
  rs = """
<html>
<body style="margin:0px;padding:50px">
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script>
var br = $.browser;

$('document').ready(function () {
  function interpretMsg(e) {
    alert("hello");
    var o = $.parseJSON(e.data);
    var cmd = o.command;
    if (cmd == "navigateToPage") {
      location.href = o.arguments[0];
    }
  }
  if (br.msie && (parseFloat(br.version) < 9)) {
    alert("attach event");
    alert(document.attachEvent("message",interpretMsg));
    alert("eventAttached");
  } else {
   window.addEventListener("message",interpretMsg,false);
  }
});
</script>
<iframe id="iframe" width="100%" frameborder="0" style="border:none" height="100%" src='"""+domain+path+nocloak+"""'>
</iframe>
</body>
</html>
"""
  return WebResponse("200 OK","text/html",rs);

 
  

