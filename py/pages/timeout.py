
import constants
import gen



bodyText = """
<script>
 document.cookie = "sessionId=deleted;userId=deleted; expires=" + new Date(0).toUTCString()+"; Domain=.imagediver.org; path=/;"
  document.cookie = "userId=; expires=" + new Date(0).toUTCString()+"; Domain=.imagediver.org; path=/;"
</script>
  <p>
  Your session has timed out. Please log in again, if you like.
 </p>
 
 
</div>
"""

def emitPage(webin):
  return gen.genHtmlPage(webin,bodyText,redirectOnTimeout=False,pageTitle = "Timeout")
