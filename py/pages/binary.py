


from WebClasses import WebResponse,okResponse,failResponse


body = """
<html>
<body>
<script>var jQuery;</script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>


<script type="text/javascript" src="/pages/binary.js"></script>

<div class="content"></div>

<script>
$(document).ready(function () {
  page.initialize();
});
</script>
</body>
</html>
"""


def emitPage(webin):
  return WebResponse("200 OK","text/html",body);  


