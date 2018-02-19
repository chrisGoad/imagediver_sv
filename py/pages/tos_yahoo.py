

import constants
import gen

styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]
jsFiles = ""
headerTitle = "ImageDiver TOS"


bodyText = """
  <center><b>Terms of Service</b></center>
  <p>
  You may create a user account at ImageDiver  only if you can form a binding contract, and are  at least 13 years of age.
 </p>
 
 
<p>
You understand that all images and text that you upload or post  to ImageDiver are your sole responsibility. ImageDiver does not control content added by its users  and does not guarantee the accuracy, integrity or quality of such Content. You understand that by using ImageDiver, you may be exposed to Content that is offensive, indecent or objectionable. Under no circumstances will ImageDiver be liable in any way for any Content, including, but not limited to, any errors or omissions in any Content, or any loss or damage of any kind incurred as a result of the use of any Content.
</p>

<p>
You agree to not use ImageDiver to:
</p>

<p class="indented">
upload, post, or otherwise make available any Content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable
</p>

<p class="indented">
harm minors in any way
</p>

<p class="indented">
upload, post, or otherwise make available any Content that you do not have a right to make available under any law or under contractual or fiduciary relationships (such as inside information, proprietary and confidential information learned or disclosed as part of employment relationships or under nondisclosure agreements)
</p>

<p class="indented">
upload, post, or otherwise make available any Content that infringes any patent, trademark, trade secret, copyright or other proprietary rights ("Rights") of any party
</p>

<p class="indented">

You acknowledge that ImageDiver may or may not pre-screen Content, but that ImageDiver and its designees shall have the right (but not the obligation) in their sole discretion to pre-screen, refuse, or remove any Content that is available via ImageDiver.  You agree that you must evaluate, and bear all risks associated with, the use of any Content, including any reliance on the accuracy, completeness, or usefulness of such Content. 
</p>

<p>
INDEMNITY
</p>
<p>
You agree to indemnify and hold ImageDiver and its agents, employees, partners and licensors harmless from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of Content you  make available through ImageDiver, your violation of the TOS, or your violation of any rights of another.
</p>
<p>
These Terms of Service are adapted from those of <a style="color:blue" href="http://info.yahoo.com/legal/us/yahoo/utos/utos-173.html">Yahoo!</a>
</p>
</div>
"""

def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText)

