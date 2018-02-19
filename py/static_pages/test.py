
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebResponse import WebResponse
import constants


def pageBodyF(jsFiles,onReady):
  return  """
<body>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
""" + jsFiles + """

<script>

$(document).ready(function () {
  $('.aboutLogo').click(function () {location.href = "/";});
""" + onReady + """
});
</script>
<div class="aboutTitleDiv">
 <span class="aboutLogo">imageDiver</span>
</div>
"""


print "DEFINING emitter"

def emitter(webin):
  pg0 =  constants.pageHeader(webin,"imageDiver") + pageBodyF("""
<script type="text/javascript" src="/lib/util.js"></script>
  ""","""
  var cd = $('.infoDiv');
  cd.append('Questions, comments, complaints, and ideas for projects are welcome.  '+
  'ImageDiver albums can be hosted at any server, without dependencies or software installation.');
  var emailLine = $('<p>Your email (if you wish a response):</p>');
  var emailInput = $('<input type="text" size="50"></input>');
  cd.append(emailLine);
  emailLine.append(emailInput);
  var txa = $('<textarea rows="10" cols="60"></textarea>');
  //txa.css("color","grey");
  cd.append(txa);
  var buttonDiv = $('<div>');
  cd.append(buttonDiv);
  var sendButton = $('<input type="button" value="Send"></input>');
  var sending = $('<span></span>');
  buttonDiv.append(sendButton);
  buttonDiv.append(sending);
  function sendMsg() {
    var email = emailInput.val();
    var msg = txa.val();
    sending.html("Sending ...");
    idv.util.post("/api/contact",{email:email,msg:msg},function (rs) {
      cd.html("<center>Thanks!</center>");
    });
  }
  sendButton.click(sendMsg);
  cd.append("<p>I will use your email address only to communicate with you, and will not share it with anyone.</p><p>Thanks!</p><p>Chris Goad, ImageDiver author</p>");
  """) + """
 <div class="infoDiv">
 </div>
</body>
</html>
"""
  return WebResponse("200 OK","text/html",pg0);
  

