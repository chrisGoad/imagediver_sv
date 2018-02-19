

import constants
import gen

styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """


styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]
jsFiles = ""
topbarOptions = '{title:"<i>the depths of high-resolution images, annotated",includeGallery:1}'
headerTitle = "ImageDiver Copyright Policy"

bodyText = """

  <center><b>Copyright Policy</b></center>
  <p>
  ImageDiver respects the intellectual property of others, and asks its users to do the same.
</p>



<p>
It is ImageDiver's policy, under
appropriate circumstances and at its discretion,
to disable and/or terminate the accounts of users who may
infringe or repeatedly infringe  copyrights or other intellectual property rights.
</p>
<p>
If you believe that your work has been copied in a way that constitutes copyright infringement, or that your intellectual property rights have been otherwise violated, please provide ImageDiver with the following information in English (your "Notice"), via email to
<a style="color:blue" href = "mailto:copyright@imagediver.org">copyright@imagediver.org</a>.
</p>
<p>Note: If you are asserting infringement of an intellectual property right other than copyright,
please specify the intellectual property right at issue (for example, "trademark").
</p>
<p class="indented">
an electronic or physical signature of the person authorized to act on behalf of the owner of the copyright or other intellectual property interest;
</p>
<p class="indented">
a description of the copyrighted work or other intellectual property that you claim has been infringed;
</p>
<p class="indented">
the URL at which  the material that you claim is infringing can be found on the ImageDiver site;
</p>
<p class="indented">
your address, telephone number, and email address;
</p>
<p class="indented">
a statement by you that you have a good faith belief that the disputed use is not authorized by the copyright or intellectual property owner, its agent, or the law;
</p>
<p class="indented">
a statement by you, made under penalty of perjury, that the above information in your Notice is accurate and that you are the copyright or intellectual property owner or authorized to act on the copyright or intellectual property owner's behalf.
</p>
<p>
(adapted from Yahoo's <a style="color:blue" href="http://info.yahoo.com/copyright/us/details.html">copyright policy page</a> )
"""



def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,topbarOptions,headerTitle,headLines,bodyText)



