

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
*/


(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;


  
 
  
   
  lib.renderControls = function (container) {
    var cnt = container;
    var elements = {};
    //var login = $('<div class="rightElement">log in/register</div>');
    //cnt.append(login);
    //login.click(lib.popLogin);
    var aboutImageActivator = $('<span style="float:right" class="clickableElement">about image</span>');
    cnt.append(aboutImageActivator);
    var pn = lib.setPanelActivator("aboutImage",aboutImageActivator);
    pn.scalable = false;
    pn.height = null;
    var albumsActivator = $('<span style="float:right" class="clickableElement">albums</span>');
    cnt.append(albumsActivator);
    lib.setPanelPanel("albums",lib.albumDiv);
    lib.setPanelActivator("albums",albumsActivator);
    if (loggedInUser) {
      var createSnapActivator = $('<span style="float:right" class="clickableElement">new snap</span>');
      cnt.append(createSnapActivator);
      pn = lib.setPanelActivator("createSnap",createSnapActivator);
      pn.scalable = false;
      pn.height = null;
    }
    var selectedSnapActivator = $('<span style="float:right" class="clickableElement">1 by 1</span>');
    cnt.append(selectedSnapActivator);
    pn =lib.setPanelActivator("selectedSnap",selectedSnapActivator);
    pn.selfScaling = true;
   

    var snapArrayActivator = $('<span style="float:right" class="clickableElement">all snaps</span>');
    cnt.append(snapArrayActivator);
    pn = lib.setPanelActivator("snapArray",snapArrayActivator);
    pn.selfScaling = true;

    //pn.scalable = true;
    //pn.height = lib.standardPanelHeight;
    var setZoom = function (z) {lib.vp.setZoom(z);};
    var getZoom = function () {return lib.vp.zoom;};
    var zmropts = {container:cnt,maxZoom:lib.vp.maxZoom,setZoom:setZoom,getZoom:getZoom,
       zoomIncrement:1.05,zoomFactor:2,zoomDelay:50};
    var zmr =  new idv.zoomSlider(zmropts);
    lib.zSlider = zmr;
    lib.vp.zoomCallbacks.push(function (z) {lib.zSlider.positionSliderFromZoom(z);});

   var viewAll = $('<span class="clickableElement">view all</span>');
   viewAll.css({position:"absolute",left:lib.zSlider.totalWidth+10});
   cnt.append(viewAll);
   viewAll.click(function () {lib.vp.setZoom(1);});
     
   // var zoomin = $('<span style="float:left" class="clickableElement">zoom in </span>');
   // cnt.append(zoomin);
    //this.elements.zoomin = zmr.zoomin;
    //var zoomout = $('<span style="float:left" class="clickableElement">zoom out</div>');
   // this.container.append(zoomout);
    //this.elements.zoomout = zmr.zoomout;
 
    var gap = $('<div class="gap"></div>');
    container.append(gap);
 
  //  var about = $('<div class="zoomElement">about</div>');
   // var howtoPan = $('<div class="textElement">To pan, drag the image</div>');
  
   // cnt.append(howtoPan);
  //  about.click(function () {lib.lightbox.pop();});

    }
    
  // A view
  
//  lib.controlDiv
//var controlDiv,windowDiv,presentDiv,pastDiv;
  lib.setParams = function(imD) {
    var imTopic = imD.topic
    lib.imName = imTopic.split("/")[2]
    lib.snapThumbMinWidth=100;
    lib.snapThumbMargin = 5;
    lib.snapThumbHeight=50;
    lib.snapThumbCaptionHeight=10;
    lib.snapGapX = 10;
    lib.snapGapY = 25;
    lib.snapHeight = 200; // for the selected snap
    lib.snapTop = 20;
    lib.thumbTop = 80;
    
    lib.zoomDelay = 50;
    lib.zoomIncrement = 1.05;
    lib.imD = imD;
    var imDimx = imD.dimensions.x;
    var imDimy = imD.dimensions.y;
    var imDim = new geom.Point(imDimx,imDimy);
    var imDir = imD.imDir;
    lib.depthBias = 0; // applies for all images; determines when to go to higher res images. higher values=higher res
    //var tilingDepthBump = imD.tilingDepthBump;
    //var depthBump = imD.zoomDepthBump;
    //var tilingDir = imD.tilingDir;
    //var tilingUrl = imD.tilingUrl;
    //var iev = neo.theIEVersion;
    //lib.depthBump = depthBump;
  
  // these are the same lines as those that created the tiling in image_scripts/liberty.js
//  lib.pastIm = new imlib.Image(new geom.Point(25330,4115),"/mnt/ebs0/projects/panorama/P1923_3.TIF");
//    lib.pastTiling = new imlib.Tiling(lib.pastIm,256,0.5,"/var/www/neo.com/tilings/Panorama1923_3/","http://s3.amazonaws.com/tilings/Panorama1923_3/",0);



    var vpWidth = 500;
    
    // for astoria 1923
    var aRatio = 0.35;
    lib.aspectRatio = aRatio;
    lib.minScale = 0.75;
    var vpHeight = vpWidth * aRatio;
    //var ssDivHt = 250;
    var ssDivHt = vpHeight;
    lib.ssDivHt = ssDivHt;
    lib.standardPanelHeight= ssDivHt;
    lib.selectedSnapPanelHeight = 400;

    var vpSep = 10;
    var vpTop = 35; // top of the viewport
    var lbWidth = 600; // lightbox dims
    var lbHeight = 550;
    var lbTop = 50;
    
    lib.bottomDivHt = 10;
    
    lib.maxZoom = 16;
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;
    lib.vpHeight = vpHeight;
    lib.vpWidth = vpWidth;
    lib.vpSep = vpSep;
    lib.vpTop = vpTop;
    lib.lbTop = lbTop;
    lib.scale = 1.0;
    lib.vpMargin = 40;
    lib.minZoom = 1;
    var cHeight = 30; // height of controls
    var tHeight = 25; // height of title
    util.log("layout",vpWidth,vpHeight);
    var yp = 10;
    lib.titleRect = new geom.Rect(new geom.Point(40,yp),new geom.Point(500,tHeight));//50));
    lib.imRect = new geom.Rect(new geom.Point(0,0),new geom.Point(vpWidth,vpHeight));
    //lib.controlRect = new geom.Rect(new geom.Point(0,0),new geom.Point(100,100));
    yp = lib.imRect.maxY();
    lib.controlRect = new geom.Rect(new geom.Point(40,yp),new geom.Point(500,cHeight));//50));
    //yp = lib.controlRect.maxY();
    //lib.ssRect = new geom.Rect(new geom.Point(50,yp),new geom.Point(vpWidth,ssDivHt));
    lib.lightboxRect = new geom.Rect(new geom.Point(50,lbTop),new geom.Point(lbWidth,lbHeight));

    lib.image = new imlib.Image(imDim,imDir);
    lib.tiling = new imlib.Tiling(lib.image,256,1,imD.tilingDir,imD.tilingUrl,imD.tilingDepthBump);
    lib.maxDepth = lib.tiling.depth;
      
  }
  
  
 
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new geom.Rect(corner,nex);
    return rs;
  }
    
    
  
  
  lib.placeDivs = function () {
    var ww = $(window).width();
    var margin = lib.vpMargin;
    var vpw = ww - 2 * margin;
    var wsc = vpw/(lib.vpWidth);
    var wh = Math.max(0,$(window).height()); //-lib.ssDivHt-100); // this used to be lib.ssDivHt, but now don't force the whole ss dive to be visible
    var vph = (wh -  margin - lib.vpTop-30)/2;
    var hsc = vph/(lib.vpHeight);
    var centerit = hsc < wsc;
    util.log("placedivs",wsc,hsc);
    var sc = Math.min(hsc,wsc);
    var imwid=lib.imRect.extent.x; // before scaling
    var minimwid = 700; 
    var minsc = minimwid/imwid;
    if (sc < minsc) {
      sc = minsc;
    }
     var simwid = sc*imwid;
   
    if (centerit) {
      var wincenter = ww/2;
       var imleft=wincenter-0.5*simwid;
      util.log("placedivs",wincenter,imwid,simwid,imleft);
    } else {
      var imleft = margin;
    }
    util.log("layout",hsc,wsc,sc,centerit,wincenter,simwid,imleft);
    sc = Math.max(lib.minScale,sc);
    lib.scale = sc; 
    var imCorner = new geom.Point(imleft,lib.vpTop);
    lib.imCorner = imCorner;
    var simRect = geom.scaleRect(lib.imRect,imCorner,sc);
    var yp = simRect.maxY();
    var ttlr = lib.titleRect.clone();
    // line the title rect up over the image
    ttlr.extent.x=simRect.extent.x;
    ttlr.corner.x=simRect.corner.x;
    com.setRect(lib.titleDiv,ttlr);
    var ccr = lib.controlRect.clone();
    ccr.extent.x=simRect.extent.x;
    ccr.corner.x=simRect.corner.x;
    ccr.corner.y = yp;
    
    com.setRect(lib.controlDiv,ccr);
   // lib.imDiv.hide();
    com.setRect(lib.imDiv,simRect,lib.imCanvas,lib.ovCanvas);
    yp = ccr.maxY() + 10;
    lib.defaultPanelHeight = sc*lib.ssDivHt;
    var ssRect = new geom.Rect(new geom.Point(simRect.corner.x,yp),new geom.Point(simRect.extent.x,lib.defaultPanelHeight));
    com.setRect(lib.ssDiv,ssRect,null,null,true);
    var bottomRect = new geom.Rect(new geom.Point(simRect.corner.x,yp+lib.defaultPanelHeight),new geom.Point(simRect.extent.x,lib.bottomDivHt));
    com.setRect(lib.bottomDiv,bottomRect);
    if (lib.currentPanel) {
      lib.scaleDivForPanel(lib.currentPanel);
    }
    if (lib.vp) {
     // lib.vp.setScale(sc);
      lib.vp.refresh();
    }
    if (lib.vp) {
      lib.vp.scale = sc;
    }

  }

    
  lib.genDivs = function () {
    var b = $('body');
    lib.titleDiv = imlib.genTitleBar(lib.albumD.caption,true,true);

    lib.imDiv = $('<div class="viewport"/>');
    b.append(lib.imDiv);
   // lib.setRect(lib.presentDiv,lib.presentRect);
    lib.imCanvas = imlib.genCanvas({container:lib.imDiv,extent:lib.imRect.extent,zIndex:100,backgroundColor:"#000000"});
   lib.ovCanvas = imlib.genCanvas({container:lib.imDiv,extent:lib.imRect.extent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas

    lib.controlDiv = $('<div class="controls"/>');
    b.append(lib.controlDiv);

    lib.ssDiv = $('<div class="snapshots" />'); // lower panel container
    lib.panels = {};  // indexed by panel names; values have form {activator:,panel: }
    b.append(lib.ssDiv);
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
    b.append(lib.bottomDiv);
  
    
     lib.addSnapArrayDiv(lib.ssDiv);
   
    lib.addSelectedSnapDiv(lib.ssDiv);
   // lib.ssDiv.append(lib.selectedSnapDiv);
    lib.addCreateSnapDiv(lib.ssDiv);
    lib.addAlbumDiv(lib.ssDiv);
    lib.addAboutImageDiv(lib.ssDiv);
  
    
    
    //  lib.selectSnapArea = $('#selectSnapArea');
    //lib.setClickMethod(lib.selectSnapArea,lib.startDefArea);
    //lib.enableClickable(lib.selectSnapArea);
    
    // *** ABOUT IMAGE DIV
 


     
    lib.selectPanel("snapArray");

    lib.lightbox = new com.Lightbox(b,lib.lightboxRect);
    lib.lightbox.render();
    lib.placeDivs();

    
  }
  
  
    
  
  lib.genViewports = function () {   
    lib.tiling.createTiles();
    var vp = new imlib.Viewport(lib.imCanvas,lib.tiling,lib.imRect.extent,lib.ovCanvas);
    vp.depthBias = lib.depthBias;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    
    
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    lib.renderControls(lib.controlDiv);
    //vp.depthBump = 3.5;
    lib.panControl = new imlib.PanControl(lib.imDiv,vp);
  }
  
  lib.test = function () {
    var ov = new imlib.Overlay("test",new geom.Rect(new geom.Point(12000,2000),new geom.Point(5000,1000)));
    lib.vp.addOverlay(ov);
  }
  
  
  lib.initialize = function (imD,albumD,albumDs,loggedInUser) {
    if (!albumD) {
       imlib.genTitleBar("No Such Album");
        return;
    }

  lib.setParams(imD);
    var albumTopic = albumD.topic;
    var sp = albumTopic.split("/");
    var spln = sp.length;
    lib.albumId = sp[spln-1];
    lib.albumD = albumD;
    lib.albumDs = albumDs;
    lib.albumTopic = albumTopic;
    idv.loggedInUser = loggedInUser;
    lib.myAlbum = loggedInUser == albumD.owner;
    
    
    lib.genDivs();
    lib.genViewports();
    
    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.placeDivs();
      lib.positionSnaps();
    });
    lib.placeDivs();
//    lib.controls.initialZoom = lib.initialZoom;
//    lib.controls.refresh();
    lib.addSnaps();
    lib.hookupPanelActivators();
    lib.selectPanel("snapArray");


  }
  
  
  
})();

idv.util.activeConsoleTags = ["tiling"];//"loaded","drawfail"];//"limitPan"];//"scale","imsrc","loaded"];

