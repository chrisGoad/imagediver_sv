

import constants
import gen


 
styleSheets = ["/css/faq.css","/css/ui-darkness/jquery-ui-1.8.21.custom.css"]

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
  ("whatSize","What range of image resolutions is suitable for annotation?"),
  ("tumblr","ImageDiver and Tumblr"),
  ("googleArtProject","ImageDiver and the Google Art Project"),
  ("explanation","What is an Album?"),
  ("otherimage","Can I annotate other users' images?"),
    ("creole","Can I include links in the captions and descriptions of snapshots?"),
("s3",'Can I link to my albums and snaps?'),
    ("json","Is ImageDiver content available in machine readable form?"),
   ("tech",'What is your technology stack?'),
("free","Is ImageDiver free?"),
  ("limits","Are there bandwidth or storage limits during the beta test period?"),
("who","Who did this?")

  ])+"""</ul>
 <hr/>
"""+faqValueHead("what")+ """
<p>ImageDiver  is a tool for annotating  images, including high-resolution images where zooming is relevant.
 See  <a href="http://s3.imagediver.org/topic/album/4294b0e/the_dutch_proverbs/1/index.html">this</a> example. 
 </p>
 
<!--<p>Of course, ImageDiver is not the first
 such tool (GigaPan and the Google Art Project offer related capabilities), but there are many features unique to ImageDiver which are crucial to effective documentation of contents of an image.
It is rare that any image is perceived in its full detail without  diligent study. Extracting and framing subimages, with or without annotation,
yields new perception. -->
</p>

"""+faqValueHead("whatSize")+"""
<p>ImageDiver is useful for explaining the contents of images of quite low resolution. The image in this  <a href="http://s3.imagediver.org/topic/album/4294b0e/one_dollar_bill_5/1/index.html">example</a> is only 3 megapixels in size. Images of  20 or 30 megapixels are suitable for very extensive and detailed annotation.
<a href="/topic/image/4294b0e/the_dutch_proverbs/index.html">The Dutch Proverbs</a> is  less than 23 megapixels. </p>
<p> The upper limit is currently 1/2 gigapixel, due to the infrastructure on which ImageDiver runs. If you have a project that requires images of greater  resolution, please <a href="mailto:support@imagediver.org">contact</a> ImageDiver.</p>

"""+faqValueHead("tumblr")+"""
<p>ImageDiver integrates with <a href="http://tumblr.com">Tumblr</a> in two ways. First, your Tumblr account can be used to log in to ImageDiver without the need for
separate registration. Second, you can post your annotated snapshots to Tumblr in a few clicks. So, the process of blogging details from an an image is very quick.


"""+faqValueHead("googleArtProject")+"""

 <p>  The <a href="http://http://www.googleartproject.com">Google Art Project</a> offers a capability, "User Galleries", which is related to what  ImageDiver does to a degree,
 but has a different aim: allowing users to collect together paintings that interest them into a gallery.
 The images collected can be subimages of the paintings,  but only of fixed aspect ratio (ratio of height to width), over which the user has no control.
 For this and several other reasons user galleries are  ill-suited  to ImageDiver's core capability: effective documentation of the contents of a particular
 painting (or other image).  If you'd like to see for yourself, peruse  <a href="http://www.googleartproject.com/galleries/">http://www.googleartproject.com/galleries/</a>.
 Of course, there is also the difference that ImageDiver is applicable to any image that a user cares to import.</p>
 

"""+faqValueHead("explanation")+"""
<p>An <i>Album</i> is a collection of annotated subimages (also called <i>snapshots</i>), taken from an image.  Each image may have many associated albums. You don't really need to worry about albums to begin with, because an album is created for you for each image you wish to annotate. But if you do wish to have more than one set of annotations for the same image, albums allow this.


"""+faqValueHead("otherimage")+"""
<p>Yes. You can annotate any image which anyone has made public. Go to the <a href="/images">images</a> page, click on an image, and start annotating.</p>







"""+faqValueHead("creole")+"""
<p>Yes, and formatting too. All text content in ImageDiver (snap, album,and image descriptions) supports
<a href="http://daringfireball.net/projects/markdown/basics">Markdown</a>, a standard format used by Tumblr and Wordpress, among many others. For example, this is what a Markdown link looks like:<p> [A famous painting](http://en.wikipedia.org/wiki/The_Scream).</p>




"""+faqValueHead("s3")+"""
<p>Yes. Click on the "links" button on an album page, and you will see a variety of relevant links. You might notice that all these links are at "s3.imagediver.org". "S3" refers to Amazon's <a href="http://aws.amazon.com/s3/">simple storage service</a>. All public ImageDiver content resides at S3.  This makes the public album and snap pages  invulnerable to failures except those of S3 itself (a very rare occurence). In the near future, it will be possible to export albums to any server. 




"""+faqValueHead("json")+"""
<p>Yes.  Among the links shown when you click on the "links" button on any album page are several JSON links, which
supply all of the data associated with the album, image, and  the selected snap, if any.  This data includes the coordinates
of snaps within the image.   So, the content of annotations is not locked within the ImageDiver tool, but can be used in other contexts.





"""+faqValueHead("tech")+"""
<p>Other than the aforementioned S3: <a href="http://http://aws.amazon.com/ec2/">Amazon EC2</a> for servers, <a href="http://aws.amazon.com/dynamodb/">DynamoDB</a>  for data storage, <a href="http://python.org">Python</a> for server-side programming,  <a href="http://www.pythonware.com/products/pil/">Python Image Library</a> for image manipulation. On the client: <a href="http://jquery.com/">jQuery</a>  and  <a href="http://en.wikipedia.org/wiki/Canvas_element">HTML5 Canvas</a> for  all modern browsers, with <a href="http://en.wikipedia.org/wiki/Adobe_Flash">Flash</a>  for older browsers lacking canvas support (IE7, IE8 - IE6 is not supported).</p>


"""+faqValueHead("free")+"""<p>ImageDiver is a recent development, and in beta test (testing by external users). During the beta test phase, it will be free. 
It will remain free for all users except those with large (multi-gigabyte or gigabyte-per-month)
storage or bandwidth requirements,
from whom we may need to recoup costs, at between 10 and 20 cents for one gigabyte of bandwidth, or gigabyte of storage per month. Also, as mentioned in an earlier item, there will be an option for exporting your content,
so that it can be served from wherever you like, with no charges from ImageDiver.  </p> 



"""+faqValueHead("limits")+"""<p>Yes: 2 gigabytes of storage, and 5 gigabytes of bandwidth per month.
Please <a href="mailto:support@imagediver.org">contact</a> ImageDiver to arrange for higher limits. </p> 

"""+faqValueHead("who")+"""<p>ImageDiver was designed and implemented by <a href="http://www.linkedin.com/pub/chris-goad/1/a39/759">Chris Goad</a>.</p> 




<hr/>
</div>
"""



def emitPage(webin):
  return gen.genHtmlPage(webin,bodyText,styleSheets=styleSheets,pageTitle="FAQ")

