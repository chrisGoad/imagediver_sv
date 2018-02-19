
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

print "******TEST*********"

from WebResponse import WebResponse
import constants


def pageBodyF(jsFiles,onReady):
  return  """
<body>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
""" + jsFiles + """

<script>

$(document).ready(function () {
  $('.aboutLogo').click(function () {location.href = "/";});
""" + onReady + """
});
</script>
<div class="aboutTitleDiv">
 <span class="aboutLogo">imageDiver</span>
</div>
"""

print "DEFINING emitter"



def emitter(webin):
  hfile = "/mnt/ebs0/imagediverdev/py/static/test.html";
  hff = open(hfile,"r")
  hft = hff.read()
  
  pg0 =  constants.pageHeader(webin,"imageDiver")
  pg0 += hft

  return WebResponse("200 OK","text/html",pg0);
  
  
constants.emitter = emitter

