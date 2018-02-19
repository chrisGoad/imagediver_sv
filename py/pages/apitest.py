

import constants
import gen


headLines = []
styleSheets = ["/css/faq.css"]

jsFiles = ""
headerTitle = "APITEST"
 
bodyText = """
<script>

function grabHistory() {
  var album = '/album/4294b0e/one_dollar_bill_obverse/3';
  data = {album:album}
  idv.util.post("http://dev.imagediver.org/api/albumHistory",data,function (rs) {
    var def = 33;
  });
}

$(document).ready(function () {
  $('#callapi').click(grabHistory);
});
</script>

<input id="callapi" type = "button" value="callapi"></input>
</div>
</html>
"""

def emitPage(webin):
  return gen.genHtmlPage(webin,jsFiles,headerTitle,headLines,bodyText,styleSheets=styleSheets,pageTitle="APITEST")

