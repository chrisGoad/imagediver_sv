#!/usr/bin/env python

"""
http://neochronography.com/topics/astoria_house/736 10th street
http://neochronography.com/topics/image/astoria_panorama_1923
http://neochronography.com/topic/a/b/json

For checking whether a user is already present
"""


import urllib
import json
import Logr
Logr.log("api","HOHOHO8O")
import store.dynamo
dyn = store.dynamo

from WebClasses import WebResponse


import api.utils
apiutils = api.utils

import constants


"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""

def checkUser(webin):
  pcn = json.loads(webin.content())
  u = dyn.emailToUser(pcn["email"])
  if u==None:
    st = "ok"
  else:
    st = "failed"
  return WebResponse("200 OK","application/json",json.dumps({"status":st}));
 