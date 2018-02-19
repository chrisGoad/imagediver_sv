

(function () {
var common = idv.common;
var util = idv.util;
var theUser = {}
var lib = page;


function showMessage(msg) {
    var rmsg = $('#errMsg');
    rmsg.show();
    rmsg.html(msg);
}


function newpass() {
    $("#errMsg").hide();
    function checkPassword(pw) {
      var ln = pw.length;
      if (ln < 6) return false;
      var mt = pw.match(/^\w*$/);
      if (!mt) return false;
      return true;
    }
   
    //var uname=$('#newUser').attr('value');
   // uname = uname.toLowerCase();
    var pw = $('#newPassword').attr('value');
    var rpw = $('#repeatPassword').attr('value');
     //theUser.user = uname;
   
    /*
    if (!checkUserId(uname)) {
      showMessage("Your User Id must start with a letter, and consist of letters and digits. It is case-insensitive");
      return;
    }
    */
    if (pw != rpw) {
      showMessage("Repeated password does not match");
      return;
    }
    if (!checkPassword(pw)) {
      showMessage("Your password must consist of six or more letters and digits");
      return;
    }
    var data ={user:lib.user,password:pw,code:lib.code};
    var dataj = JSON.stringify(data);
    $.ajax({url:"/api/newPassword",data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:function (rs) {
            if (rs.status != "ok") {
               util.logout();
               location.href = "/timeout";
               return;
            }

         showMessage("Your password has been reset.")
      return;
      var st = rs.status;
      if (st == "failed") {
        showMessage("There is already an account associated with this email");
        return;
      }
      var userj = JSON.stringify(theUser);

      $.ajax({url:"/api/register",data:userj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
        success: function (rs) {
          if (rs.status == "ok") {
            var idv = $('.infoDiv');
            idv.html("An email has been sent to "+email+" - clicking on a link  in that email will complete your registration. Thanks!");
          } else {
            showMessage("Someone grabbed your proposed User Id just now! Sorry. Please  try another.");
           
          }
        }});
      
      
    
     
    }});
  }

lib.initialize = function (options) {
  util.commonInit();
  lib.topDiv = idv.topbar.genTopbar(undefined,{'title':'reset password'});

  lib.user = options.user;
  lib.code = options.code;
  lib.email = options.email;
  var cn = $('.infoDiv');
  cn.append("<div>Reset password for "+options.email+"</div>");
  var rtb = $(common.genTable("resettable",[
                            ['New Password','<input id="newPassword" type="password"/>'],
                             ['Repeat Password','<input id="repeatPassword" type="password"/>']
                             
                             ]));
  rtb.css({'margin-top':"10px","margin-left":"10px","margin-bottom":"20px"});
  cn.append(rtb);
  var rmsg = $('<div id="errMsg"></div>');
  rmsg.css({color:"red","margin-bottom":"20px"})
  cn.append(rmsg);
  var buttonDiv = $('<div/>');
  cn.append(buttonDiv);
  var newpassbut = $('<span id="reset" class="clickableElement">Set Password</span>');
  buttonDiv.append(newpassbut);
  newpassbut.click(newpass);
 // idv.util.addDialogDiv($(".infoDiv"));
}


})();

