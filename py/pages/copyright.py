

import constants
import gen

headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "Copyright"


bodyText = """
<p style="margin-bottom:40px"><i>See also:</i> <a href="/tos">Terms of Service</a>, <a href="/privacy">Privacy Policy</a></p>

  
  <p>
ImageDiver respects the intellectual property rights of others and expects its users to do the same. It is ImageDiver's policy, in appropriate circumstances and at its discretion, to disable and/or terminate the accounts of users who repeatedly infringe or are repeatedly charged with infringing the copyrights or other intellectual property rights of others.
</p>
<p>
In accordance with the Digital Millennium Copyright Act of 1998, the text of which may be found on the U.S. Copyright Office website at <a href="http://www.copyright.gov/legislation/dmca.pdf">http://www.copyright.gov/legislation/dmca.pdf</a>, ImageDiver will respond expeditiously to claims of copyright infringement committed using the ImageDiver website (the "Site").</p>


<p>
If you are a copyright owner, or are authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing a DMCA Notice of Alleged Infringement and emailing it to <a  href = "mailto:copyright@imagediver.org">copyright@imagediver.org</a>. Upon receipt of the Notice as described below, ImageDiver will take whatever action, in its sole discretion, it deems appropriate, including removal of the challenged material from the Site. Your DMCA Notice of Alleged Infringement ("Notice") should:</p>
<ol>
<li class="tosli">Identify the copyrighted work that you claim has been infringed, or - if multiple copyrighted works are covered by this Notice - you may provide a representative list of the copyrighted works that you claim have been infringed.</li>
<li class="tosli">
Identify (i) the material that you claim is infringing (or to be the subject of infringing activity) and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material, including at a minimum the URL of the link shown on the Site where such material may be found, and (ii) the reference or link, to the material or activity that you claim to be infringing, that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate that reference or link, including at a minimum, if applicable, the URL of the link shown on the Site where such reference or link may be found.</li>
<li class="tosli">
Provide your mailing address, telephone number, and, if available, email address.
</li>
<li class="tosli">

Include both of the following statements in the body of the Notice:<br/>
"I hereby state that I have a good faith belief that the disputed use of the copyrighted material or reference or link to such material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."<br/>
"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."<br/>
</li>
<li class="tosli">

Provide your full legal name and your electronic or physical signature.
</li>
</ol>
</div>
"""

def emitPage(webin):
    return gen.genHtmlPage(webin,bodyText,styleSheets=styleSheets,pageTitle="Copyright Policy")



