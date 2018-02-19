
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""



import constants
execfile(constants.pyDir+"common_includes.py")


import model.models
models = model.models
import json
import Logr
import store.log
logstore = store.log
import datetime

def emitPage(webin):
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user;
  logstore.initStore(webin.pageStore)
  #entries = logstore.allEntries(webin.pageStore);
  entries = logstore.selectEntries(webin.pageStore,where="bytes > 1000000");
  logstore.closeStore(webin.pageStore)
  pg0= gen.pageHeader("ImageDiver Logs") + "<body>" 
  if constants.compressJs:
    pg0 += constants.jsPreamble 
  else:
    pg0 +=  constants.commonJsIncludes()
  epoch = datetime.datetime(1970, 1, 1)
  epocho = epoch.toordinal()
  daysecs = 60 * 60 * 24
  for ent in entries:
    dt = ent["date"]
    ts = daysecs * (dt - epocho)
    ent["date"] = ts # for javascript consumption

    
  pg0 += """
  <script type="text/javascript" src="/lib/util.js"></script>
  <script type="text/javascript" src="/pages/logs.js"></script>

  <script>
  var entries = """+json.dumps(entries)+""";
  
  $('document').ready(function () {page.initialize(entries);});
  

</script>
<div class="infoDiv"></div>
  """

  pageText = " " 
  #print pg1
  pg1 = """
</script>
"""+pageText+"""
</body>
</html>
"""
  otxt = pg0 + pg1;
  return  htmlResponse(otxt)
 
  
  
  

