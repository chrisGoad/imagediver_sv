
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse

import constants
import store.dynamo
dyn = store.dynamo
import gen

session = getattr(constants,"session",None)

if session:
  session.deactivate()

def emitPage(webin):
  rs =  gen.pageHeader(webin,"Sign Out") + gen.pageBodyF("","",["login","logout","account"]) + """
<body>

<script>

document.cookie = "sessionId=deleted; expires=" + new Date(0).toUTCString();


</script>
<div class="infoDiv" style="color:black;background-color:#aaaaaa">You are now logged out. Come back soon!</div>

</body>
</html>
"""
  return okResponse()

 
  

