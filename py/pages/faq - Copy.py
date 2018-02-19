

import constants
import gen


 
headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "FAQ"

theFaqLines = {}
def faqLine(lnk,txt):
  global theFaqLines
  theFaqLines[lnk] = txt
  return '<li><a href="#{0}">{1}</a></li>\n'.format(lnk,txt)

def faqLines(items):
  rs = ""
  for i in items:
    rs += faqLine(i[0],i[1])
  return rs

def faqValueHead(lnk):
  q = theFaqLines[lnk]
  return '<p class="answerHead"><a name="{0}"></a>Q: {1}</p>\n'.format(lnk,q)
  
bodyText = """
  <ul>
  """+faqLines([
  ("what","What is ImageDiver?"),
  ("whatSize","What range of image sizes is suitable for annotation?"),
  ("tumblr","ImageDiver and Tumblr"),
  ("explanation","What is an Album?"),
   ("embed","Can I embed ImageDiver albums into other web pages?"),
  ("otherimage","Can I annotate other users' images?"),
   ("howstart","What is a quick way to get started?"),
    ("creole","Can I include links in the captions and descriptions of snapshots?"),
    ("json","Are the contents of albums available in machine-readable form?"),
  ("s3",'I notice that published albums are at the domain "s3.imagediver.org". Why?'),
   ("tech",'What is your technology stack?'),
("free","Is ImageDiver free?"),
  ("limits","Are there bandwidth or storage limits during the beta test period?"),
("who","Who did this?")

  ])+"""
  </ul>
 <p> The Details. How to: </p>
 <ul>
 """+faqLines([
  ("import","Import an Image"),
    ("createAlbum","Create an Album"),
    ("editAlbum","Edit an album's properties, or delete it."),
    ("addSnap","Add a snap to an album, or edit one that is already present."),

  ])+"""</ul>
 <hr/>
"""+faqValueHead("what")+ """
<p>ImageDiver  is a tool for annotating high resolution images. See the <a href="http://s3.imagediver.org/topic/album/4294b0e/the_dutch_proverbs/1/index.html">this</a> example.</p>
<p>It can also be seen as a second stage or recursive camera, which extracts  images from within existing images rather than from the outside world.  
It is rare that any image is perceived in its full detail without  diligent study. Extracting and framing subimages, with or without annotation,
yields new perception. 
</p>

"""+faqValueHead("whatSize")+"""
<p>ImageDiver is useful for explaining the contents of images of quite low resolution. The image in this  <a href="http://s3.imagediver.org/topic/album/4294b0e/one_dollar_bill_5/1/index.html">example</a> is only 3 megapixels in size. Images of  20 or 30 megapixels are suitable for very extensive and detailed annotation.
<a href="/topic/image/4294b0e/the_dutch_proverbs/index.html">The Dutch Proverbs</a> is  less than 23 megapixels. </p>
<p> The upper limit is currently 1/2 gigapixel, due to the infrastructure on which ImageDiver runs. If you have a project that requires images of greater  resolution, please <a href="mailto:support@imagediver.org">contact</a> ImageDiver.</p>

"""+faqValueHead("tumblr")+"""
<p>ImageDiver integrates with <a href="http://tumblr.com">Tumblr</a> in two ways. First, your Tumblr account can be used to log in to ImageDiver without the need for
separate registration. Second, you can post your annotated snapshots to Tumblr in a few clicks. So, the process of blogging details from an an image is very quick.




"""+faqValueHead("explanation")+"""
<p>An <i>Album</i> is a collection of annotated subimages (also called <i>snapshots</i>), taken from an image.  Each image may have many associated albums. You don't really need to worry about albums to begin with, because an album is created for you for each image you wish to annotate. But if you do wish to have more than one set of annotations for the same image, albums allow this.


"""+faqValueHead("embed")+"""
<p>Yes. Any public album can be embedded into any web page, by anyone (no need to be an ImageDiver account holder). Click the "embed" button at the bottom of an album page. There are two options: the whole album can appear within an iframe, or a smaller image can be embedded, which when clicked, opens the album in a lightbox.</p>


"""+faqValueHead("otherimage")+"""
<p>Yes. You can annotate any image which any one has made public. See the <a href="/gallery">images</a> page</p>






"""+faqValueHead("creole")+"""
<p>Yes, and some formatting too. All text content in ImageDiver (album and image descriptions as well) uses
<a href="http://en.wikipedia.org/wiki/Creole">Markdown</a>, a standard format used by Tumblr and Wordpress. For example, this is what a Markdown looks like: [A famous painting](http://en.wikipedia.org/wiki/The_Scream).


"""+faqValueHead("json")+"""
<p>Yes.  If you open the "album details" for any album, you will see a link to a JSON representation of the album's content.
 The form of the data should be should be self-explanatory to those familiar with JSON, except for one detail. The encoding of the area covered by  a snap looks like this: </p> 
    <table id="jsonTable">
      <tr><td>{"coverage": </td><td>{"corner": {"x": 0.25, "y": 0.5},</td></tr>
      <tr><td></td><td>"extent": {"x": 0.01, "y": 0.02}}</td></tr>
    </table>
<p>The x and y values are normalized to the width of the image. So, in this example, if the image is 1000 pixels wide,
the upper left corner of the snap is at pixel coordinates (250,500), its width is 10 pixels, and its height is 20 pixels.</p>




"""+faqValueHead("s3")+"""
<p>"S3" refers to Amazon's <a href="http://aws.amazon.com/s3/">simple storage service</a>. Published albums reside on this service, and have no dependency on the ImageDiver website. This makes them invulnerable to failures except those of S3 itself (a very rare occurence). In the near future, it will be possible to export albums to any server. 




"""+faqValueHead("tech")+"""
<p><a href="http://http://aws.amazon.com/ec2/">Amazon EC2</a> for servers, <a href="http://aws.amazon.com/dynamodb/">DynamoDB</a> and <a href="http://www.sqlite.org/">SQLite</a> for data storage, <a href="http://python.org">Python</a> for server-side programming,  <a href="http://www.pythonware.com/products/pil/">Python Image Library</a> for image manipulation. On the client: <a href="http://jquery.com/">jQuery</a>  and  <a href="http://en.wikipedia.org/wiki/Canvas_element">HTML5 Canvas</a> for  all modern browsers, with <a href="http://en.wikipedia.org/wiki/Adobe_Flash">Flash</a>  for older browsers lacking canvas support (IE7, IE8 - IE6 is not supported).</p>


"""+faqValueHead("free")+"""<p>ImageDiver is a recent development, and in beta test (testing by external users). During the beta test phase, it will be free. Later, it may be necessary to recoup bandwidth, storage, and server costs.   Pricing will be proportional to bandwidth and storage requirements, at approximately 15 cents for one gigabyte of bandwidth, or gigabyte of storage per month. There will be a free tier, also, which should be adequate for most users.  Also, as mentioned in an earlier item, there will be an option for exporting your content, so that it can be served from wherever you like, with no charges from ImageDiver.  </p> 



"""+faqValueHead("limits")+"""<p>Yes: 2 gigabytes of storage, and 5 gigabytes of bandwidth per month.
Please <a href="mailto:support@imagediver.org">contact</a> ImageDiver to arrange for higher limits. </p> 

"""+faqValueHead("who")+"""<p>ImageDiver was designed and implemented by <a href="http://www.linkedin.com/pub/chris-goad/1/a39/759">Chris Goad</a>.</p> 


<hr/><p>Detailed instructions:</p>
"""+faqValueHead("import")+"""<p>The "my content" page, linked to in the top bar, includes an "Import" button. (note: "my content"  will not appear in the top bar  unless you are logged in). </p>


"""+faqValueHead("createAlbum")+"""<p>Buttons for creating  albums for your own images appear in the "my content" page. For public images from other users, go to the "images" page to find the image, thence to the page for the image,  and click its "Create Album" button.</p>



"""+faqValueHead("editAlbum")+"""<p>Select "album details" from the top bar when viewing the album's page. Edit and delete buttons appear there. Similarly for images. </p>



"""+faqValueHead("addSnap")+"""<p>The working (as opposed to published) version of each album page  has an "add snap" button. Unpublished albums are accessible via the "my content" page. When a snap is selected, edit and delete buttons appear above the snap. </p>

<hr/>
</div>
"""

def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText,styleSheets=styleSheets,pageTitle="FAQ")

