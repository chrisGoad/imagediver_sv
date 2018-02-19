
/*
 http://dev.imagediver.org/topic/image/cg/The_Ambassadors/index.html?image_only=1&album=/album/cg/The_Ambassadors/1
*/

(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;
  page.wideLayout = false; // the wide layout is for wide images
  idv.pageKind == "image";

  
   
  lib.renderControls = function (container) {
    var cnt = container;
    var elements = {};
    var albums = lib.albumDs;
    var ln = albums.length;
    if ((ln > 0)||loggedInUser) {
      lib.someAlbums = true;
      /*
      var aboutImageActivator = $('<span style="float:right" class="clickableElement">about image</span>');
      cnt.append(aboutImageActivator);
      var pn = lib.setPanelActivator("aboutImage",aboutImageActivator);
      
      pn.scalable = false;
      pn.height = null;
      
      var albumsActivator = $('<span style="float:right" class="clickableElement">albums</span>');
      cnt.append(albumsActivator);
      */
      lib.setPanelPanel("albums",lib.albumDiv);
      //lib.setPanelActivator("albums",albumsActivator);
      
    } else {
      lib.someAlbums = false;
    }
  
   if (loggedInUser) {
      var editImageActivator = $('<span style="float:right" class="clickableElement">Edit</span>');
      pn = lib.setPanelActivator("editImage",editImageActivator);
      pn.scalable = false;
      pn.height = null;
      cnt.append(editImageActivator);
    }
    //if (loggedInUser) {
    //  put a create album button in here
    //}
    
    //pn.selfScaling = true;
    var setZoom = function (z) {lib.vp.setZoom(z);};
    var getZoom = function () {return lib.vp.zoom;};
    var zmropts = {container:cnt,maxZoom:lib.vp.maxZoom,setZoom:setZoom,getZoom:getZoom,
       zoomIncrement:1.05,zoomFactor:2,zoomDelay:50};
    var zmr =  new idv.zoomSlider(zmropts);
    lib.zSlider = zmr;
    lib.vp.zoomCallbacks.push(function (z) {lib.zSlider.positionSliderFromZoom(z);});

   var viewAll = $('<span class="clickableElement">view all</span>');
   viewAll.css({left:lib.zSlider.totalWidth+10,top:5,position:"absolute"});

   cnt.append(viewAll);
   viewAll.click(function () {lib.vp.setZoom(1);});
    var gap = $('<div class="gap"></div>');
    container.append(gap);
    if (lib.image_only) {
   


      lib.stdSnapAdvice = "the yellow outline above shows the area of interest";
      // var snapAdvice = $('<span><i>click within outline for detail</i></span>');
       var snapAdvice = $('<span></span>');
       snapAdvice.html(lib.stdSnapAdvice);
       snapAdvice.hide();
       //snapAdvice.css({left:lib.zSlider.totalWidth+170,top:15,position:"absolute"})
       //snapAdvice.css({left:lib.zSlider.totalWidth,top:45,position:"absolute"})
         snapAdvice.css({"font-style":"italic",left:340,top:10,position:"absolute"})
        lib.snapAdvice = snapAdvice;
       cnt.append(snapAdvice);
       //snapAdvice.hide();
   
      var zoomToSnap = $('<span class="clickableElement">zoom to outline</span>');
      zoomToSnap.css({left:lib.zSlider.totalWidth+10+70,top:5,position:"absolute"});
      lib.zoomToSnap = zoomToSnap;
      cnt.append(zoomToSnap);
      zoomToSnap.click(function () {
         lib.vp.setZoom(1);
        lib.animatedZoomToSnap(lib.selectedSnap,1.1);
        //lib.postMessageToParent("hohoho"); just a test
      });
   
      
    }
  }

  // A view
  
  
  imlib.clickCallback = function (ps,vps,dclick) {
    //lib.vpCapDiv.css({left:vps.x,top:vps.y});
    //if (!lib.showSnapsMode) return;
    //console.slog("CLICK CALL BACK",ps);
    
    var  csel = lib.selectedSnap;
    var cv = csel.coverage;
    var rl = cv.contains(ps);
    if (rl) {
      lib.vp.setZoom(1);
      lib.animatedZoomToSnap(csel,1.1);
    }
  }
  

  lib.setParams = function(imD) {
    var imTopic = imD.topic
    lib.imName = imTopic.split("/")[2]
   
    lib.zoomDelay = 50;
    lib.zoomIncrement = 1.05;
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;
    var dim = imD.dimensions;
    var x = dim.x;
    var y = dim.y;
    var aar = x/y;
    lib.imageAspectRatio = aar;
    if (aar > 1.5) {
     lib.aspectRatio = 2; // this is the aspect ratio of the panels
     lib.twoColumns = false;
    } else {
      lib.aspectRatio = 1;
      lib.twoColumns = true;
    }
  

/*
    var unscaledWidth = 500;
    var margin = 20;
    // for astoria 1923
    //var aRatio = 0.35;
    var aRatio = 2.0;
  
    lib.aspectRatio = aRatio;
    var minScale = 1.3;
    var minScale = 0.2;
    var vpHeight = unscaledWidth * aRatio;
    
    lib.standardPanelHeight= vpHeight;
 */
    lib.selectedSnapPanelHeight = 400;
/*
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
    lib.defaultPanelNominalHeight = vpHeight;
    lib.panelSdiv = new lib.scalableDiv({height:vpHeight,scalable:true,name:"panel"});
    theDivStack.addDiv(lib.panelSdiv);
    lib.bottomSdiv = new lib.scalableDiv({height:40,scalable:false,name:"bottom"});
    theDivStack.addDiv(lib.bottomSdiv);
    lib.theDivStack.placeDivs();
*/
    lib.imD = imD;
   // lib.depthBias = -1; // applies for all images; determines when to go to higher res images. higher values=higher res
    lib.image = new imlib.Image(imD);
   // lib.tiling = new imlib.Tiling(lib.image,256,1,imD.tilingDir,imD.tilingUrl,imD.tilingDepthBump);
    lib.tiling = new imlib.Tiling(lib.image,256,1,imD.tilingDepthBump);
    lib.maxDepth = lib.tiling.depth;    
  }
 

 
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new geom.Rect(corner,nex);
    return rs;
  }
    
    
  
  lib.defaultPanelHeight = function () {
    return lib.standardPanelHeight * lib.theLayout.scale;
  }
  

  
  lib.placeDivs = function () {
    lib.theLayout.placeDivs();
    lib.vp.scale = lib.theLayout.scale;
    lib.vp.refresh();
  }
  
  
  
  
  lib.genDivs = function () {
    var b = $('body');
    var imD = lib.imD;
    var author = imD.author;
    if (author) {
      author = ", "+author;
    } else {
      author = "";
    }
    if (imD.title) {
      var title = imD.title;
    } else {
      title = imD.name;
    }
    var wpg = imD.wikipediaPage;
    var topbarOptions = {embed:idv.embed,title:title+author,aboutText:imD.description,aboutTitle:"about image",includeGallery:1};
    if (wpg) {
      topbarOptions.wikipediaPage = wpg;
    }
    
    var twoC = page.twoColumns;
    if (lib.image_only) twoC=false;
    //twoC = lib.aspectRatio < 1.8;
    //twoC = false;
    if (twoC) {
      var outerDiv = $("<div class='outerDiv'/>");
      if (!idv.embed) lib.topbar = imlib.genTopbar(outerDiv,topbarOptions);

      //lib.titleDiv = imlib.genTitleBar(outerDiv,title,true,true);
      lib.outerDiv = outerDiv;
      b.append(outerDiv);
      var colsDiv = $("<div class='columns'/>")
      outerDiv.append(colsDiv);
      var c0Div = $("<div class='leftColumnDiv'/>");
      lib.c0Div = c0Div;
      colsDiv.append(c0Div);
      var c1Div = $("<div class='columnDiv'/>");
      lib.c1Div = c1Div;
      colsDiv.append(c1Div);      
    } else {
      var c1Div = $("<div class='columnDiv'/>");
      lib.c1Div = c1Div;
      b.append(c1Div);
      if (!idv.embed&&!lib.image_only) lib.topbar = imlib.genTopbar(c1Div,topbarOptions);
      if (lib.image_only) {
        var titleDiv = $('<div class="titleDiv"/>');
        titleDiv.css({"text-align":"center","margin":"10px"});
        c1Div.append(titleDiv);
      }
      //imlib.genTopbar(c1Div,topbarOptions);
      //lib.titleDiv = imlib.genTitleBar(c1Div,title,true,true);
    }
      
      
    lib.vpDiv = $('<div class="viewport"/>');
   /* if (!page.wideLayout) {
      lib.sideDiv = $('<div id="sideDiv"/>');
      b.append(lib.sideDiv);
    }
   */
 
 //    lib.controlSdiv.element = lib.controlDiv;
    lib.panelDiv = $('<div class="snapshots" />'); // lower panel container
    lib.panelDiv.css("overflow","auto");

      
    lib.panels = {};  // indexed by panel names; values have form {activator:,panel: }
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
//    c1Div.append(lib.bottomDiv);
//    lib.bottomSdiv.element=lib.bottomDiv;
      
    c1Div.append(lib.vpDiv);
    
    
    lib.controlDiv = $('<div class="controls"/>');
    c1Div.append(lib.controlDiv);

    var evDiv = $('<div id="evDiv"></div>');
    evDiv.css({"position":"absolute","background-color":"transparent"});
    lib.evDiv = evDiv;
    lib.vpDiv.append(evDiv);


    if (twoC) {
      c0Div.append(lib.panelDiv);
      //outerDiv.append(lib.bottomDiv);
      lib.theLayout = new lib.LayoutTwo({
        outerDiv:lib.outerDiv,
        colsDiv:colsDiv,
        leftDiv:lib.c0Div,
        rightDiv:lib.c1Div,
        panelDiv:lib.panelDiv,
        vpDiv:lib.vpDiv,
        evDiv:lib.evDiv,
        margin:20,
        aspectRatio:lib.aspectRatio,
        minScale:0.5,
        additionalHeight:120,
        includeLightbox:true

      });
    } else {
   // lib.vpSdiv.element = lib.vpDiv;
   // var vpRect = lib.vpSdiv.rect();
      if (!lib.image_only) c1Div.append(lib.panelDiv);
      lib.theLayout = new lib.LayoutOne({
      centerDiv:c1Div,
        margin:20,
        aspectRatio:lib.aspectRatio,
        minScale:0.5,
        vpDiv:lib.vpDiv,
        evDiv:lib.evDiv,
        additionalHeight:lib.image_only?100:180,
        scaleToViewport:true,
        includeLightbox:!lib.image_only

      });
    }
    if ((!lib.image_only) || (lib.albumDs.length > 0) || loggedInUser) {
      lib.addAlbumDiv(lib.panelDiv);
    }
   // lib.addAboutImageDiv(lib.panelDiv);
    if (loggedInUser) {
      lib.addEditImageDiv(lib.panelDiv);
    }
    lib.theLayout.placeDivs();
    if (lib.topbar) {
      lib.topbar.lightbox = lib.theLayout.lightbox;
    }
    lib.lightbox = lib.theLayout.lightbox;
    var vpExtent = lib.theLayout.vpExtent;
    lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",extent:vpExtent,container:lib.vpDiv,zIndex:100,backgroundColor:"#000000"});
    lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:200,backgroundColor:"transparent"}); // overlay canvas


    

    
    lib.theLayout.placeDivs();
    lib.theLayout.afterPlacement = function () {
      if (lib.vp) {
        var layout = lib.theLayout;
        lib.vp.scale = layout.scale;
        var vpCss = layout.vpCss;
        //lib.setCss(lib.vp,vpCss);
        lib.vpCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})  
        //lib.setCss(lib.vpCanvas,vpCss);
        //lib.setCss(lib.ovCanvas,vpCss);
        if (lib.ovCanvas) lib.ovCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        lib.vp.refresh();

      }
    }
  }
  
  
    
  
  lib.genViewports = function () {
    lib.tiling.createTiles();
    var vpExtent = lib.theLayout.vpExtent;
    var vp = new imlib.Viewport(lib.vpCanvas,lib.tiling,vpExtent,lib.ovCanvas);
    lib.vp = vp;
//    vp.depthBias = lib.depthBias;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    
    
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    lib.renderControls(lib.controlDiv);
    //vp.depthBump = 3.5;
    lib.panControl = new imlib.PanControl(lib.vpDiv,vp);
    lib.vp.panControl = lib.panControl;
  }
  
  lib.test = function () {
    var ov = new imlib.Overlay("test",new geom.Rect(new geom.Point(12000,2000),new geom.Point(5000,1000)));
    lib.vp.addOverlay(ov);
  }
  
  
  
  /*
   lib.updateOverlays = function (which) {
    var vp = lib.vp;
    if (which == "selected") {
      vp.clearOverlays(1);
    } else if (which == "outlined") {
      vp.clearOverlays(0);
    } else {
      vp.clearOverlays("both");
    }
    util.arrayForEach(lib.snapDs,function (snapD) {
      var st = snapD.overlayState;
      if ((st == "selected") && ((which == "selected") || (which == "both"))  ||
          ((st == "outlined") &&  ((which == "outlined") || (which == "both")))) {
        var cv = snapD.coverage;
        var nm = snapD.topicId;
        var ov = new imlib.Overlay(nm,cv);
        ov.color = (st == "selected")?"yellow":"red"
    //if (snapD.selected) ov.selected; // this is for the selection in showSnapMode
        vp.addOverlay(ov);
        if (st == "selected") {
          vp.addOverlay(ov,1);
        } 
      }
    });
    //vp.refresh(true);
    if (which == "selected") {
      vp.drawOverlays(1);
    } else if (which == "outlined") {
      vp.drawOverlays(0);
    } else {
      vp.drawOverlays("both");
    }
  }
  
  */
  lib.snapSelected = "none";
  lib.selectSnap = function (idx) {
    lib.snapSelected =idx;
    lib.snapAdvice.show();
    lib.zoomToSnap.show();
 
     var vp = lib.vp;
      lib.vp.setZoom(1);
    vp.clearOverlays(1);
     var snap = lib.snapsByIndex[idx];
     lib.selectedSnap = snap;
    //lib.selectedSnap = snap;
    var cv = snap.coverage;
    var nm = snap.topicId;
    var ov = new imlib.Overlay(nm,cv);
    vp.addOverlay(ov,1);
    //lib.showSnapsMode = true; // this prevents the refresh from clearing the overlays
    //lib.setSelectedSnap(snap);
    vp.drawOverlays(1);
    //lib.vp.addOverlay(ov,1);
    //lib.vp.refresh(true);
    $('.titleDiv').html(snap.caption);
    //lib.zoomToSnap.show();

  }
  
  
  lib.selectMain = function () {
    lib.selectedSnap = undefined;
    lib.vp.clearOverlays("both");
    lib.snapAdvice.hide();
    lib.vp.setZoom(1);
    lib.zoomToSnap.hide();
    lib.snapAdvice.hide();
    //lib.vp.refresh(true);
    var imD = lib.imD;
    var txt = imD.title;
    if (imD.author) txt += ", "+imD.author;
    $('.titleDiv').html(txt);
    //lib.animatedZoomToSnap();
  }
  
  lib.firstMessage = true;
  lib.czoom = 1;
  lib.interpretMessage = function (msg) {
    var mt = msg.match(/(\w*)\((\w*)\)/);
    if (mt) {
      var cmd = mt[1];
      var arg = mt[2];
      if (cmd == "selectSnap") {
        var snapid = parseInt(arg);
        /*lib.vp.clearBeenDrawn(true);
        lib.vp.needsRefresh = true;
        lib.czoom = lib.czoom * 0.98;
        lib.czoom = 1;
        lib.vp.removeFlashImages();
        lib.vp.refresh(true);
        return;
        */
        lib.vp.setZoom(1,false,true);
        //setTimeout(function () {util.slog("HEREE");lib.vp.setZoom(lib.czoom,false,true);},1000);
        /*
        if (!lib.cpan) lib.cpan = 0.01;
        lib.cpan = lib.cpan + 1;
        setTimeout(function () {util.slog("HEREEPO");lib.vp.setPan(new geom.Point(lib.cpan,0.1));},1000);
        */
        if (lib.firstMessage) { // need some time to resize etc
          setTimeout(function () {
            lib.selectSnap(snapid);
          },10);
          lib.firstMessage = false;
        } else {
          lib.selectSnap(snapid);
        }
      } else if (cmd = "selectMain") {
        lib.selectMain();
      }
    }
  }
  lib.addListener = function () {
    function receiveMessage(event) {
      lib.interpretMessage(event.data);
    }
    if (window.addEventListener) {
      window.addEventListener("message", receiveMessage, false);
    } else {
      window.attachEvent("onmessage", receiveMessage);
    }
  }
  
  
  
  lib.postMessageToParent = function (msg) {
    var pr = window.parent;
    //var ifm = $('.lighboxiframe');
    //if (idv.brie8) {
    pr.postMessage(msg,"http://"+location.host);
    //}
    //cw.postMessage(msg,"*");
    

  }

  
  //duplicated from snaparray 
  
  lib.internalizeSnapD = function (snapD,sc) {
    var cv = snapD.coverage;
    var ext = cv.extent;
    var crn = cv.corner;
    var nc = geom.internalizeRect({extent:{x:ext.x * sc,y:ext.y * sc}, corner:{x:crn.x * sc,y:crn.y* sc}});
    snapD.coverage = nc;
  }
  
  
  lib.finishInitialize = function () {
    if (lib.snapDs) {
      lib.snapsByIndex = {};
      var imx = lib.imD.dimensions.x;
      util.arrayForEach(lib.snapDs, function (snapD) {
        var tp = snapD.topic;
        var idx = util.numberAtEnd(tp);
        lib.snapsByIndex[idx]=snapD;
        lib.internalizeSnapD(snapD,imx);
        snapD.topicId = idx;
      });
 // idv.util.arrayForEach(snapDs,function (snapD){return page.internalizeSnapD(snapD,imx);});

    }
    lib.genDivs();
    lib.genViewports();
   /* if (lib.selectedRect) {
      var ov = new imlib.Overlay("test",lib.selectedRect);
      lib.vp.addOverlay(ov);
      //var vp = lib.viewport;
      //vp.drawRect(lib.selectedRect,"image",idv.selectedColor);
    }
   */
    lib.vpCapDiv = $('<div class="vpCap" id="viewport0" style="position:absolute;background-color:black;border:solid thin white;padding:3px;font-size:8pt;z-index:1000">TEST</div>');
    lib.vpDiv.append(lib.vpCapDiv);
    lib.vpCapDiv.hide();
    lib.vpSelectDiv = $('<div class="vpSelect" id="vpSelect" style="margin:0px;padding:0px;position:absolute;background-color:transparent;font-size:8pt;z-index:2000;border:solid yellow;border-width:2px;"></div>');
    lib.vpDiv.append(lib.vpSelectDiv);
    lib.vpSelectDiv.hide();
    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.placeDivs();
    });
    lib.placeDivs();
    lib.hookupPanelActivators();
    if (!lib.image_only) {
      if (lib.someAlbums) {
        lib.selectPanel("albums")
      } else {
        lib.selectPanel("aboutImage");
      }
    }
    lib.postMessageToParent("ready");
  }
   
  
  lib.initialize = function (imD,albumDs,loggedInUser) {
    //alert("imagge");
    //window.pageshow= function () {alert("pageshow");}
    //$("document").ready(function () { alert("ready");});
    
    // VILE HACK until I get an album deletion thing going
    util.commonInit();
    imlib.selectStrokeWidth = 20;
    var qs = util.parseQS();
    lib.image_only = qs["image_only"];
    lib.album = qs["album"];
    lib.imD = imD;
    util.slog(lib.album);
    if (lib.image_only) {
      lib.addListener();
    }
    /*
    var sel = qs["selected"];
    if (sel) {
      var sels = sel.split(",");
      var crn = new geom.Point(parseFloat(sels[0]),parseFloat(sels[1]));
      var extent = new geom.Point(parseFloat(sels[2]),parseFloat(sels[3]));
      var selr = new geom.Rect(crn,extent);
      lib.selectedRect = selr;
    }
    
    lib.selsnap = qs["snap"];
    */
    if (imD.name == "vintage_1") {
      albumDs = [];
      imD.albumDs = [];
    }
    lib.setParams(imD);
    lib.albumDs = albumDs;
    idv.loggedInUser = loggedInUser;
    if (lib.album) {
      var jsonUrl = idv.util.jsonUrl(lib.album);
      idv.util.get(jsonUrl,function (rs) {
        lib.snapDs = rs.value.snaps;
        lib.finishInitialize();
      });
    } else {
      lib.finishInitialize();
    }
    
  }
  
 
  
})();