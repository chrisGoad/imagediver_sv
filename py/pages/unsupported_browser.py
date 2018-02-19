"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse

import constants
import model.models
models = model.models
import json
import Logr

def emitUnsupportedBrowserPage(iev):
  Logr.log("page","EMITTING ABOUT PAGE")
  pg0 = """<!DOCTYPE html>
<html>
<head>
    <title>ImageDiver</title>
    <link rel="stylesheet" type="text/css" href="/pages/imagestyle.css"/>

</head>


<body>
<div class="aboutTitleDiv">
 <span class="aboutLogo">imageDiver</span><span class="titleSpan"><i>explore the depths of high-resolution images</i></span>
</div>

<div class="unsupportedBrowser">
In versions of Internet Explorer prior to version 9, ImageDiver requires the chromeframe plugin, which can be
installed  <a href="http://www.google.com/chromeframe>here</a>. (This is because ImageDiver uses a web standard
for image display known as "html5 canvas", which is supported in all other major browsers). Alternatively,
please return with <a href="http://mozilla.com">Firefox</a>, <a href="http://www.apple.com/safari/">Safari</a>,
<a href="http://opera.com">Opera</a>, or <a href="http://google.com/chrome">Chrome</a>, or with
<a href="http://microsoft.com/ie9">version 9</a> of Internet Explorer. Thanks!
</div>
</body>
</html>
"""

  return okResponse()


def emitUnsupportedBrowserPage(webin):
