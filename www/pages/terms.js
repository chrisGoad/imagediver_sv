

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/


(function () {
  
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var common = idv.common;
  var util  = idv.util;
    
 
  
  lib.initialize = function(options) {
    var nm = options.tumblr_name;
    if (!nm) {
      nm = options.twitter_name;
    }
    var uid = options.uid;
    var dv = $('.infoDiv');
    var pg = $('<div>'+
                 '<div>Welcome '+nm+'!</div>'+
                 '<div><input id="agree" type="checkbox" />I agree to the ImageDiver <a style="color:black" href="/tos" target="_blank">Terms of Service</a></input></div>'+
                  '<div><span>Email:</span><input id="email" type="text" /></div>'+
                  '<div>Email is optional.  If available, it is used by ImageDiver to contact you when large image imports are complete. </div>'+
                 '<div><span id="login" class="clickableElement">Sign in</span></div>'+
                 '<div id="msg"></div>'+
              '</div>');
    dv.append(pg);
    $('div',pg).css({'margin-top':"20px"});
    $('#msg').css({'color':util.errorColor});
    util.commonInit();
    var eml = $('#email');
    eml.css({'width':'400px'});
    //eml.focus(function () { alert(22);});
    $('#login').click(function () {
      var emlv = $.trim(eml.attr('value'));

      var checked = $('#agree').attr('checked');
      if (checked) {
        url = "/api/acceptedTerms";
        data = {user:"/user/"+uid,'email':emlv};
        util.post(url,data,function (rs) {
          if (rs.emailFailed) {
            $('#msg').html("ImageDiver was unable to send a verification message to the given email address.Please correct (or remove it), and try again.");
            return;
          } else {
            $('#msg').html("");
          }
          var vl = rs.value;
          document.cookie =   "sessionId="+vl.sessionId+"; Domain=.imagediver.org; path=/;";
          document.cookie =   "userId="+uid+"; Domain=.imagediver.org; path=/;";
          location.href = "/";
        });
      } else {
        $('#msg').html("You must agree to the terms of service to sign in.")
      }
      
    });
   
  }
  
  
})();


