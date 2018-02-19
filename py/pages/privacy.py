

import constants
import gen

headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "Privacy"


bodyText = """
<p style="margin-bottom:40px"><i>See also:</i> <a href="/tos">Terms of Service</a>, <a href="/copyright">Copyright Policy</a></p>

  <p><i>Information Collected</i></p>
  <p>
  The only pieces of information about a registered user that ImageDiver  collects from the user are his or her name, and email address. Information about activity at the ImageDiver site is retained in log files. A cookie is used to support the log-in process, and a trace of this process appears in the ImageDiver database.
  </p>
  
  <p><i>Sharing Information</i></p>
  
  <p>
  Email addresses, activity logs, and  other histories of usage of the site,  will never  be shared with any third party, for any purpose. Email  will only be used for  direct communications with the user concerning ImageDiver. 
</p>
 
</div>
"""

def emitPage(webin):
      return gen.genHtmlPage(webin,bodyText,styleSheets=styleSheets,pageTitle="Privacy Policy")



