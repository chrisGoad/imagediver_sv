
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python
"""


import misc
import urllib

verbose = False


def vprint(*args):
  if verbose:
    misc.printargs(args,"OAUTH TUMBLR")

import urlparse
import ops.oauth2 as oauth

consumer_key = 'YULMTQMzxKkm0XCeIZVhnALysmoLZbAHhI7IcYjBuymb9dEmvZ'
consumer_secret  = 'u8eEieUmuFEzKnUc1wLEbNpwUHAgm1XcTzBpbzuKCaEtQwXw7m'


request_token_url = 'https://www.tumblr.com/oauth/request_token'
access_token_url = 'https://www.tumblr.com/oauth/access_token'
authorize_url = 'https://www.tumblr.com/oauth/authorize'


def requestToken():
  vprint("REQUEST TOKEN")
  consumer = oauth.Consumer(consumer_key, consumer_secret)
  client = oauth.Client(consumer)
  """ Step 1: Get a request token. This is a temporary token that is used for 
  having the user authorize an access token and to sign the request to obtain
  said access token."""
  resp, content = client.request(request_token_url, "POST")
  vprint("RESPONSE",resp,content)
  if resp['status'] != '200':
    raise Exception("Invalid response %s." % resp['status'])
  request_token = dict(urlparse.parse_qsl(content))
  return request_token


def getAccessToken(oauth_verifier,oauth_token,oauth_token_secret):
  vprint("GET ACCESS TOKEN")
  consumer = oauth.Consumer(consumer_key, consumer_secret)
  token = oauth.Token(oauth_token,oauth_token_secret)
  token.set_verifier(oauth_verifier)
  client = oauth.Client(consumer, token)
  resp, content = client.request(access_token_url, "POST")
  vprint("RESP",resp)
  if resp['status'] != '200':
    raise Exception(("Invalid response %s." % resp['status'])+content)

  access_token = dict(urlparse.parse_qsl(content))
  return access_token

""" now, actually calling the api. token,token_secret are the persistent access token """
def getUserInfo(token,token_secret):
  vprint("getUserInfo")
  vprint("token",token)
  vprint("Secret",token_secret)
  consumer = oauth.Consumer(consumer_key, consumer_secret)
  token = oauth.Token(token,token_secret)
  client = oauth.Client(consumer, token)
  info_url = "http://api.tumblr.com/v2/user/info"
  resp,content = client.request(info_url,"GET")
  if resp['status'] != '200':
    raise Exception("Invalid response %s." % resp['status'])

  vprint("RESP",resp)
  return content

"""
blog = eg chrisgoad.tumblr.com
params = eg{"type":"text","state":"draft","body":"Second TEST post"}
"""

def post(token,token_secret,blog,params): 
  vprint("POST to ",blog)
  vprint("token",token)
  vprint("Secret",token_secret)
  consumer = oauth.Consumer(consumer_key, consumer_secret)
  token = oauth.Token(token,token_secret)
  client = oauth.Client(consumer, token)
  post_url = "http://api.tumblr.com/v2/blog/"+blog+"/post"
  pen = urllib.urlencode(params)
  resp,content = client.request(post_url,"POST",body=pen)
  if resp['status'] != '201':
    raise Exception("Invalid response %s." % resp['status'])

  vprint("RESP",resp,content)
  return content
  

  """
  url = "{0}?oauth_token={1}".format(authorize_url,request_token['oauth_token']);
  print "URL",url
  print "Go to the following link in your browser:"
  print "%s?oauth_token=%s" % (authorize_url, request_token['oauth_token'])
  print
  return url



http://tumblr.com/oauth/authorize?oauth_token=knEzWw82JkgUj6SoasJ5MoYGlEpWOX1rMZroLif6eOoichUvTW


http://imagediver.org/tumblr_oauth?oauth_token=vPojcTc1GEl80fwG5cZKnq2HlkQyUZkm9ajtJYJDXeIvTEBoW2&oauth_verifier=cs8ZNY0fSvpJVFhIltdVAn1IhlUExvLlzhgZeP2z8MteYEeXu1


oauth_verifier="cs8ZNY0fSvpJVFhIltdVAn1IhlUExvLlzhgZeP2z8MteYEeXu1"
token = oauth.Token(request_token['oauth_token'],request_token['oauth_token_secret'])
token.set_verifier(oauth_verifier)

client = oauth.Client(consumer, token)
resp, content = client.request(access_token_url, "POST")
access_token = dict(urlparse.parse_qsl(content))


{'oauth_token_secret': 'TI5Y24EnaTPstk3onAz6BvinMdU51BjdydJoNMAJTujlQzlY9y', 'oauth_token': 'kkN6EZL6LdR51MdwQV7Te5XUa5gAdXMa0JRXMvBUW6IwhBeJUN'}

token = oauth.Token(access_token['oauth_token'],access_token['oauth_token_secret'])
client = oauth.Client(consumer, token)
info_url = "http://api.tumblr.com/v2/user/info"
resp,content = client.request(info_url,"GET")
    
import urllib
post_url = "http://api.tumblr.com/v2/blog/chrisgoad.tumblr.com/post"
params = {"type":"text","state":"draft","body":"Second TEST post"}
purle = urllib.urlencode(params)
resp,content = client.request(post_url,"POST",body=purle)

    client = oauth.Client(consumer, token)
    
    resp, content = client.request(access_token_url, "POST")
    access_token = dict(urlparse.parse_qsl(content))
"""
