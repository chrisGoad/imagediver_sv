
# for the google apis

import httplib
import ops.oauth2 as oauth
import pdb

SERVER = 'www.tumblr.com'
PORT = 80



REQUEST_TOKEN_URL = 'http://www.tumblr.com/oauth/request_token'
ACCESS_TOKEN_URL = 'https://photos.example.net/access_token'
AUTHORIZATION_URL = 'https://photos.example.net/authorize'
CALLBACK_URL = 'http://printer.example.com/request_token_ready'
RESOURCE_URL = 'http://photos.example.net/photos'

# key and secret granted by the service provider for this consumer application - same as the MockOAuthDataStore

CONSUMER_KEY  = 'YULMTQMzxKkm0XCeIZVhnALysmoLZbAHhI7IcYjBuymb9dEmvZ'
CONSUMER_SECRET  = 'u8eEieUmuFEzKnUc1wLEbNpwUHAgm1XcTzBpbzuKCaEtQwXw7m'


# example client using httplib with headers
class TumblrClient(oauth.Client):

    def __init__(self, server, port=httplib.HTTP_PORT, request_token_url='', access_token_url='', authorization_url=''):
        self.server = server
        self.port = port
        self.request_token_url = request_token_url
        self.access_token_url = access_token_url
        self.authorization_url = authorization_url
        self.connection = httplib.HTTPConnection("%s:%d" % (self.server, self.port))

    def fetch_request_token(self, oauth_request):
        # via headers
        # -> OAuthToken
        #pdb.set_trace()
        hdrs = oauth_request.to_header()
        print "HEADERS ",hdrs
        self.connection.request(oauth_request.method, self.request_token_url, headers=hdrs) 
        response = self.connection.getresponse()
        return oauth.Token.from_string(response.read())

    def fetch_access_token(self, oauth_request):
        # via headers
        # -> OAuthToken
        self.connection.request(oauth_request.http_method, self.access_token_url, headers=oauth_request.to_header()) 
        response = self.connection.getresponse()
        return oauth.OAuthToken.from_string(response.read())

    def authorize_token(self, oauth_request):
        # via url
        # -> typically just some okay response
        self.connection.request(oauth_request.http_method, oauth_request.to_url()) 
        response = self.connection.getresponse()
        return response.read()

    def access_resource(self, oauth_request):
        # via post body
        # -> some protected resources
        headers = {'Content-Type' :'application/x-www-form-urlencoded'}
        self.connection.request('POST', RESOURCE_URL, body=oauth_request.to_postdata(), headers=headers)
        response = self.connection.getresponse()
        return response.read()
        
        
        
"""

# key and secret you got from Fire Eagle when registering an application
consumer_key  = 'YULMTQMzxKkm0XCeIZVhnALysmoLZbAHhI7IcYjBuymb9dEmvZ'
consumer_secret  = 'u8eEieUmuFEzKnUc1wLEbNpwUHAgm1XcTzBpbzuKCaEtQwXw7m'

host = "www.tumblr.com/oauth/"
#token = '5A94ZRExhA8fIM9mxHqn0l7vFei_

#token_secret = 'E6IY_ZgYL-VV0bL64YgzRsolCP4'
# see https://github.com/Yelp/yelp-api/blob/master/v2/python/search.py
path = '/v2/search'

path = 'request_token'
kind = 'POST'
token = None
#def request(kind,path, url_params):
global token
# Unsigned URL
encoded_params = ''
if url_params:
  encoded_params = urllib.urlencode(url_params)
url = 'http://%s%s?%s' % (host, path, encoded_params)
print 'URL: %s' % (url,)
# Sign the URL
consumer = oauth2.Consumer(consumer_key, consumer_secret)
oauth_request = oauth2.Request('GET', url, {})
oauth_request.update({'oauth_nonce': oauth2.generate_nonce(),
                      'oauth_timestamp': oauth2.generate_timestamp(),
                      #'oauth_token': token,
                      'oauth_consumer_key': consumer_key})
if token:
  token = oauth2.Token(token, token_secret)
oauth_request.sign_request(oauth2.SignatureMethod_HMAC_SHA1(), consumer, token)
signed_url = oauth_request.to_url()
print 'Signed URL: %s\n' % (signed_url,)
# Connect
try:
  conn = urllib2.urlopen(signed_url, None)
  try:
    response = json.loads(conn.read())
  finally:
    conn.close()
except urllib2.HTTPError, error:
  response = json.loads(error.read())
return response
"""
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
import pdb

SERVER = 'www.tumblr.com'
PORT = 80


REQUEST_TOKEN_URL = 'http://www.tumblr.com/oauth/request_token'
ACCESS_TOKEN_URL = 'https://photos.example.net/access_token'
AUTHORIZATION_URL = 'https://photos.example.net/authorize'
CALLBACK_URL = 'http://printer.example.com/request_token_ready'
RESOURCE_URL = 'http://photos.example.net/photos'

CONSUMER_KEY  = 'YULMTQMzxKkm0XCeIZVhnALysmoLZbAHhI7IcYjBuymb9dEmvZ'
CONSUMER_SECRET  = 'u8eEieUmuFEzKnUc1wLEbNpwUHAgm1XcTzBpbzuKCaEtQwXw7m'


import ops.oauth2 as oauth

import ops.oauth_tumblr as oat
client = oat.TumblrClient(SERVER, PORT, REQUEST_TOKEN_URL, ACCESS_TOKEN_URL, AUTHORIZATION_URL)
consumer = oauth.Consumer(CONSUMER_KEY, CONSUMER_SECRET)
signature_method_plaintext = oauth.SignatureMethod_PLAINTEXT()
signature_method_hmac_sha1 = oauth.SignatureMethod_HMAC_SHA1()
#oauth_request = oauth.Request.from_consumer_and_token(consumer, http_method='POST', http_url=client.request_token_url)

def getToken():
  oauth_request = oauth.Request.from_consumer_and_token(consumer, http_method='POST', http_url=client.request_token_url)
  #oauth_request.http_method = 'POST'
  oauth_request.sign_request(signature_method_hmac_sha1, consumer, None)
  
  #print 'REQUEST (via headers)'
  #print 'parameters: %s' % str(oauth_request.parameters)
  
  token = client.fetch_request_token(oauth_request)
  return token

getToken();




# Signing a Request

CONSUMER_KEY  = 'YULMTQMzxKkm0XCeIZVhnALysmoLZbAHhI7IcYjBuymb9dEmvZ'
CONSUMER_SECRET  = 'u8eEieUmuFEzKnUc1wLEbNpwUHAgm1XcTzBpbzuKCaEtQwXw7m'

import oauth2 as oauth
import time

# Set the API endpoint 
url = "http://www.tumblr.com/oauth/request_token"

# Set the base oauth_* parameters along with any other parameters required
# for the API call.
params = {
    'oauth_version': "1.0",
    'oauth_nonce': oauth.generate_nonce(),
    'oauth_timestamp': int(time.time())
}

# Set up instances of our Token and Consumer. The Consumer.key and 
# Consumer.secret are given to you by the API provider. The Token.key and
# Token.secret is given to you after a three-legged authentication.
#token = oauth.Token(key="tok-test-key", secret="tok-test-secret")
token=None
consumer = oauth.Consumer(key=CONSUMER_KEY, secret=CONSUMER_SECRET)

# Set our token/key parameters
#params['oauth_token'] = token.key
params['oauth_consumer_key'] = consumer.key

# Create our request. Change method, etc. accordingly.
req = oauth.Request(method="POST", url=url, parameters=params)

# Sign the request.
signature_method = oauth.SignatureMethod_HMAC_SHA1()
req.sign_request(signature_method, consumer, token)




import urlparse
import oauth2 as oauth

consumer_key = 'YULMTQMzxKkm0XCeIZVhnALysmoLZbAHhI7IcYjBuymb9dEmvZ'
consumer_secret  = 'u8eEieUmuFEzKnUc1wLEbNpwUHAgm1XcTzBpbzuKCaEtQwXw7m'


request_token_url = 'http://tumblr.com/oauth/request_token'
access_token_url = 'http://tumblr.com/oauth/access_token'
authorize_url = 'http://tumblr.com/oauth/authorize'

consumer = oauth.Consumer(consumer_key, consumer_secret)
client = oauth.Client(consumer)

# Step 1: Get a request token. This is a temporary token that is used for 
# having the user authorize an access token and to sign the request to obtain 
# said access token.

resp, content = client.request(request_token_url, "POST")
if resp['status'] != '200':
    raise Exception("Invalid response %s." % resp['status'])

request_token = dict(urlparse.parse_qsl(content))


print "Go to the following link in your browser:"
print "%s?oauth_token=%s" % (authorize_url, request_token['oauth_token'])
print

http://imagediver.org/tumblr_oauth?oauth_token=vPojcTc1GEl80fwG5cZKnq2HlkQyUZkm9ajtJYJDXeIvTEBoW2&oauth_verifier=cs8ZNY0fSvpJVFhIltdVAn1IhlUExvLlzhgZeP2z8MteYEeXu1
"""

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

