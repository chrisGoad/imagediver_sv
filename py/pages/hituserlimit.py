
"""
http://neochronography.com/topic/image/astoria_1923_0
"""


import constants
execfile(constants.pyDir+"common_includes.py")



headLines = []
js = ""
pageName = 'limit'
if constants.compressJs:
  js += commonCjsIncludes()
else:
  js +=  commonJsIncludes()

headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "No new users for now"


bodyText = """

  <p>
  ImageDiver is in beta, and  limiting the rate at which new users sign up. Sorry, but the current limit has been reached. The limit
  will be raised periodically, so please check back. Thanks! </p>
</div>
"""

def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText,styleSheets=styleSheets,pageTitle="Users Limited for Beta")
  


