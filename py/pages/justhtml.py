NOT IN USE
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebResponse import WebResponse
import constants
import gen

#pageBody = gen.pageBody

oldAbout = """

<p>ImageDiver supports web display of high resolution images  and  the creation of albums
 of annotated sub-images. </p>
 
 
<p>Technology for exploration of high resolution imagery is of interest beyond the realm of images captured with modern high resolution techniques, such as <a href="http://gigapan.org">GigaPan</a>.
For example, historical photographs constitute an extensive  source of high resolution imagery.
The dimensions of exposed emulsion for photographs taken in the late 19th and early 20th centuries were often high - for example, eight by eleven inch plates were common, and there were <a href="http://en.wikipedia.org/wiki/Cirkut">panoramic cameras</a> whose individual exposures measured more than twenty square feet. Consequently, the effective pixel resolution was very high too, sometimes in the gigabyte range. </p>


 
<p>Nor is the relevance of imageDiver  restricted to  very high resolution images. For example the first image
in the imageDiver gallery  is a 14 megabyte jpeg of a painting - The Garden of Earthly Delights by Hieronymus Bosch;  this is not particularly high resolution by current standards.
When we see any image, we imagine that we immediately perceive everything that is there, at least everything bigger than a speck.
This is a delusion, as is shown by visual puzzles such as "Where's Waldo?", or "Find the differences between these
two pictures". An imageDiver album brings to light content hidden within an image - hidden from perception if not from sight.  </p>

<p> 
If you have a project for which you think imageDiver would be useful,   please contact:</p>

<p><a href="mailto:support@imagediver.com">support@imagediver.com</a></p>

 

</body>
</html>
"""
def emitAboutPage(webin):
  pg0 =  gen.pageHeader(webin,"imageDiver") + pageBody + """

<div class="infoDiv">
<p> ImageDiver is a project by Chris Goad.  If you have an image for which ImageDiver would be useful, please <a href="/contact">contact me</a>. You can
add your own snapshots  once I set you up.</p>
<p>Any ImageDiver album can be packaged as a directory of html, javascript, and image files, which can be dropped onto any web server with no dependency
on the ImageDiver server. No code
installation is required.</p>
<p>A word about motivation: there are other sites that enable annotation of sub-images, for example gigapan and the google art project, but it seemed to me that the sub-images might be given more respect,
in screen real estate, in flexibility of aspect ratio, in general treatment. But judge for yourself.</p>
</div>
</body>
</html>
  """


  return WebResponse("200 OK","text/html",pg0);
  
  
   # pg0 = pageTop + """


def emitMessage(webin,msg):
  pg0 =  gen.pageHeader(webin,"imageDiver") + gen.pageBodyF("","") + """
 <div class="infoDiv">

 <p>{0}</p>
 

</body>
</html>
""".format(msg)
  return WebResponse("200 OK","text/html",pg0);

def emitNoSuchPage(webin):
  return emitMessage(webin,"<p>No such page</p>")

def emitOverCapacity(webin):
  pg0 = pageTop + """
<div class="infoDiv">

 <p>Apologies.  Imagediver is a non-commercial site that I maintain at my own expense. The recent use of the site has
 been so heavy that my budget for bandwidth charges (from Amazon S3 where the images are stored) has been exceeded. Please
 check back soon.</p>
 

</body>
</html>
"""

  return WebResponse("200 OK","text/html",pg0);

def emitUnsupportedBrowserPage(webin,iev):
  pg0 =  gen.pageHeader(webin,"imageDiver") + """
<div class="infoDiv">
ImageDiver does not support versions of Internet Explorer prior to  8 (and yours is version """+str(iev)+"""). Please update your Internet Explorer version.
 Alternatively,
return with <a href="http://mozilla.com">Firefox</a>, <a href="http://www.apple.com/safari/">Safari</a>,
 or <a href="http://google.com/chrome">Chrome</a>. </p>

<p>Thanks!<p>

 </div>
</body>
</html>
"""
  return WebResponse("200 OK","text/html",pg0);
  



def emitContactPageOld(webin):
  pg0 =  gen.pageHeader(webin,"imageDiver") + pageBodyF("""
<script type="text/javascript" src="/lib/util.js"></script>
  ""","""
  var cd = $('.infoDiv');
 
  cd.append('<p>All comments are welcome. If you have an image which would benefit from the ImageDiver treatment, '+
  'please let me know, and I can set you up to create your own albums, which can be hosted at ImageDiver, or at your '+
  'your own servers (no software installation needed; an album is just HTML, JavaScript, and image files).</p> ';
  var emailLine = $('<p>Your email (if you wish a response):</p>');
  var emailInput = $('<input type="text" size="50"></input>');
  cd.append(emailLine);
  emailLine.append(emailInput);
  var txa = $('<textarea rows="10" cols="60"></textarea>');
  txa.css("color","grey");
  cd.append(txa);
  var buttonDiv = $('<div>');
  cd.append(buttonDiv);
  var sendButton = $('<input type="button" value="Send"></input>');
  buttonDiv.append(sendButton);
  function sendMsg() {
    var email = emailInput.val();
    var msg = txa.val();
    idv.util.post("/api/contact",{email:email,msg:msg},function (rs) {
      cd.html("<center>Thanks!</center>");
    });
  }
  sendButton.click(sendMsg);
  cd.append("<p>I will use your email address only to communicate with you, and will not share it with anyone.</p><p>Thanks!</p><p>Chris Goad</p>");
  """) + """
 <div class="infoDiv"></div>
</body>
</html>
"""
  return WebResponse("200 OK","text/html",pg0);
  
"""

  cd.append('<p>If you have an image which would benefit from the ImageDiver treatment, '+
  'please let me know (ImageDiver albums can be hosted at any server, without dependencies or software installation). Other questions, comments, and complaints are welcome.</p>'+
  '<p>A word about motivation: I wished to show sub-images more respect - in screen real estate, in flexibility of aspect ratio, in general treatment - '+
  ' than provided by  systems such as GigaPan and the Google Art Project.</p>');
"""

def emitContactPage(webin):
  pg0 =  gen.pageHeader(webin,"imageDiver") + gen.pageBodyF("""
<script type="text/javascript" src="/lib/util.js"></script>
  ""","""
  var cd = $('.infoDiv');
  cd.append('Questions, comments, complaints, and ideas for projects are welcome.  '+
  'ImageDiver albums can be hosted at any server, without dependencies or software installation.');
  var emailLine = $('<p>Your email (if you wish a response):</p>');
  var emailInput = $('<input type="text" size="50"></input>');
  cd.append(emailLine);
  emailLine.append(emailInput);
  var txa = $('<textarea rows="10" cols="60"></textarea>');
  //txa.css("color","grey");
  cd.append(txa);
  var buttonDiv = $('<div>');
  cd.append(buttonDiv);
  var sendButton = $('<input type="button" value="Send"></input>');
  var sending = $('<span></span>');
  buttonDiv.append(sendButton);
  buttonDiv.append(sending);
  function sendMsg() {
    var email = emailInput.val();
    var msg = txa.val();
    sending.html("Sending ...");
    idv.util.post("/api/contact",{email:email,msg:msg},function (rs) {
      cd.html("<center>Thanks!</center>");
    });
  }
  sendButton.click(sendMsg);
  cd.append("<p>I will use your email address only to communicate with you, and will not share it with anyone.</p><p>Thanks!</p><p>Chris Goad, ImageDiver author</p>");
  ""","contact") + """
 <div class="infoDiv" style="background-color:#aaaaaa">
 </div>
</body>
</html>
"""
  return WebResponse("200 OK","text/html",pg0);
  
  
def emitWikipediaNotes(webin):
  pg0 =  gen.pageHeader(webin,"imageDiver") + """
  <div class="infoDiv" style="color:black;background-color:#aaaaaa">
                                                             
<p><b>Ideas for integration of ImageDiver with Wikipedia.</b></p>

<p>Image annotation fits perfectly into the  Wikipedia model: many annotations constitute factual information which can benefit just as
much from Wikipedia's community editing process as other varieties of content.
Specialized viewers, such as ImageDiver,  can contribute by making  navigation and understanding of  annotionations   easier for the reader, particularly if the annotations are numerous. Consider the <a href="http://en.wikipedia.org/wiki/Netherlandish_Proverbs">Wikipedia page</a> about Pieter Bruegel the Elder's painting, "The Dutch Proverbs", and the corresponding <a href="http://s3.imagediver.org/topic/album/cg/The_Dutch_Proverbs/1/index.html">ImageDiver page</a>. Note that the ImageDiver page allows the reader to see at a glance where  illustrations of proverbs appear in the painting. The same kind of understanding can be gleaned from the table of sub-images in the Wikipedia page, but only with substantial effort.</p>
 


<p>
The transfer between  Wikipedia and ImageDiver  can (and has) been done manually, and this seems to me to be a worthwhile effort on behalf of the Wikipedia readership in the case of images with much note-worthy detail.
If over time, the images to which this idea applies are found to be numerous, automation is feasible. Suggestions follow. None of these is specific to ImageDiver - any other tool for displaying image annotations can benefit equally.</p>

<p>
The authoritative source of the content should remain within Wikipedia, where it is managed via the usual community process. The requirement is that the data needed by viewers be present in the Wikitext.
  This data consists of the coordinates of the extracted images, and enough regularity in the formulation of annotations to allow an automated tool to pick them out of the Wikitext.</p>
  </p>
<p>
sub-image coordinates can be included as a named argument to the normal
wikipedia template for describing a sub-image: <a href="http://en.wikipedia.org/wiki/Template:Extracted_from">Template:Extracted_from</a>.
Simply inserting this into the Wikitext in the form </p>
<p><b>|coordinates = upperLeftX,upperleftY,xExtent,yExtent</b> </p>
<p>is benign - arguments that do not appear in the definition of a template are ignored. I have applied this idea to a few images which
I have extracted and added to Wikipedia.
See <a href="http://en.wikipedia.org/wiki/File:Detail_-_Torquetum_-_from_The_Ambassadors_-_Holbein.jpg">this image page</a>  for example (and you will need to view the Wikitext to see the coordinates).
</p>

<p>
Picking out captions of extracted images can be done via a template designed for the purpose.  Here is an example use: </p>
<p><b>{{extractedImageCaption|from_image=example.jpg|caption=A sample caption}}</b></p>

<p>This template would evaluate to the caption - that is, its effect is only to assert captionhood. This scheme would leave free the placement of captions within the Wikitext. I have not yet implemented anything along these lines.
</p>

<p>
There is potential utility in going the other direction: in using ImageDiver as a tool which aids in creation of Wikipedia pages containing extracted images. ImageDiver has a simple user interface for defining extracted images, and associated annotations. It would be possible, using the Wikimedia API, to automate the submission of extracted images to Wikipedia, which is a tedious process if done by hand. Sending text annotations back to Wikipedia would be possible too, if a uniform scheme for placement of the captions in Wikitext were available (and there could be a library of such options). </p>

 </div>
</body>
</html>
"""
  return WebResponse("200 OK","text/html",pg0);

  
def emitWhy(webin):
  pg0 =  gen.pageHeader(webin,"imageDiver") + gen.pageBodyF("","",[{'id':'contact','text':'contact','url':'contact'}]) + """
  
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
  """

Examples of mistakes that can and have been made: a scheme for navigating annotated sub-images will soon become annoying if a time-consuming animated zoom is needed to inspect each sub-image, and if visiting a separate webpage is needed to see its description. Sub-images must not be constrained to a single aspect ratio (ratio of height to width). If annotation is the main point, adequate screen real estate is needed for this aspect.
These are only a few of the  detailed considerations that are crucial to usability, and which have been taken into account in ImageDiver's design. 

Zoomability of the image is an essential ingredient, but not the main one. The treatment of annotation is the focus.
<p>ImageDiver  provides a way  to  annotate high resolution images &mdash; to exhibit and describe the content that appears deep within them to a web audience. 
The details matter, and the aim in the development of ImageDiver has been to get the details right. Examples: half of the screen real estate is devoted to display of sub-images,  supporting rapid scrolling through the whole set, a clear view of the selected sub-image, and room for descriptive text in addition to a caption. Aspect ratios (ratio of height to width) of sub-images are unconstrained. Outlines showing where the sub-images within the main image appear at the viewer's option.</p>

In the design of image diver, getting the details the annotation aspect has not been treated as a 

if sub-images cannot be seen adequately without an animage and the aim in the development of ImageDiver has been to get the details right. Examples: half of the screen real estate is devoted to display of sub-images,  supporting rapid scrolling through the whole set, a clear view of the selected sub-image, and room for descriptive text in addition to a caption. Aspect ratios (ratio of height to width) of sub-images are unconstrained. Outlines showing where the sub-images within the main image appear at the viewer's option.</p>
In so far as the design is successful, ImageDiver will be useful tool for annotating paintings, architectural and historical photos, and the many other kinds of images whose inner content is worth explaining.

These design decisions were dictated </p>

Imagediver's emphasis is on doing a good job of annotation, not just on providing zoomability.


<p>ImageDiver  provides a means for  annotating high resolution images, for exhibiting and describing the content that appears deep within them to a web audience. 
This sounds simple enough, but the details matter, and the aim in the development of ImageDiver has been to get the details right. Of course you can judge for yourself if the aim has been met, but I will mention a few of these details. Half of the screen real-estate is devoted to display of sub-images,  supporting rapid scrolling through the whole set, a clear view of the selected sub-image, and room for than more than a line of descriptive text. Aspect ratios (ratio of height to width) of sub-images are arbitrary. Outlines showing where the sub-images within the main image appear at the viewer's option.</p>


<p>ImageDiver  provides a means for  annotating high resolution images, for exhibiting and describing the content that appears deep within them.
This sounds simple enough, but the details matter, and the aim in the development of ImageDiver has been to get the details right. Half of the screen real-estate is devoted to display of sub-images, supporting rapid navigation through the whole set, and a clear view of each sub-image  fast to navigate through the sub-images of interest, and enough screen real-estate should be allocated to each sub-image to make it clearly visible (after the first few times, it is arduous and distracting to endure an animated zoom to see clearly what each sub-image is about). Aspect ratios (ratio of height to width) of sub-images must be arbitrary.</p>

<p>The motivation behind ImageDiver is to get the  details right, thereby producing a really usable tool for annotating paintings, architectural and historical photos, and the many other kinds of images whose inner content is worth explaining to a web audience.</p>

"""
  return WebResponse("200 OK","text/html",pg0);

def emitEmbedTest(webin):
   pg0 =  gen.pageHeader(webin,"imageDiver") + """
 <iframe src="http://s3.imagediver.org/topic/album/cg/The_Ambassadors/1/index.html?embed=true" width="700" height="450"></iframe>   """
   return WebResponse("200 OK","text/html",pg0);
   
   

def emitLikeButtonTest(webin):
  pg0 = """
<html>
<head>
<meta property="fb:app_id" content="252341458175463"/>
<link rel="canonical" href="http://dev.imagediver.com/like_button_test">


<meta property="og:title" content="The Dutch Proverbs" />
<meta property="og:type" content="website" />
<meta property="og:url" content="http://dev.imagediver.org/like_button_test" />
<meta property="og:image" content="http://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Pieter_Bruegel_the_Elder_-_The_Dutch_Proverbs_-_Google_Art_Project.jpg/320px-Pieter_Bruegel_the_Elder_-_The_Dutch_Proverbs_-_Google_Art_Project.jpg" />
<meta property="og:site_name" content="ImageDiver" />
<meta property="fb:admins" content="614841860" />

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
</head>
<body style="background-color:grey;color:white;margin:30px">

<script>
var facebookLikeButton = $('<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fdev.imagediver.org%2Flike_button_test&amp;send=false&amp;layout=box_count&amp;width=250&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=90&amp;appId=252341458175463" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:250px; height:90px;" allowTransparency="true"></iframe>');



$(document).ready(function () {
 //$('.FBB').append(facebookLikeButton);
  //$('.FBB').append($('<div>]</div>'));
});
</script>


<center><p style="font-size:14pt">This is a test of the Facebook like button. Please pardon and ignore! Thanks - chris</p>
<div class="FBB" style="background-color:white;width:450px;">
<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fdev.imagediver.org%2Flike_button_test&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=450&amp;appId=252341458175463" scrolling="no" frameborder="0" style="border:none; overflow:hidden; left:0px;width:450px; height:50px;" allowTransparency="true"></iframe>
</div>
</center>

"""
  return WebResponse("200 OK","text/html",pg0);


"""
http://www.facebook.com/plugins/like.php?href&amp;send=false&amp;layout=button_count&amp;width=50&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp;appId=252341458175463
"""
   
  

