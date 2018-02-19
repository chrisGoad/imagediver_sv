"""
The callback page for twitter.
http://dev.imagediver.org/authorize_twitter
"""

import constants
import gen
from WebClasses import WebResponse,okResponse,failResponse,redirectResponse



headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "Tumblr Authorized"


bodyText = """
<div style="text-align:center;padding:30px">Accesss to Twitter was denied.</div>
</div>
"""

import misc
import urlparse
import json
import model.models
models  = model.models

import ops.s3

#print dir(ops)

import ops.oauth_twitter
oauth_twitter = ops.oauth_twitter


def emitRedirect(verifier,token):
    rs = """
    <!DOCTYPE html>
    <html>
    <head>
    </head>
    <body style="background-color:#444444">
    <script>var jQuery; </script>
   <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
   <script type="text/javascript" src="/lib/util.js"></script>
    <script>
    (function () {
      var tokenForComparison = '"""+token+"""'; // just for checking
      var tkj = sessionStorage.twitterToken;
      var tk = JSON.parse(tkj);
      tk.verifier = '"""+verifier+"""';
      
      var url = "/api/setTwitterToken";
      if (sessionStorage.signingInWithTwitter) {
        tk.signingIn = 1;
      }
      var data = JSON.stringify(tk);
      
      idv.util.post(url,data,function (rs) {
        if (sessionStorage.signingInWithTwitter) {
          var vl = rs.value;
          if (vl.hit_limit) {
            location.href = "/hituserlimit"
            return;
          }
          if (vl.accepted_terms) {
            document.cookie =   "sessionId="+vl.sessionId+"; Domain=.imagediver.org; path=/;";
            document.cookie =   "userId="+vl.userId+"; Domain=.imagediver.org; path=/;";
            location.href = "/";
            return;
          }
          // go to the page for accepting terms
          var turl = "/terms?user="+vl.userId;
          location.href = turl;
          return;
        }
        var dataj = sessionStorage.post_to_twitter_args;
        if (!dataj) alert("Internal problem: missing session storage data");
        var abc = 22;
         var inp;
        var frm = $('<form enctype = "text/plain" action="/post_to_twitter" method="POST">').append(
        inp = $('<input type="hidden" name="data"/>'));
        inp.attr("value",dataj);
        frm.submit(); 
        });
    })();
    </script>
    </body>
    </html>
    """
    return WebResponse("200 OK","text/html",rs)



def emitPage(webin):
  #sess = webin.session
  #user = sess.user
  qs = webin.queryString
  if qs:
    qd = urlparse.parse_qs(qs)
    #print "QD",qd
    tokena = qd.get('oauth_token',None)
    if tokena:
      token = tokena[0]
      verifier = qd['oauth_verifier'][0]
      return emitRedirect(verifier,token)
    
    """
    dir = "/mnt/ebs1/imagediver/tokens/"
    uname = misc.pathLast(user)
    fln = dir+uname
    f = open(fln)
    tkj = f.read()
    f.close()
    tk = json.loads(tkj)
    token_secret = tk['oauth_token_secret']
    access_token = oauth_tumblr.getAccessToken(verifier,token,token_secret)
    #print "ACCESS TOKEN:",access_token
    userD = models.loadUserD(user)
    atkj = json.dumps(access_token)
    userD.tumblr_token = atkj
    userD.dynsave(False)
    topic = tk.get("topic",None)
    if topic:
      topic = str(topic)
      url = "/post_to_tumblr?topic="+topic
      return redirectResponse(url)
    """
  return gen.genHtmlPage(webin,"Twitter access was denied.",styleSheets=styleSheets,pageTitle="Access Denied")



 
  

