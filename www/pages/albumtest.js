

// panorama page generation


(function () {
  

  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;


  
 
  
   
  lib.renderControls = function (container) {
    var cnt = container;
    var elements = {};
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
     
    var gap = $('<div class="gap"></div>');
    container.append(gap);
 
  }
    
  // A view
  
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
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;
  


    var unscaledWidth = 500;
    var margin = 20;
    // for astoria 1923
    var aRatio = 0.35;
    lib.aspectRatio = aRatio;
    var minScale = 1.3;
    var vpHeight = unscaledWidth * aRatio;
    
    lib.standardPanelHeight= vpHeight;
    lib.selectedSnapPanelHeight = 400;


    var theDivStack = new lib.divStack(margin,minScale,unscaledWidth);
    theDivStack.includeLightbox = false;
    lib.theDivStack = theDivStack;
    lib.topDiv = new lib.scalableDiv({height:10,scalable:false,name:"top"});
    theDivStack.addDiv(lib.topDiv);

    lib.titleSdiv = new lib.scalableDiv({height:30,scalable:false,name:"title"});
    theDivStack.addDiv(lib.titleSdiv);
    lib.vpSdiv = new lib.scalableDiv({height:vpHeight,scalable:true,name:"vp"});
    theDivStack.addDiv(lib.vpSdiv);
    lib.controlSdiv = new lib.scalableDiv({height:50,scalable:false,name:"control"});
    theDivStack.addDiv(lib.controlSdiv);
    lib.panelSdiv = new lib.scalableDiv({height:vpHeight,scalable:true,name:"panel"});
    theDivStack.addDiv(lib.panelSdiv);
    lib.bottomSdiv = new lib.scalableDiv({height:40,scalable:false,name:"bottom"});
    theDivStack.addDiv(lib.bottomSdiv);
    lib.theDivStack.placeDivs();


    lib.imD = imD;
    var imDimx = imD.dimensions.x;
    var imDimy = imD.dimensions.y;
    var imDim = new geom.Point(imDimx,imDimy);
    var imDir = imD.imDir;
    lib.depthBias = 0; // applies for all images; determines when to go to higher res images. higher values=higher res
    lib.image = new imlib.Image(imDim,imDir);
    lib.tiling = new imlib.Tiling(lib.image,256,1,imD.tilingDir,imD.tilingUrl,imD.tilingDepthBump);
    lib.maxDepth = lib.tiling.depth;    

  }
  
  
 
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new geom.Rect(corner,nex);
    return rs;
  }
    
    
  
  
  
  lib.defaultPanelHeight = function () {
    return lib.standardPanelHeight * lib.theDivStack.scale;
  }
  

  
  lib.placeDivs = function () {
    lib.theDivStack.computeScale();
    var scale = lib.theDivStack.scale;
    lib.vp.scale = scale;
    lib.theDivStack.placeDivs();
    lib.vp.refresh();
  }
  
    
  lib.genDivs = function () {
    var b = $('body');
    var fullTitle = lib.imD.title + ":" + lib.albumD.caption;
    lib.titleDiv = imlib.genTitleBar(fullTitle,true,true);
    lib.titleSdiv.element = lib.titleDiv;

    lib.vpDiv = $('<div class="viewport"/>');
    b.append(lib.vpDiv);
    lib.vpSdiv.element = lib.vpDiv;
    var vpRect = lib.vpSdiv.rect();
    lib.vpCanvas = imlib.genCanvas({container:lib.vpDiv,extent:vpRect.extent,zIndex:100,backgroundColor:"#000000"});
   lib.ovCanvas = imlib.genCanvas({container:lib.vpDiv,extent:vpRect.extent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas


    lib.vpSdiv.afterPlacement = function () {
      if (lib.vp) {
        lib.vp.scale = lib.theDivStack.scale;
        var rc = lib.vpSdiv.rect();
        util.log("layout","rect",rc.corner.x,rc.corner.y,rc.extent.x,rc.extent.y);
        com.setRect(lib.vpDiv,rc,lib.vpCanvas,lib.ovCanvas);
        lib.vp.refresh();
      }
    };
    
    lib.controlDiv = $('<div class="controls"/>');
    b.append(lib.controlDiv);
    lib.controlSdiv.element = lib.controlDiv;


    lib.panelDiv = $('<div class="snapshots" />'); // lower panel container
    b.append(lib.panelDiv);
    lib.panelSdiv.element = lib.panelDiv;
    lib.panels = {};  // indexed by panel names; values have form {activator:,panel: }
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
    b.append(lib.bottomDiv);
    lib.bottomSdiv.element=lib.bottomDiv;
  
    
    lib.addSnapArrayDiv(lib.panelDiv);
   
    lib.addSelectedSnapDiv(lib.panelDiv);
    lib.addCreateSnapDiv(lib.panelDiv);
    lib.addAlbumDiv(lib.panelDiv);
    lib.addAboutImageDiv(lib.panelDiv);
  }
  
  
    
  
  lib.genViewports = function () {   
    lib.tiling.createTiles();
    var vpRect = lib.vpSdiv.rect(true);
    var vp = new imlib.Viewport(lib.vpCanvas,lib.tiling,vpRect.extent,lib.ovCanvas);
    lib.vp = vp;
    vp.depthBias = lib.depthBias;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    lib.renderControls(lib.controlDiv);
    lib.panControl = new imlib.PanControl(lib.vpDiv,vp);
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
    lib.addSnaps();
    lib.hookupPanelActivators();
    lib.selectPanel("snapArray");


  }
  
  
  
})();
  