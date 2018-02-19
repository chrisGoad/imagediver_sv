
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""




#from WebClasses import WebResponse

import constants
execfile(constants.pyDir+"common_includes.py")
#constants.commonIncludes(globals())
#print jsFiles
#import constants
#from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsIncludes,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

#import gen

styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]

pageName = 'mywork'
js = ""
if constants.compressJs:
  js += commonCjsIncludes() +  cjsForPage(pageName)
else:
  js +=  commonJsIncludes() + jsForPage(pageName)



bodyText = """


<script>
idv.util.commonInit();
page.initialize(); //myimages



</script>
</div>
"""

print "JJJJs",js,constants.devVersion

def emitPage(webin):
  return gen.genStdPage(webin,'mywork','Your Content',staticSize=True)

  return gen.genDynPage(webin,js,{"topbarTitle":"<i>Your Content</i>"},{"a":"b"},headLines)

"""
def emitPage(webin):
  return gen.genHtmlPage(webin,jsIncludes,headerTitle,headLines,bodyText)



"""

