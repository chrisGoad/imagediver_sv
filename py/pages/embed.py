
import constants
from WebClasses import WebResponse,okResponse,failResponse,redirectResponse


headLines = []
styleSheets = ["/pages/faq.css"]

jsFiles = ""
headerTitle = "ImageDiver EMBED TEST"
"""

http://dev.imagediver.org/embed.py

"""

rs = """
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>ImageDiver EMBED TEST</title>
<meta name="description" content="the depths of high-resolution images, annotated"/>
<body>

HO HO
<p>
<script type="text/javascript" src=" http://s3.imagediver.org/widget.js?album=4294b0e.the_ambassadors.1&width=400"></script>
</p>
<script type="text/javascript" src=" http://s3.imagediver.org/widget.js?album=4294b0e.one_dollar_bill_4.1&width=500"></script>
</p>
<p>
<script type="text/javascript" src="http://s3.imagediver.org/widget.js?album=4294b0e.the_ambassadors.1&width=200"></script>
</p>
<p>
<script type="text/javascript" src="http://s3.imagediver.org/widget.js?album=4294b0e.astoria_1923.1&width=201"></script>
</p>
<!--
<script>

$(document).ready(function () {
  $('#popLightbox').click(function () {
  var url = "http://s3.imagediver.org/topic/album/4294b0e/Saint_Francis_Bellini/1/index.html";
  lib.popLightbox(url);
  //page.popLightbox();
 // page.lightbox.loadUrl();
  });
  });
</script>
<body>
<span id="popLightbox">THE BUTTON</span>
-->
</body>
</html>
"""


def emitPage(webin):
    return  WebResponse("200 OK","text/html",rs);  

