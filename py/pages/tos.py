

import constants
import gen

styleSheets = ["/css/faq.css","/css/ui-darkness/jquery-ui-1.8.21.custom.css"]

jsFiles = ""
headerTitle = "TOS"


bodyText = """
<p style="margin-bottom:40px"><i>See also:</i> <a href="/copyright">Copyright Policy</a>, <a href="/privacy">Privacy Policy</a></p>
  <p>
  You may create a user account at ImageDiver  only if you can form a binding contract, and only in compliance with these Terms and all applicable local, state, national, and international laws, rules and regulations. You may use this service only if you are at least 13 years of age.
 </p>
 
<p>Creating an account with ImageDiver gives you access to its services in our sole discretion. If you open an account on behalf of a company, organization, or other entity, then (a) "you" includes you and that entity, and (b) you represent and warrant that you are an authorized representative of the entity with the authority to bind the entity to these Terms, and that you agree to these Terms on the entity's behalf. 
 
 
<p> All  User-provided Images accessible through the Website are the proprietary property of the respective Registered User. A user may elect to assert a license allowing redistribution of the image. If so, the redistribution licence will appear with the image on the Website. If no redistribution licence is asserted, redistribution is prohibited. You agree not to duplicate, publish, display, distribute, modify, or create derivative works from any image on the Website except as expressly allowed in the license (if any) appearing with the image. You agree to assert a license for an image only if you have the legal authority do so.</p>



<p>You agree not to post User Content that:</p>

<ul>
<li class="tosli">seeks to harm or exploit children by exposing them to inappropriate content;</li>

<li class="tosli">violates, or encourages any conduct that violates laws or regulations;</li>

<li class="tosli">
contains any information or content we deem to be hateful, violent, harmful, abusive, racially or ethnically offensive, defamatory, infringing, invasive of personal privacy or publicity rights, harassing, humiliating to other people (publicly or otherwise), libelous, threatening, profane, or otherwise objectionable;</li>

<li class="tosli">

contains any information or content that is illegal (including, without limitation, the disclosure of insider information under securities law or of another party's trade secrets);</li>

<li class="tosli">
infringes any third party's Intellectual Property Rights, privacy rights, publicity rights, or other personal or proprietary rights;</li>
<li class="tosli">
contains any information or content that you do not have a right to make available under any law or under contractual or fiduciary relationships;</li>
<li class="tosli">
is fraudulent, false, misleading, or deceptive.</li>
</ul>

<p>
We reserve the right, but are not obligated, to remove User Content from the Service for any reason, including User Content that we believe violates these Terms.
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
You agree to indemnify and hold harmless ImageDiver and its agents and employees, , from and against any claims, suits, proceedings, disputes, demands, liabilities, damages, losses, costs and expenses, including, without limitation, reasonable legal and accounting fees (including costs of defense of claims, suits or proceedings brought by third parties), arising out of or in any way related to (i) your access to or use of the Services or ImageDiver Content, (ii) your User Content, or (iii) your breach of any of these Terms.
</p>
<p>
These Terms of Service are adapted from those of <a style="color:blue" href="http://http://pinterest.com/about/terms/">Pinterest</a>
</p>
</div>
"""

def emitPage(webin):
    return gen.genHtmlPage(webin,bodyText,styleSheets=styleSheets,pageTitle="Terms of Service")



