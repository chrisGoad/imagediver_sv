
from WebClasses import WebResponse,okResponse,failResponse
"""
http://dev.imagediver.org/test_album?topic=/4294b0e/young_knight_in_a_landscape/1/index.html
"""
pg = """
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>ImageDiver</title>
<meta name="description" content="the depths of high-resolution images, annotated"/>
<link rel="stylesheet" type="text/css" href="/css/imagestyle.css"/>
<link rel="stylesheet" type="text/css" href="/css/ui-darkness/jquery-ui-1.8.21.custom.css"/>

<script src="/ncjs/modernizr.custom.43258.js"></script>
</head><body>
<script>var jQuery; </script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript" src="/ncjs/jquery-ui-1.8.21.custom.min.js"></script>
<script type="text/javascript" src="/ncjs/swfobject.js"></script>
<script type="text/javascript" src="/pagedown/Markdown.Converter.js?stamp=1"></script>
<script type="text/javascript" src="/lib/util.js?stamp=1"></script>
<script type="text/javascript" src="/lib/geom2d.js?stamp=1"></script>
<script type="text/javascript" src="/lib/image.js?stamp=1"></script>
<script type="text/javascript" src="/js/image_2.1.js?stamp=1"></script>
<script type="text/javascript" src="/js/topbar.js?stamp=1"></script>
<script type="text/javascript" src="/js/image_2.2.js?stamp=1"></script>
<script type="text/javascript" src="/pages/common.js?stamp=1"></script>
<script type="text/javascript" src="/pages/zoomslider.js?stamp=1"></script>
<script type="text/javascript" src="/pages/layout.js?stamp=1"></script>
<script type="text/javascript" src="/pages/clickable.js?stamp=1"></script>
<script type="text/javascript" src="/pages/panel.js?stamp=1"></script>
<script type="text/javascript" src="/pages/snaparray.js?stamp=1"></script>
<script type="text/javascript" src="/pages/zoom_to_snap.js?stamp=1"></script>
<script type="text/javascript" src="/pages/selectedsnap.js?stamp=1"></script>
<script type="text/javascript" src="/pages/createsnap.js?stamp=1"></script>
<script type="text/javascript" src="/pages/image_details.js?stamp=1"></script>
<script type="text/javascript" src="/pages/editimage.js?stamp=1"></script>
<script type="text/javascript" src="/pages/albumdiv.js?stamp=1"></script>
<script type="text/javascript" src="/pages/aboutimage.js?stamp=1"></script>
<script type="text/javascript" src="/pages/album.js?stamp=1"></script>
<script type="text/javascript" src="/pages/showsnaps.js?stamp=1"></script>

    <script>
    page.initialize();
    </script>
    <div class="outerDiv">
      <div class="topDiv">
          <div class="topDivTop"></div>
         <div class="titleDiv"></div>
      </div>
    </div>
    </body>
    </html>
"""

def emitPage(webin):
  return WebResponse("200 OK","text/html",pg);  


