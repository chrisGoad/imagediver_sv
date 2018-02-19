

// panorama page generation



(function () {
  

  var lib = page;

  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  //var com = idv.common;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"}
  idv.pageKind = "album";



lib.facebookLikeButton = function (topic,width,height) {
  // for now
  //page = "/like_button_test";
  //return ''; // @undo
  var url = "http://s3.imagediver.org/topic"+topic+"/index.html";
  var qs = "href="+encodeURI(url)+"&send=false&layout=button_count&width="+width+"&height="+height+
           "&action=like&colorscheme=light&appId=252341458175463"
  var rs = '<iframe src="//www.facebook.com/plugins/like.php?'+qs+
          '" scrolling="no" frameborder="0" style="padding-left:15px;display:inline-block;border:none;overflow:hidden;width:'+width+'px;height:'+height+'px"'+
          ' allowTransparency="true"></iframe>';
  return rs;
}

  /*
  lib.setSelectedSnap = function (snap) {
    lib.nowSelectedSnap = snap;
    if (snap) {
      lib.zoomToSnap.show();
    } else {
      lib.zoomToSnap.hide();
      var dv = lib.vpSelectDiv;
      dv.hide();
    }
    if (lib.showSnapsMode) lib.showOverlaysForSnaps(lib.snapDs);

  }
  */
  
  lib.setSelectedSnapCallbacks.push(function () {
    return;
    if (lib.selectedSnap) {
      lib.zoomToSnap.show();
    } else {
      lib.zoomToSnap.hide();
    }
  });
  
  
  lib.stdSnapAdvice = function () {
    if (lib.showSnapsMode) {
      return "click within outline for detail, doubleclick to zoom there";
    } else {
      if (lib.selectedSnap) {// && (lib.currentPanel.name=="selectedSnap")) {
        return "double click to zoom to the selected snap";
      } else {
        return "";
      }
    }
  }
 
  
  lib.renderZoomControl = function (container) {
    var cnt = container;

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
   viewAll.css({left:lib.zSlider.totalWidth+0,top:10,position:"absolute"});
   cnt.append(viewAll);
   viewAll.click(function () {
    // view all also normalizes the snap grid if the snap array panel is up;
    if (lib.vp.zoom == 1) {
      lib.computeSnapVisibility();
    } else {
      lib.vp.setZoom(1);
    }
    if (lib.currentPanel.name=="snapArray") {
      //lib.setSnapsMessage();
      lib.selectClickable(lib.snapArrayButton);
    }
   });
   var showSnaps = $('<span class="clickableElement">show outlines</span>');
   showSnaps.css("font-size","9pt");
   lib.showSnapsButton = showSnaps;
   showSnaps.css({left:lib.zSlider.totalWidth+70,top:10,position:"absolute"});
   cnt.append(showSnaps);
   showSnaps.click(function () {
      if (lib.showSnapsMode) {
        lib.exitShowSnapsMode();
      } else {
        lib.enterShowSnapsMode();
      }});
    var zoomToSnap = $('<span class="clickableElement">zoom to snap</span>');
    zoomToSnap.css({"font-size":"9pt",left:lib.zSlider.totalWidth+70+100,top:10,position:"absolute"});
    lib.zoomToSnap = zoomToSnap;
    zoomToSnap.hide();
    cnt.append(zoomToSnap);
    zoomToSnap.click(function () {
      lib.vp.setZoom(1);
      lib.animatedZoomToSnap(lib.selectedSnap.snapD,1.1);
    });
     //lib.postMessageToParent("hohoho"); just a test

   // var snapAdvice = $('<span><i>click within outline for detail</i></span>');
   var snapAdvice = $('<div></div>');
   snapAdvice.html(lib.stdSnapAdvice());
   //snapAdvice.css({left:lib.zSlider.totalWidth+170,top:15,position:"absolute"})
   //snapAdvice.css({left:lib.zSlider.totalWidth,top:45,position:"absolute"})
     snapAdvice.css({"font-style":"italic",left:10,top:45,position:"absolute"})
    lib.snapAdvice = snapAdvice;
   cnt.append(snapAdvice);
   //snapAdvice.hide();
   /*
   if (page.fullsizeOption) {
    var toImage = $('<span class="clickableElement">fullsize image</span>');
    toImage.css({left:lib.zSlider.totalWidth+10+viewAll.width()+30,top:10,position:"absolute"});
    toImage.click(function () {
      document.location.href = "/topic"+lib.imD.topic;
    })
  
    cnt.append(toImage);
   }
   */
    var gap = $('<div class="gap"></div>');
    container.append(gap);
 
  }
  
  
  lib.embedText = function () {
    var topic = lib.albumD.topic;
    var url = "http://s3.imagediver.org/topic"+topic+"/index.html?embed=true";
    var rs = '<iframe src="'+url+'" width="700" height="450"></iframe>';
    var ers = util.htmlEscape(rs);
    return ers;
  }
  
  lib.tweetButtonText = '<a href="https://twitter.com/share" class="twitter-share-button" data-via="imagediver">Tweet</a>'+
'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
  
  //lib.tweetButtonText = ''; 
  lib.renderButtons = function (container,floatRight) {
    var cnt = container;
    var elements = {};
    /* now aboutiness is in the top bar 
    var aboutImageActivator = $('<span  class="clickableElement">about</span>');
    //if (floatRight) aboutImageActivator.css("float","right");
    var pn = lib.setPanelActivator("aboutImage",aboutImageActivator);
    pn.scalable = false;
    pn.height = null;
    var albumsActivator = $('<span class="clickableElement">OTHER ALBUMS</span>');

    lib.setPanelPanel("albums",lib.albumDiv);
    lib.setPanelActivator("albums",albumsActivator);
    */
    if (!lib.custom) {
      if (loggedInUser) {
        var createSnapActivator = $('<span class="clickableElement">new snap</span>');
        pn = lib.setPanelActivator("createSnap",createSnapActivator);
        pn.scalable = false;
        pn.height = null;
      }
      var selectedSnapActivator = $('<span class="clickableElement">1 by 1</span>');
      pn =lib.setPanelActivator("selectedSnap",selectedSnapActivator);
      pn.selfScaling = true;
      lib.setPanelNominalHeight("selectedSnap",400);
  
  
      var snapArrayActivator = $('<span class="clickableElement">all snaps</span>');
      lib.snapArrayButton = snapArrayActivator;
      snapArrayActivator.click(function () {
        lib.computeSnapVisibility();
        //snapArrayActivator.html("all visible snaps");
      }); // not in initializer, because snap arrays are activated from clicking multiple snaps in viewport. 
      pn = lib.setPanelActivator("snapArray",snapArrayActivator);
      pn.selfScaling = true;
    }
    if (floatRight) {
      /* aboutImageActivator.css("float","right");
      cnt.append(aboutImageActivator);
      if (loggedInUser || lib.albumDs.length > 1) { 
        albumsActivator.css("float","right");
        cnt.append(albumsActivator);
      }
      */
      if (!lib.custom) {
        if (loggedInUser) {
          createSnapActivator.css("float","right");
          cnt.append(createSnapActivator);
        }
        selectedSnapActivator.css("float","right");
        cnt.append(selectedSnapActivator);
        snapArrayActivator.css("float","right");
        cnt.append(snapArrayActivator);
      }
    } else {
      if (!lib.custom) {
        cnt.append(snapArrayActivator);      
        cnt.append(selectedSnapActivator);
        if (loggedInUser) {
          cnt.append(createSnapActivator);
        }
      }
      if (idv.embed) return;
      var shareButton = $('<span class="clickableElement">share</span>');
      lib.shareButton = shareButton;
      cnt.append(shareButton);
      var albumDs = lib.albumDs;
      var otherAlbumsButton = undefined;
      if (albumDs.length>1) {
        var otherAlbumsButton = $('<span class="clickableElement">other albums</span>');
        cnt.append(otherAlbumsButton);
        var otherDiv = $('<div style="padding-left:5pt;height:20pt" class = "shareDiv"></div>')
        cnt.append(otherDiv);
        idv.util.arrayForEach(albumDs,function (ald) {
          if (ald.topic == lib.albumD.topic) return;
          var asp = $('<span style="cursor:pointer;text-decoration:underline;padding:5pt"> '+ald.caption+' </span>');
          asp.click(function () {location.href = "/topic"+(ald.topic)+"/index.html"})
          otherDiv.append(asp);
        });
        otherDiv.hide();
        otherAlbumsButton.click(function () {
          if (otherDiv.css("display")=="none") {
            otherAlbumsButton.html("hide others");
            otherDiv.show();
            shareButton.hide();
          } else {
           otherAlbumsButton.html("other albums");
           otherDiv.hide();
           shareButton.show();
          }
        })
      }
      var shareDiv = $('<div class = "shareDiv"></div>');
      cnt.append(shareDiv);
     
      //lib.snapsMessage = $('<div><i>Only snaps blah blah blah</i></div>');
      //cnt.append(lib.snapsMessage);
      //lib.snapsMessage.css({"margin-top":"10px","font-size":"9pt"});
      
   var fbl = $(lib.facebookLikeButton(lib.albumD.topic,120,30));
      shareDiv.append(fbl);
    var tweetButton = $(lib.tweetButtonText);
       shareDiv.append(tweetButton);
      shareDiv.hide();
      shareButton.click(function (){
        if (shareDiv.css("display")=="none") {
          shareButton.html("hide share");
          shareDiv.show();
          var tweetIframe = $(".twitter-share-button");
          tweetIframe.css({"position":"relative","top":"-8px"});
          if (otherAlbumsButton) {
            otherAlbumsButton.hide();
          }
  
        } else {
           shareButton.html("share");
           shareDiv.hide();
           embedDiv.hide();
           embedButton.html("embed");
           if (otherAlbumsButton) {
            otherAlbumsButton.show();
          }
        }
      });
      var embedButton = $('<span style="vertical-align:top" class="clickableElement">embed</span>');
      shareDiv.append(embedButton);
    var embedDiv = $('<div class="embedDiv"></div>');
    var embedTextarea = $('<textarea rows="5" cols="35" "  onclick="this.focus();this.select()"></textarea>');
    embedDiv.append("<p style='line-height:5px'>Adjust width and height to taste</p>")
    embedDiv.append(embedTextarea);
    var eht = 140;//embedDiv.height();
      embedButton.click(function () {
        if (embedDiv.css("display")=="none") {
          embedButton.html("hide embed");
          embedDiv.show();
          lib.theLayout.additionalHeight = lib.theLayout.additionalHeight+eht;
        } else {
           embedButton.html("embed");
           embedDiv.hide();
          lib.theLayout.additionalHeight = lib.theLayout.additionalHeight-eht;

        }
        lib.placeDivs();

      });
     
      embedTextarea.html(lib.embedText());
        shareDiv.append(embedDiv);
        embedDiv.hide();
       
    
      //if (loggedInUser || lib.albumDs.length > 1) { 
      //  cnt.append(albumsActivator);
      //}
      //cnt.append(aboutImageActivator);
    }


  }
    
  // A view
  
  lib.setParams = function(imD) {
    if (page.twoColumns) {
      lib.aspectRatio = 1; // aspect ratio of the viewport
    } else {
      lib.aspectRatio = 2;
    }
    var imTopic = imD.topic
    lib.imName = imTopic.split("/")[2]
    // the snap params are all scaled by page.scale before use
    lib.snapThumbMinWidth=250; // for selected snap
    lib.snapArrayMinThumbWidth = 100; // for the array of snaps
    lib.prevNextWidth = 100; // amount of width allocated to each of the prev and next thumbs
    lib.snapThumbMargin = 20;
    lib.snapThumbHeight=150;
    lib.snapThumbBottomMargin = 40;
    lib.snapThumbCaptionHeight=90;
    lib.snapGapX = 10;
    lib.snapGapY = 25;
    lib.snapHeight = 550; // for the selected snap // was 650
    lib.snapTop = 120; // was 20
    lib.thumbTop = 180;
    
    lib.zoomDelay = 50;
    lib.zoomIncrement = 1.05;
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;

    lib.imD = imD;
  
   // lib.depthBias = -1; // gone/computed applies for all images; determines when to go to higher res images. higher values=higher res
    lib.image = new imlib.Image(imD);
    lib.tiling = new imlib.Tiling(lib.image,256,1,imD.tilingDepthBump);
    lib.maxDepth = lib.tiling.depth;
    

  }
  
  
 
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new geom.Rect(corner,nex);
    return rs;
  }
    
    
  
  
  
  lib.defaultPanelHeight = function () {
    return lib.standardPanelHeight * lib.theLibrary.scale;
  }
  
  
  
  lib.placeDivs = function () {
    lib.theLayout.placeDivs();
    lib.vp.scale = lib.theLayout.scale;
    lib.vp.refresh(true);
  }
  

  
  lib.genDivs = function () {
    var b = $('body');
    if (lib.thisIsHomePage) {
      var fullTitle = "<i>the depths of high-resolution images, annotated</i>";
    } else {
      var author = lib.imD.author;
      if (author) {
        author = ", "+author;
      } else {
        author = "";
      }
      fullTitle = lib.imD.title + author + ":" + lib.albumD.caption;
    }
    var twoC = page.twoColumns;
    twoC = 1;
   
    var wpg = lib.albumD.wikipediaPage;
    var json = util.jsonUrl(lib.albumD.topic);
    /*
    if (idv.atS3) {
      var json = "/topic"+lib.albumD.topic+"/topic.json";
    } else {
      var json = "/api"+lib.albumD.topic;
    }
    */
    if (page.fullsizeOption) {
      var fullsize = "/topic"+lib.albumD.image+"/index.html";
    } else {
      fullsize = false;
    }
    var lbt = lib.albumD.description;
    var pqs = util.parseQS();
    var embed = idv.embed;
    var topbarOptions = {embed:embed,title:fullTitle,aboutTitle:"about album",aboutText:lbt,includeGallery:1,fullsize:fullsize,json:json};
    if (wpg) {
      topbarOptions.wikipediaPage = wpg;
    }
    if (twoC) {
      var outerDiv = $("<div class='outerDiv'/>");
      lib.topbar = imlib.genTopbar(outerDiv,topbarOptions);
      lib.outerDiv = outerDiv;
      b.append(outerDiv);
      var colsDiv = $("<div class='columns'/>")
      outerDiv.append(colsDiv);
     colsDiv.mousedown(function (e) {
        idv.util.slog("mouseDown");
        if (!idv.loggedInUser) e.preventDefault();// this prevent default prevents some bluing, but also prevents text entry
      });
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
      if (!idv.embed) lib.topDiv = imlib.genTopbar(c1Div,topbarOptions);
      

    }
    //if (lib.thisIsHomePage) {
    if (false) {
      lib.noteDiv = $('<div class="noteDiv"><p> See the <span id="galleryLink">gallery</span> for a few more images</p>'+
                      '<p style="line-height:10px;top:0px;width:100%;text-align:center">Astoria in 1923</p></div>');
      b.append(lib.noteDiv);
      $('#galleryLink').click(function () {location.href = "/gallery";});
      lib.noteSdiv.element = lib.noteDiv;
    }
    
    
    
    lib.vpDiv = $('<div class="viewport" id="viewport0" style="z-index:0"/>');
    c1Div.append(lib.vpDiv);
     // add a div to catch events
    var evDiv = $('<div id="evDiv"></div>');
    evDiv.css({"position":"absolute","background-color":"transparent"});
    lib.evDiv = evDiv;
    lib.vpDiv.append(evDiv);
    // captions over image when in showsnaps mode
    lib.vpCapDiv = $('<div class="vpCap" id="viewport0" style="position:absolute;background-color:black;border:solid thin white;padding:3px;font-size:8pt;z-index:1000">TEST</div>');
    lib.vpDiv.append(lib.vpCapDiv);
    lib.vpCapDiv.hide();
    lib.vpSelectDiv = $('<div class="vpSelect" id="vpSelect" style="margin:0px;padding:0px;position:absolute;background-color:transparent;font-size:8pt;z-index:2000;border:solid yellow;border-width:2px;"></div>');
    lib.vpDiv.append(lib.vpSelectDiv);
    lib.vpSelectDiv.hide();
    lib.zoomDiv = $('<div class="controls"/>');
    c1Div.append(lib.zoomDiv);
    if (!lib.custom) {
      lib.panels = {};  // indexed by panel names; values have form {activator:,panel: }
      lib.panelDiv = $('<div class="panel_container" />'); // lower panel container
      lib.panelDiv.click(function (e) {
       e.preventDefault();
      //util.slog("panel click");
      });
    }
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
  
    if (twoC) {
      if (!lib.custom) {
        lib.panelDiv.css("overflow","auto");
        c0Div.append(lib.panelDiv);
      }
      lib.buttonsDiv = $('<div class="controls"/>');
      c0Div.append(lib.buttonsDiv);
      lib.renderButtons(lib.buttonsDiv,false);
      if (idv.embed) {
        var margin = 10;
      } else {
        margin = 20;
      }
      //outerDiv.append(lib.bottomDiv);
      var aheight = idv.embed?110:130;
      lib.theLayout = new lib.LayoutTwo({
        outerDiv:lib.outerDiv,
        colsDiv:colsDiv,
        leftDiv:lib.c0Div,
        rightDiv:lib.c1Div,
        panelDiv:lib.panelDiv,
        vpDiv:lib.vpDiv,
        evDiv:lib.evDiv,
        margin:margin,
        aspectRatio:lib.aspectRatio,
        minScale:0.3, // was .4
        additionalHeight:aheight, //was 200
        includeLightbox:true
      });
    } else {
      c1Div.append(lib.panelDiv);
      lib.renderButtons(lib.zoomDiv,true);

      c1Div.append(lib.bottomDiv);
      lib.theLayout = new lib.LayoutOne({
        centerDiv:lib.c1Div,
        vpDiv:lib.vpDiv,
        margin:20,
        aspectRatio:lib.aspectRatio,
        minScale:0.6, 
        additionalHeight:165
      });
    }
    lib.theLayout.placeDivs();
    lib.topbar.lightbox = lib.theLayout.lightbox;

  //  lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",container:lib.vpDiv,extent:vpRect.extent,zIndex:100,backgroundColor:"#000000"});
  // lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",container:lib.vpDiv,extent:vpRect.extent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
 
    var vpExtent = lib.theLayout.vpExtent;
    lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",extent:vpExtent,container:lib.vpDiv,zIndex:-1,backgroundColor:"#000000"});
   lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
    //lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:1,backgroundColor:"green"}); // overlay canvas


    

   
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
   // b.append(lib.bottomDiv);
   // lib.bottomSdiv.element=lib.bottomDiv;
   
    if (!lib.custom) {    
      lib.addSnapArrayDiv(lib.panelDiv);
   
      lib.addSelectedSnapDiv(lib.panelDiv);
      lib.addCreateSnapDiv(lib.panelDiv);
    }
   // lib.addAlbumDiv(lib.panelDiv);
   // lib.addAboutImageDiv(lib.panelDiv);
    
    /*
    lib.theLayout.topDiv = lib.titleDiv;
    lib.theLayout.vpDiv = lib.vpDiv;
    //lib.theLayout.controlDiv = lib.controlDiv;
    lib.theLayout.zoom
    lib.theLayout.panelDiv = lib.panelDiv;
    lib.theLayout.bottomDiv = lib.bottomDiv;
    */
    
    lib.theLayout.placeDivs();
    lib.theLayout.afterPlacement = function () {
    if (lib.vp) {
        var layout = lib.theLayout;
        lib.vp.scale = layout.scale;
        var vpCss = layout.vpCss;
        //lib.setCss(lib.vp,vpCss);
       lib.vpCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y});
      /* /NEW 
      lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
      lib.vp.ovContext =  lib.ovCanvas[0].getContext('2d');
      lib.ovCanvas.viewport = lib.vp
      //var dovCanvas = ovCanvas[0];
      lib.vp.ovCanvas = lib.ovCanvas;
      //END NEW
      */
    
        if (lib.ovCanvas) lib.ovCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        //lib.setCss(lib.vpCanvas,vpCss);
        //lib.setCss(lib.ovCanvas,vpCss);
         lib.vp.refresh(true);
      }
    }
  }
  
  
    
  
  lib.genViewports = function () {   
    lib.tiling.createTiles();
    var vpExtent = lib.theLayout.vpExtent;

    var vp = new imlib.Viewport(lib.vpCanvas,lib.tiling,vpExtent,lib.ovCanvas);
    lib.vp = vp;
    //vp.changeViewCallbacks.push(lib.computeSnapVisibility);
    //vp.changeViewCallbacks.push(lib.setSnapsMessage);
    //vp.changeViewCallbacks.push(lib.drawSelectedSnaps);
 //   vp.depthBias = lib.depthBias;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    lib.vp.panControl = new imlib.PanControl(lib.vpDiv,vp);
    lib.renderZoomControl(lib.zoomDiv);

  }
  
  lib.test = function () {
    var ov = new imlib.Overlay("test",new geom.Rect(new geom.Point(12000,2000),new geom.Point(5000,1000)));
    lib.vp.addOverlay(ov);
  }
  
  lib.initialize = function (imD,albumD,albumDs,loggedInUser,callback) {
    lib.custom = false;    // custom left panel; html
    util.tlog("initialize");
    util.commonInit();
    lib.snapDs = snapDs;
    lib.snapDsByTopicNum = {};
    util.arrayForEach(snapDs,function (snapD) {
      var topicId = util.lastPathElement(snapD.topic);
      snapD.topicId = topicId; // a slight efficiency hack
      lib.snapDsByTopicNum[topicId] = snapD;
    });
    util.arrayForEach(snapDs,lib.fixSnapCoverage);
    /*
     
    $(window).unload(function () { // report back image loading stats
      var cnt = idv.imageLoadCount;
    
      var url = "/api/imageLoads";
      data = {"loadCount":cnt};
      util.post(url,data,function (rs) {
      });
    });
    */
    if (!albumD) {
       imlib.genTitleBar("No Such Album");
        return;
    }
    var imdim = imD.dimensions;
    var imx  = imdim.x;
    var imy = imdim.y;
    var imar = imx/imy;
    //page.twoColumns = imar < 1.9;
    page.twoColums = true;
    page.fullsizeOption = imar > 1.6;// a bit of a hack for garden of earthly delights
   

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
       lib.resizeCurrentPanel();
       //lib.positionSnaps();
    });
        util.tlog("pre add snaps");

    lib.addSnaps(0);
    util.tlog("after add snaps");
    lib.hookupPanelActivators();
    lib.selectPanel("snapArray");
 
    util.tlog("pre place divs");
    lib.placeDivs();
    util.tlog("after place divs");
    
    
    
    //lib.addSnaps();
   
    lib.resizeCurrentPanel();
  
    lib.loadingDiv.hide();
  //  lib.positionSnaps();
    if (callback) callback();
    lib.vp.refresh(true);
     
    setTimeout(function () {lib.addSnaps(500000);lib.enterShowSnapsMode();lib.checkNoSnaps()},100);
    
    
 util.tlog("initialize done");


  }
  
  /*
  
    lib.setSnapsMessage = function () {
      if (lib.vp.zoom > 1) {
        lib.snapArrayButton.html("all visible snaps");
      } else {
        lib.snapArrayButton.html("all snaps");
      }
    }
  */
    
/*
    
    lib.setSnapsMessage = function () {
      if ((lib.currentPanel.name == "snapArray") && (lib.vp.zoom > 1)) {
        lib.snapsMessage.show();
        var msg = "Above snaps are those visible in right window";
        lib.snapsMessage.html(msg);
      } else {
        lib.snapsMessage.hide();
      }
    }
*/

  lib.defaultPanelHeight = function () {
    return lib.theLayout.scale * lib.theLayout.panelCss.height;
  }
  //idv.util.activeConsoleTags = ["cg","layout"];
  //idv.util.activeConsoleTags = ["tiling"];"loaded","drawfail"];"limitPan"];"scale","imsrc","loaded"];
  
  
})();
  