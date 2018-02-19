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
import misc
import model.models
models  = model.models
import ops.keys as keys
from WebClasses import WebResponse,okResponse,failResponse


import boto
import boto.ses

import constants


"""
form of url:
http://neochronography.com/topic/<category>/<name>[/method()][/format]
the default format is html, and the other possibility is json
"""


verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"SES")
   
SesConnection = None

def connectToSes():
  global SesConnection
  if SesConnection:
    return SesConnection
  keyId = keys.keyId
  secretKey = keys.secretKey
  SesConnection = boto.ses.connection.SESConnection(aws_access_key_id=keyId,aws_secret_access_key=secretKey)
  return SesConnection

# marian cell 699 2037  
# marcy at el castillo  995 2118 

def sendEmail(user,subject,msg):
  emailto = user.email
  emailfrom = "support@imagediver.org"
  cn = connectToSes()
  vprint("sending email to ",emailto)
  try:
    rs = cn.send_email(emailfrom,subject,msg,[emailto],html_body=msg)
    vprint("RESULT OF SEND",rs)
    return True
  except Exception as ex:
    vprint ("FAILED TO SEND",ex)
    return False
  
  
 
def sendValidationEmail (user,forTumblrOrTwitter=False):
  tp = user.topic
  uid = misc.pathLast(tp)
  code = user.validation_code
  if forTumblrOrTwitter:
    msg = """<p>To verify this email address for ImageDiver, please click on the link below, or paste it into your browser's address bar:</p>"""
  else:
    msg = """<p>To complete your registration at ImageDiver, please click on the link below, or paste it into your browser's address bar:</p>"""
  url = "http://imagediver.org/verify_email?user={0}&code={1}".format(uid,code)
  msg += """<p><a href="{0}">{0}</a>""".format(url)
  subject = "Email Verification for ImageDiver"
  return sendEmail(user,subject,msg)
  

def sendForgotPasswordEmail (user):
  tp = user.topic
  uid = misc.pathLast(tp)
  code = user.validation_code
  msg = """<p>To reset your password at ImageDiver, please click on the link below, or paste it into your browser's address bar:</p>
  <p>http://imagediver.org/reset_password?user={0}&code={1}""".format(uid,code)
  subject = "Reset Password"
  return sendEmail(user,subject,msg)

def sendImportDoneEmail (user,imageName):
  msg = """<p>See your <a href="http://imagediver.org/mywork">content</a> page.</p>"""
  subject = "Import of "+imageName+" is done."
  return sendEmail(user,subject,msg)



def sendStorageAllocationExceededEmail(user,imageName,allocation,utilization,size):
  msg = """<p>The import of the image """+imageName+""" was cancelled because it would have caused you to exceed your  storage allocation.
  Your allocation is """+misc.bytesstring(allocation)+""", and you are already using """+misc.bytesstring(utilization)+""" of this.
  The new import would have consumed """+misc.bytesstring(size)+""".  Please contact
  <a href="mailto:support@imagediver.org">support@imagediver.org</a> if you cannot free up space
  by deleting unused images."""
  subject = "Import of "+imageName+" cancelled because it would exceed storage allocation."
  return sendEmail(user,subject,msg)


def sendEmailChangedEmail (user):
  msg = """<p>The email where you have received this message is the new email associated with your account at ImageDiver."""
  subject = "Email Verification for ImageDiver"
  return sendEmail(user,subject,msg)


def sendBandwidthEmail (user):
  subject = "Bandwidth Limit Exceeded"
  alc = user.allocation()
  bw = alc["bandwidth"]
  bws = misc.bytesstring(bw)
  msg = """<p>Your bandwidth allowance of """+bws+""" per month has been exceeded. Please contact
  <a href="mailto:support@imagediver.org">support@imagediver.org</a>."""
  return sendEmail(user,subject,msg)



def sendBandwidthWarning (user):
  subject = "Bandwidth Warning"
  alc = user.allocation()
  bw = alc["bandwidth"]
  bws = misc.bytesstring(bw)
  msg = """<p>Warning: traffic to your content this month has consumed more than 75% of your montly allocation of """+bws
  return sendEmail(user,subject,msg)

""" 
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
execfile("ops/execthis.py")
import api.ses`
ses = api.ses

uu = models.loadUserD("/user/4294b0e")

ses.sendBandwidthEmail(uu)

"""

