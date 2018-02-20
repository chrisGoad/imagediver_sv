

// panorama page generation

page = {};
(function () {
  lib = page;
  
  //lib.initialize = function (imD,albumD,albumDs,loggedInUser,callback) {
  lib.initialize = function () {
    var lc = location.href;
   
    var tpr = /topic\/composite\/([^\&\#]*)\/index.html/;
    var m = lc.match(tpr);
    if (!m) {
      lib.displayError("Bad Url")
      return;
      //lib.initialize2();
    }
    var name = m[1];
    var url = "/topic/composite/"+name+"/main.json";
    //var url = "/faq";hh
    $.ajax({
      url: url,
      success: function (rs) {
        lib.images = rs;
        initialize2();
      },
      error:function (jq,txt,er) {
        lib.displayError("No such snap");
        }
    });
    return;
  }
 
    
    
    
  function initialize2() {
    var idv = $('.infoDiv');
    var tdv = $('<div/>')
    idv.append(tdv);
    tdv.html('<center>Click on an image to view it within its zoomable context.</center>');
    tdv.css({'margin':"10px"});
    var imd = $('<div/>');
    idv.append(imd);
    imd.css({'margin-right':'auto','margin-left':'auto','width':'600px'});
    var ims = lib.images;
    var ln = ims.length;
    for (var i=0;i<ln;i++) {
      var imm = ims[i];
      var im = imm.image;
      var imel = $('<img/>');
      imd.append(imel);
      imel.attr('src',im);
      
      //var wd = 250;
      
      imel.css({width:"180px",margin:"10px",'cursor':'pointer'});
      (function (url) {
        imel.click(function () {
          location.href = url;
        })})(imm.link);
    }
  }
  
   
})();
  