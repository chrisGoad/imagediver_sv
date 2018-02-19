
import constants
import gen

styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]
jsFiles = ""
topbarOptions = '{title:"<i>the depths of high-resolution images, annotated",includeGallery:1}'
headerTitle = "ImageDiver Privacy Policy"


 
 
 

def emitMessagePage(webin,headerTitle,pageTitle,txt):
  bodyText = """
  <center><b>"""+pageTitle+"""</b></center>
  <p><center>"""+txt+"""</center></p>
"""
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText)




