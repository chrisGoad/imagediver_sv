(function () {
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;


   lib.aboutImageDiv = $(
      '<div id="aboutImage"></div>'
    );
    
    
  lib.aboutImageDiv.data("initializer",function () {
    var albumD = lib.albumD;
    if (albumD) {      
      var d = albumD.description;
    } else {
      var imD = lib.imD;
      d = imD.description;
    }
    if (!d) {
      if (albumD) {
        imD = lib.imD;
        d = imD.description;
      }
    }
    if (!d) {
      d = "No description yet";
    }
    $('#aboutImage').html(d);
    var ht = $("#aboutImage").height();
    var dht = lib.defaultPanelHeight();
    var aht = Math.max(ht,dht);
    //lib.setPanelDivHeight(aht);
    //lib.ssDiv.css({"height":aht});

  });

  lib.addAboutImageDiv = function (container) {
    container.append(lib.aboutImageDiv);
    var pn = lib.setPanelPanel("aboutImage",lib.aboutImageDiv);
    pn.selfScaling = true;
  }


    
    
})();

