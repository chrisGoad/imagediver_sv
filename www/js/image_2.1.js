
var imlib = exports.IMAGE;
/*
  theory of operation
  three coordinate systems:
  image (upper left corner 0,0 ranging to the dims of the image)
  
  viewport. Always 1000 wide. aspect ratio determines hegith (now always 1000 or 500)
  two parameters determine map from image to viewport: pan, and zoom
  1 unit of pan is the width of the image.
  pan 0,0 = center of image = center of viewport
  zoom 1 means that the image fits evenly in the viewport.
  
  canvas: these are the coordinates in which basic drawing ops (in flash or html5 canvas) are carried out
  this a scaling only. the upper left of the canvas = 0,0 = upper left of viewport
  for the html5 canvas case, the scale factor is the ratio of width of the screen canvas and the viewport (ie 1000)
  for flash, there is an additional factor. flash places the stage so that it evenly fits in the surrounding div
  if the stage has lower aspect ratio than the div, then there is no further scaling.
  in the other case, the stage is shrunk so that the y dim will fit.
*/

  
  


(function () {
  var lib = exports.IMAGE;
  lib.noCanvas = !(Modernizr.canvas);
  lib.noCanvas = true;
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
    /*
    if (idv.isDev) {
      var url = tiling.url;
      var idvdvi = url.indexOf("dev.imagediver.com");
      if (idvdvi < 0) {
        var nurl = url.replace(/imagediver\.com/,"dev.imagediver.com");
        tiling.url = nurl;
      }
    }
    */
    canvas.viewport = this;
   
    //console(canvas);
    if (canvas.isFlashCanvas) {
      this.context = canvas;
      if (lib.noCanvas) {
        this.ovCanvas = canvas;
        this.ovContext = canvas;
      } else {
        if (ovCanvas) {
          this.ovContext = ovCanvas[0].getContext('2d');
        }
      }
    } else {
      var dcanvas = canvas[0];
      this.context =   dcanvas.getContext('2d');
      this.ovContext =   this.context;
    }
    var ctx = this.context;
    ctx.strokeStyle = "#ff0000";
    if (ovCanvas && !lib.noCanvas) {
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
    
    var imx = imextent.x;
    var imy = imextent.y;
    var war = this.extent.y/this.extent.x; // window aspect ratio
    var imar = imy/imx;
    var xconstrained = imar < war; // image at zoom 1 fits x into the viewport
    this.xconstrained = xconstrained;
    // the noZoomScaling is how much the image should be scaled by for it to fit evenly in the viewport
    var xsc = (extent.x)/(imextent.x);
    var ysc = (extent.y)/(imextent.y);
    this.noZoomScaling = Math.min(xsc,ysc);
    this.noZoomScaling = 0.01;
    //(extent.x)/(imextent.x);
    if (xconstrained) {
      awdr = 1.0;
    } else {
      var awdr = ((imextent.y/imextent.x)/(this.extent.y/this.extent.x)); // the x span occupied by this image is less than nominal value by the ratio of its aspect ratio to the vp aspect ratio
    }
    var xsc = 1000/(imextent.x);
    var ysc = 1000/(imextent.y);
    this.noZoomScaling = 1000/(awdr * imextent.x); // for nominal, unscaled viewport
    //this.noZoomScaling = Math.min(xsc,ysc);
    //this.noZoomScaling = 1; //@rremove
    this.overlays = {} //used for outlined snaps
    this.selOverlays = {} // used for selected snaps
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
  // the canvas is scaled by the size of the window.
  // but also, the image is scaled to fit into the viewport. This is the "fitScale"
  
  lib.Viewport.prototype.viewportToCanvas = function (x) {
    // this is scaling of the viewport into canvas coords (as the window changes size); works for 
    var scale = this.scale;// * this.fitScale; // zzuubb @rremove 
    return x.times(scale);
  }
  
  
  lib.Viewport.prototype.canvasToViewport = function (x) {
    // this is scaling of the viewport into canvas coords (as the window changes size); works for 
    var invscale = 1/(this.scale);// * this.fitScale);  // zzuubb remove fitscale factor
    return x.times(invscale);
  }
  
  
  lib.Viewport.prototype.rectCanvasToViewport = function (r) {
    var invscale = 1/(this.scale);//*this.fitScale);
    return r.times(invscale);
  }
  
  
  
  lib.Viewport.prototype.pointViewportToImage = function (p) {
      var zoom = this.zoom;
      // scaling from viewport coords to image coords
      var scaling = 1/((this.noZoomScaling)*zoom);
      var vext = this.extent;
      var vcenter = new geom.Point(500,500/(page.aspectRatio));//vext.times); //in the nominal, unscaled viewport, which has fixed width 1000
      var vrel = p.minus(vcenter); // p relative to the center
      var irel = vrel.times(scaling); // p relative to the center in image coords
      var panDist = this.pan.times(this.imExtent.x); // pan is a multiple of image width
      // the panDist
      var imCenter = this.imCenter;
      var viewCenter = this.imCenter.plus(panDist); // in image  coordinates
      var rs = viewCenter.plus(irel);
     // util.slog("toim",p.x,p.y,rs.x,rs.y);
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
     // var vcenter = vext.times(0.5); // viewport center
      var rs = vcenter.plus(relvp);
     // util.slog("tovp",p.x,p.y,rs.x,rs.y);
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
  
  
  lib.Viewport.prototype.rectImageToCanvas = function (r,useFlash) {
    var vp = this.rectImageToViewport(r);
    if (useFlash) { // if flash is used there is a fixed ratio between viewport coords and flash coords
     //return vp.times(lib.vp2flash);

      return vp.times(4.0/10);
    }

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
    
  
  lib.Viewport.prototype.clearBeenDrawn = function (inFlashToo) {
    util.slog("beenDrawn","CLEAR",inFlashToo);
    if (this.canvas && this.canvas.isFlashCanvas  && !inFlashToo) return; // don't redraw in flash, usually
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
    
  
  lib.Viewport.prototype.addOverlay = function (o,sel) {
    var nm = o.name;
    if (sel) {
      this.selOverlays[nm]=o;
    } else {
      this.overlays[nm] = o;
    }
    
  }
  
  
  lib.Viewport.prototype.clearOverlays= function (sel) {
    //util.slog("CLEAR OVERLAYS "+sel);
    if (sel=="both") {
      this.clearOverlays(0);
      this.clearOverlays(1);
      return;
    }
    if (sel) {
      this.selOverlays = {}
    } else {
      this.overlays = {};
    }   
    this.clearOverlay(sel);
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
  
  lib.Viewport.prototype.redrawTiles = function () { // needed in FF lighbox, for some reason
    var tiles = this.tiling.tiles;
    util.arrayForEach(tiles,function (tile) {
      tile.beenDrawn = false;
    });
    this.refresh(true);
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
      return rc.divideBy(vp.scale*vp.fitScale);  // zzuubb was / instead of *
    }
      
   
    div.mousemove(function (e) {thisHere.mouseMoveHandler(thisHere,e);});
    div.mousedown(function (e) {thisHere.mouseDown(thisHere,e);});
    div.mouseout(function (e) {thisHere.mouseOutt(thisHere,e);});
      
 
    
    div.mouseup(function (e) {thisHere.mouseUp(thisHere,e);});

    
  }
  
  lib.PanControl.prototype.relCanvas  = function (e) {
      if (idv.useFlashForOverlay) {
 //      return new geom.Point(e.stageX,e.stageY);
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
    var vp = this.vp;
    var rs = rc.divideBy(vp.scale*vp.fitScale);  
    //util.slog("RELVIEWPORT "+rs.x+" "+rs.y);
    return   rs;
  }
  
  
  lib.PanControl.prototype.mouseMoveHandler =   function (pc,e) {
        if (e.preventDefault) {
          if (idv.useFlashForOverlay) {
            //return;
          }
          e.preventDefault();
        }
        var vp = pc.vp;
       if (!vp.ready) return;
        util.log("mouse","movee",e);
        var cp = pc.relViewport(e);
        var df = cp.minus(pc.mouseRef);
         //util.slog("mouse","cp",cp,"rf",pc.mouseRef);
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
          var newpan = pc.panRef.minus(nrp.divideBy(vp.zoom/(vp.scale*vp.fitScale))); // zzuubb
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
        } else {
            if (lib.mouseMoveCallback) {
              var rc = pc.relCanvas(e);
              var imcc = vp.pointViewportToImage(cp);

              lib.mouseMoveCallback(imcc,rc);
            }
   
        }
      }
  
  lib.PanControl.prototype.mouseDown = function (pc,e) {
      idv.util.log("flash_mouse",e.stageX,e.stageY);
   if (!idv.useFlash) e.preventDefault();
      
        var vp = pc.vp;
        if (!vp.ready) return;

        var ps = pc.relViewport(e);
        var ips = vp.pointViewportToImage(ps);
        var bps = vp.pointImageToViewport(ips);

      pc.mouseRef = ps;
      pc.panRef = vp.pan;
      idv.util.log("flash_mouse","ref",ps,vp.pan);
      util.log("mouse","down");
      pc.mouseIsDown = 1;
      // THIS SHOULD BE CALL BACK
      var dv = page.vpCapDiv;
      if (dv) dv.hide();

    }
  
  
  lib.dclickInterval = 350;
  lib.PanControl.prototype.mouseUp = function (pc,e) {
      idv.ee = e; //for debugging
      //console.log(e.clientX,e.clientY,e.stageX,e.stageY);
      var vp = pc.vp;
     // util.slog("mouse","up");
      var lutm = vp.mouseUpTime;
      vp.mouseUpTime = Date.now();
      if (lutm == undefined) lutm = 0;
      var sinceClick = vp.mouseUpTime - lutm;
      //util.slog("CLICKDUR ",sinceClick);
      var dclick = sinceClick < lib.dclickInterval;

      //console.log("MOUSE UP");
      if (!vp.ready) return;
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
          var rc = pc.relCanvas(e);
          //var ps = pc.relViewport(e);
          var imc = vp.pointViewportToImage(cp);
          //var nrp = df.divideBy(vp.extent.x); // normalized in x relative position to mouse ref within the viewport
          //var np = cp.divideBy(vp.extent); // normalized  position  within the viewport
          //var imc = vp.normalizedCanvasToImageCoords(np);
          if (lib.clickCallback) {
            lib.clickCallback(imc,rc,dclick);
          }
        }
      }
      pc.mouseIsDown = 0;
    //  div.unbind("mousemove");
    //  util.log("pan",thisHere.pan);
  }

  lib.PanControl.prototype.mouseOutt = function (pc,e) {
      //  util.slog("mouse","out");
      e.preventDefault();

      var vp = pc.vp;
      if (vp.defAreaMode && pc.mouseIsDown) {
        var cb = vp.areaDefinedCallback;
        if (cb) {
          cb(vp.rectViewportToImage(pc.selectedArea));
        }
      }
      thisHere.mouseIsDown = 0;
      if (lib.mouseOutCallback) {
        lib.mouseOutCallback();
      }
    
     // div.unbind("mousemove",mouseMoveHandler);
    }
  
  lib.checking = false; // for debugging

      
  
  // the pan for image top to lie at the top of the viewport, or the bottom at the bottom
  lib.Viewport.prototype.maxYpan = function () {
    // at a given zoom and pan, the Y coverage is the interval in image coords that is visible
    // there are two cases. If the whole image Y range is visible, then no pan is allowed
    // if we are "inside the image", then the min coverage must be at least as large as min im y
    var zm = this.zoom;
    var imExtent = this.imExtent;
    var imx = imExtent.x;
    var imy = imExtent.y;
    var war = this.extent.y/this.extent.x; // window aspect ratio
    var imar = imy/imx;
    var xconstrained = imar < war; // image at zoom 1 fits x into the viewport
    var zimy = zm * imy; // this is the zoomed size of the image
    if (xconstrained) {
      var avy = imx * war; // available y
    } else {
      var avy = imy;
    }
    if (zimy < avy) return 0;

   // var panDist = pan * imx * zm;
    var hbelow = 0.5 * (zimy-avy); // this is how much is hidden below (and above) at 0 pan
    var maxPan = hbelow/(imx*zm); // the most that can be panned is enough to bring this into sight
    //util.slog("maxYPan",maxPan);
    return maxPan;
  }
 lib.Viewport.prototype.maxXpan = function () {
    // at a given zoom and pan, the X coverage is the interval in image coords that is visible
    // there are two cases. If the whole image X range is visible, then no pan is allowed
    // if we are "inside the image", then the min coverage must be at least as large as min im y
    var zm = this.zoom;
    var imExtent = this.imExtent;
    var imx = imExtent.x;
    var imy = imExtent.y;
    var war = this.extent.y/this.extent.x; // window aspect ratio
    var imar = imy/imx;
    var yconstrained = imar >= war; // image at zoom 1 fits x into the viewport
    var zimx = zm * imx; // this is the zoomed size of the image
    if (yconstrained) {
      var avx = imy / war; // available y
    } else {
      var avx = imx;
    }
    if (zimx < avx) return 0;

   // var panDist = pan * imx * zm;
    var hright = 0.5 * (zimx-avx); // this is how much is hidden to the right(and left) at 0 pan
    var maxPan = hright/(imx*zm); // the most that can be panned is enough to bring this into sight
   // util.slog("maxXPan",maxPan);
    return maxPan;
  }
  
  /*
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
  */
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
  lib.Viewport.prototype.clearOverlay = function (sel) {
    if (!sel) sel=0;
    var ctx = this.context;
    var xt = this.rect.extent.times(this.scale);
    var octx = this.ovContext;
    if (octx) {
      var useFlash = octx.isFlashCanvas;
      if (useFlash) {
        var el = octx.element;
        if (el&&el.removeShapes) {
          el.removeShapes(sel);
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
      
     // util.slog("draw",this.depth,pln,this.scale,this.zoom,trycountv,tile.id,vc.x,vc.y,ve.x,ve.y);
      var thisHere = this;
      if (useFlash) {
        if (tile.beenDrawn) return;
        var tiling = this.tiling;
        //tiling.url = "http://dev.imagediver.com/tilings/Panorama1923_3/"
        //tiling.url = "http://dev.imagediver.com/tilings/Panorama2010_3/"
        var imsrc = tiling.url + (tile.id) +".jpg";
        util.slog("flashDraw",tile.id,behind);
        var imdrawn = ctx.drawImage(imsrc,vc.x,vc.y,ve.x,ve.y);
        if (imdrawn) {
          this.assertTileDrawn(tile);
        } else {
          tile.loadingImage = false;
          util.slog("LOADING THE TILE");
        }
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
        util.slog("drawfail",tile.path);
        if (trycountv < 1) {
          setTimeout(function () {thisHere.drawTileImage(tile,trycountv+1,behind);},200);
        }
      }
  }
   
    
  lib.Viewport.prototype.canvasToImageCoords = function (p) {
  }
  

  lib.Viewport.prototype.divToRect = function (ir,coordSystem,div) { // coordSystem = "canvas" "viewport" or "image"
   if (coordSystem == "image") {
      var r = this.rectImageToCanvas(ir);
    } else if (coordSystem == "viewport") {
      r = this.viewportToCanvas(ir);
    } else {
      r = ir;
    }
    var c = r.corner.plus(new geom.Point(-1,-1));
    var ex = r.extent.plus(new geom.Point(-1,-2));
    //var c = r.corner;
    var ex = r.extent;
    div.css({left:c.x,top:c.y,width:ex.x,height:ex.y});
  }
  
  // sel = draw to the selected clip/layer
  lib.Viewport.prototype.drawRect = function (ir,coordSystem,color,sel) { // coordSystem = "canvas" "viewport" or "image"
    var ctx = this.ovContext;
    var useFlash = ctx.isFlashCanvas;
     if (useFlash) { //flash expects coords with image center coords = 0,0
      if (coordSystem == "image") {
        var imdim = geom.internalizePoint(page.imD.dimensions).times(0.5);
        var r = ir.plus(imdim.minus());
        //var r = ir;//this.rectImageToViewport(ir);
      } else  {
        util.error("no such option");
      }
     } else {
      if (coordSystem == "image") {
        var r = this.rectImageToCanvas(ir,idv.useFlashForOverlay);
      } else if (coordSystem == "viewport") {
        r = this.viewportToCanvas(ir);
      } else {
        r = ir;
      }
     }
    if (useFlash) {
      // hack for now
     
      ctx.setStrokeColor(color);
    } else {
      ctx.save();
      ctx.strokeStyle = color
      if (color=="yellow") {
        ctx.lineWidth =2;
      } else {
        ctx.lineWidth = 1;
      }
    }
    if (color == "yellow") { // hack so that highlighting visible in show outline mode
      var rtd = r.expand(2);
    } else {
      rtd = r;
    }
    var rtd = r;
    corner = rtd.corner;
    extent = rtd.extent;
    //console.log("STROKE ",corner.x," ",corner.y," ",extent.x," ",extent.y);
    ctx.strokeRect(corner.x,corner.y,extent.x,extent.y,sel);
    if (!useFlash) ctx.restore();
  }
    
  
  lib.Viewport.prototype.drawOverlays = function (sel) {
    if (sel == "both") {
      this.drawOverlays(0);
      this.drawOverlays(1);
      return;
    }
    this.clearOverlay(sel);
    var os = sel?this.selOverlays:this.overlays;
    var cnt = 0;
    for (var i in os) {
      cnt++;
      var o = os[i];
      var g = o.geometry;
      var color = o.color;
      if (color == undefined) {
        color = idv.selectedColor;
      }
      // now sel overrides
      if (sel) {
        color = "yellow";
      } else {
        color = "red"
      }
      this.drawRect(g,"image",color,sel);
    }
    //util.slog("DREW "+cnt+" OVERLAYS");
   // this.drawRect(); // with no args this draws a boundary around the viewport, which hides "ghosts"
  }
      
  // tiles are drawnn in image coords
  lib.Viewport.prototype.drawTile = function (tile,behind) {
    //console.log(tile);
    var ctx = this.context;
    var useFlash = ctx.isFlashCanvas;

    var tileDepth = tile.path.length;
    util.slog("draw","mightDraw ",tile.path.join(""));
    if (tile.outsideImage) {
       util.log("draw","did not draw because outside ",tile.path.join(""));
      return;
    }
    if (tile.beenDrawn) {
      util.slog("beenDrawn","been drawn",tile.path.join(""));
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
  
  lib.setScale = 1;
  lib.Viewport.prototype.setFlashScale = function (s) {
    var e = this.canvas.element;
    if (e  && e.setScale) {
      if (lib.setScale) e.setScale(s); 
    }
  }


lib.Viewport.prototype.removeFlashImages = function () {
    var e = this.canvas.element;
    if (e  && e.removeImages) {
      e.removeImages(); 
    }
  }

  lib.Viewport.prototype.setFlashPan = function (x,y) {
    var e = this.canvas.element;
    if (e  && e.setPan) {
      if (lib.setScale) e.setPan(x,y);
    }
  }
  
  
  lib.Viewport.prototype.drawTiles = function (d) {
    var useFlash = this.canvas && this.canvas.isFlashCanvas;
    if (useFlash) {
      var cs = this.scale;
      var im = this.tiling.image;
      var imxxt = im.extent.x;
      var imyxt = im.extent.y;
      var imAR = imyxt/imxxt;
      var vpxxt = this.rect.extent.x;
      var vpyxt = this.rect.extent.y;
      var zm = this.zoom;
      // the calculation: flash is in showall mode. stageAR = stage aspect ration; cntAR = container aspect ratio
      // if stageAR < cntAR then the stage is wider and fatter than the container, and so showall fit will be constrained by
      // x. So stagexxt/imxxt is the scaling. if stageAR > cntAR
      var stagexxt = this.stageWd;
      var stageyxt = this.stageHt;
      if (!stagexxt) {
        stagexxt = this.canvas.stageWidth();
        stageyxt = this.canvas.stageHeight();
        if (!stagexxt) {
          this.ready=false;
          return; //not ready
        }
        this.stageWd = stagexxt;
        this.stageHt = stageyxt;
        this.ready = true;
      }
      var stageAR = stageyxt/stagexxt;
      var cntAR = this.extent.y/this.extent.x;
      if (stageAR <= cntAR) { //stage is wider than container; we will be x contstrained
        this.fitScale = 1.0;//imAR/cntAR;
        // ok now the container fits on the stage, but the image must also fit in the container
        if (cntAR < imAR) {
          im2flash = stagexxt/imxxt * cntAR/imAR;
          lib.vp2flash = (cntAR/imAR) * stagexxt/1000;
          var fimxxt = imxxt * imAR/cntAR; // the effective full xxt of the image after scaling
        } else {
          var im2flash = stagexxt/imxxt;
          lib.vp2flash = stagexxt/1000;
          this.xconstrained = true;
          this.fitScale = 1.0;
          var fimxxt = imxxt;
        }
      } else { // stage is taller than container; we are y-constrainetd.
        var im2flash = stageyxt/imyxt;
        lib.vp2flash = stageyxt/1000;

        this.xconstrained = false;
        var fimxxt = imyxt/cntAR; // this is the xextent of the image if it were exactly the container's aspect ratio
        this.fitScale = Math.max(1.0,imxxt/fimxxt);
         this.fitScale = Math.min(1.0,fimxxt/imxxt);
      /* if (!this.fitScaleAlert) {
          //alert("fitscale = 1 hack "+this.fitScale);
          this.fitScaleAlert = 1;
        }
      */

      }
      var fsc = zm * im2flash * this.fitScale; // zzuubb remove fitScale

      //util.slog("IM2FLASH",im2flash,"FSC ",fsc);
      this.setFlashScale(fsc);

      // 1 pan unit is the width of the image
      // 0 pan in flash places the center of the image at 0,0
      // so we want to move the image right by the width of the image, scaled approprately
      var pxbias = fimxxt/2 * im2flash;
      var pybias = pxbias*this.aspectRatio; // 0 pan in flash is effectively this pan; this is also the scale factor
       //var pscale =  zm * fimxxt * im2flash; 
       var pscale =  zm * imxxt * im2flash * this.fitScale; 
     var px = pxbias -  this.pan.x * pscale;
      var py = pybias - this.pan.y * pscale;
      //util.slog("im2flash",im2flash,"pxbias",pxbias,"pscale",pscale,"panx",this.pan.x,"pany",this.pan.y);
        this.setFlashPan(px,py);
    }
    this.clear();
    var tileids = this.coveringTiles(d);
    //util.log("depth",tileids);
    var byId = this.tiling.tilesById;
    var ln = tileids.length;
    /* this.depth = d; experiment */
    util.slog("DRAWING ",ln," TILES")
    for (var i=0;i<ln;i++) {
      var tlid = tileids[i];
      var tl = byId[tlid];
      if (tl) {
        this.drawTile(tl);
      }
    }
  }
})();
  
