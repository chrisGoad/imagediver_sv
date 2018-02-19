
"""
http://neochronography.com/topic/image/astoria_1923_0
"""

from WebClasses import WebResponse,okResponse,failResponse,htmlResponse

import constants
from constants import jsForPage,cjsForPage
import pages.gen
gen = pages.gen
import model.models
models = model.models
import json
import Logr

def emitPage(webin):
  
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user;
  txt = """
<head>
    <link rel="stylesheet" type="text/css" href="/css/imagestyle.css"/>
</head>


<body>
<script>var jQuery; // for commonJS compatability</script>
 <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
"""
  pageName = 'upload_iframe'
  if constants.compressJs:
    txt += cjsForPage(pageName)
  else:
    txt += jsForPage(pageName)
  txt += """
<script>
idv.loggedInUser='"""+str(user)+"""'

$(document).ready(initialize);

</script>


<form id="theForm" target="_self" enctype="multipart/form-data" action="/api/upload?id=333" method="post">
  <p>File: <input id="fileInput" style="color:white" type="file" name="file"/></p>
  <p id="errorP"></p>
  <p><input id ="theButton" type="button" value="Upload"></p>
</form>
</body>
</html>
"""
  return htmlResponse(txt)




"""
//$(document).ready(function() {initialize();});
  /*
  var b = $('#theButton');
  //var nmi = $("#nameInput");
  var fli = $("#fileInput");
  var imname = "";
  var ext = "";
  //jobC.initProgressBar = parent.initProgressBar;

  fli.change(function () {
    parent.page.hideRetrieveOptions();
    var pth = fli.attr("value");
    var rfs = pth.lastIndexOf("\/");
    var bsl = String.fromCharCode(92); // backslash
    var rfbs = pth.lastIndexOf(bsl);
    var rf = Math.max(rfs,rfbs);
    if (rf < 0) {
      var fimname = pth;
    } else {
      fimname = pth.substr(rf+1);
    }
    var rfd = fimname.lastIndexOf(".");
    if (rfd < 0) {
      imname = fimname;
      ext = "";
      
    } else {
      imname = fimname.substr(0,rfd);
      ext = fimname.substr(rfd+1);
      
    }
    var imnf = $("#imname",window.parent.document);
    var cimn = $.trim(imnf.attr("value"));
    if ((!cimn) && parent.page.checkImageName(imname)) {
      var imnf = $("#imname",window.parent.document);
      imnf.attr("value",imname);
    }
  });
  b.click(function () {
    var pth = fli.attr("value");
    if (!pth) {
      myAlert("Error","No file specified");
      return;
    }
    var imnf = $("#imname",window.parent.document);
    var imn = $.trim(imnf.attr("value"));
    if (!imn) {
      myAlert("Error","Please enter the name that the image should be assigned at ImageDiver");
      return;
    }
    var usp = idv.loggedInUser.split("/")[2]
    var sbj = JSON.stringify({"image_name":imn,"source":"upload"});

    var data = [{"subject":sbj,"kind":"upload","owner":usp},
      {"subject":sbj,"kind":"add_image_to_db",owner:usp},
       {"subject":imn,"kind":"build_tiling","owner":usp}];
    url = "/api/allocateJob";
    idv.util.post(url,data,function (rs) {
      var jobs = rs.value;
      var exists = jobs == "exists";
      //jobs[1].noMonitoring = true;
      parent.jobC.theJobs = jobs;
      parent.jobC.uploadForm = $('#theForm');
      var upload = jobs[0]
      var exists = upload.retries;
      if (exists) {
        var ifyes = function () {console.log("yes");parent.closeDialog();parent.initDiv.hide(); parent.jobC.startFirstJob();};
        var ifno = function () {console.log("no");parent.closeDialog();};
        var ok = parent.myConfirm("","A file by that name exists. Overwrite?",ifyes,ifno);
        return;
      }
      parent.initDiv.hide();
      parent.jobC.startJob();
      return false;
    });
  });
});
*/

</script>
"""
