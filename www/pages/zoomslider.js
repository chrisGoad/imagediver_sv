

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
*/


(function () {
  
  
  
  var lib = idv;
  var geom = idv.geom;
  var imlib = idv.image;
  var util  = idv.util;


  function log() {
    if (0) {
      var a = util.argsToString(arguments);
      util.slog1(a);
    }
  }
  
  
  
  // options: container, maxZoom,setZoom function,getZoom function,zoomFactor,zoomIncrement

  lib.zoomSlider = function (options) {
    container = options.container;
    this.container = container;
    this.getZoom = options.getZoom;
    this.zoomFactor = options.zoomFactor;
    this.zoomIncrement = options.zoomIncrement;
    this.zoomDelay = options.zoomDelay;
    this.mouseIsDown = false;
    var thisHere = this;
    var marginX = 5;
    var marginY = 2;
    var ht = 26;
    var midy = ht/2;
    var barWidth =60;// was 100
    this.barWidth = barWidth;
    var barLeft = marginX+ht;
    var smallSep = 3;
    var totalWidth = ht * 2 + marginX + barWidth + smallSep;
    this.totalWidth = totalWidth;
    var zoomerContainer = $('<div id="zoomercontainer"/>');
   // zoomerContainer.css({"left":0,"top":marginY,"width":totalWidth,"height":ht,"position":"absolute",
   //                   "background-color":"#444444"});
    zoomerContainer.css({"left":0,"top":marginY,"width":totalWidth,"height":ht,position:"relative",
                      "background-color":util.bkColor});
    container.append(zoomerContainer);

    var circleExtent = new geom.Point(ht,ht);
    var corner = new geom.Point(marginX,0);
    
    var minusCanvas= $('<img/>');
    minusCanvas.css({"left":0,"top":0,"width":25,"height":25,"position":"absolute",
                      "background-color":util.bkColor});
    zoomerContainer.append(minusCanvas);
    minusCanvas.attr("src","/minus.png");

    var plusCanvas= $('<img/>');
    plusCanvas.css({"left":marginX+ht+barWidth+smallSep,"top":0,"width":24,"height":24,"position":"absolute",
                      "background-color":util.bkColor});
    zoomerContainer.append(plusCanvas);
    plusCanvas.attr("src","/plus.png");
    
    var linewidth = 1.5;
    var radius = 10;
    var leftPadding = 0;
    var xDim = 10;
    var centerx = radius+linewidth+leftPadding

    //var barWidth = 100;
    var extent = new geom.Point(barWidth,ht);
    var barLeft = marginX+ht;
    corner = new geom.Point(barLeft,0);
  //  var barContainer = $('<div/>');
  // barContainer.css({"left":barLeft,"top":marginY,"width":extent.x,"height":extent.y,"position":"absolute",
  //                    "background-color":"yellow"});
  //  container.append(barContainer);
    var barCanvas = $('<div class="zoomBar"/>');
    zoomerContainer.append(barCanvas);
    var barTop = corner.y+midy-1;
    var barBottom  =  barTop;
        barCanvas.css({"background-color":"white",position:"absolute","top":barTop,"left":corner.x,"width":barWidth,"bottom":barBottom});
     //   barCanvas.css({"background-color":"blue",position:"absolute","top":barTop,"left":corner.x,"width":barWidth,"height":"2px"});
    zoomerContainer.append(barCanvas);
// for weirdshit ie 8
  //var belowbarCanvas = $('<div class="belowBar"/>');
  //  belowbarCanvas.css({"background-color":"yellow",position:"absolute","top":corner.y+midy22,"left":corner.x,"width":barWidth,"height":"2px"});
   // zoomerContainer.append(belowbarCanvas);

  /*
     var barCanvas = imlib.genCanvas(
      {"z-index":100,whichCanvas:"bar",container:zoomerContainer,corner:corner,extent:extent,backgroundColor:"#444444"});
    var ctx = barCanvas.context.getContext('2d');
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.lineWidth = linewidth;
    ctx.beginPath();
    ctx.moveTo(0,midy);
    ctx.lineTo(barWidth,midy);
    ctx.stroke();
  */
    var marker = $('<div class="zoomMarker"/>');
    this.marker = marker;
    var markerWidth = 3;
    var markerHeight = ht-6;
    var markerTop = 3;
    this.markerTop = markerTop;
    marker.css({"background-color":"white",position:"absolute","top":markerTop,"left":barLeft,"width":markerWidth,"height":markerHeight});
    zoomerContainer.append(marker);
    var corner = new geom.Point(marginX+ht+barWidth+smallSep,0);
    /*
    var plusCanvas = imlib.genCanvas(
      {corner:corner,whichCanvas:"plus",container:zoomerContainer,extent:circleExtent,backgroundColor:"#444444"});
    var ctx = plusCanvas.context.getContext('2d');
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.lineWidth = linewidth;
    ctx.beginPath();
    ctx.arc(centerx,midy,radius,0,2*Math.PI,false);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerx-xDim/2,midy);
    ctx.lineTo(centerx+xDim/2,midy);
    ctx.moveTo(centerx,midy-xDim/2);
    ctx.lineTo(centerx,midy+xDim/2);
    ctx.stroke();
    */
     marker.mouseenter(function () {
      util.log("slider","enter marker");
      mouseInMarker = true;
    });
    marker.mouseleave(function () {
      util.log("slider","leave marker");
      mouseInMarker = false;
    });
    var markerMaxX = barLeft + barWidth;
    
    this.markerMaxX = markerMaxX;
    this.markerMinX = barLeft;
    this.markerTop = markerTop;
    var maxZoom = options.maxZoom;
    this.maxZoom = maxZoom;
    var setZoom = options.setZoom;
    this.setZoom = setZoom;
    function sliderAction(p) {
      var x = p.x+barLeft;
      if (x > markerMaxX) return; 
      if (x < barLeft) return;
      var nx = (x - barLeft)/barWidth;
      
      marker.css({top:markerTop,left:x});
      var logMaxZoom = Math.log(maxZoom);
      var ex = nx * logMaxZoom;
      var newZoom = Math.pow(Math.E,ex);
      setZoom(newZoom);
     // lib.controls.setZoom(newZoom);
      
    }
    
    zoomerContainer.mousedown(function (e) {
      e.preventDefault();
      var rc = imlib.relCanvas(barCanvas,e);
      thisHere.mouseIsDown = true;
      sliderAction(rc);
    });
    
    zoomerContainer.mousemove(function (e) {
      e.preventDefault();
      if (thisHere.mouseIsDown) {
        var rc = imlib.relCanvas(barCanvas,e);
        sliderAction(rc);
      }
    });
    zoomerContainer.mouseup(function (e) {
      thisHere.mouseIsDown = false;
    });
    
     zoomerContainer.mouseleave(function (e) {
        thisHere.mouseIsDown = false;
      });
    var thisHere = this;
    
    plusCanvas.mousedown(function (e) {
      thisHere.startZoomingIn();
    });
    
    plusCanvas.mouseup(function (e) {
      thisHere.stopZooming();
    });
    
    
    plusCanvas.mouseleave(function (e) {
      thisHere.stopZooming();
    });
    
    
    minusCanvas.mousedown(function (e) {
      thisHere.startZoomingOut();
    });
    
    minusCanvas.mouseup(function (e) {
      thisHere.stopZooming();
    });
    
    
    
    minusCanvas.mouseleave(function (e) {
      thisHere.stopZooming();
    });
    
    
    this.zoomin = plusCanvas;
    this.zoomout = minusCanvas;
    this.bar = barCanvas;
    //return {"zoomin":plusCanvas,"bar":barCanvas,"zoomout":minusCanvas,"marker":marker};
  }
  
   // normalized zoom is the log of the zoom scaled to range from 0 to 1
  lib.zoomSlider.prototype.fromNormalizedZoom = function (nx) {
    var logMaxZoom = Math.log(this.maxZoom);
    var ex = nx * logMaxZoom;
    return  Math.pow(Math.E,ex);
  }
  
   lib.zoomSlider.prototype.toNormalizedZoom = function (zoom) {
    var logMaxZoom = Math.log(this.maxZoom);
    var logZoom = Math.log(zoom);
    return logZoom/logMaxZoom;
  }
    
  lib.zoomSlider.prototype.positionSlider = function (v) {
      var x =this.markerMinX + v*this.barWidth;   
      this.marker.css({top:this.markerTop,left:x});
  }
  
  
  lib.zoomSlider.prototype.positionSliderFromZoom = function (z) {
    this.positionSlider(this.toNormalizedZoom(z));
  }
  
  
  
  
  lib.zoomSlider.prototype.zoomer = function () {
    util.log("zoomer","zoomer",this.zoomDelay);
    var z = this.getZoom();
    var zin = this.zoomingIn;
    var zout = this.zoomingOut;
    
    var thisHere = this;
    var zoomFactor  = this.zoomFactor;
    var nz = 0;
    if (zin || zout) {
      if (zin) {
        var nz = z * this.zoomIncrement;
        
      } else {
        var nz = z/this.zoomIncrement;
      }
      if ((1 <= nz) && (nz <= this.maxZoom)) {
        var dt = new Date();
        var ctm = dt.getTime();
        this.setZoom(nz);
        dt = new Date();
        var etm = dt.getTime() - ctm;
        log("zoomer",Math.floor(etm));
        setTimeout(function () {thisHere.zoomer()},this.zoomDelay);
      } else {
        this.zoomingIn = false;
        this.zoomingOut = false;
        page.zooming = false;
        this.setZoom(this.getZoom()); // will bump the depth if needed
      }
    }
  }
                 
  lib.zoomSlider.prototype.startZoomingIn = function () {
    this.zoomingOut = false;
    this.zoomingIn = true;
    this.startZoomDepth = page.vp.depth;
    page.zooming = true;
    this.zoomer();
  }
  
  
  lib.zoomSlider.prototype.stopZooming = function () {
    log("STOP ZOOMING");

    if (page.vp.depth != page.vp.actualDepth) { // we have deferred some tile loading
      //page.vp.needsRefresh = true;
      this.depth = this.actualDepth;
    }
  //  util.slog("DEPTH ",page.vp.depth,this.startZoomDepth);

    var czm = this.getZoom();
    page.vp.needsRefresh = true;
    page.vp.fromZooming = true;
    page.vp.cachedCoverage = null;
    page.vp.needsRefresh = true;
    page.zooming = false;
    this.setZoom(czm); // will bump the depth if needed
    page.vp.fromZooming = false;
    this.zoomingIn = false;
    this.zoomingOut = false;

  }
  
  
  lib.zoomSlider.prototype.startZoomingOut = function () {
    this.zoomingOut = true;
    this.zoomingIn = false;
    this.startZoomValue = page.vp.zoom;
    page.zooming = true;
    this.zoomer();
  }
})();

