#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""


import urllib
import json
import Logr
import store.dynamo
dynamo = store.dynamo
Logr.log("api","HOHOHO8O")
import model.models
models  = model.models
from WebClasses import WebResponse,okResponse,failResponse


import api.utils
apiutils = api.utils


import constants
import api.ses
ses = api.ses


"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""


"""
  
def sendValidationEmailOld (user):
 
  imsg = "<p>To complete your registration at ImageDiver, please click on the link below:</p>
  <p><a href="http://dev.imagediver.org/validate_email?user=A&code=B">Click Here</a><p>
  <p>or else paste the following line into the address line of your browser</p>"
  email = "cagoad@gmail.com"
  #email = user.email
  #vcode = user.validation_code
  ss = SMTP("smtp.gmail.com")
  ss.starttls()
  ss.login("cagoad@gmail.com","psan343")
  msg = MIMEText(imsg,'html');
  msg['Subject'] = "ImageDiver Email Validation"
  msg['From']="support@imagediver.org"
  msg['To'] = email

  msgs = msg.as_string()
  ss.sendmail("cagoad@gmail.com","cagoad@gmail.com",msgs)
  ss.quit()
  return WebResponse("200 OK","application/json",json.dumps({"value":"ok"}));

  
"""

  
def register(webin):
  Logr.log("test","TEST CONSTANT "+str(getattr(constants,"testvar",None)))
  pcn = json.loads(webin.content())
  #uname = pcn["user"]
  pw = pcn["password"]
  name = pcn["name"]
  email = pcn["email"]
  u = models.loadUserDbyEmail(email)
  if u!=None:
    return failResponse("there is already an account associated with that email");
  uname = dynamo.genNewUserId()
  nu = models.UserD(None)
  nu.topic = '/user/'+uname
  nu.name  = name
  nu.storage_allocation = constants.initial_storage_allocation
  nu.bandwidth_allocation = constants.initial_bandwidth_allocation
  nu.setPassword(pw)
  nu.email = email
  vcode = models.genId("register")
  nu.validation_code = vcode
  nu.validated=0
  rs = ses.sendValidationEmail(nu)
  if rs:
    nu.dynsave(True)
    dynamo.bumpCount("/user/count")
    return okResponse()
  else:
    return failResponse("Unable to send email to "+email)
  
  