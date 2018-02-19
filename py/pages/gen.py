
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse,redirectResponse

from constants import jsFiles,toJsIncludes,toJsInclude,commonCjsIncludes,commonJsIncludes,jsForPage,cjsForPage,jsPreamble

import constants
import json
import misc
import traceback



verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"GEN")
   
    
def metaTags(desc):
  return """
<meta name="description" content=""" + '"'+desc+'"'+"""/>
"""

def pageHeader(title,description=None,headLines=None,styleSheets=None):
  if title:
    description = title
  else:
    description = "the depths of high-resolution images, annotated"
  if not title: title = "ImageDiver"
  if styleSheets == None:
    styleSheets = ["/css/imagestyle.css","/css/ui-darkness/jquery-ui-1.8.21.custom.css"]
  ss = ""
  for st in styleSheets:
    ss += '<link rel="stylesheet" type="text/css" href="'+st+'"/>\n'
  rs = """<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>"""+title+"""</title>"""+metaTags(description)+ss
  if headLines:
    for hl in headLines:
      rs += hl +"\n"
  rs += """
<script src="/ncjs/modernizr.custom.43258.js"></script>
</head>"""
  return rs
  
  



def loggedIn():
  return bool(getattr(constants,"session",False))
 


# for pages without their own js initializers

def genTop(topbarOptions):
  vprint("genTop","compress",constants.compressJs)
  rs = """
<body>
<script>
var jQuery;
</script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script type="text/javascript" src="/ncjs/jquery-ui-1.8.21.custom.min.js"></script>
"""
  if constants.compressJs:
    rs += toJsInclude('/ncjs/staticpage.js')
  else:
    rs += toJsInclude('/lib/util.js')
    rs += toJsInclude('/js/topbar.js')
  rs += """
<script>
var topOptions = """+str(topbarOptions)+""";
$(document).ready(function () {
  idv.topbar.genTopbar(null,topOptions);
  $('.topDiv').css({width:"750px","margin-bottom":"30px","margin-left":"auto","margin-right":"auto","margin-top":"20px"});
  
});
</script>
"""
  return rs

def defaultPageTitle(pageTitle):
  if pageTitle==None:
    pageTitle = "the depths of high-resolution images, annotated"
  if pageTitle == "":
    pageTitle = "<span class='blend'>explore the depths of high-resolution images</span>";
  return pageTitle


def handleTimedOut(webin):
  if not webin: return None
  sess = webin.session;
  if sess:
    timed_out = getattr(sess,"timed_out",None)
    if timed_out:
      return redirectResponse("/timeout")
  return None


""" if webin is None, return the page text instead of serving it """
def genHtmlPage(webin,txt,redirectOnTimeout=True,styleSheets=None,pageTitle=None):
  vprint("genHtmlPage")
  if redirectOnTimeout:
    tmo = handleTimedOut(webin)
    if tmo: return tmo
  pageTitle = defaultPageTitle(pageTitle)
  opts = {"title":pageTitle}
  optsjs = json.dumps(opts)
  rs =  pageHeader(pageTitle,styleSheets=styleSheets) + genTop(opts) + """
  
<div class="topDiv">
    <div class="topDivTop"></div>
    <div class="titleDiv">{0}</div>
</div>
  <div class="infoDiv">

""".format(pageTitle) + txt + """
</body>
</html>
"""
  if webin:
    return WebResponse("200 OK","text/html",rs)
  else:
    return rs



def genDynTop(jsFiles,options,staticSize=False):
  optionsJS = json.dumps(options)
  vprint("JSFILES",jsFiles)
  if staticSize:
    adjt = """
      $('.topDiv').css({width:"750px","margin-bottom":"30px","margin-left":"auto","margin-right":"auto"});
    """
  else:
    adjt = ''

  rs = """
<body>

""" + jsFiles + """
<script>
$(document).ready(function () {"""+adjt+"""
  page.initialize("""+optionsJS+""")
});
</script>
"""
  return rs

# pages have two possible structures. dynamically sized pages have <outerDiv><topdiv/></outerDiv> staticSize pages have <topdiv><infodiv/><topdiv>
def genDynPage(webin,jsFiles,options,redirectOnTimeout=True,pageTitle =None,body='',staticSize=False):
  vprint("genDynPage")
  if webin and redirectOnTimeout:
    tmp = handleTimedOut(webin)
  rs =  pageHeader(pageTitle) +  genDynTop(jsFiles,options,staticSize)
  if staticSize:
    rs += """
  <div class="topDiv">
    <div class="topDivTop"></div>
    <div class="titleDiv">{0}</div>
  </div>
  <div class="infoDiv">
  </div>
""".format(defaultPageTitle(pageTitle))
  else:
    rs += """
  <div class="outerDiv">
    <div class="topDiv">
      <div class="topDivTop"></div>
      <div class="titleDiv">{0}</div>
    </div>
  </div>
""".format(defaultPageTitle(pageTitle))
  
  rs += body + """
</div>
</body>
</html>
"""
  vprint("RS",rs)
  if webin:
    return WebResponse("200 OK","text/html",rs);
  else:
    return rs



# page described in constants.py

def genStdPage(webin,pageName,options=None,pageTitle=None,compressJs=None,staticSize=False):
  if compressJs==None:
    cjs = constants.compressJs
  else:
    cjs = compressJs
  if cjs:
    jsFiles = commonCjsIncludes() +  cjsForPage(pageName)
  else:
    jsFiles =  commonJsIncludes() + jsForPage(pageName)
  if options==None: options = {}
  return genDynPage(webin,jsFiles,options,pageTitle=pageTitle,staticSize=staticSize)



def emitMessagePage(webin,pageTitle,txt):
  bodyText = """
  <center><b>"""+pageTitle+"""</b></center>
  <p><center>"""+txt+"""</center></p>
"""
  return genHtmlPage(webin,bodyText,pageTitle=pageTitle)

def emitNotFound(webin):
  vprint("NOT FOUND")
  return emitMessagePage(webin,"404","No such page");
  
def emitUnsupportedBrowserPage(webin,iev):
  return emitMessagePage(webin,"Unsupported Browser","Versions of Internet Explorer prior to 7 are not supported. Please try a newer version of IE, or Chrome, Firefox, or Safari");

