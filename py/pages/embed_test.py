
import constants
import gen

headLines = []
styleSheets = ["/pages/faq.css"]

jsFiles = ""
headerTitle = "ImageDiver EMBED TEST"

bodyText = """
<p>Try this</p>
<iframe src="http://s3.imagediver.org/topic/album/4294b0e/Saint_Francis_Bellini/1/index.html?embed=true" width="700" height="450"></iframe>
"""

bodyText = """
<p>Try this</p>
<iframe id="imagediver" src="http://dev.imagediver.org/embed" width="200" height="200"></iframe>

"""

bodyText = """
<script type="text/javascript" src=" http://s3.imagediver.org/widget.js?album=4294b0e.the_ambassadors.1&width=200"></script>
"""

print "HOOOm"
def emitPage(webin):
    return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText,styleSheets=styleSheets)
