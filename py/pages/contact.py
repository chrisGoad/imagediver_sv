

import constants
import gen

styleSheets = ["/css/faq.css","/css/ui-darkness/jquery-ui-1.8.21.custom.css"]

jsFiles = ""
headerTitle = "Contact"


bodyText = """
  <p style="text-align:center"> <a href="mailto:support@imagediver.org">support@imagediver.org</a> </p>
  
</div>
"""

bodyTextLoggedIn = """
  <p style="margin-left:50px"> <a href="mailto:support@imagediver.org">support@imagediver.org</a> </p>
  <p style="margin-left:50px"> or, particularly for bug reports, questions, or comments, see the <a href="/forum">forum</a>.</p>
</div>
"""



def emitPage(webin):
  sess = getattr(webin,"session",None)
  loggedIn = sess and getattr(sess,"user",None)
  if loggedIn:
    btxt = bodyTextLoggedIn
  else:
    btxt = bodyText
    
  return gen.genHtmlPage(webin,bodyText,styleSheets=styleSheets,pageTitle="Contact")



