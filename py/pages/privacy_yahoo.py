

import constants
import gen

styles = """
<STYLE type="text/css">
   .indented {margin-left:10px}
 </STYLE>
 """
headLines = [styles]
jsFiles = ""
headerTitle = "ImageDiver Privacy Policy"


bodyText = """

  <center><b>Privacy Policy</b></center>
  <p><b>Information Collected</b></p>
  <p>
  The only pieces of information about a registered user that ImageDiver  collects from the user are his or her name, and email address. Information about activity at the ImageDiver site is retained in log files. A cookie is used to support the log-in process, and a trace of this process appears in the ImageDiver database.
  </p>
  
  <p><b>Sharing Information </b></p>
  
  <p>
  Email addresses, activity logs, and  other histories of usage of the site,  will never  be shared with any third party, for any purpose. Email  will only be used for  direct communications with the user concerning ImageDiver. 
</p>
 
<p>A user's name will appear on the ImageDiver website on his or her profile page, but only if the user chooses to have a profile page.   </p>





"""

def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText)


