

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated

Simplified layout.  in 1 column layout there is the topBar, the viewPort the controlBar and the Panel (or second viewport)
tHeight = 2*viewportHt*scale + topBarHt + controlBarHt
tWidth = viewportWd + 2 * margin


*/

var page = {};

(function () {
  
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;

  lib.twoColumns = true; //two column layout



    
  // the page is a stack of sDivs (scalable divs)
  
  // the  margin is the target space to left and right.
  // unscalableHeight is the sum of the unscaled divs
  // unscaledHeight is the sum of the scaled divs
  
  // the objective is to scale so that the stack fits evenly on the page; both wrt height and width

  // used for the gallery page
  lib.LayoutZero = function (options) {
    this.outerDiv = options.outerDiv;
    this.margin = options.margin;
  //  this.topDiv = options.topDiv;
    this.centerDiv = options.centerDiv;
    /*this.bottomDiv = options.bottomDiv;
    this.panelDiv = options.panelDiv;
    this.topDivHt = options.topDivHt;
    this.controlDivHt = options.controlDivHt;*/
    this.minScale = options.minScale;
    this.maxScale = options.maxScale;
    this.aspectRatio = options.aspectRatio;
  }
  
  
  // the scaling is a scaling from a nominal width of 1000
  lib.LayoutZero.prototype.computeScale = function () {

     var ww = $(window).width();
    var margin = this.margin;
    var maxwd = ww-2*margin;
        
    var hscale = (ww - 2*margin)/1000; // scale for horizonal fit
    this.scale = Math.max(this.minScale,hscale);
    if (this.maxScale) {
      this.scale = Math.min(this.scale,this.maxScale);
    }
    lib.scale = this.scale;
    idv.util.log("scale",this.maxScale,this.scale);
    
  }
  
  
  lib.LayoutZero.prototype.placeDivs = function () {
    this.computeScale();
    var ww = $(window).width();
    var hh = $(window).height();
    var winCenter = ww/2;
    var scale = this.scale;
    var divWd = 1000 * scale;
    var left = winCenter - 0.5 * divWd;
    var vpHt = divWd/(this.aspectRatio);
    var cTop = 10; // top padding
    var topDiv = this.topDiv;
    lib.setCss(this.outerDiv,{left:left,width:divWd});

    lib.setCss(this.centerDiv,{width:divWd});
    this.vpCss = {width:divWd,height:vpHt};


    var afp = this.afterPlacement;
    if (afp) {
      afp();
    }
  }

  // for image, album pages, with panel below

  lib.setTopDivCss = function (layout) {
    layout.css.titleDiv = {"margin-top":"30px","margin-bottom":"20px","font-size":"10pt","font-style":"bold"};
   // layout.css.topDiv = {"margin-top":"0px","margin-bottom":"30px","font-size":"10pt","font-style":"bold"};
    layout.css.titleDiv = {"font-size":"10pt","font-style":"bold"};
    var tdHt = idv.embed?"20px":"35px";
    layout.css.topDiv = {"margin-top":"0px",padding:"0px","margin-bottom":"10px",height:tdHt,"font-size":"10pt","font-style":"bold"};
    layout.css.logo = {"font-size":"12pt"};
    layout.css.topDivTop = {"height":"20px"};
  }
  
  lib.applyTopDivCss = function (layout) {
    if (!idv.embed) lib.setCss(imlib.titleDiv,layout.css.titleDiv);
    lib.setCss(imlib.topDiv,layout.css.topDiv);
    lib.setCss($(".logo"),layout.css.logo);
    lib.setCss($(".topDivTop"),layout.css.topDivTop);
  }

  lib.LayoutOne = function (options) {
    this.margin = options.margin;
    this.aspectRatio = options.aspectRatio,
    this.vpDiv = options.vpDiv;
    this.evDiv = options.evDiv;
    this.centerDiv = options.centerDiv;
    this.minScale = options.minScale;
    this.additionalHeight = options.additionalHeight;
    this.scaleToViewport = options.scaleToViewport;
    this.includeLightbox = options.includeLightbox;
    this.css = {}
    lib.setTopDivCss(this);

  }
  
  // the scaling is a scaling from a nominal width of 1000
  lib.LayoutOne.prototype.computeScale = function () {
     var ww = $(window).width();
     idv.util.log("scaling",ww);
    var margin = this.margin;
    var maxwd = ww-2*margin;
        
    var hscale = (ww - 2*margin)/1000; // scale for horizonal fit
    var wht = $(window).height();
    var nVpHt = 1000/(this.aspectRatio);
    /* equation: wHt = 2*nVpHt*scale + controlDivHt + topBarHt
      so 2*nVpHt*scale = tHt - controlDivHt - topBarHt
      vscale = (tHt - (controlDivHt + topBarHt))/2*nVpHt */
    if (this.scaleToViewport) {
      var vpc = 1; // scale for one viewport
    } else {
      vpc = 1.8;  //scale for two viewports; the second 80% the size of the first
    }
    var vscale = (wht - this.additionalHeight)/(vpc*nVpHt);
    this.scale = Math.max(this.minScale,Math.min(hscale,vscale));
    util.log("layout",vscale," hscale ",hscale,this.scaleToViewport);
    lib.scale = this.scale;
    
  }
  
  
  lib.setCss = function (div,css) {
    if (div) {
      div.css(css);
    }
  }
  
  lib.LayoutOne.prototype.placeLightbox = function () {
    if (this.includeLightbox) {
      var lb = this.lightbox;
      var top = 50;
      var lbwd = 500;
      var lft = winCenter = 0.5 * lbwd;
      var wht = $(window).height();
      var lbht = wht - 100; 
      var lightboxRect = new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));
      if (!lb) {
        lb = new com.Lightbox($('body'),lightboxRect);
        lb.render();
        this.lightbox = lb;
      }
    }
  }
  lib.LayoutOne.prototype.placeDivs = function () {
    this.computeScale();
    var ww = $(window).width();
    var hh = $(window).height();
    var winCenter = ww/2;
    var scale = this.scale;
    var divWd = 1000 * scale;
    var left = winCenter - 0.5 * divWd;
    var vpHt = divWd/(this.aspectRatio);
    var cTop = 10; // top padding
    var topDiv = this.topDiv;
    var sep = 10;
    this.vpExtent = new geom.Point(divWd,vpHt);
    lib.setCss(this.centerDiv,{left:left,width:divWd});
    this.vpCss = {width:divWd,height:vpHt};
    this.panelCss = {width:divWd,height:0.8*vpHt}
    lib.setCss(this.vpDiv,this.vpCss);
    lib.setCss(this.evDiv,this.vpCss);
   
 //   lib.setCss(this.evDiv,this.evDiv);
    lib.applyTopDivCss(this);
    lib.setCss($(".shareDiv"),this.css.shareDiv);
    lib.setCss($(".embedDiv"),this.css.embedDiv);
    this.placeLightbox();
    var vp = lib.vp;
    if (vp) {
    //  vp.depthBias = (scale < 1.0)?-1:0;
      lib.vp.refresh(true);
    }
    var afp = this.afterPlacement;
    if (afp) {
      afp();
    }
  }
  
  
  
  // dual viewports, one above the other
  
  lib.LayoutDual = function (options) {
    this.margin = options.margin;
    this.aspectRatio = options.aspectRatio,
    this.vp1Div = options.vp1Div;
    this.vp0Div = options.vp0Div;
    this.centerDiv = options.centerDiv;
    this.minScale = options.minScale;
    this.additionalHeight = options.additionalHeight;
    this.scaleToViewport = options.scaleToViewport;
    this.includeLightbox = options.includeLightbox;
  }
  
  // the scaling is a scaling from a nominal width of 1000
  lib.LayoutDual.prototype.computeScale = lib.LayoutOne.prototype.computeScale; 
  lib.LayoutDual.prototype.placeLightbox = lib.LayoutOne.prototype.placeLightbox;

  lib.LayoutDual.prototype.placeDivs = function () {
    this.computeScale();
    var ww = $(window).width();
    var hh = $(window).height();
    var winCenter = ww/2;
    var scale = this.scale;
    var divWd = 1000 * scale;
    var left = winCenter - 0.5 * divWd;
    var vpHt = divWd/(this.aspectRatio);
    var cTop = 10; // top padding
    var topDiv = this.topDiv;
    var sep = 10;
    this.vpExtent = new geom.Point(divWd,vpHt);
    lib.setCss(this.centerDiv,{left:left,width:divWd});
    this.vpCss = {width:divWd,height:vpHt};
    lib.setCss(this.vp0Div,this.vpCss);
    lib.setCss(this.vp1Div,this.vpCss);
    this.placeLightbox();
   

    var afp = this.afterPlacement;
    if (afp) {
      afp();
    }
  }
  

  // side-by-side layout for albums
  lib.LayoutTwo = function (options) {
    this.margin = options.margin;
    this.aspectRatio = options.aspectRatio,
  //  this.topDiv = options.topDiv;
    this.outerDiv = options.outerDiv;
    this.colsDiv = options.colsDiv;
    this.vpDiv = options.vpDiv;
    this.evDiv = options.evDiv;
    this.leftDiv = options.leftDiv;
    this.rightDiv = options.rightDiv;
    this.panelDiv = options.panelDiv;
    /*this.bottomDiv = options.bottomDiv;
    this.panelDiv = options.panelDiv;
    this.topDivHt = options.topDivHt;
    this.controlDivHt = options.controlDivHt;*/
    this.minScale = options.minScale;
    this.additionalHeight = options.additionalHeight;
    this.css = {};
    lib.setTopDivCss(this);

    this.css.shareDiv = {"border":"solid thin white","margin-top":"10px","padding-top":"10px"};
    this.css.embedDiv = {"border":"solid  white","margin":"10px","background-color":"white","color":"black"};
    this.includeLightbox = options.includeLightbox;


  }
  
  // the scaling is a scaling from a nominal width of 1000
  lib.LayoutTwo.prototype.computeScale = function () {
     var ww = $(window).width();
    var margin = this.margin;
    if (idv.embed) {
      margin = 0.5 * margin;
    }
    var maxwd = (ww-3*margin)/2;
        
    var hscale = maxwd/1000; // scale for horizonal fit
    var wht = $(window).height();
    var nVpHt = 1000/(this.aspectRatio);
    /* equation: wHt = 2*nVpHt*scale + controlDivHt + topBarHt
      so 2*nVpHt*scale = tHt - controlDivHt - topBarHt
      vscale = (tHt - (controlDivHt + topBarHt))/2*nVpHt */
    var vscale = (wht - this.additionalHeight)/nVpHt;
    this.scale = Math.max(this.minScale,Math.min(hscale,vscale)); //@remove unremove?
  
    util.log("layout","vscale ",vscale," hscale ",hscale);
    lib.scale = this.scale;
    
  }
  
  
  lib.setCss = function (div,css) {
    if (div) {
      div.css(css);
    }
  }
  
  lib.LayoutTwo.prototype.placeLightbox = lib.LayoutOne.prototype.placeLightbox;

  lib.LayoutTwo.prototype.placeDivs = function () {
    this.computeScale();
    var scale = this.scale;
    var sep = this.margin;//bewteen columns
    if (idv.embed) {
      sep = 0.5*sep;
    }
    var margin =  this.margin;
    var ww = $(window).width();
    var hh = $(window).height();
    var divWd = 1000 * scale;
    var contentWd = sep + 2*divWd; // due to minScale, the contentWd might exceed the window width
    if (ww > contentWd+2*margin) {
      var actualMargin = Math.max(margin,0.5*(ww-contentWd));
    } else {
      var actualMargin = margin;
    }
      
    var contentCenter = contentWd/2;
    var rightLeft = contentCenter + sep/2;
    var vpHt = divWd/(this.aspectRatio);
    var cTop = 10; // top padding
    var sep = 10;
    this.vpExtent = new geom.Point(divWd,vpHt);
    lib.setCss(this.outerDiv,{left:actualMargin,width:contentWd});
    lib.setCss(this.colsDiv,{left:0,width:contentWd});//height:vpHt + this.additionalHeight});
    lib.setCss(this.leftDiv,{left:0,width:divWd});
    lib.setCss(this.panelDiv,{left:0,width:divWd,height:vpHt});
    //lib.setCss($('#snapArray'),{left:0,width:divWd,height:vpHt});
    lib.setCss(this.rightDiv,{left:rightLeft,width:divWd});
    //var clp = "rect(0px,"+divWd+"px,"+vpHt+"px,0px)"
    this.vpCss = {width:divWd,height:vpHt};
    this.panelCss = this.vpCss;
    //this.panelCss.height = undefined;
    lib.setCss(this.vpDiv,this.vpCss);
    lib.setCss(this.evDiv,this.vpCss);

    lib.applyTopDivCss(this);
    lib.setCss($(".shareDiv"),this.css.shareDiv);
    lib.setCss($(".embedDiv"),this.css.embedDiv);

    this.placeLightbox();

    var afp = this.afterPlacement;
    if (afp) {
      afp();
    }
  }
  
})();


