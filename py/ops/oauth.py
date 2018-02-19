
# for the google apis


import oauth2


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
"""Returns response for API request."""
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
