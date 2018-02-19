#!/usr/bin/env python

"""
Handles the api call api/tumblrRequestToken

http://dev.imagediver.com/topic/image/cg/astoria_1923_0

http://neochronography.com/snap/astoria_1923_0/franklin.jpg

despite its name, this handles editing of snaps too

if the incoming data has a topic field, this is the snap being edited.

"""
from WebClasses import WebResponse,okResponse,failResponse

import ops.oauth_tumblr as oauth_tumblr
import store.dynamo as dynamo
import json
import misc
import constants
import model.models
models  = model.models



verbose = True

def vprint(*args):
  if verbose:
    misc.printargs(args,"tumblrAPI")
    
    
def tumblrRequestToken(webin):
  #print "tumblrRequestToken"
  #cks = webin.checkSessionResponse()
  #if cks: return cks
  sess = webin.session
  #user = sess.user
  tk = oauth_tumblr.requestToken()
  """
  tkj = json.dumps(tk)
  #print "TKJ",tkj
  " the token needs to be saved for a few minutes: until the user authorizes or declines the app "
  dir = "/mnt/ebs1/imagediver/tokens/"
  uname = misc.pathLast(user)
  fln = dir+uname
  f = open(fln,'w')
  f.write(tkj)
  f.close()
  """
  return okResponse(tk)


    
def setTumblrToken(webin):
  
  cn = webin.content()
  print "CONTENT",cn
  cob=json.loads(cn)
  token = cob["oauth_token"]
  token_secret = cob["oauth_token_secret"]
  verifier = cob["verifier"]
  signingIn = cob.get("signingIn",False)
  if not signingIn:
    cks = webin.checkSessionResponse()
    if cks: return cks
  access_token = oauth_tumblr.getAccessToken(verifier,token,token_secret)
  print "ACCESS TOKEN ",access_token
  atkj = json.dumps(access_token)
  if signingIn:
    uinfj = oauth_tumblr.getUserInfo(access_token["oauth_token"],access_token["oauth_token_secret"])
    print "UINFJ",uinfj
    uinf = json.loads(uinfj)
    tuname = uinf["response"]['user']['name']
    vprint("TUNAME",tuname)
    exu = models.loadUserDbyTumblr(tuname)
    rs = {"tumblr_name":tuname}
    if exu:
      vprint("Existing tumblr user")
      exu.tumblr_token = atkj
      exu.dynsave(False)
      tac = getattr(exu,"accepted_terms",0)
      #tac = 1
      rs["accepted_terms"] = tac
      utp = exu.topic
      uid = misc.pathLast(utp)
      rs["userId"] = uid
      if tac:
        # go ahead and generate a new session for this fellow
        s = exu.newSession()
        stp = s.topic
        sid = misc.pathLast(stp)
        rs["sessionId"] = sid
      return okResponse(rs)
    else:
      vprint("NEW TUMBLR USER")
      uid = dynamo.genNewUserId()
      nu = models.UserD(None)
      nu.topic = '/user/'+uid
      nu.name  = tuname
      nu.tumblr_name = tuname
      nu.storage_allocation = constants.initial_storage_allocation
      nu.bandwidth_allocation = constants.initial_bandwidth_allocation
      nu.accepted_terms = 0
      nu.tumblr_token = atkj
      nu.dynsave(True)
      vprint("NEW TUMBLR USER SAVED")
      rs["accepted_terms"] = 0
      rs["userId"] = uid

      return okResponse(rs)
  """ getting a access token in the course of a post to tumblr """
  sess = webin.session
  user = sess.user
  userD = models.loadUserD(user)
  atkj = json.dumps(access_token)
  userD.tumblr_token = atkj
  userD.dynsave(False)
  return okResponse()


def tumblrPost1(user,params):
  cob = params
  userD = models.loadUserD(user)
  uid = misc.pathLast(user)
  ttk = getattr(userD,'tumblr_token',None)
  if not ttk:
    return failResponse("noToken")
  tko = json.loads(ttk)
  token = tko["oauth_token"]
  token_secret = tko["oauth_token_secret"]
  vprint("Token",token)
  vprint("Token_secret",token_secret)
  topic = cob["topic"]
  blog = cob["blog"]
  topicsp = topic.split("/")
  ownr = topicsp[2]
  ownerName = None
  if ownr != uid:
    ownru = models.loadUserD("/user/"+ownr)
    ownerName = ownru.name
  imname = topicsp[3]
  albumNum = topicsp[4]
  snap = cob["snap"]
  print "snap",snap
  imageTitle = cob["imageTitle"]
  imageAuthor = cob["imageAuthor"]
  cropId = snap["cropid"]
  snapId = misc.pathLast(topic)
  scaption = snap.get("caption",None)
  sdes = snap.get("description",None)
  caption = "Click on the image to see the detail in a zoomable context\n\nDetail"
  tags = []
  
  if imageTitle:
    caption += " from *"+imageTitle+"*"
    if imageTitle.find(",") < 0:
      tags.append(imageTitle)
  if imageAuthor:
    caption += ", "+imageAuthor
    if imageAuthor.find(",") < 0:
      tags.append(imageAuthor)
  caption += "\n\n"
  if scaption:
    caption += scaption
  if sdes:
    if scaption:
      caption +=  "\n\n"
    caption += sdes.decode("utf8","ignore")
  if ownerName:
    caption += "\n\n From  "+ownerName+" at [Imagediver](http://imagediver.org)"
  #http://static.imagediver.org/images/4294b0e/van_eyck_arnolfini/snap/12.jpg?album=4294b0e.1
  #http://s3.imagediver.org/topic/album/4294b0e/van_eyck_arnolfini/1/index.html#snap=9
  cropUrl = "http://static.imagediver.org/images/"+ownr+"/"+imname+"/snap/"+str(cropId)+".jpg"
  clickThru = "http://s3.imagediver.org/topic/album/"+ownr+"/"+imname+"/"+albumNum+"/index.html#snap="+str(snapId)
  params = {"type":"photo","format":"markdown","state":"draft","link":clickThru,"source":cropUrl}
  if caption:
    params["caption"] = caption
  if len(tags) > 0:
    params["tags"] = ",".join(tags)
  #params = {"type":"text","state":"draft","body":"Second TEST post"}
  print "DESC",sdes
  vprint("CAPTION",caption)
  print "params",params
  oauth_tumblr.post(token,token_secret,blog,params)
  vprint("post complete")
  
  
def tumblrPost(webin):
  vprint("tumblrPost")
  cks = webin.checkSessionResponse()
  if cks: return cks
  cob=json.loads(webin.content())
  vprint("cob",cob)
  
  sess = webin.session
  user = sess.user
  tumblrPost1(user,cob)
  
  """
  userD = models.loadUserD(user)
  ttk = getattr(userD,'tumblr_token',None)
  if not ttk:
    return failResponse("noToken")
  tko = json.loads(ttk)
  token = tko["oauth_token"]
  token_secret = tko["oauth_token_secret"]
  vprint("Token",token)
  vprint("Token_secret",token_secret)
  cob=json.loads(webin.content())
  blog=cob["blog"]
  #caption = cob["caption"]
  #description = cob["description"]
  albumt = cob["album"]
  albumsp = albumt.split("/")
  ownr = albumsp[2]
  imname = albumsp[3]
  cropId = cob["crop"]
  snapId = cob["snap"]
  #http://static.imagediver.org/images/4294b0e/van_eyck_arnolfini/snap/12.jpg?album=4294b0e.1
  #http://s3.imagediver.org/topic/album/4294b0e/van_eyck_arnolfini/1/index.html#snap=9
  cropUrl = "http://static.imagediver.org/images/"+ownr+"/"+imname+"/snap/"+str(cropId)+".jpg"
  clickThru = "http://s3.imagediver.org/topic"+albumt+"/index.html#"+str(snapId)
  params = {"type":"photo","state":"draft","link":clickThru,"source":cropUrl}
  vprint("params",params)
  oauth_tumblr.post(token,token_secret,"chrisgoad.tumblr.com",params)
  vprint("post complete")
  """
  return okResponse()
  


  
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

import api.tumblr as tumblr
    rs = oauth_tumblr.getUserInfo(tko["oauth_token"],tko["oauth_token_secret"])



params = {"type":"text","state":"draft","body":"Second TEST post"}
params = {"album":"/album/4294b0e/van_eyck_arnolfini/1","snap":9,"crop":12,"blog":"annotatedart.tumblr.com"}


api.tumblr.tumblrPost1("/user/4294b0e",params)


sess = models.loadSessionD('8dca034396f099459e413a415372df7d0c8313e705ae74c7e717922e')
  
  
"""
