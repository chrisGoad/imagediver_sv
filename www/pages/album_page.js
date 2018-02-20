

// panorama page generation
/*
dev.imagediver.org/topic/album/cg/The_Ambassadors/1/test.html
dev.imagediver.org/topic/image/cg/The_Ambassadors/index.html?image_only=1&coverage=17244.541015625,1656.005859375,3864.013671875,4195.21484375
*/


(function () {
  

  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"}
  

idv.init = function (albumTopic) {
  idv.util.commonInit();
  var jsonUrl = idv.util.jsonUrl(albumTopic);

  idv.util.get(jsonUrl,function (rs) {
    var snapDs = rs.value.snaps;
    var imD = rs.value.image;
    var imx = imD.dimensions.x;
    idv.util.arrayForEach(snapDs,function (snapD){return page.internalizeSnapD(snapD,imx);});

    $('document').ready(
      function () {
        page.initialize(albumTopic,imD,snapDs);
      });

  });

}
  //duplicated from snaparray 
  
  lib.internalizeSnapD = function (snapD,sc) {
    var cv = snapD.coverage;
    var ext = cv.extent;
    var crn = cv.corner;
    var nc = {extent:{x:ext.x * sc,y:ext.y * sc}, corner:{x:crn.x * sc,y:crn.y* sc}};
    snapD.coverage = nc;
  }
  
    //duplicated from snaparray 

  
  lib.fixSnapCoverage = function (snapD) {
    var sc = snapD.shares_coverage;
    if (sc != undefined) {
      var sw = lib.snapDsByTopicNum[sc];
      return snapD.coverage = sw.coverage;
    }
  }
  
  
  lib.placeLightbox = function () {
    var lb = lib.lightbox;
    var top = 50;
    //var lbwd = 500;
    var wht = $(window).height();
    var wwd = $(window).width();
    lbwd = wwd * 0.8;
    var lft = winCenter = 0.5 * lbwd;
    var lbht = wht - 100; 
    var lightboxRect = new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));
    if (lb) {
      com.setLightboxRect(lb,lightboxRect);
    } else {
      lb = new com.Lightbox($('body'),lightboxRect);
      lb.render();
      lib.lightbox = lb;
    }
  }
  
  
  lib.lightBoxReady = false;
  lib.addListener = function () {
    function receiveIframeMessage(event) {
      //alert(event.data);
      // only one message for now: "ready"
      lib.lightBoxReady = true;
    }
    if (window.addEventListener) {
      window.addEventListener("message", receiveIframeMessage, false);
    } else {
      window.attachEvent("onmessage", receiveIframeMessage);
    }
  }
  
  
  
  
  lib.postMessageToLightbox = function (msg) {
    var cw = lib.lightbox.contentWindow;
    //var ifm = $('.lighboxiframe');
    //if (idv.brie8) {
    if (lib.lightBoxReady) {
     cw.postMessage(msg,"http://"+location.host);
    } else {
      util.slog("WAITING FOR LIGHTBOX TO BE READY");
      setTimeout(function () {lib.postMessageToLightbox(msg);},500);
    }
    //}
    //cw.postMessage(msg,"*");
    

  }
  
  lib.initialize = function (albumTopic,imD,snapDs) {
    lib.addListener();
    util.commonInit();
    lib.snapDsByTopicNum = {};
    lib.snapDs = snapDs;
    util.arrayForEach(snapDs,function (snapD) {
      var topicId = util.lastPathElement(snapD.topic);
      snapD.topicId = topicId; // a slight efficiency hack
      lib.snapDsByTopicNum[topicId] = snapD;
    });
    util.arrayForEach(snapDs,lib.fixSnapCoverage);
    
    var imdim = imD.dimensions;
    var imx  = imdim.x;
    var imy = imdim.y;
    var imar = imx/imy;
    //page.twoColumns = imar < 1.9;
    var sp = albumTopic.split("/");
    var spln = sp.length;
    lib.albumId = sp[spln-1];
    lib.albumTopic = albumTopic;
    var itp = imD.topic;
    var itps = itp.split("/")
    var uname = itps[2];
    var imname = itps[3];
    var asnapEls = $('img');
    var snapEls = [];
    var def = 22;
    var imurl = "http://"+idv.cfDomain+"/topic"+itp+"/index.html?image_only=1";
    var imurl = "/topic"+itp+"/index.html?image_only=1&album="+albumTopic;
    var mainEl = undefined;
    function snapElIndex(el) {
      var id = el.id;
      if (id) {
        if (id.indexOf("snap")==0) {
          var nae = util.numberAtEnd(id);
          if (nae != undefined) {
            return nae
          }
        }
      }
      return undefined;
     
    }
    var snapElsByIndex = {};
    function snapUrl(idx) {
      if (idv.useS3) {
        var dm = idv.cfDomain;
      } else {
        dm = "dev.imagediver.org"
      }
      return "http://"+dm+"/snap/"+uname+"/"+imname+"/"+idx+".jpg?owner=cg&album=2";
    }
    function emitCoverage(r) {
      var c = r.corner;
      var ext = r.extent;
      return c.x + "," + c.y +"," + ext.x +","+ ext.y;
    }
    util.arrayForEach(asnapEls,function (snapEl) {
      var id = snapEl.id;
      if (id && (id.indexOf("main")==0)) {
        mainEl = snapEl;
        return;
      }
     
      var idx = snapElIndex(snapEl);
      if (idx != undefined) {
        var snapD = snapDs[idx];
        var url = snapUrl(idx);
        var snapJel = $(snapEl);
        snapJel.css({"cursor":"pointer"});
        snapJel.attr("src",url);
        snapJel.click(function () {
          lib.lightbox.pop();
          lib.postMessageToLightbox("selectSnap("+idx+")");
          //var curl = imurl + "&selected="+emitCoverage(snapD.coverage);
         // lib.lightbox.loadUrl(curl);
          //lib.lightbox.loadUrl("/topic/image/cg/The_Dutch_Proverbs/index.html?image_only=1");
        });
        snapEls.push(snapJel);
        snapElsByIndex[idx] = snapJel;
      }
    });
    if (mainEl) {
      var mainJel = $(mainEl);
      mainJel.click(function () {
          lib.lightbox.pop();
          lib.postMessageToLightbox("selectMain()");
        }
      );
    }
    //        thisHere.lightbox.loadUrl("/topic/image/cg/The_Dutch_Proverbs/index.html?image_only=1");
    lib.placeLightbox();
    var def = 22;
    lib.lightbox.loadUrl(imurl);
    lib.lightbox.pop(true); // need to configure the lightbox
   // lib.lightbox.dismiss();
    

    $(window).resize(function() {
        lib.placeLightbox();     
    });
      

  }
  
  
  
})();
  