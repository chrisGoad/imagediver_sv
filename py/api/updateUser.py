#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

"""


import urllib
import json
import Logr
Logr.log("api","HOHOHO8O")
import model.models
models  = model.models
from WebClasses import WebResponse,okResponse,failResponse
import api.ses
ses = api.ses
import misc
import store.dynamo
dynamo = store.dynamo

import api.utils
apiutils = api.utils

import constants




verbose = True

def vprint(*args):
  if verbose:
    misc.printargs(args,"updateUser")
   
   
"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""

def updateUser(webin):
  Logr.log("test","TEST CONSTANT "+str(getattr(constants,"testvar",None)))
  pcn = json.loads(webin.content())
  uname = pcn["userId"]
  vprint("uname",uname)
  cks = webin.checkSessionResponse()
  if cks: return cks
  session = webin.session
  suserId = misc.pathLast(session.user)
  if suserId != uname:
    return failResponse("wrongUser");
  pw = pcn.get("password",None)
  name = pcn["name"]
  email = pcn["email"].strip()
  u = models.loadUserD("/user/"+uname,webin.pageStore)
  
  if u==None:
    return failResponse()
  oldemail = getattr(u,"email","")
  if email and (oldemail != email):
   eu = dynamo.emailToUser(pcn["email"])
   if eu != None:
    return failResponse("emailInUse");
  nu = models.UserD(None)
  nu.topic = '/user/'+uname
  nu.name  = name
  if pw: nu.setPassword(pw)
  nu.email = email
  vprint("old email",oldemail,"new ",email)
  if (oldemail != email):
    rs = ses.sendEmailChangedEmail(nu)
    if rs:
      nu.dynsave(False)
      if oldemail:
        dynamo.deleteEmailToUserEntry(oldemail)
      return okResponse()
    else:
      return failResponse("Unable to send email to "+email)
  nu.dynsave(False)
  return okResponse()




def newPassword(webin):
  Logr.log("test","TEST CONSTANT "+str(getattr(constants,"testvar",None)))
  pcn = json.loads(webin.content())
  utopic = pcn["user"]
  code = pcn["code"]
  pw = pcn["password"]
  user = models.loadUserD(utopic,webin.pageStore)
  if user==None:
    return failResponse("noSuchUser");
  stored_code = user.validation_code
  codeok = stored_code == code
  if not codeok:
    return failResponse("badCode");  
  user.setPassword(pw)
  user.dynsave(False)
  return okResponse()
  



def acceptedTerms(webin):
  pcn = json.loads(webin.content())
  vprint("acceptedTerms",pcn)
  utopic = pcn["user"]
  email = pcn["email"]
  user = models.loadUserD(utopic,webin.pageStore)
  if user==None:
    return failResponse("noSuchUser");
  rss = None
  if email:
    vcode = models.genId("register")
    user.validation_code = vcode
    user.validated=0
    user.email = email
    vprint("sending validating email to ",email)
    rss = ses.sendValidationEmail(user,True)
  user.accepted_terms = 1
  user.dynsave(False)
  s = user.newSession()
  stp = s.topic
  sid = misc.pathLast(stp)
  rs = {"sessionId":sid}
  if not rss:
    vprint("emailFailed")
    rs["emailFailed"] = 1
  return okResponse(rs)
  