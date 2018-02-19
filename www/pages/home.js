

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/

var page = {};

(function () {
  
  
  var lib = page;
  var geom = exports.GEOM2D;
  var com = idv.common;
  var util  = idv.util;
  
  
  lib.toAlbum = function (im,aid) {
    var tp = im.topic;
    var tps = tp.split("/");
    var imname = tps[tps.length-1];
    return "/album/"+imname+"/"+aid;
  }
  
  lib.largeImDiv = function (container,imD,albums) {
    this.container = container;
    this.imD = imD;
    this.albums = albums;
  }
  
  lib.largeImDiv.prototype.render = function () {
    var imD = this.imD;
    var title = imD.title;
    var imUrl = imD.imUrl;
    var dim = geom.internalizePoint(imD.untiledDimensions);
    var wd = 500;
    var ht = Math.floor(500 * dim.y/dim.x);
    var imDiv = $('<div class="largeImDiv"/>');
    //var titleDiv = $('<div class="largeImTitle"/>');
    //imDiv.append(titleDiv);
    //titleDiv.html(title);
    var imEls = '<img class="largeIm" width="'+wd+'" height="'+ht+'" src="'+imUrl+'"/>';
    var imEl = $(imEls);
    imDiv.append(imEl);
    this.container.append(imDiv);
    imDiv.append("<p>Albums of snapshots from this image:</p>");
    var albums = this.albums
    var ln = albums.length;
    for (var i=0;i<ln;i++) {
      var album= albums[i];
      var adiv = $('<p class="homeAlbumLink">');
      adiv.html(album.caption);
      adiv.click(function () {location.href = "/topic"+album.topic;});
      imDiv.append(adiv);
    }      
      
  }
  
  
    lib.setParams = function(imD0,imD1) {
    var imTopic0 = imD0.topic
    lib.imName0 = imTopic0.split("/")[2]
    var imTopic1 = imD1.topic
    lib.imName1= imTopic1.split("/")[2]
    var margin = 20;
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
    
    lib.noteSdiv = new lib.scalableDiv({height:30,scalable:false});
    theDivStack.addDiv(lib.noteSdiv);
    
    
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
    lib.bottomDiv = new lib.scalableDiv({height:40,scalable:false,name:"bottom"});
    theDivStack.addDiv(lib.bottomDiv);
    lib.theDivStack.placeDivs();
    lib.imD0 = imD0;
    lib.imD1 = imD1;
    //imD0 is used to set viewport dimensions
    var imDimx0 = imD0.dimensions.x;
    var imDimy0 = imD0.dimensions.y;
    var imDim0 = new geom.Point(imDimx0,imDimy0);
    var imDimx1 = imD1.dimensions.x;
    var imDimy1 = imD1.dimensions.y;
    var imDim1 = new geom.Point(imDimx1,imDimy1);
   // lib.depthBias = 0; // applies for all images; determines when to go to higher res images. higher values=higher res
    lib.maxZoom = 16;
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;
   
    //yp = lib.controlRect.maxY();
    //lib.ssRect = new geom.Rect(new geom.Point(50,yp),new geom.Point(vpWidth,ssDivHt));
   // lib.lightboxRect = new geom.Rect(new geom.Point(50,lbTop),new geom.Point(lbWidth,lbHeight));

    lib.image0 = new imlib.Image(imDim0,imD0.imDir);
    lib.image1 = new imlib.Image(imDim1,imD1.imDir);
    lib.tiling0 = new imlib.Tiling(lib.image0,256,1,imD0.tilingDir,imD0.tilingUrl,imD0.tilingDepthBump);
    lib.tiling1 = new imlib.Tiling(lib.image1,256,1,imD1.tilingDir,imD1.tilingUrl,imD1.tilingDepthBump);
    lib.maxDepth = lib.tiling0.depth;
      
  }
  
  
  lib.initialize = function () {
    var b = $('body');
    var titleDiv = $('<div class="homeTitleDiv"/>');
    b.append(titleDiv);
    titleSdiv.element = titleDiv;
    var logo = $('<div class="homeLogo">imageDiver</div>');
    titleDiv.append(logo);
    var cnt = $('<div class="homeContainer"/>');
    b.append(cnt);
    var slogan  = $('<div class="slogan">explore the depths of high resolution images</div>');
    cnt.append(slogan);


    var imDiv0 = new lib.largeImDiv(cnt,lib.params.im0,[lib.params.im0a0,lib.params.im0a1]);
    imDiv0.render();


    var imDiv1 = new lib.largeImDiv(cnt,lib.params.im1,[lib.params.im1a0]);
    imDiv1.render();
    var imPair = $('<div class="homeImagePair">The above images yoked together for zooming and panning</div>');
    cnt.append(imPair);
    imPair.click(function () {location.href = "/topic/imagepair/astoria_1923_2010_1";});
                   
                 
  }
  
  
})();

idv.util.activeConsoleTags = ["api"];

