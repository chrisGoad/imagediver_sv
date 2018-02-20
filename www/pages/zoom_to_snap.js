
(function () {
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;

  
  lib.interpolateCoverage = function (startCov,destCov,v) {
    if (v >=1) v = 1;
    lib.animationUnderway = true;
    var covNow = startCov.interpolate(destCov,v);
    var covRect = geom.internalizeRect(covNow);
    lib.vp.setCoverage(covRect);
    lib.zSlider.positionSliderFromZoom(lib.vp.zoom);
    if (v < 1) {
      setTimeout(function () {lib.interpolateCoverage(startCov,destCov,v+0.1);},50);
    } else {
      page.zooming = false;
      //lib.vp.setDisplayParamsForZoom();
      lib.vp.refreshOverlays();
      lib.zSlider.setZoom(lib.zSlider.getZoom()); // set the depth and grab tiles
    }
  }
  
  lib.immediateZoomToSnap = function (snapD,scale) {
    if (!scale) scale = 1.1;
    var cov = snapD.coverage;
    var scov = cov.scale(scale);
    var covRect = geom.internalizeRect(scov);
    lib.vp.setCoverage(covRect);
    lib.zSlider.positionSliderFromZoom(lib.vp.zoom);
  }

  lib.animatedZoomToSnap = function (snapD,scale) {
    page.zooming = true;
    var startCov = lib.vp.coverage();
    if (!scale) scale = 1.1;
    var destCov = snapD.coverage.scale(scale);
    lib.interpolateCoverage(startCov,destCov,0);
   
  }
  
  lib.zoomToSelectedSnap = function () {
    lib.vp.setZoom(1);
    lib.animatedZoomToSnap(lib.selectedSnap.snapD,1.1);
  }
    
  
  
})();
