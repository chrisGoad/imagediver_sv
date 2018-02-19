

(function () {
  var lib = exports.IMAGE;
  lib.noCanvas = false; // true mode not in use, nor will be; code fossil
  if (!lib) {
    exports.IMAGE = {};
    lib = exports.IMAGE;
  }
  var geom = exports.GEOM2D;
  var util = idv.util;
  idv.imageLoadCount = 0;
  // A view
  idv.outlineColor = "red";
  idv.selectedColor = "yellow";
  
  lib.Overlay = function (name,geometry) {
    this.geometry = geometry; // currently a Rect
    this.name = name;
  }
  
  // the companion is another viewport whose zooming is coordinated
  lib.Viewport  = function (canvas,tiling,extent,ovCanvas) {
    this.scale = 1;
    this.canvas = canvas;
    if (idv.isDev) {
      var url = tiling.url;
      var idvdvi = url.indexOf("dev.imagediver.com");
      if (idvdvi < 0) {
        var nurl = url.replace(/imagediver\.com/,"dev.imagediver.com");
        tiling.url = nurl;
      }
    }
    canvas.viewport = this;
    if (canvas.isFlashCanvas) {
      this.context = canvas;
      if (lib.noCanvas) {
        this.ovCanvas = canvas;
        this.ovContext = canvas;
      } else {
        this.ovContext = ovCanvas[0].getContext('2d');
      }
    } else {
      var dcanvas = canvas[0];
      this.context =   dcanvas.getContext('2d');
      this.ovContext =   this.context;
    }
    var ctx = this.context;
    ctx.strokeStyle = "#ff0000";
    if (!lib.noCanvas) {
      ovCanvas.viewport = this;
      var dovCanvas = ovCanvas[0];
      this.ovCanvas = ovCanvas;
    }
  //}
    this.showTileBoundaries = false; //for debugging
    this.tiling = tiling;
    this.extent = extent; // extent in pixels of the port
    this.rect = new geom.Rect(new geom.Point(0,0),new geom.Point(1000,1000/page.aspectRatio));
    this.aspectRatio = extent.y/extent.x;
  //  this.depthBias = 0;
    this.zoom = 1;
    this.zoomDelay = 500;//16;
    this.scale = 1.0; // an overall scale factor
    this.maxDepth = 6;
    this.defAreaMode = 0; // when this is true, mouse clicks on the image define an area by dragging, rather than panning the image
  //  this.panCallback = panCallback;
    this.depthOffset = 0; //smaller numbers lead to less resolution, higher speed 
    this.pan = new geom.Point(0,0); // relative to the image center. A pan of -0.5 centers the left edge of the image, and 0.5 the right edge
  //  this.limitedPan = this.pan;
    var im = tiling.image;
    var imextent = im.extent;
    this.imExtent = imextent;
    this.imCenter = imextent.times(0.5);
    // the noZoomScaling is how much the image should be scaled by for its width to fit evenly in the viewport
    this.noZoomScaling = (extent.x)/(imextent.x);
    this.noZoomScaling = 1000/(imextent.x); // for nominal, unscaled viewport
    this.overlays = {}
    this.tilesDrawn = []
    this.idsOfTilesDrawn = []; // for debugging
    this.beingLoaded = []; // for debugging
    this.tilesLoading = [];

    //this.panControl = new imlib.PanControl(lib.imDiv,vp);
    this.zoomCallbacks = [];
    this.panCallbacks = [];
    this.changeViewCallbacks = [];
    this.zoomCount = 0;
    this.needsRefresh = true;

    return;
  
  }
  
  // tranformations between the three coordinate systems: canvas, viewport and image
  lib.Viewport.prototype.viewportToCanvas = function (x) {
    // this is scaling of the viewport into canvas coords (as the window changes size); works for 
    var scale = this.scale;
    return x.times(scale);
  }
  
  
  lib.Viewport.prototype.canvasToViewport = function (x) {
    // this is scaling of the viewport into canvas coords (as the window changes size); works for 
    var invscale = 1/(this.scale);
    return x.times(invscale);
  }
  
  
  lib.Viewport.prototype.rectCanvasToViewport = function (r) {
    var invscale = 1/(this.scale);
    return r.times(invscale);
  }
  
  
  
  lib.Viewport.prototype.pointViewportToImage = function (p) {
      var zoom = this.zoom;
      // scaling from viewport coords to image coords
      var scaling = 1/((this.noZoomScaling)*zoom);
      var vext = this.extent;
      var vcenter = new geom.Point(500,500/(page.aspectRatio));//vext.times(0.5); //in the nominal, unscaled viewport, which has fixed width 1000
      var vrel = p.minus(vcenter); // p relative to the center
      var irel = vrel.times(scaling); // p relative to the center in image coords
      var panDist = this.pan.times(this.imExtent.x); // pan is a multiple of image width
      // the panDist
      var imCenter = this.imCenter;
      var viewCenter = this.imCenter.plus(panDist); // in image  coordinates
      var rs = viewCenter.plus(irel);
      util.log("toim",p.x,p.y,rs.x,rs.y);
      return rs;
  }
  
  
  
  lib.Viewport.prototype.pointImageToViewport = function (p) {
      var panDist = this.pan.times(this.imExtent.x); // pan is a multiple of image width      
      var viewCenter = this.imCenter.plus(panDist); // the center of the current view in image  coordinates
      var relim = p.minus(viewCenter);
     // scaling from image coords to viewport coords
      var scaling = (this.noZoomScaling)*(this.zoom);
      var relvp = relim.times(scaling);  // p relative to the viewport center in vp coords
      var vext = this.extent;
        var vcenter = new geom.Point(500,500/(page.aspectRatio));//vext.times(0.5); //in the nominal, unscaled viewport, which has fixed width 1000
      //var vcenter = vext.times(0.5); // viewport center
      var rs = vcenter.plus(relvp);
      util.log("tovp",p.x,p.y,rs.x,rs.y);
      return rs;
  }
  
  
  lib.Viewport.prototype.rectViewportToImage = function (r) {
    var thisHere = this;
    var f = function (p) {return thisHere.pointViewportToImage(p);}
    return r.applyPointOperation(f);
  }
  
  lib.Viewport.prototype.rectCanvasToImage = function (r) {
    var vp = this.rectCanvasToViewport(r);
    return this.rectViewportToImage(vp);
  }
  
  lib.Viewport.prototype.rectImageToViewport = function (r) {
    var thisHere = this;
    var f = function (p) {return thisHere.pointImageToViewport(p);}
    return r.applyPointOperation(f);
  }
  
  lib.Viewport.prototype.rectImageToCanvas = function (r) {
    var vp = this.rectImageToViewport(r);
    return this.viewportToCanvas(vp);
  }
  
  lib.Viewport.prototype.computeCoverage = function () {
    return this.rectViewportToImage(this.rect);
  }
  
    // the area currently covered in image space
  lib.Viewport.prototype.coverage = function () {
    if (this.cachedCoverage && !lib.checking) return this.cachedCoverage;
    var tl = this.tiling;
    var im = tl.image;
    var zm = this.zoom;
    if (!zm) return null;
    // new way:
    var rs = this.computeCoverage();
    this.cachedCoverage = rs;
    return rs;
  }
  
  lib.Viewport.prototype.coverageToPanZoom = function (coverage) {
    if (!coverage) {
      coverage = this.coverage();
    }
    var covCenter = coverage.center();
    var offset = covCenter.minus(this.imCenter);
    var pan = offset.divideBy(this.imExtent.x); // pan is a multiple of image width
    var im = this.tiling.image;
    var zmx = (im.extent.x)/(coverage.extent.x);
    var zmht = (coverage.extent.x) * this.aspectRatio;  // this is the height in pixels of the covered area, at zoom zmx
    var cvy = coverage.extent.y;
    if (zmht < cvy) { // need to pull back enough to show coverage.extent.y
      zm = zmx * (zmht/cvy);
    } else {
      zm = zmx;
    }
    var cpan = this.pan;
    var czoom = this.zoom; // for debugging
    return {zoom:zm,pan:pan}
  }
    
  
  lib.Viewport.prototype.clearBeenDrawn = function () {
    util.log("beenDrawn","CLEAR");
    if (this.canvas && this.canvas.isFlashCanvas) return; // don't redraw in flash
    var td = this.tilesDrawn;
    var ln = td.length;
    for (var i = 0;i<ln;i++) {
      td[i].beenDrawn = false
    }
    this.tilesDrawn = [];
    this.idsOfTilesDrawn = [];
  }
  
  lib.Viewport.prototype.assertTileDrawn = function (tile) {
    tile.beenDrawn = true;
    //tile.loadingImage = false;
    this.tilesDrawn.push(tile); 
    this.idsOfTilesDrawn.push("r"+tile.path.join(""))
  }
  
  
  lib.Viewport.prototype.assertTileLoading = function (tile) {
    tile.loadingImage = true; 
    this.tilesLoading.push(tile); // this may contain tiles which have already loaded
  }
  
  lib.Viewport.prototype.cancelLoads  = function (dp) { /// cancel all loads of depth > dp
    var ctx = this.canvas;
    var useFlash = ctx.isFlashCanvas;
    if (!useFlash) return;
    var el = ctx.element;
    if (!el) return;
    var tld = this.tilesLoading;
    var ln  = tld.length;
    if (ln == 0) return;
    for (var i=0;i<ln;i++) {
      var tl = tld[i];
      var tlid = tl.id;
     

      var tldp = tlid.length - 1;
         util.log("cancelload",tlid,dp,tldp,tl.beenLoaded,tl.loadingImage);
      if (tl.beenLoaded || !(tl.loadingImage)) continue;
      if (tldp > dp) {
     
        el.cancelLoad(tlid);
      }
    }
  }
    
  
  lib.Viewport.prototype.addOverlay = function (o) {
    var nm = o.name;
    this.overlays[nm] = o;
    
  }
  
  
  lib.Viewport.prototype.clearOverlays= function (o) {
    this.overlays = {};
    this.clearOverlay();
    
  }
  lib.Viewport.prototype.normalizedCanvasToImageCoords = function (np) {
    // np ranges from 0 to 1 in both dimensions
    var cv = this.coverage(); // in image coords, the rect visible in the viewport
    var cvc = cv.corner;
    var cvxt = cv.extent;
    var imx = cvc.x + (np.x * cvxt.x);
    var imy = cvc.y + (np.y * cvxt.y);
    return new geom.Point(imx,imy);
  }
 
 
  
  
  lib.Viewport.prototype.refresh = function (force) {
    if (force) {
      this.needsRefresh = true;
    }
    if (typeof this.zoom == "undefined") this.zoom = this.initialZoom;
    if (this.canvas.isFlashCanvas && !this.canvas.element) return;
    util.log("refresh")
    this.setZoom(this.zoom);
  }
  
  
  lib.relCanvas = function (div,e) {
     var ofs = div.offset();
      var x = e.clientX - ofs.left;
      var y = e.clientY - ofs.top;
      var px = e.pageX- ofs.left;
      var py = e.pageY - ofs.top;
      util.log("drag",ofs.left,ofs.top,x,px,y,py);
      return new geom.Point(px,py);//.divideBy(forControls.scale);
  }
  // also handles dragging to define an area
  lib.PanControl  = function (div,vp,callbacks) {
//    this.vp.pan = new geom.Point(0,0); // relative to the image center. A pan of -0.5 centers the left edge of the image, and 0.5 the right edge
    thisHere = this;
    this.div = div;
    this.vp = vp;
    if (typeof callback=="undefined") {
      this.callbacks = [];
    } else {
      this.callbacks = callbacks;
    }
    //var vp  = forControls.mainVP;
    // REL CANVAS RETURNS A RESULT IN VIEWPORT, not CANVAS coords
    // for debugging
    function relCanvas(e) {
      var ofs = div.offset();
      var x = e.clientX - ofs.left;
      var y = e.clientY - ofs.top;
      var px = e.pageX- ofs.left;
      var py = e.pageY - ofs.top;
      util.log("drag",ofs.left,ofs.top,x,px,y,py);
      return new geom.Point(px,py);//.divideBy(forControls.scale);
    }
    
    function relViewport(e) {
      var rc = relCanvas(e);
      return rc.divideBy(vp.scale);
    }
      
   
    div.mousemove(function (e) {thisHere.mouseMoveHandler(thisHere,e);});
    div.mousedown(function (e) {thisHere.mouseDown(thisHere,e);});
    div.mouseout(function (e) {thisHere.mouseOutt(thisHere,e);});
      
 
    
    div.mouseup(function (e) {thisHere.mouseUp(thisHere,e);});

    
  }
  
  lib.PanControl.prototype.relCanvas  = function (e) {
      if (idv.useFlashForOverlay) {
        return new geom.Point(e.stageX,e.stageY);
      }
      var ofs = this.div.offset();
      var x = e.clientX - ofs.left;
      var y = e.clientY - ofs.top;
      var px = e.pageX- ofs.left;
      var py = e.pageY - ofs.top;
      util.log("dragg",e.clientX,e.pageX,e.clientY,e.client,e.pageY);
      util.log("drag",ofs.left,ofs.top,x,px,y,py);
      return new geom.Point(px,py);//.divideBy(forControls.scale);
    }
    
  lib.PanControl.prototype.relViewport = function (e) {
    var rc = this.relCanvas(e);
    return rc.divideBy(this.vp.scale);    
  }
  
  
  lib.PanControl.prototype.mouseMoveHandler =   function (pc,e) {
        if (e.preventDefault) {
          if (idv.useFlashForOverlay) {
            return;
          }
          e.preventDefault();
        }
        util.log("mouse","movee",e);
        var cp = pc.relViewport(e);
        var df = cp.minus(pc.mouseRef);
         util.log("mouse","cp",cp,"rf",pc.mouseRef);
       var vp = pc.vp;
        if (vp.defAreaMode) {
          if (pc.mouseIsDown) {
            vp.clearOverlay();
            var r = new geom.Rect(pc.mouseRef,df);
            pc.selectedArea = r;
            util.log("drag",r.corner.x,r.corner.y,df.x,df.y);
            vp.drawRect(r,"viewport",idv.selectedColor);
            return;
          }
        }
        var nrp = df.divideBy(vp.extent.x); // normalized in x relative position to mouse ref within the viewport
        var np = cp.divideBy(vp.extent); // normalized  position  within the viewport
        var imc = vp.normalizedCanvasToImageCoords(np);
        //var nrp = vp.normalizedCanvasToImageCoords(np);
        var cv = vp.coverage(); // in image coords, the rect visible in the viewport
        var cvc = cv.corner;
        var cvxt = cv.extent;
        var imx = cvc.x + (np.x * cvxt.x);
        var imy = cvc.y + (np.y * cvxt.y);
        util.log("pan","panx",e,df.x,nrp.x,vp.zoom)
        
      //  util.log("pan",dfop.x,dfop.y);
        util.log("mouse",imc.x,imc.y);
        if (pc.mouseIsDown) {
          var newpan = pc.panRef.minus(nrp.divideBy(vp.zoom/vp.scale));
          util.log("pan","newpan",newpan.x,newpan.y);
       // console.log([cp,df,dfop,np]);
          vp.setPan(newpan);
          var callbacks = pc.callbacks;
          if (callbacks) {
            var ln = callbacks.length;
            for (var i=0;i<ln;i++) {
              var cb = callbacks[i];
              cb(newpan);
            }
          }
        }
      }
  
  lib.PanControl.prototype.mouseDown = function (pc,e) {
      idv.util.log("flash_mouse",e.stageX,e.stageY);
   if (!idv.useFlash) e.preventDefault();
      
        var vp = pc.vp;
        var ps = pc.relViewport(e);
        var ips = vp.pointViewportToImage(ps);
        var bps = vp.pointImageToViewport(ips);

      pc.mouseRef = ps;
      pc.panRef = vp.pan;
      idv.util.log("flash_mouse","ref",ps,vp.pan);
      util.log("mouse","down");
      pc.mouseIsDown = 1;
    }
  
  
  lib.PanControl.prototype.mouseUp = function (pc,e) {
      idv.ee = e; //for debugging
      //console.log(e.clientX,e.clientY,e.stageX,e.stageY);
      util.log("mouse","up");
      //console.log("MOUSE UP");
      var vp = pc.vp;
      if (vp.defAreaMode && pc.mouseIsDown) {
        var cb = vp.areaDefinedCallback;
        if (cb) {
          cb(vp.rectViewportToImage(pc.selectedArea));
        }
      } else {
        var cp = pc.relViewport(e);
        var df = cp.minus(pc.mouseRef);
        var ln = df.length();
        if (ln < 10) {
          var ps = pc.relViewport(e);
          var imc = vp.pointViewportToImage(ps);
          //var nrp = df.divideBy(vp.extent.x); // normalized in x relative position to mouse ref within the viewport
          //var np = cp.divideBy(vp.extent); // normalized  position  within the viewport
          //var imc = vp.normalizedCanvasToImageCoords(np);
          if (lib.clickCallback) {
            lib.clickCallback(imc);
          }
        }
      }
      pc.mouseIsDown = 0;
    //  div.unbind("mousemove");
    //  util.log("pan",thisHere.pan);
  }

  lib.PanControl.prototype.mouseOutt = function (pc,e) {
        util.log("mouse","out");
      var vp = pc.vp;
      if (vp.defAreaMode && pc.mouseIsDown) {
        var cb = vp.areaDefinedCallback;
        if (cb) {
          cb(vp.rectViewportToImage(pc.selectedArea));
        }
      }
      thisHere.mouseIsDown = 0;
    
     // div.unbind("mousemove",mouseMoveHandler);
    }
  
  lib.checking = false; // for debugging

      
  
  // the pan for image top to lie at the top of the viewport, or the bottom at the bottom
  lib.Viewport.prototype.maxYpan = function () {
    var tl = this.tiling;
    var im = tl.image;
    var zm = this.zoom;
    if (typeof zm == "undefined") return 0;
    var imExtent = this.imExtent;
    var imCenter = this.imCenter;
    var coverageXextent = imExtent.x * (1/zm);
    var vext = this.extent;
    var coverageYextent = coverageXextent * (vext.y/vext.x);
    util.log("setZoom","covYext",coverageYextent,imExtent.x);
    if (coverageYextent >= imExtent.y) return 0;
    return Math.abs((0.5 * coverageYextent - imCenter.y)/(imExtent.x));
         //   (imExtent.y - (0.5 * coverageYextent + imCenter.y))/(imExtent.x)];
  }
    /* here's the equation
    0 = lowCov = covCenter - (0.5 * covExtent) = pan.y * imExtent.x + imCenter.y - (0.5 * covExtent)
    pan.y = 0.5*covExtent- (imCenter.y) /imExtent.x
    
    for bottom fit
    highCov = imExtent.y = covCenter + (0.5 * covExtent) = pan.y * imExtent.x + imCenter.y + (0.5 * covExtent)
        pan.y = (imExtent.y - 0.5*covExtent- (imCenter.y)) /imExtent.x
   as they should, these two computations lead to values that sum to zero
    */
    
  
   lib.Viewport.prototype.maxXpan = function (windowMode) {
    var tl = this.tiling;
    var im = tl.image;
    var zm = this.zoom;
    if (typeof zm == "undefined") return 0;
    var imExtent = this.imExtent;
    var imCenter = this.imCenter;
    var coverageXextent = imExtent.x * (1/zm);
    var vext = this.extent;
    //if (coverageXextent >= imExtent.x) return 0;
        //return MathMath.abs((0.5 * coverageXextent - imCenter.x)/(imExtent.x)));//0.364 empirically set so sailing ship would show

    return  Math.abs((0.5 * coverageXextent - imCenter.x)/(imExtent.x+(windowMode?2100:0)));//2100 empirically set 
 //   return  Math.abs((0.5 * coverageXextent - imCenter.x)/(imExtent.x));//0.364 empirically set so sailing ship would show
         //   (imExtent.y - (0.5 * coverageYextent + imCenter.y))/(imExtent.x)];
  }
  
  // returns an array of 1s and 0s for n as a binary number -
  // it is a bit sad to have to write this code when the result is sitting in the internal rep of n
  
  lib.toBase2 = function (n,d) {
    var rs = [];
    var cv = n;
    while (cv > 0) {
      var cd = cv%2;
      rs.push(cv%2);
      cv = Math.floor(cv/2);
    }
    // pad out to d digits
    if (d) {
      var ln = rs.length;
      for (var i=ln;i<d;i++) {
        rs.push(0);
      }
    }
    return rs.reverse();
  }
  
  
  lib.Tiling.toTileId = function (xv,yv,d) {  // xv,yv are grid coords in a grid of size pow(2,d) - this converts to a gigapanish id
    var xb2 = lib.toBase2(xv,d);
    var yb2 = lib.toBase2(yv,d);
    var id = "r";
    for (var i=0;i<d;i++) {
      var xd = xb2[i];
      var yd = yb2[i];
      if (xd) {
        if (yd) {
          var cpe = "3";
        } else {
          cpe="1";
        }
      } else {
        if (yd) {
          cpe="2";
        } else {
          cpe = "0";
        }
      }
      id += cpe;
    }
    return id;
  }
    
  
    
    
    
    
    
  lib.Tiling.prototype.withinTile = function (p,d) { // which tile at depth d is the image point in?
    var ar = this.aspectRatio;
    var tts = this.topTileSize;
    var x = p.x;
    var y = p.y;
    var tileDim = tts/Math.pow(2,d);
    var xindex = Math.floor(x/tileDim);
    var yindex = Math.floor(y/(tileDim));
    return lib.Tiling.toTileId(xindex,yindex,d);
  }
  
   lib.debug = false;
  
   lib.Tiling.prototype.coveringTiles= function (r,d) { // tiles that intersect rectangle r
    if (lib.debug) debugger;
    var ar = this.aspectRatio;
    var tts = this.topTileSize;
    var p = r.corner;
    var xt = r.extent;
    var q = p.plus(xt); 
    var px = p.x;
    var py = p.y;
    var qx = q.x;
    var qy = q.y;
    var tileDim = tts/Math.pow(2,d);
    var pxindex = Math.max(Math.floor(px/tileDim),0);
    var pyindex = Math.max(Math.floor(py/(tileDim)),0);
    var qxindex = Math.max(Math.floor(qx/tileDim),0);
    var qyindex = Math.max(Math.floor(qy/(tileDim)),0);
    var rs = [];
    for (var i=pxindex;i<=qxindex;i++) {
      for (var j=pyindex;j<=qyindex;j++) {
        rs.push(lib.Tiling.toTileId(i,j,d));
      }
    }
    util.log("coveringTiles",rs);
    return rs;
  }
  
  lib.Viewport.prototype.clear = function () {
    var ctx = this.context;
    var useFlash = ctx.isFlashCanvas;
    if (useFlash) {
      return;
      ctx.hideImages();
    }
    var xt = this.rect.extent.times(this.scale);
    ctx.clearRect(0,0,xt.x,xt.y);
    var octx = this.ovContext;
    if (octx) {
      octx.clearRect(0,0,xt.x,xt.y);
    }
    this.clearBeenDrawn();
  }
  
  // clear out the overlay layer, but not the overlay content (done by clearoverlays)
  lib.Viewport.prototype.clearOverlay = function () {
    var ctx = this.context;
    var xt = this.rect.extent.times(this.scale);
    var octx = this.ovContext;
    if (octx) {
      var useFlash = octx.isFlashCanvas;
      if (useFlash) {
        var el = octx.element;
        if (el&&el.removeShapes) {
          el.removeShapes();
        }
      } else {
        octx.clearRect(0,0,xt.x,xt.y);
      }
    }
  }
  
  // k now placement of tile images
  
  lib.Viewport.prototype.drawTileImage = function (tile,trycount,behind) {
      var ctx = this.context;
      var useFlash = ctx.isFlashCanvas;
      if (useFlash) { // in the flash case, just draw the tile in image coords
        var vc = tile.corner;
        var im = this.tiling.image;
        var imxxt = im.extent.x;
        var imyxt = im.extent.y;
        vc = new geom.Point(vc.x - imxxt/2,vc.y-imyxt/2);
 
        var ve = tile.coverage;
      } else {
        vc = tile.whereToDraw.corner.times(this.scale);
        ve = tile.whereToDraw.extent.times(this.scale);
      }
      var im = tile.image;
   
      var ee;
      var trycountv = trycount?trycount:1;
   //   if (trycountv > 1)
      pln = tile.path.length;
      
      util.log("draw",this.depth,pln,this.scale,this.zoom,trycountv,tile.id,vc.x,vc.y,ve.x,ve.y);
      var thisHere = this;
      if (useFlash) {
        if (tile.beenDrawn) return;
        var tiling = this.tiling;
        //tiling.url = "http://dev.imagediver.com/tilings/Panorama1923_3/"
        //tiling.url = "http://dev.imagediver.com/tilings/Panorama2010_3/"
        var imsrc = tiling.url + (tile.id) +".jpg";
        util.log("flashDraw",tile.id);
        var imdrawn = ctx.drawImage(imsrc,vc.x,vc.y,ve.x,ve.y);
        if (imdrawn) this.assertTileDrawn(tile); else tile.loadingImage = false;
        return;
      }
      try {
        if (behind) ctx.globalCompositeOperation  = "destination-over";
        ctx.drawImage(im,vc.x,vc.y,ve.x,ve.y);
        if (behind) ctx.globalCompositeOperation  = "source-over";
        this.assertTileDrawn(tile);
        var pln = tile.path.length;
        if (this.showTileBoundaries) {
          if ((pln%2) == 0) ctx.strokeStyle = "red";
          else ctx.strokeStyle="green";
          ctx.strokeRect(vc.x,vc.y,ve.x,ve.y);
        }
      } catch (e) {
        ee = e;
        util.log("drawfail",tile.path);
        if (trycountv < 1) {
          setTimeout(function () {thisHere.drawTileImage(tile,trycountv+1,behind);},200);
        }
      }
  }
   
    
  lib.Viewport.prototype.canvasToImageCoords = function (p) {
  }
  

  
  
  lib.Viewport.prototype.drawRect = function (ir,coordSystem,color) { // coordSystem = "canvas" "viewport" or "image"
    if (coordSystem == "image") {
      var r = this.rectImageToCanvas(ir);
    } else if (coordSystem == "viewport") {
      r = this.viewportToCanvas(ir);
    } else {
      r = ir;
    }
    var ctx = this.ovContext;
    var useFlash = ctx.isFlashCanvas
    if (!useFlash) ctx.save();
    ctx.strokeStyle = color
    corner = r.corner;
    extent = r.extent;
    ctx.strokeRect(corner.x,corner.y,extent.x,extent.y);
    if (!useFlash) ctx.restore();
  }
    
  
  lib.Viewport.prototype.drawOverlays = function () {
    this.clearOverlay();
    var os = this.overlays;
    for (var i in os) {
      var o = os[i];
      var g = o.geometry;
      var color = o.color;
      if (color == "undefined") {
        color = idv.selectedColor;
      }
      this.drawRect(g,"image",color);
    }
   // this.drawRect(); // with no args this draws a boundary around the viewport, which hides "ghosts"
  }
      
  
  lib.Viewport.prototype.drawTile = function (tile,behind) {
    //console.log(tile);
    var ctx = this.context;
    var useFlash = ctx.isFlashCanvas;

    var tileDepth = tile.path.length;
    util.log("draw","mightDraw ",tile.path.join(""));
    if (tile.outsideImage) {
       util.log("draw","did not draw because outside ",tile.path.join(""));
      return;
    }
    if (tile.beenDrawn) {
      util.log("beenDrawn","been drawn",tile.path.join(""));
       util.log("draw","did not draw because been drawn ",tile.path.join(""));
      return;
    }
    util.log("beenDrawnn","drawing",tile.path.join(""));

    var coverage = this.coverage();
    // at no zoom the tile needs to scaled first by the ratio of the width it covers (tile.size) to  tileImageSize
    // then by the noZoomFactor (which maps image dimension to viewport dimension)
    //
    var tiling = this.tiling;
    var ar = tiling.aspectRatio;
    var timsz = tiling.tileImageSize;
    
    var zoom = this.zoom;
    // scaling from image coords to view port coords
  //  var scaling = ((tile.size)/(tiling.tileImageSize))*(this.noZoomScaling)*zoom;
    var scaling = (this.noZoomScaling)*zoom;
    var tileCorner = tile.corner;
    var coverageCorner = coverage.corner;
    var vcorner = tileCorner.minus(coverageCorner).times(scaling);  // coords in viewport coords
    var cv = tile.coverage;
    var vwidth = (cv.x)*scaling + 1; // width in viewport pixels; bogus extra pixel to avoid gaps
    var vheight = (cv.y)*scaling + 1;
    var vextent = new geom.Point(vwidth,vheight);
    tile.whereToDraw = new geom.Rect(vcorner,vextent);
    var im = tile.image;
    var thisHere = this;
    if (im) {
      this.drawTileImage(tile,null,behind);
    } else {
      // draw the parent, if it is all set to go, or grandparent etc
      var ptile = tile.parent();
      while (ptile) {
        var pim = ptile.image;
        if (pim && ptile.imageLoaded) {
          util.log("parent",tile.path,ptile.path)
          this.drawTile(ptile,true);
          break;
        // return;//for debugging
        } else {
          ptile = ptile.parent();
        }
      }
      if (tile.loadingImage) return; // loading this image, but the loading has not completed
      tile.loadingImage = 1;
      if (useFlash) {
      
        this.assertTileLoading(tile);
        this.drawTileImage(tile,null,behind);
        return;

        
      }
      var im = document.createElement('img');
      var imsrc = tiling.url + (tile.id) +".jpg"; //todo
      util.log("imsrc",imsrc);
      var imjq = $(im);
      imjq.css({left:0,top:0,"z-index":100*tileDepth,position:"absolute"});
      //util.log("loaded","depth",tileDepth);
     
      //im = new Image();
      thisHere.beingLoaded.push(tile.path.join(""));//for debugging
      imjq.load(function () {
        tile.image = im;
        tile.loadingImage = false;
        tile.imageLoaded = true;
        idv.imageLoadCount = idv.imageLoadCount +1;
        util.log("loaded",tile.path.join(""));
        if (thisHere.depth + thisHere.depthOffset == tile.path.length) { // if this tile is still appropriate for the current depth
          thisHere.drawTile(tile);
        }
        // the rest of this code is for debugging
        var bld = thisHere.beingLoaded;
        var bln = bld.length;
        var nbld = [];
        var mid = tile.path.join("");
        for (var i = 0;i<bln;i++) {
          var cid = bld[i];
          if (cid != mid) {
            nbld.push(cid);
          }
        }
        thisHere.beingLoaded = nbld;
          
      });
      // define onload before setting src for IE
      // see http://www.alanedwardes.com/posts/internet-explorer-opera-and-javascript-image-object-onload-event/
      imjq.attr("src",imsrc);
      $(".imageHolder").append(imjq);
    }
  }
  
  
  
  lib.Viewport.prototype.coveringTiles = function (d) {
    var coverage = this.coverage();
    if (!coverage) return [];
    var tiling = this.tiling;
    return tiling.coveringTiles(coverage,d);
  }
  
  lib.Viewport.prototype.setFlashScale = function (s) {
    var e = this.canvas.element;
    if (e  && e.setScale) {
      e.setScale(s);
    }
  }


  lib.Viewport.prototype.setFlashPan = function (x,y) {
    var e = this.canvas.element;
    if (e  && e.setPan) {
      e.setPan(x,y);
    }
  }
  
  
  lib.Viewport.prototype.drawTiles = function (d) {
    var useFlash = this.canvas && this.canvas.isFlashCanvas;
    if (useFlash) {
      var cs = this.scale;
      var im = this.tiling.image;
      var imxxt = im.extent.x;
      var vpxxt = this.rect.extent.x;
      var vpyxt = this.rect.extent.y;
      var zm = this.zoom;
      var fsc = zm * cs * vpxxt/imxxt;
      util.log("flashScale",zm,cs,fsc);
      this.setFlashScale(fsc);
      var pxbias = cs  * vpxxt/2; // 0 pan in flash is effectively this pan; this is also the scale factor
      var pybias = pxbias*this.aspectRatio; // 0 pan in flash is effectively this pan; this is also the scale factor
      var pscale = cs * zm * vpxxt;
      var px = pxbias -  this.pan.x * pscale;
      var py = pybias - this.pan.y * pscale;
      util.log("flashPan",this.pan.x,this.pan.y,px,py);
      this.setFlashPan(px,py);
      //this.setFlashPan()
    }
    this.clear();
    var tileids = this.coveringTiles(d);
    //util.log("depth",tileids);
    var byId = this.tiling.tilesById;
    var ln = tileids.length;
    /* this.depth = d; experiment */
    
    for (var i=0;i<ln;i++) {
      var tlid = tileids[i];
      var tl = byId[tlid];
      if (tl) {
        this.drawTile(tl);
      }
    }
  }
  
  
  lib.Viewport.prototype.setPan = function (ip,skipCallbacks) { // -0.5 centers left edge
    util.log("setPan","pan",ip.x,ip.y,"maxypan",this.cmaxYpan,"zoom",this.zoom,"depth",this.depth);
    var lp = this.limitPan(ip);
    if (lp != null) {
      this.limitedPan = lp;
      p = lp;
    }
    var cv = this.coverage();
    var cvxt = cv.extent;
    var cvc = cv.corner;
    var imxt = this.imExtent;
    var bottomCv = cvc.y+cvxt.y; // this is the max y value in image space covered
    this.pan = p;
    this.cachedCoverage = null;
    /* this.drawTiles(this.depth-1); /* an experiment */
    this.drawTiles(this.depth+this.depthOffset); 
    this.drawOverlays();
    var pcbs = this.panCallbacks;
    if (!skipCallbacks) {
      util.runCallbacks(this.panCallbacks,p);
      util.runCallbacks(this.changeViewCallbacks);
    }
  }
  
  

  
  lib.Viewport.prototype.setZoom = function (z,dontDraw,dontCallTheCallback) { // -0.5 centers left edge
    util.log("setZoom",z);
    if (this.renderedZoom != z) {
      this.needsRefresh = true;
    } else {
      var abc =22;
    }
    if (!this.needsRefresh) return;
    this.zoomCount = this.zoomCount + 1;
    //if (z == this.renderedZoom) return;
    this.zoom = z;
    this.cmaxYpan = this.maxYpan();
    this.cmaxXpan = this.maxXpan();
    this.cmaxXpanWindow = this.maxXpan(window);
    util.log("setZoom","panLimit",this.cmaxXpan,this.cmaxYpan);
    var lp = this.limitPan(this.pan);
    if (lp) {
      this.pan = lp;
    }
    var nd  = Math.floor(Math.log(z*(this.scale))/Math.LN2 + this.depthBump);// + this.depthBias); depthBias no longer used
    util.slog("nd ",nd,"scale ",this.scale);
    nd = Math.min(this.maxDepth,nd);
    if (nd != this.depth) {
      util.log("depth",nd,this.maxDepth);
      //console.log("new depth",nd);
      this.actualDepth = nd;
      //util.activeConsoleTags = ["draw"]
      if (nd < this.depth || !page.zooming) { // don't bump the depth while in the midst of zooming
        this.depth = nd;
        this.cancelLoads(nd);
      }
    }
    this.cachedCoverage = null;
    if (!dontDraw) {
      this.drawTiles(this.depth+this.depthOffset);
      if (!lib.showSnapsMode) this.clearOverlay();
      this.drawOverlays();
      this.needsRefresh = false;
      this.renderedZoom = z;
    }
    if (dontCallTheCallback) return;
    util.runCallbacks(this.zoomCallbacks,z,dontDraw);
    util.runCallbacks(this.changeViewCallbacks,dontDraw);
  }
  
  
  lib.Viewport.prototype.limitPan = function (p) {
    if (!p) return null;
    if (typeof this.zoom == "undefined") return null;
    var py = p.y;
    
    py = Math.min(py,this.cmaxYpan);
    py = Math.max(py,-this.cmaxYpan);
    var px = p.x;
    px = Math.min(px,this.cmaxXpan);
    px = Math.max(px,-this.cmaxXpan);
    util.log("limitPan",p.x,px,p.y,py);
   // util.log("limitPan",p.x,this.windowVP.cmaxXpan,p.y,this.mainVP.cmaxYpan);
    return new geom.Point(px,py);
  }

  lib.Viewport.prototype.setPanZoom = function (p,z) { // -0.5 centers left edge
    this.setZoom(z,true);
    this.setPan(p);
  }
  
  lib.Viewport.prototype.setCoverage = function (cov) {
    var pz = this.coverageToPanZoom(cov);
    this.setPanZoom(pz.pan,pz.zoom);
  }
  
    


  lib.Topbar = function (container,options)  {
    this.container = container;
    util.setProperties(this,options,["title","aboutText","aboutTitle","includeGallery","fullsize","wikipediaPage","json","embed","inIframe"]);
  }
  
  lib.Topbar.prototype.render = function () {
    var cnt = this.container;
    var embed = this.embed;
    var thisHere = this;
    //var caption = lib.albumD.caption;
    var logo = $('<span class="logo">imageDiver</span>');
    if (embed) {
      logo.click(function () {util.navigateToPage(util.dropQS(),embed);});
    } else {
      logo.click(function () {util.navigateToPage("/");});
    }
    if (embed) {
      cnt.append(logo);
      var titleSpan = $('<span>'+this.title+'</span>');
      cnt.append(titleSpan);
      lib.titleSpan = titleSpan;
      return;
    }
    var topDivTop = $('<div class="topDivTop"></div>');
    cnt.append(topDivTop);
    var tdt = topDivTop;
    tdt.append(logo);
    var brie8 =   $.browser.msie && (parseFloat($.browser.version) < 9);
    var okb = !brie8;
    if (brie8 && false) {
      var ie8Note =  $('<span class="titleRight" style="font-size:8pt">To see more ImageDiver content, please upgrade your browser (Internet Explorer 8) to version 9, or come back with Chrome, Firefox, or Safari.</span>');
      tdt.append(ie8Note);
      return;
    }
    var contactIDV = $('<span class="titleRight">contact</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
    tdt.append(contactIDV);
    contactIDV.click(function () {util.navigateToPage("http://imagediver.org/contact")});
 
    if (this.aboutText) {
      var atitle = this.aboutTitle;
      var about = $('<span class="titleRight">'+atitle+'</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
      tdt.append(about);
      about.click(function () {
        var th = thisHere;//for debugging
        thisHere.lightbox.pop();
        thisHere.lightbox.setHtml(thisHere.aboutText);
      });
    }
    if (this.includeGallery) {
      var gallery = $('<span class="titleRight">gallery</span>');
      // var gallery = $('<span style="float:right" class="smallClickableElement">gallery</span>');
      tdt.append(gallery);
      gallery.click(function () {
        util.navigateToPage('/gallery');
      })//location.href="/gallery";});
    }
    if (this.fullsize) {
      var fs = $('<span class="titleRight">image/other albums</span>');
      // var gallery = $('<span style="float:right" class="smallClickableElement">gallery</span>');
      tdt.append(fs);
      fs.click(function () {
        util.navigateToPage(thisHere.fullsize);
      });
    }
    var json = this.json;
    if (json && okb) {
      var jsonButton = $('<span class="titleRight">json</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
      tdt.append(jsonButton);
      jsonButton.click(function () {util.navigateToPage(json);});
    }
 
    var wpg = this.wikipediaPage;
    if (wpg  && okb) {
      var wikipediaButton = $('<span class="titleRight">wikipedia</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
      tdt.append(wikipediaButton);
      wikipediaButton.click(function () {util.navigateToPage(wpg);});
    }
    if (0 && idv.loggedInUser) { // add this
      var logOut = $('<div style="position:absolute;right:5px;top:0px" class="smallClickableElement">log out</span>');
      tdt.append(logOut);
    }
    
    var titleDiv = $('<div class="titleDiv">'+this.title+'</div>');
    //titleDiv.css(page.css.titleDiv);
    cnt.append(titleDiv);
    lib.titleDiv = titleDiv;
    //r lg = com.genLogo();
    //r cnt = this.container;
   //nt.append(lg);
  }
  
  
  lib.genTopbar = function (container,options) {
    //title,includeAbout,includeGallery) {
    var topDiv = $('<div class="topDiv"/>');
     container.append(topDiv);
    lib.topDiv = topDiv;
    //b.setRect(lib.controlDiv,lib.controlRect);
    lib.topbar =  new lib.Topbar(topDiv,options);
    lib.topbar.render();
    return lib.topbar;
  }
    
  lib.DualControl= function (vp0,vp1) {
    this.vp0 = vp0;  // the reference viewport: pan and zoom values are taken from this
    this.vp1 = vp1;
    var thisHere = this;
    function vp1SetPan(p) {
      vp1.setPan(thisHere.pan0topan1(p),true);
    }
    this.vp0.panCallbacks.push(vp1SetPan);
    function vp0SetPan(p) {
      var p0p = thisHere.pan1topan0(p);
      vp0.setPan(p0p,true);
    }
    this.vp1.panCallbacks.push(vp0SetPan);
    function vp1SetZoom(z,dontDraw) {
      util.log("dual"," control1 zoom to "+z);
      vp1.setZoom(z,dontDraw,true);
    }
    this.vp0.zoomCallbacks.push(vp1SetZoom);    
  }    


  lib.DualControl.prototype.pan0topan1= function (p) {
    var po = p.plus(this.panOffset);
        util.log("adjustment","offsetonly",po.x);

    var px = po.x;
    var py = po.y;
    var pxg = this.panxGrid; // locacal adjustment
    var adx = pxg.valueAt(px); // local  adjustment
    util.log("adjustment",px,adx);
    var spx = (px+adx)/(this.spanFactor);//scaled 
    var rs = new geom.Point(spx,py);
    util.log("pastPan",p.x,rs.x);
    return rs;
  }
  
  
  
  lib.DualControl.prototype.pan1topan0 = function (p) {
    var po = p.minus(this.panOffset);
    util.log("adjustment","offsetonly",po.x);
    var px = po.x;
    var py = po.y;
    var pxg = this.panxGrid; // locacal adjustment
    var adx = pxg.valueAt(px); // local  adjustment
    util.log("adjustment",px,adx);
    var spx = (px-adx)*(this.spanFactor);//scaled 
    var rs = new geom.Point(spx,py);
    util.log("presentPan",p.x,rs.x);
    return rs;
  }
  
lib.flashCanvasCount = 0;

lib.flashCanvas = function (options) {
  var extent = options.extent;
  var cn = options.container;
  lib.flashCanvasCount = lib.flashCanvasCount + 1;
  var fid = "flashDiv"+lib.flashCanvasCount;
  var fdiv = $('<div id="'+fid+'" style="width:100%;height:100%">');
  cn.append(fdiv);
  //var zIndex = options.zIndex;
  

  //var cnid = cn.attr("id");
  this.myId = fid;
  var xe = 300;
  if (extent  && extent.x) xe = extent.x;
  var ye = 300;
   if (extent && extent.y) ye = extent.y;
   var aext = new geom.Point(xe,ye);
  this.extent = aext;
  this.container = cn;
  this.isFlashCanvas = true;
 //swfobject.embedSWF("hx/hello.swf", cnid, ""+xe, ""+ye, "9.0.0");
 var thisHere = this;
 function waitForInitThenRefresh(fc) {
   var e = fc.element;
        util.log("waiting")

   if (e.setScale  && e.drawImage && fc.viewport && page.vp) {
    //alert("flash ready")
    page.placeDivs();
    fc.viewport.refresh(true);

   } else {
     setTimeout(function () { waitForInitThenRefresh(fc);},100);
   }
 }
  var fn = function () {
    var flashEl = document.getElementById(fid);
    thisHere.element = flashEl;
    thisHere.jel = $(thisHere.element);
    idv.jel = thisHere.jel; // for testing
    //alert("hoob");
    thisHere.jel.attr("width",thisHere.extent.x);
    thisHere.jel.attr("height",thisHere.extent.y);
    //if (zIndex != undefined) {
    //  fdiv.css("z-index",zIndex);
    //}
    waitForInitThenRefresh(thisHere);
  }
  var params = {
                            scale:'noscale',
                            quality:'best',
                            align:'left',
                            salign:'tl',
                            allowScriptAccess:'always',
                            wmode:'transparent',
                            bgcolor:"#000000",
                            menu: 'false'
                        };
  var flashvars = {
    whichCanvas:fid
  }
  var fv = swfobject.getFlashPlayerVersion();
  var noFlash = fv.major == 0;
  var flashEl = document.getElementById(fid);
  var flashJel = $(flashEl);
  if (noFlash) {
    //debugger;
    flashJel.html('<p>This web page requires Adobe Flash.</p><p> <img id="getFlash" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"/></p>');
    $('#getFlash').click(function () {location.href="http://www.adobe.com/go/getflashplayer";});
  } else {
    //alert(JSON.stringify(fv.major==10));
 //fdiv.append('<object  classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="650" height = "100"><param name="movie" value="hx/canvas.swf"></object>');
   swfobject.embedSWF("/hx/canvas.swf", fid, "40", "100", "10","/js/expressInstall.swf",flashvars,params,null,fn);
  }
 this.context = this;
}

lib.flashCanvas.prototype.attr = function (atr,val) {
  if (typeof atr == "object") {
    var wd = atr.width;
    if (typeof wd == "number") {
      this.attr("width",wd);
    }
    var ht = atr.height;
    if (typeof ht=="number") {
      this.attr("height",ht);
    }
    return;
  }
  if (atr == "width") {
    this.extent.x = val;
    if (this.jel) {
      this.jel.attr("width",val);
      this.jel.attr("left",0);
      this.jel.attr("top",0);
    
    }
  /*  var el = this.element;
    if (el  && el.setStageWidth) {
      el.setStageWidth(val);
    }
    return;
  */
  }
 if (atr == "height") {
    this.extent.y = val;
    if (this.jel) {
      this.jel.attr("height",val);
    }
    return;
  }
}


lib.flashCanvas.prototype.drawImage = function (url,x,y,xxt,yxt) {
  var el = this.element;
  if (el  && el.drawImage) {
    el.drawImage(url,x,y,xxt,yxt);
    return true;
  }
 
  drawImageFailed = true;
  
  return false;
}



lib.flashCanvas.prototype.beginPath = function () {
  var el = this.element;
  if (el) {
    el.beginPath();
  }
}
lib.flashCanvas.prototype.arc = function (cx,cy,radius,i0,i1,i2) {
  var el = this.element;
  if (el) {
    el.arc(cx,cy,radius,i0,i1,i2);
  }
}

lib.flashCanvas.prototype.stroke = function () {
}


lib.flashCanvas.prototype.moveTo = function (x,y) {
  var el = this.element;
  if (el) {
    el.moveTo(x,y);
  }
}


lib.flashCanvas.prototype.lineTo = function (x,y) {
  var el = this.element;
  if (el) {
    el.lineTo(x,y);
  }
}

lib.flashCanvas.prototype.hideImages = function () {
  var el = this.element;
  if (el) {
    el.hideImages();
  }
}


lib.flashCanvas.prototype.mousedown= function (f) {
  var cn = this.container;
  cn.mousedown(f);
}


lib.flashCanvas.prototype.mouseup= function (f) {
  var cn = this.container;
  cn.mouseup(f);
}

lib.flashCanvas.prototype.mouseleave  = function (f) {
  var cn = this.container;
  cn.mouseleave(f);
}


lib.flashCanvas.prototype.strokeRect = function (lx,ly,xxt,yxt)  {
  var el = this.element;
  if (el && el.strokeRect) {
    el.strokeRect(lx,ly,xxt,yxt);
  }
}
//          ctx.strokeRect(vc.x,vc.y,ve.x,ve.y);

lib.flashCanvas.prototype.clearRect= function (xl,yl,w,h) {
}

lib.flashCanvas.prototype.getContext = function (wc) {
  return this;
}
  
lib.genCanvas = function (options) {
  if (idv.useFlash) {
    var wc = options.whichCanvas;
    if (lib.noCanvas && (wc == "ov")) return null;
    if (wc == "vp") {
      var fc = new lib.flashCanvas(options);
      return fc;
    }
  }
  
  var container = options.container;
  var extent = options.extent;
  var zIndex = options.zIndex;
  var bcolor = options.backgroundColor;
  if (!bcolor) bcolor = "#000000"
  var icanvasE = document.createElement('canvas');
  var br = $.browser;
  if (br.msie && (parseFloat(br.version) < 9)) {
    idv.useFlashForOverlay = true;
    G_vmlCanvasManager.initElement(icanvasE);
  }

 // var ich = '<canvas style="z-index:10;opacity:1;position:absolute;left:'+maplft+'px;top:'+maptp+'px;" width="'+mapwd+'" height="'+mapht+'"></canvas>'
  icanvasE.setAttribute("width",extent.x);
  icanvasE.setAttribute("height",extent.y);

  //icanvasE.setAttribute("width","100%");
 // icanvasE.setAttribute("height","100%");

//  util.initCanvas(icanvasE);
  icanvas =  $(icanvasE);
  icanvas.css("position","absolute");

  theCanvas = icanvas;
  //icanvas.css("position","absolute");
  icanvas.css("opacity",1);// IE requires non zero opacity for interaction
  var corner = options.corner;
  
//  icanvas.css("background-color","#00c0c0");
  icanvas.css("background-color",bcolor);
 icanvas.css("z-index",zIndex);
  container.append(icanvas);
  
  if (corner) {
    icanvas.css({top:corner.y,left:corner.x});
  } else {
    icanvas.css({top:0,left:0});
  }
  return icanvas;
  //var ictx= new yUp(icanvasE.getContext('2d'),1,1);
 // theContext = icanvasE.getContext('2d'); // no more yUp
}
})();

// called from flash
function imageLoaded(x) {
  //idv.util.log("flash","loaded "+x);
  var slidx = x.lastIndexOf("/");
  var didx = x.lastIndexOf(".");
  var tid  = x.substring(slidx+1,didx);
  idv.util.log("imageLoaded","image loaded "+tid);
  var byid = page.vp.tiling.tilesById;
  var tl = byid[tid];
  tl.loadingImage = false;
  tl.beenLoaded = true;
  //idv.util.log("cancelload","LOADED "+tid);
  im = "flashImage";
  tl.image = im;
  idv.imageLoadCount = idv.imageLoadCount +1;
  
  //idv.util.log("flash","count bumped "+idv.imageLoadCount);

  
}

function pc_mousedown(wc,x,y) {
  //alert("MOUSE IS DOWN "+wc+","+x+","+y);
  //idv.util.log("flash_mouse","down",wc,x,y);
  if (wc == "flashDiv1") {
    var pc = page.vp.panControl;
  } else {
    var pc = page.vp1.panControl;
  }
  var e = {stageX:x,stageY:y};
  //if (pc) rs = "HOOO";
  //return rs;
  pc.mouseDown(pc,e);
   return wc;
 return "testResult";
}



function pc_mousemove(wc,x,y) {
  idv.util.log("flash_mouse","movee",wc,x,y);
  if (wc == "flashDiv1") {
    var pc = page.vp.panControl;
  } else {
    var pc = page.vp1.panControl;
  }
  var e = {stageX:x,stageY:y};
  pc.mouseMoveHandler(pc,e);
}


function pc_mouseup(wc,x,y) {
  idv.util.log("flash_mouse","up",wc,x,y);
  if (wc == "flashDiv1") {
    var pc = page.vp.panControl;
  } else {
    var pc = page.vp1.panControl;
  }
  var e = {stageX:x,stageY:y};
  pc.mouseUp(pc,e);
}

function pc_doubleclick(wc,x,y) {
  //doesn't work; don't know why
  //console.log("double click",x,y);
}


function fp(x,y) {
  if (!y) y = 0;
  var e = page.vp.canvas.element;
  e.setPan(x,y);
}

var drawImageFailed = false;

