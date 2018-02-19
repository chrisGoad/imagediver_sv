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
import boto
import boto.ses

import constants
import api.ses
ses = api.ses



  
def resend(webin):
  Logr.log("test","TEST CONSTANT "+str(getattr(constants,"testvar",None)))
  pcn = json.loads(webin.content())
  uname = pcn["user"]
  pw = pcn["password"]
  u = models.loadUserD("/user/"+uname,webin.pageStore)
  if u==None:
    return failResponse("noSuchUser");
  pok = u.checkPassword(pw)
  if not pok:
    return failResponse("badPassword");
  ses.sendValidationEmail(u)
  return okResponse()
