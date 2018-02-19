#!/usr/bin/env python

"""
Handles the api call api/login
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""

import urllib
import constants
import urlparse
import model.models
models  = model.models
#reload(constants)
import gen


"""
form of url:
http://imagediver.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""

def genBody(txt):
  return '<body><div class="infoDiv">'+txt+'</div></body></html>'

def emitPage(webin):
  #def genHtmlPage(webin,txt,redirectOnTimeout=True,styleSheets=None,pageTitle=None):

  def genPage(txt):
    return gen.genHtmlPage(webin,txt,redirectOnTimeout=False,pageTitle="Email Verification")

  """
  Handles the  api/contact - for people contacting ImageDiver
  """
  #print "VERIFY EMAIL"
  qs = getattr(webin,"queryString",None)
  if qs:
    qsp = urlparse.parse_qs(qs)
  usernames = qsp.get("user",None)
  if usernames == None:
    return genPage("Incorrect form for verification")
  username = usernames[0]
  codes = qsp.get("code",None)
  if codes == None:
    return genPage("Incorrect form for verification")
  code = codes[0]
  user = models.loadUserD("/user/"+username,webin.pageStore)
  #print "USER ",user.__dict__
  isTumblr = getattr(user,"tumblr_name",None)
  if user == None:
    return genPage("Problem in verification: unknown user")
  if user.validated:
    if isTumblr:
      return genPage("Your email has already been verified.  Thanks!")
    else:
      return genPage("Your email has already been verified. You can log in now. Thanks!")

  stored_code = user.validation_code
  codeok = stored_code == code

  if codeok:
    user.validated = 1
    user.dynsave(isNew=False)
    if isTumblr:
      return genPage("Your email has been verified. Thanks!")
    else:
      return genPage("Your email has been verified. You can log in now. Thanks!")
      
  else:
    return genPage("Problem in verification: incorrect code")
    txt = "BAD CODE"
 

  
"""
http://dev.imagediver.org/validate_email?user=cg&code=455454
"""
  
  


