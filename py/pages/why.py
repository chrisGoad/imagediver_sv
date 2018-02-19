NOT IN USE
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebResponse import WebResponse
import constants
import gen

pageBody = gen.pageBody




  
def emitWhy(webin):
  pg0 =  gen.pageHeader(webin,"imageDiver") + gen.pageBodyF("","") + """
  
  <div class="infoDiv" style="color:black;background-color:#aaaaaa">
                                                             
<p><b>Why ImageDiver?</b></p>

<p>ImageDiver  is a tool for annotating high resolution images &mdash; for exhibiting and describing the content that appears deep within them to a web audience. I undertook the project because I felt that there was no available option that  focused adequately on this task.
</p>
<p>The details matter. An  example is allocation of screen real estate to annotation relative to the main image. If the only way to see a sub-image at decent resolution is to zoom to it, navigation to one sub-image after another will soon become annoying. Based on this consideration, and general respect for the annotation aspect, imagediver allocates half of the screen to display of sub-images, providing enough room to see successive sub-images and descriptions clearly without distraction. This is just one example  where focus on the annotation task has a decisive impact on design decisions. Another is support for sub-images of unconstrained aspect ratio (ratio of height to width). There are plenty of others.
</p>


<p>ImageDiver can also be used in the context of a free-form web page, where the main image and its sub-images are placed freely within the text of the page. (See <a style="color:blue" href="http://s3.imagediver.org/album/example.html">this</a> example). The ImageDiver machinery is deployed in a different way in this case, but still makes it easy for the viewer to see where the sub-images appear within the main image.</p>

<p>Between these two options, ImageDiver, it is hoped, will provide good support for image annotation in a  variety of contexts, such as art, architecture, science and history.</p>

<p>Chris Goad - ImageDiver author</p>

 </div>
</body>
</html>
""";
  return WebResponse("200 OK","text/html",pg0);

  

