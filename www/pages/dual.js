

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/


(function () {
  
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;




   
  lib.renderControls = function (container) {

    var cnt = container;
    this.elements = {};
    //var login = $('<div class="rightElement">log in/register</div>');
    //cnt.append(login);
    //login.click(lib.popLogin);
    /*
     var aboutImage = $('<span style="float:right" class="clickableElement">about image</span>');
    cnt.append(aboutImage);
    aboutImage.click(function () {
      var lb = lib.theLayout.lightbox;
      lb.pop();
      lb.setHtml("<p class='lightboxP'>On December 8, 1922, a fire burned down the business district of Astoria Oregon. The 1923 panorama was made by Frank Woodfield 9 months later, on September 23, 1923, and shows an intermediate stage of reconstruction. "+
                 "A <a target='idvWindow' href='http://en.wikipedia.org/wiki/Cirkut'>Cirkut</a> #8 camera was used. The negative, from which this web image was scanned, was 8 inches by approximately 3 feet in size, which accounts for the very high resolution. The negative is the property of the Clatsop County Historical Society, whom we thank for its use.</p>"+
                 "<p>The 2010 image was made by <a target='idvWindow' href='http://michaelmathers.com'>Michael Mathers</a> utilizing <a target='idvWindow' href = 'http://gigapan.org'>GigaPan</a> technology to achieve approximately the same resolution.</p>" +
                 "<p>The images were made from the same spot on the roof of the Spexarth building in downtown Astoria.</p>");
    });
    */
    /*
    
    var zoomin = $('<span style="float:left" class="clickableElement">zoom in </span>');
    cnt.append(zoomin);
    this.elements.zoomin = zoomin;
    var zoomout = $('<span style="float:left" class="clickableElement">zoom out</div>');
    this.container.append(zoomout);
    this.elements.zoomout = zoomout;
    */
    var setZoom = function (z) {lib.vp0.setZoom(z);};
    var getZoom = function () {return lib.vp0.zoom;};
    var zmropts = {container:cnt,maxZoom:lib.vp0.maxZoom,setZoom:setZoom,getZoom:getZoom,
       zoomIncrement:1.05,zoomFactor:2};
    var zmr =  new idv.zoomSlider(zmropts);
    lib.zSlider = zmr;
    
   var viewAll = $('<span class="clickableElement">view all</span>');
   viewAll.css({position:"absolute",top:"8px",left:lib.zSlider.totalWidth+30});

   cnt.append(viewAll);
   viewAll.click(function () {lib.vp0.setZoom(1);});
     
   //var gap = $('<div class="gap"></div>');
    //container.append(gap);
    //this.connectElements();

    }
    
  // A view
  
//  lib.controlDiv
//var controlDiv,im0Div,im1Div;
  lib.setParams = function(imD0,imD1) {
    var imTopic0 = imD0.topic
    lib.imName0 = imTopic0.split("/")[2]
    var imTopic1 = imD1.topic
    lib.imName1= imTopic1.split("/")[2]
    lib.aspectRatio = 4;
   /* var margin = 20;
    var minScale = 1.3;
    var unscaledWidth = 500;
    var aRatio = 0.35;
    var vpHeight = unscaledWidth * aRatio;
    var theDivStack = new lib.divStack(margin,minScale,unscaledWidth);
    theDivStack.includeLightbox = true;
    lib.theDivStack = theDivStack;
    lib.topDiv = new lib.scalableDiv({height:10,scalable:false,name:"top"});
    theDivStack.addDiv(lib.topDiv);

    lib.titleSdiv = new lib.scalableDiv({height:30,scalable:false});
    theDivStack.addDiv(lib.titleSdiv);
    
    
   // lib.noteSdiv = new lib.scalableDiv({height:40,scalable:false});
  //  theDivStack.addDiv(lib.noteSdiv);
    
    
    lib.im0TitleSdiv = new lib.scalableDiv({height:20,scalable:false});
    theDivStack.addDiv(lib.im0TitleSdiv);
    lib.vp0Sdiv = new lib.scalableDiv({height:vpHeight,scalable:true,name:"vp0"});
    theDivStack.addDiv(lib.vp0Sdiv);
    lib.controlSdiv = new lib.scalableDiv({height:50,scalable:false,name:"control"});
    theDivStack.addDiv(lib.controlSdiv);
    lib.im1TitleSdiv = new lib.scalableDiv({height:20,scalable:false});
    theDivStack.addDiv(lib.im1TitleSdiv);
    lib.vp1Sdiv = new lib.scalableDiv({height:vpHeight,scalable:true,name:"vp1"});
    theDivStack.addDiv(lib.vp1Sdiv);
    //lib.bottomDiv = new lib.scalableDiv({height:40,scalable:false,name:"bottom"});
   // theDivStack.addDiv(lib.bottomDiv);
    lib.theDivStack.placeDivs();
   */
    lib.imD0 = imD0;
    lib.imD1 = imD1;
    //imD0 is used to set viewport dimensions
 
   // lib.depthBias = 0; // applies for all images; determines when to go to higher res images. higher values=higher res
    lib.maxZoom = 16;
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;
   
    //yp = lib.controlRect.maxY();
    //lib.ssRect = new geom.Rect(new geom.Point(50,yp),new geom.Point(vpWidth,ssDivHt));
   // lib.lightboxRect = new geom.Rect(new geom.Point(50,lbTop),new geom.Point(lbWidth,lbHeight));

    lib.image0 = new imlib.Image(imD0);
    lib.image1 = new imlib.Image(imD1);
    lib.tiling0 = new imlib.Tiling(lib.image0,256,1,imD0.tilingDepthBump);
    lib.tiling1 = new imlib.Tiling(lib.image1,256,1,imD1.tilingDepthBump);
    lib.maxDepth = lib.tiling0.depth;
      
  }
  
  
 
    
    
    
    
    
  
  lib.placeDivs = function () {
    lib.theLayout.placeDivs();
    var scale = lib.theLayout.scale;
    lib.vp0.scale = scale;
    lib.vp1.scale = scale;
    lib.vp0.refresh();
    lib.vp1.refresh();
  }

  lib.genDivs = function () {
    var fullTitle = "Coordinated Dual Viewer";
    var b = $('body');
    var c1Div = $("<div class='columnDiv'/>");
    lib.c1Div = c1Div;
    b.append(c1Div);
    lib.titleDiv = imlib.genTitleBar(c1Div,fullTitle,true,true);
      
  
    lib.im0TitleDiv = $('<div class="imTitleDiv">Astoria in 1923</div>');
    c1Div.append(lib.im0TitleDiv);
   /* lib.titleDiv1 = $('<div class="titleDiv1">More Images</div>');
    lib.titleDiv.append(lib.titleDiv1);
    lib.titleDiv2 = $('<div class="titleDiv2">Astoria in 1923</div>');
    lib.titleDiv.append(lib.titleDiv2);
   */
    lib.vp0Div = $('<div class="viewport"/>');
    c1Div.append(lib.vp0Div);
  
    lib.controlDiv = $('<div class="controls"/>');
    c1Div.append(lib.controlDiv);


    lib.im1TitleDiv = $('<div class="imTitleDiv">Astoria in 2010</div>');
    c1Div.append(lib.im1TitleDiv);
  
    lib.vp1Div = $('<div  class="viewport"/>');
    c1Div.append(lib.vp1Div);
   
   
     lib.theLayout = new lib.LayoutDual({
        centerDiv:lib.c1Div,
        vp0Div:lib.vp0Div,
        vp1Div:lib.vp1Div,
        margin:50,
        aspectRatio:lib.aspectRatio,
        minScale:0.5,
        additionalHeight:170,
        includeLightbox:true
      });
     
    lib.theLayout.placeDivs();
    var vpExtent = lib.theLayout.vpExtent;

    lib.vp0Canvas = imlib.genCanvas({whichCanvas:"vp0",container:lib.vp0Div,extent:vpExtent,zIndex:100,backgroundColor:"#000000"});
    lib.ov0Canvas = imlib.genCanvas({whichCanvas:"ov",container:lib.vp0Div,extent:vpExtent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas

    lib.vp1Canvas = imlib.genCanvas({whichCanvas:"vp1",container:lib.vp1Div,extent:vpExtent,zIndex:100,backgroundColor:"#000000"});
    lib.ov1Canvas = imlib.genCanvas({whichCanvas:"ov",container:lib.vp1Div,extent:vpExtent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
  
  
    lib.theLayout.afterPlacement = function () {
      var layout = lib.theLayout;
      if (lib.vp0) {
        lib.vp0.scale = layout.scale;
        var vpCss = layout.vpCss;
        lib.vp0Canvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        if (lib.ov0Canvas) lib.ov0Canvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        lib.vp0.refresh();
      }
     if (lib.vp1) {
        lib.vp1.scale = layout.scale;
        var vpCss = layout.vpCss;
        lib.vp1Canvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        if (lib.ov1Canvas) lib.ov1Canvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        lib.vp1.refresh();
      }
    };
    
 

    
    
    
  }
  
  
    
  
  lib.genViewports = function () {   
    lib.tiling0.createTiles();
    var vpExtent = lib.theLayout.vpExtent;

    var vp0 = new imlib.Viewport(lib.vp0Canvas,lib.tiling0,vpExtent,lib.ov0Canvas);
//    vp0.depthBias = lib.depthBias;
    vp0.zoom = lib.initialZoom;
    lib.vp0 = vp0;
    
    
    vp0.maxZoom = lib.maxZoom;
    vp0.maxDepth = lib.maxDepth;
    vp0.depthBump = lib.imD0.zoomDepthBump;
    //vp.depthBump = 3.5;

    lib.tiling1.createTiles();
    var vp1= new imlib.Viewport(lib.vp1Canvas,lib.tiling1,vpExtent,lib.ov1Canvas);
//    vp1.depthBias = lib.depthBias;
    vp1.zoom = lib.initialZoom;
    lib.vp1 = vp1;
    
    vp1.maxZoom = lib.maxZoom;
    vp1.maxDepth = lib.maxDepth;
    vp1.depthBump = lib.imD1.zoomDepthBump;
    lib.renderControls(lib.controlDiv);
     //lib.control0.render();
    lib.vp = lib.vp0;  // slight hack so we get the right pancontrol in pc_mousedown, pc_mousemove
    lib.vp0.panControl = new imlib.PanControl(lib.vp0Div,vp0);
    lib.vp1.panControl = new imlib.PanControl(lib.vp1Div,vp1);
    
    lib.dualControl = new imlib.DualControl(lib.vp0,lib.vp1);
    
    var dc = lib.dualControl;
    
    // HACK put in the params directly for our one and only current example
      var gv = [0,0,0,0,0,-0.0035,0.002,0.002,0.004,0.004,0.004];
        var gv = [0,0,0,0,0,0,0,0,0,0,0];
    dc.panxGrid = new geom.Grid1(gv,-0.5,0.5);
    //gv = [0,0,0,0,0,-0.003,0.002,0.002,0.004,0.004,0.004];
    dc.panyGrid = new geom.Grid1(gv,-0.2,0.2);
    
     dc.spanFactor = 1.083;
   //dc.zoomFactor = 4.295; // 27201/25330 * 4
    //dc.zoomFactor = 4.0 * lib.spanFactor;
    dc.panOffset = new exports.GEOM2D.Point(-0.002455,0.002);
    dc.panOffset = new exports.GEOM2D.Point(0.0035,0.002);
  //dc.panOffset = new geom.Point(0,0);

    lib.vp0.zoomCallbacks.push(function (z) {lib.zSlider.positionSliderFromZoom(z);});


   
  }
  
  
  
  lib.initialize = function (imD0,imD1) {
    lib.setParams(imD0,imD1);
    var href = document.location.href;
  
    
    lib.genDivs();
    lib.genViewports();
    
    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.placeDivs();
    });
    lib.placeDivs();
      lib.vp0.refresh();
      lib.vp1.refresh();

  }
  
  
  
  
  
  
})();


