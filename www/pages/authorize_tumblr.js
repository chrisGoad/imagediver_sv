




(function () {
  

  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;

  //var com = idv.common;
  var util  = idv.util;
   var common = idv.common;

  
  
  lib.initialize = function (options) {
    idv.util.commonInit();
    util.loggedInUserFromCookie();
    var dv = $('.infoDiv');
    var nt,bt;
    dv.append(nt = $('<div>Authorize posting annotations to your Tumblr blog with one click</div>'));
    nt.css({'margin-bottom':'20px'});
    dv.append(
      bt = $('<div>'+
          '<span id="ok" class="clickableElement">Ok</span>'+
          '<span id="cancel" class="clickableElement">Cancel</span>'+
        '</div>'));
    var ok = $("#ok",dv);
    ok.click(function () {
      var url = "http://"+idv.apiHost+"/api/tumblrRequestToken";
      //var data = {};
      util.get(url,function (rs) {
           var abc = 33;
           var vl = rs.value;
           var rtk = vl.oauth_token;
           var url = 'http://tumblr.com/oauth/authorize?oauth_token='+rtk;
           location.href = url;
    
        });
    });
  }
 

    
 
})();
  