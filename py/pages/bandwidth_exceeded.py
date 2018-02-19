

import constants
import gen

styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]
jsFiles = ""
headerTitle = "ImageDiver TOS"


bodyText = """
  <center><b>Bandwidth Limit Exceeded</b></center>
  <p>
  The bandwidth allocation for this page has been temporarily exceeded. Please check back soon!
  
 </p>
</div>
"""

def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText,pageTitle="")

