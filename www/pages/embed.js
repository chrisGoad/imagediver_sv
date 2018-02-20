

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/

var page = {};

(function () {

  
  var lib = page;
  var geom = idv.geom;
  var geom = exports.GEOM2D;
  var com = idv.common;
  var util  = idv.util;
  
  lib.popLightbox = function (url) {
      
      var cnt =  document.getElementsByTagName('body')[0]; // $('body',window.parent.document);
      var lb = lib.lightbox;
      /*var top = 50;
      var wd = cnt.width();
      var lft = 50;
      var lbwd = wd - (lft*2);
      //var winCenter = 0.5 * wd;
      //var  lft = winCenter - 
      var wht = $(window.parent).height();
      var lbht = wht - 100; 
      var lightboxRect = new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));
      // var cnt = $('body')
      */
      if (!lb) {
        lb = new com.Lightbox(cnt);
        //lb.window = $(window.parent);
        lb.pop(url);
        //lb.pop();
        lib.lightbox = lb;
      }
    }
  
  
})();


