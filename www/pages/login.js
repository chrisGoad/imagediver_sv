

(function () {
var common = idv.common;
var util = idv.util;
var theUser = {}
var lib = page;


function callResend(uname,pw,cb) {
  var url = "/api/resend"
  var data = {"password":pw,"user":uname};
  var dataj = JSON.stringify(data);
  $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:cb});
  
}
function signIn() {
  var url = "/api/login";
  var email=$('#loginEmail').attr('value');
  var errel = $('#loginError');
  if ($.trim(email)=="") {
    errel.html("No email entered");
    return;
  }
  var pw = $('#loginPassword').attr('value');
  var data = {"password":pw,"email":email};
  var dataj = JSON.stringify(data);
  $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:
    function (rs) {
      if (rs.status == "ok") {
        errel.html("");
        var vl = rs.value;
        document.cookie =   "sessionId="+vl.sessionId+"; Domain=.imagediver.org; path=/;";
        document.cookie =   "userId="+vl.userId+"; Domain=.imagediver.org; path=/;";
       
        location.href = "/";
      } else {
        var rsn = rs.msg;
        if (rsn == "badUserOrPassword")
          errel.html("Incorrect email or password.");
        else {
          errel.html("The email associated with this account has not yet been verified. Please check your email. Click ");
          var rsnd = $('<span style="color:blue;cursor:pointer">here</span>');
          errel.append(rsnd);
          errel.append(' to resend the verification message.');
          function popResendDialog () {
            idv.util.myConfirm("Resend",
            "<p>Resend Verification Message</p>",
            function (){callResend(uname,pw,function (rs) {
              if (rs.status == "ok") {
                errel.html("Verification email resent");
                idv.util.closeDialog();
              } else {
                errel.html("Unexpected condition: bad password. Please reload this page and try again.");
                idv.util.closeDialog();
                
              }
            })},
            function () {idv.util.closeDialog();}
          );
          }
          rsnd.click(popResendDialog);
        }
      }
    }});
}


function forgotPassword() {
  var url = "/api/forgotPassword";
  var errel = $('#loginError');
  var email=$('#loginEmail').attr('value');
  if ($.trim(email)=="") {
    errel.html("No email entered");
    return;
  }
  var pw = $('#loginPassword').attr('value');
  var data = {"email":email};
  var dataj = JSON.stringify(data);
  $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:
    function (rs) {
      if (rs.status == "ok") {
        errel.html("An email has been sent with a link enabling password reset");
      } else {
        errel.html("There is no ImageDiver user with this email.");
      }
    }});
}
function showMessage(msg) {
    var rmsg = $('#errMsg');
    rmsg.show();
    rmsg.html(msg);
}


function register(cn) {
    $("#errMsg").html(" ");
    function checkPassword(pw) {
      var ln = pw.length;
      if (ln < 6) return false;
      var mt = pw.match(/^\w*$/);
      if (!mt) return false;
      return true;
    }
    /*
    function firstCharIsLetter(c) {
      var cc = c.charCodeAt(0);
      return ((65 <= cc) && (cc <= 90)) || ((97 <= cc) && (cc <= 122));
    }
    function checkUserId(pw) {
      var ln = pw.length;
      if (ln == 0) return false;
      var mt = pw.match(/^\w*$/);
      if (!mt) return false;
      return firstCharIsLetter(pw);
    }
    */
    function checkName(pw) {
      var mt = pw.match(/^(\w|\s)*$/);
      if (!mt) return false;
      return true;
    }
    function checkEmail(pw) {
      var mt = pw.match(/^[^\s]*$/);
      if (!mt) return false;
      return true;
    }
    //var uname=$('#newUser').attr('value');
   // uname = uname.toLowerCase();
    var pw = $('#newPassword').attr('value');
    var rpw = $('#repeatPassword').attr('value');
    var name = $('#name').attr('value');
    var email = $('#email').attr('value');
    //theUser.user = uname;
    theUser.password = pw;
    theUser.name = name;
    theUser.email = email;
    
    
    if (!checkName(name)) {
      showMessage("Your username must consist only of letters, digits, and spaces");
      return;
    }
    
    if (!checkEmail(email)) {
      showMessage("This does not look like an email address");
      return;
    }
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
    if (lib.tosAgree.attr('checked') != "checked") {
      showMessage("You must agree to the Terms of Service in order to register");
      return;
    }
    var data ={email:email};
    var dataj = JSON.stringify(data);
    $.ajax({url:"/api/checkUser",data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:function (rs) {
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
            showMessage("Failed to send email to "+email);
           
          }
        }});
      
      
    
     
    }});
  }

lib.signInWithTumblr = function () {
    var url = "http://"+idv.apiHost+"/api/tumblrRequestToken";
    //var data = {};
    sessionStorage.signingInWithTumblr = "yes"; 
    util.get(url,function (rs) {
         var vl = rs.value;
         var vlj = JSON.stringify(vl);
         sessionStorage.tumblrToken=vlj; 
         var rtk = vl.oauth_token;
         var url = 'http://tumblr.com/oauth/authorize?oauth_token='+rtk;
         location.href = url;
  
      });
}


lib.signInWithTwitter = function () {
    var url = "http://"+idv.apiHost+"/api/twitterRequestToken";
    //var data = {};
    sessionStorage.signingInWithTwitter = "yes"; 
    util.get(url,function (rs) {
         var vl = rs.value;
         var vlj = JSON.stringify(vl);
         sessionStorage.twitterToken=vlj;
        var rtk = vl.oauth_token;

         var url = 'http://api.twitter.com/oauth/authorize?oauth_token='+rtk;
         location.href = url;
  
      });
}


lib.initialize = function (options) {
  if (!options) options = {};
  util.commonInit()
  idv.topbar.genTopbar(undefined,{title:'sign in'});

  var cn = $('.infoDiv');
  var br = $.browser;
  if (br.msie && (parseFloat(br.version) < 8)) {
    cn.append("<p>Versions of Internet Explorer prior to version 8 are not suitable for creating ImageDiver content "+
              ", although Internet Explorer 7.0 is adequate for viewing existing content. Please come back with " +
              " a newer version of Internet Explorer, or Chrome, Firefox, or Safari.</p> <p> -- Thanks. </p>");
    return;
  }
  
  //cn.append("<div>Sign In</div>");
  var sit,sitw;
  if (options.hit_limit) {
    cn.append($('<div/>').html('If you are new to ImageDiver: ImageDiver is in beta, and  limiting the rate at which new users sign up. The current limit has been reached.'+
                               ' Signing in via Tumblr will succeed if you are an existing user, but not a new user. '+
                               'The limit will be raised periodically, so please check back. Thanks! </p>').css(
                               {"font-size":"8pt","margin-left":"20pt","margin-right":"20pt","color":util.errorColor}));

                            
  }
  
  cn.append($('<div/>').css({"margin-left":"10px"}).append('If you have a Tumblr or Twitterr account, there is no need to register separately with ImageDiver.'));
  cn.append($('<div/>').css({"margin-left":"20px","margin-top":"10px"}).append(sit=$('<span id="signIn" class="clickableElement">sign in with Tumblr</span>').css({'background-color':'#2C4762'})));
  cn.append(
    $('<div>The only access that ImageDiver will perform to your Tumblr account: retrieving your Tumblr name, and posting ImageDiver content as drafts when you request this.</div>').
       css({"margin":"10px"}));
  //cn.append(lint);
  sit.click(lib.signInWithTumblr);
  sit.css({'cursor':'pointer'});
  var sitw = $('<img src="images/twitter.png"/>')
   cn.append($('<div/>').css({"margin-left":"10px"}).append(sitw));
  // cn.append($('<div/>').css({"margin-left":"10px"}).append(sitw=$('<span id="signIn" class="clickableElement">log in with Twitter</span> (No registration required)')));
  cn.append(
    $('<div>ImageDiver will not access your Twitter account, except to retrieve your screen name.</div>').
       css({"margin":"10px"}));
  //cn.append(lint);
  sitw.click(lib.signInWithTwitter);
  sitw.css({'cursor':'pointer'});
  
  
  cn.append('<hr/>');
    cn.append('<div>Or if you have registered:</div>');

  //cn.css('border','solid thin white');
  //cn.append(common.genLogo());
  var tb = $(common.genTable("login",[['Email','<input id="loginEmail" size="30" type="text"/>'],
                             ['Password','<input id="loginPassword" type="password"/>']]));
  cn.append(tb);
  var errel = $('<div id="loginError" class="errorMessage"/>');
  cn.append(errel);
  var signinDiv = $('<div/>');
  cn.append(signinDiv);
  tb.css({'margin-top':"10px","margin-left":"10px","margin-bottom":"20px"});
  var signin = $('<span id="signIn" class="clickableElement">sign in</span>');
  signinDiv.append(signin);
  signin.click(signIn);

  var forgot = $('<span id="forgot" class="clickableElement">forgot password</span>').css({"margin-left":"40px"});
  signinDiv.append(forgot);
  forgot.click(forgotPassword);
  signinDiv.css({"margin-left":"20px","margin-top":"20px","margin-bottom":"20px"})
  //var signin = $('<div id="signIn" style="width:50px;margin-left:10px;margin-right:auto" class="clickableElement">Sign in</div>');
  if (options.hit_limit) return;
   cn.append('<hr/>');
  var rgtop = $("<div>Or Register</div>");
  rgtop.css({"margin-top":"20px"});
  cn.append(rgtop);
  var rtb = $(common.genTable("signin",[
                             ['Username','<input id="name" size="30" type="text"/>'],
                             ['Email','<input id="email"  size="30" type="text"/>'],
                             ['Password','<input id="newPassword" type="password"/>'],
                             ['Repeat Password','<input id="repeatPassword" type="password"/>']
                             
                             ]));
  rtb.css({'margin-top':"10px","margin-left":"10px","margin-bottom":"20px"});
  cn.append(rtb);
  lib.tosAgree = $('<input type="checkbox" />I agree to the ImageDiver <a style="color:black" href="/tos" target="_blank">Terms of Service</a></input>');
  var tosDiv = $('<div/>');
  tosDiv.append(lib.tosAgree)
  cn.append(tosDiv);
  
  var rmsg = $('<div id="errMsg"></div>');
  rmsg.css({color:util.errorColor,"margin-bottom":"20px"});
  cn.append(rmsg);
  var registerbut = $('<span id="signIn" class="clickableElement">Register</span>');
  cn.append(registerbut);
  registerbut.click(function () {register(cn);});
  idv.util.addDialogDiv($(".infoDiv"));
}


})();

