
/*
 http://dev.imagediver.org/topic/image/cg/earthly_delights_1/index.html?image_only=1
 vp = page.vp
 cnv = page.vp.canvas
 //cnv.strokeRect(100,100,100,100)
 //cnv.strokeRect(10,50,10,50)
 page.vp.extent
 dims = page.imD.dimensions
 cntx = dims.x/2;
 cnty = dims.y/2;
 geom = exports.GEOM2D;
 cr = new geom.Rect(new geom.Point(cntx-500,cnty-500),new geom.Point(1000,1000));
 vp.drawRect(cr,"image","yellow")

cr = new geom.Rect(new geom.Point(cntx-10,cnty-10),new geom.Point(20,20));
 vp.drawRect(cr,"image","yellow")


cr = new geom.Rect(new geom.Point(cntx-1500,cnty-0),new geom.Point(20,20));
 vp.drawRect(cr,"image","yellow")
 
 //vp.drawRect(new geom.Rect(new geom.Point(100,100),new geom.Point(500,500)),"image")
  rr = new geom.Rect(new geom.Point(50,50),new geom.Point(dims.x-50,dims.y-50))
vpr = vp.rectImageToViewport(rr)
cnv = vp.viewportToCanvas(vpr)

vp.drawRect(rr,"image","yellow")
    //ctx.strokeRect(corner.x,corner.y,extent.x,extent.y);


rrr = new geom.Rect(new geom.Point(68.4931640625,83.7138671875),new geom.Point(631.6591796875,738.2041015625))
vp.drawRect(rrr,"image","yellow")



*/
 
 
(function () {
  var lib = exports.IMAGE;
  //lib.noCanvas = false; // true mode not in use, nor will be; code fossil
  var geom = exports.GEOM2D;
  var util = idv.util;
 

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
    if (!lib.noCanvas) this.drawOverlays("both");
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
    var resBias = 1.5; // for numbers >1, bring in tiles at greater resolution earlier; that is up the resolution
    // for a given scale and zoom
    var nd  = Math.floor(Math.log(resBias*z*(this.scale))/Math.LN2 + this.depthBump);// + this.depthBias); depthBias no longer used
    //util.slog("nd=",nd,"scale=",this.scale);
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
      util.slog("DRAWING TILES");
      this.drawTiles(this.depth+this.depthOffset);
      //if (!lib.showSnapsMode) this.clearOverlay();
      if (!lib.noCanvas) this.drawOverlays("both");
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
    var embed = idv.embed;
    var thisHere = this;
    //var caption = lib.albumD.caption;
    var logo = $('<span class="logo">imageDiver</span>');
    if (embed) {
      logo.click(function () {util.navigateToPage(util.dropQS(),embed);});
    } else {
      logo.click(function () {util.navigateToPage("http://imagediver.org/");});
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
    okb = true; // now ie8 just navigates around s3
    if (brie8 && false) {
      var ie8Note =  $('<span class="titleRight" style="font-size:8pt">To see more ImageDiver content, please upgrade your browser (Internet Explorer 8) to version 9, or come back with Chrome, Firefox, or Safari.</span>');
      tdt.append(ie8Note);
      return;
    }
    var contactIDV = $('<span class="titleRight">contact</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
    tdt.append(contactIDV);
    contactIDV.click(function () {util.navigateToPage("http://imagediver.org/contact")});
 
    var whyIDV = $('<span class="titleRight">why?</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
    tdt.append(whyIDV);
    whyIDV.click(function () {util.navigateToPage("http://imagediver.org/why")});
 
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
      /*
      if (idv.devVersion) {
        var gp = "/gallery.html"
      } else {
        gp = "http://imagediver.org/gallery.html"
      }
      */
      gallery.click(function () {
        util.navigateToPage('/gallery/index.html');
      });
    }
    if (this.fullsize) {
      var fs = $('<span class="titleRight">image</span>');
      tdt.append(fs);
      fs.click(function () {
        util.navigateToPage(thisHere.fullsize);
      });
    }
    var json = this.json;
    if (json && okb) {
      var jsonButton = $('<span class="titleRight">json</span>');
      tdt.append(jsonButton);
      jsonButton.click(function () {util.navigateToPage(json);});
    }
 
    var wpg = this.wikipediaPage;
    if (wpg  && okb) {
      var wikipediaButton = $('<span class="titleRight">wikipedia</span>');
      tdt.append(wikipediaButton);
      wikipediaButton.click(function () {util.navigateToPage(wpg);});
    }
    /*
    if (idv.loggedInUser) { // add this
      var logOut = $('<div style="position:absolute;right:5px;top:0px" class="smallClickableElement">log out</span>');
      tdt.append(logOut);
    }
    */
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

lib.waitForInitThenRefresh = function (fc) {
   var e = fc.element;
        util.log("waiting")

   if (e.setScale  && e.drawImage && fc.viewport && page.vp) {
    //alert("flash ready")
    page.placeDivs();
    fc.viewport.refresh(true);
    fc.viewport.drawOverlays("both");

   } else {
     setTimeout(function () {lib.waitForInitThenRefresh(fc);},100);
   }
 }

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
 
 
  var fn = function () {
    var th = thisHere;
    var flashEl = document.getElementById(fid);
    thisHere.element = flashEl;
    thisHere.jel = $(thisHere.element);
    idv.jel = thisHere.jel; // for testing
    thisHere.jel.attr("width",thisHere.extent.x);
    thisHere.jel.attr("height",thisHere.extent.y);
    lib.waitForInitThenRefresh(thisHere);
  }
  var params = {
                            scale:'showall',
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
   //swfobject.embedSWF("/hx/canvas.swf", fid, "40", "100", "10","/js/expressInstall.swf",flashvars,params,null,fn);
   //swfobject.embedSWF("/hx/canvas.swf", fid, "40", "100", "10","/js/expressInstall.swf",flashvars,params,null,fn);
    swfobject.embedSWF("/hx/canvas.swf", fid, "100%", "100%", "10","/js/expressInstall.swf",flashvars,params,null,fn);
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

lib.toIntColor = function (c) {
  //hack for now
  if (c == "yellow") {
    return 0xffff00;
  } else {
    return 0xff0000;
  }
}

lib.selectStrokeWidth = 10;
lib.flashCanvas.prototype.setStrokeColor = function (c)  {
  var el = this.element;
  if (el && el.setStrokeColor) {
    if (c=="yellow") { //hack
      el.setStrokeWidth(lib.selectStrokeWidth);
    } else {
      el.setStrokeWidth(1);
    }
    el.setStrokeColor(lib.toIntColor(c));
  }
}


lib.flashCanvas.prototype.stageWidth = function () {
  var el = this.element;
  if (el && el.stageWidth) {
    return el.stageWidth();
  }
}



lib.flashCanvas.prototype.stageHeight = function () {
  var el = this.element;
  if (el && el.stageHeight) {
    return el.stageHeight();
  }
}


lib.flashCanvas.prototype.setStageSize = function (wd,ht) {
  var el = this.element;
  if (el) {
    el.setStageSize(wd,ht);
  }
}



lib.flashCanvas.prototype.mcWidth = function () {
  var el = this.element;
  if (el) {
    return el.mcWidth();
  }
}


lib.flashCanvas.prototype.mcHeight = function () {
  var el = this.element;
  if (el) {
    return el.mcHeight();
  }
}



lib.flashCanvas.prototype.scaleMode = function () {
  var el = this.element;
  if (el) {
    return el.scaleMode();
  }
}

lib.flashCanvas.prototype.strokeRect = function (lx,ly,xxt,yxt,sel)  {
  if (!sel) sel = 0;
  var el = this.element;
  if (el && el.strokeRect) {
    el.strokeRect(lx,ly,xxt,yxt,sel);
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
    if (lib.noCanvas && (wc == "ov")) {
      idv.useFlashForOverlay = true;
      return null;
    }
    // now, there are only two cases: noCanvas (then use just the one swf for everything), and 
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
  /* explorercanvas doesn't work; not used
  if (br.msie && (parseFloat(br.version) < 9)) {
    //idv.useFlashForOverlay = true;
    G_vmlCanvasManager.initElement(icanvasE);
  }
  */

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
idv.noFlashCallbacks = true; // since going to show_all mode

function pc_mousedown(wc,x,y) {
  if (idv.noFlashCallbacks) return;
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
  if (idv.noFlashCallbacks) return;
  //idv.util.slog("flash_mouse","movee",wc,x,y);
  if (wc == "flashDiv1") {
    var pc = page.vp.panControl;
  } else {
    var pc = page.vp1.panControl;
  }
  var e = {stageX:x,stageY:y};
  pc.mouseMoveHandler(pc,e);
}


function pc_mouseup(wc,x,y) {
  if (idv.noFlashCallbacks) return;
  //idv.util.slog("flash_mouse","up",wc,x,y);
  if (wc == "flashDiv1") {
    var pc = page.vp.panControl;
  } else {
    var pc = page.vp1.panControl;
  }
  var e = {stageX:x,stageY:y};
  pc.mouseUp(pc,e);
}
/*
function pc_doubleclick(wc,x,y) {
  //doesn't work; don't know why
  //console.log("double click",x,y);
}
*/

function fp(x,y) {
  if (!y) y = 0;
  var e = page.vp.canvas.element;
  e.setPan(x,y);
}

var drawImageFailed = false;

