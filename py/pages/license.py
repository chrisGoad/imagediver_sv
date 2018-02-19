

import constants
import gen

headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "ImageDiver TOS"


bodyText = """
  <center><b>License</b></center>
  <p>
  You may choose to allow redistribution of an image that you import into ImageDiver, by asserting the appropriate license. If you assert no license, then you retain rights to the image, and prohibit all redistribution, as specified in the Terms of Service. If you choose to assert a license, you also assert your legal authority to do so. The links below provide details on the license options: </p>

<p><a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a></p>
<p><a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0</a></p>
<p><a href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0</a></p>

</div>
"""

def emitPage(webin):
    return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText,styleSheets=styleSheets)


