
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse,htmlResponse

import constants
from constants import jsForPage,cjsForPage
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
  txt = """
<head>
    <link rel="stylesheet" type="text/css" href="/css/imagestyle.css"/>
</head>


<body>
<script>var jQuery; // for commonJS compatability</script>
 <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
"""
  pageName = 'albums_for_image'
  if constants.compressJs:
    txt += cjsForPage(pageName)
  else:
    txt += jsForPage(pageName)
  txt += """
<script>
idv.loggedInUser='"""+str(user)+"""'

$(document).ready(page.initialize);

</script>

"""
  return htmlResponse(txt)




