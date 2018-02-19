
#!/usr/bin/env python


import urllib
import constants
import urlparse
import model.models
models  = model.models
#reload(constants)
import gen




"""
def emitPage(webin):
  return gen.genDynPage(webin,jsIncludes,{"topbarTitle":"<i>the depths of high-resolution images, annotated</i>"},None,headLines)
"""

def emitPage(webin):
  def genErrPage(txt):
    return gen.emitMessagePage(webin,"Reset Password",txt);

 
  #def genPage(jsOptions):
  #  return gen.genDynPage(webin,jsIncludes,{"topbarTitle":"<i>the depths of high-resolution images, annotated</i>"},jsOptions=jsOptions,headLines=headLines)
    #return WebResponse("200 OK","text/html",gen.genHtmlPage(webin,'',"ImageDiver Email Verification",[],txt))
  qs = getattr(webin,"queryString",None)
  if qs:
    qsp = urlparse.parse_qs(qs)
  usernames = qsp.get("user",None)
  if usernames == None:
    return genPage("Incorrect form for password-reset URL")
  username = usernames[0]
  codes = qsp.get("code",None)
  if codes == None:
    return genErrPage("Incorrect form for password-reset URL")
  code = codes[0]
  user = models.loadUserD("/user/"+username,webin.pageStore)
  
  if user == None:
    return genErrPage("Problem in reset-password: unknown user")
  stored_code = user.validation_code
  codeok = stored_code == code


  if codeok:
    return gen.genStdPage(webin,'reset_password',{"user":"/user/"+username,"code":code,"email":user.email},staticSize=True)
  else:
    return genErrPage("Problem: incorrect code")
    txt = "BAD CODE"
 

  
"""
http://dev.imagediver.org/validate_email?user=cg&code=455454
"""
  
  
























