
/*
 http://dev.imagediver.org/topic/image/cg/The_Ambassadors/index.html?image_only=1&album=/album/cg/The_Ambassadors/1
*/

(function () {
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;

  var com = idv.common;
  var util  = idv.util;
  page.wideLayout = false; // the wide layout is for wide images
  idv.pageKind == "image";

  
  lib.licenseText = {
    "PD-old":'<a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a> in the United States, and those countries with a copyright term of life of the author plus 100 years or less',
    "PD-author":'Released into the <a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a> by the author',
    "PD-self":'Released into the <a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a> by the author',
   "cc-by-sa-3.0":'Creative Commons Attribution-ShareAlike 3.0',
   "cc-by-3.0":'<a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0</a>'}
   
  
  lib.renderControls = function (container) {
    var cnt = container;
    var elements = {};
    var albums = lib.albumDs;
    var ln = albums.length;
    if ((ln > 0)||idv.loggedInUser) {
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
      lib.setPanelPanel("albums",lib.albumsDiv);
      //lib.setPanelActivator("albums",albumsActivator);
      
    } else {
      lib.someAlbums = false;
    }
  /*
   if (loggedInUser  && (lib.imD.owner==loggedInUser)) {
      var editImageActivator = $('<span style="float:right" class="clickableElement">Edit Image Properties</span>');
      editImageActivator.click(function () {
        lib.popEditImageLightbox();
      });
      cnt.append(editImageActivator);
   }
  */
   if (idv.loggedInUser) {
     var createAlbumActivator = $('<span style="float:right" class="clickableElement">Create New Album</span>');
      createAlbumActivator.click(function () {
        lib.popCreateAlbumLightbox();
      });
      cnt.append(createAlbumActivator);
      /*
      pn = lib.setPanelActivator("editImage",editImageActivator);
      pn.scalable = false;
      pn.height = null;
      cnt.append(editImageActivator);
      */
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
  
  
  /*imlib.clickCallback = function (ps,vps,dclick) {
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
  */

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
    if (true || aar > 1.5) {
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
  
  
  lib.computeAboutText = function () {
    var imD = lib.imD;
    var imd = ""
    if (imD.title) {
      imd += "{{{"+imD.title+"}}}"; // nowiki
    }
    if (imD.author) {
      imd += " by " + imD.author
    }
    imd += "\n\n"
    var ds = imD.description;
    if (ds) {
      imd += ds
    }
    return imd;
  }
  
  lib.updateTopbarOptions = function (options) {
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
    options.title = util.sanitize(title + author);
    /*
    options.aboutText = lib.computeAboutText();
    var dp = [];
    var wpg = imD.wikipediaPage;
    if (wpg) {
      dp.push({title:"wikipedia",url:wpg});
    }
    options.detailPages = dp;
   */
  }
  
   lib.imageDetailsWd  = 200;
   lib.imageDetailsDiv =
    $('<div class="imageDetailsDiv">' +
        '<div id="title"></div>' +
        '<div id="description"></div>' +
       '<table id="imageFields">' +
            '<tr id="authorRow"><td  class="rowTitle">Artist/Photographer:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="author"/></td></tr>' + 
            '<tr  id="yearRow"><td  class="rowTitle">Year:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="year"/></td></tr>' + 
            '<tr id="externalLinkRow" ><td class="rowTitle">External Link:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="externalLink"/></td></tr>' + 
            '<tr id="contributorRow" ><td class="rowTitle">Contributed by:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="contributor"/></td></tr>' +
            '<tr class="dimensionRow"><td class="rowTitle">Dimensions:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="dimensions"/></td></tr>' +
            '<tr class="publicRow"><td id="isPublic" class="rowTitle">Public</td></tr>' +
       '<tr id="licenseRow" ><td class="rowTitle">License:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="license"/></td></tr>' +
             '</table>'+
          '<div id="buttons"><span id="editButton" class="clickableElement">Edit Image Properties</span><span id="deleteButton" class="clickableElement">Delete the Image</span><span style="margin-left:20px" id="buttonMsg">Not deleteable (public, in use)</span></div>' +

        '</div>');
    
    
    
    
    
  lib.deleteTheImage = function () {
     var data = {topic:lib.imD.topic};
    var url = "/api/deleteImage";
    util.post(url,data,function (rs) {
        if (rs.status != "ok") {
          util.logout();
          location.href = "/timeout";
          return;
        }
        location.href = "/mywork"
       },"json");
    util.log("api","uuuuu");
  }
  
  lib.popImageDetails = function () {
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    function adjustLightBoxHeight() {
        var ht = lib.imageDetailsDiv.height();
        var lbh = lib.lightbox.element.height();
        lib.lightbox.element.css({"height":(ht + 40)+"px"});
    }
    
    lib.imageDeleteable = function () {
  // check for divergent ownership
      var aln = lib.allAlbumDs.length;
      if (aln == 0) return true;
      var imowner = lib.imD.owner;
      for (var i=0;i<aln;i++) {
        var calb = lib.allAlbumDs[i];
        if (calb.owner != imowner) {
         return false;
        }
      }
      return true;
    }
    
    
    lib.lightbox.element.append(lib.imageDetailsDiv);
    if ($.trim(lib.imD.description)) {
      var dst = $("#description",lib.imageDetailsDiv);
      dst.empty();
      dst.css({"word-wrap":"break-word"});
      util.creole.parse(dst[0],lib.imD.description);
    } else {
      $("#descriptionRow",lib.imageDetailsDiv).hide();
    }
    $("#title",lib.imageDetailsDiv).css({"font-weight":"bold","margin-left":"10px","margin-right":"10px","margin-top":"10px","text-align":"center"});
    $("#imageFields",lib.imageDetailsDiv).css({"margin-left":"10px","margin-right":"10px","margin-top":"10px"});
    $(".rowTitle",lib.imageDetailsDiv).css({"padding-left":"10px","padding-right":"20px"});
    $("tr",lib.imageDetailsDiv).css({"padding-top":"10px"});
    $("#buttons",lib.imageDetailsDiv).css({"margin":"30px"});

    //$("#titleTitle",lib.imageDetailsDiv).css({"margin-right":"10px"});
    var ttl = $.trim(lib.imD.title);
    if (!ttl) {
      ttl = "Untitled"
    }
   
    $("#titleRow",lib.imageDetailsDiv).show();
    $("#title",lib.imageDetailsDiv).html(util.sanitize(ttl));
    var ownm = lib.imD.ownerName;
    var cdiv = $("#contributor",lib.imageDetailsDiv);
    if (ownm) {
      cdiv.show()
      cdiv.html(util.sanitize(lib.imD.ownerName));
    } else {
      $('#contributorRow').hide();
    }
   /*
    Detail-Head-Saint Francis in Ecstasy - Bellini.jpg
    
    
    http://en.wikipedia.org/wiki/Wikipedia:Upload?wpDestFile=Detail_-_Head_-_Saint_Francis_in_Ecstasy_-_Bellini.jpg
   */
    
    if ($.trim(lib.imD.author)) {
      $("#authorRow",lib.imageDetailsDiv).show();
      //var dst = $("#author",lib.imageDetailsDiv)
      //util.creole.parse($("#author",lib.imageDetailsDiv)[0],lib.imD.author);
      $("#author",lib.imageDetailsDiv).html(util.sanitize(lib.imD.author));
    } else {
      $("#authorRow",lib.imageDetailsDiv).hide();
    }

    if ($.trim(lib.imD.year)) {
      $("#yearRow",lib.imageDetailsDiv).show();
      $("#year",lib.imageDetailsDiv).html(util.sanitize(lib.imD.year));
    } else {
      $("#yearRow",lib.imageDetailsDiv).hide();
    }

    var lnk = $.trim(lib.imD.externalLink);
    if (lnk) {
      $("#externalLinkRow",lib.imageDetailsDiv).show();
      var edv = $("#externalLink",lib.imageDetailsDiv);
      var a = $('<a>');
      var sanlnk = util.sanitize(lnk);
      a.attr("href",lnk);
      a.attr("target","imagediverTarget");
      edv.empty();
      edv.append(a);
      a.html(sanlnk);
    } else {
      $("#externalLinkRow",lib.imageDetailsDiv).hide();
    }
    
    var dim = lib.imD.dimensions;
    var dims = dim.x + " pixels wide by "+ dim.y+ " pixels high";
    $('#dimensions',lib.imageDetailsDiv).html(dims);
    if (lib.imD.isPublic) {
      var pubtxt = "Public";
    } else {
      pubtxt = "Private";
    }
    $('#isPublic',lib.imageDetailsDiv).html(pubtxt);
    var lic = lib.imD.license;
    if ((!lic) || (lic == "none")) {
      $('#licenseRow').hide();
    } else {
      $('#license').html(lib.licenseText[lic]);
    }
    
    if (idv.loggedInUser  && (lib.imD.owner==idv.loggedInUser)) {
      $("#buttons",lib.albumDetailsDiv).show();
      $("#editButton",lib.imageDetailsDiv).click(function () {lib.popEditImageLightbox();});
      if (lib.imageDeleteable()) {
        $("#buttonMsg").hide();

        $("#deleteButton",lib.imageDetailsDiv).click(function () {
          
          lib.lightbox.tempDismiss();
          var aln = lib.allAlbumDs.length;
          if (aln > 1) {
           
            var msg = "Are you sure you wish to delete this image, and all of its "+aln+" albums?"
          } else if (aln == 1) {
            var msg = "Are you sure you wish to delete this image, and its album?"
          } else {
            msg = "Are you sure you wish to delete this image?"
          }
          util.myConfirm("Delete Image",msg,
                     function () {lib.deleteTheImage();},
                     function () {util.closeDialog();lib.lightbox.bringBack();});  //snapAdvice.hide();
        });
      } else {
        $("#deleteButton").hide();
        $("#buttonMsg").show();
      }
     } else {
      
    
       $("#buttons",lib.albumDetailsDiv).hide();
    }

    //adjustLightBoxHeight() 
  
 }
  
  
  lib.genDivs = function () {
    var b = $('body');
    var imD = lib.imD;
   
    var topbarOptions = {embed:idv.embed,detailsLink:{text:"image details",action:lib.popImageDetails},includeGallery:1};
    lib.updateTopbarOptions(topbarOptions);
    
    
    var twoC = page.twoColumns;
    if (lib.image_only) twoC=false;
    //twoC = lib.aspectRatio < 1.8;
    //twoC = false;
    if (twoC) {
      var outerDiv = $("<div class='outerDiv'/>");
      if (!idv.embed) lib.topbar = idv.topbar.genTopbar(outerDiv,topbarOptions);

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
    lib.addAlbumsDiv(lib.panelDiv)
    if (idv.loggedInUser) {
      //lib.addAlbumsDiv(lib.panelDiv);
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
    if (!idv.useFlash) {
      lib.selCanvas = imlib.genCanvas({whichCanvas:"sel",extent:vpExtent,container:lib.vpDiv,zIndex:300,backgroundColor:                         "transparent"}); // overlay canvas
      lib.hiliCanvas = imlib.genCanvas({whichCanvas:"hili",extent:vpExtent,container:lib.vpDiv,zIndex:400,                                        backgroundColor:"transparent"}); // overlay canvas
   }

    

    
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
        if (lib.ovCanvas) lib.ovCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y});
        if (lib.selCanvas) lib.selCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y});
        if (lib.hiliCanvas) lib.hiliCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y});
       
        lib.vp.refresh();

      }
    }
  }
  
  
    
  
  lib.genViewports = function () {
    lib.tiling.createTiles();
    var vpExtent = lib.theLayout.vpExtent;
    var vp = new imlib.Viewport(lib.vpDiv,lib.vpCanvas,lib.tiling,vpExtent,[lib.ovCanvas,lib.selCanvas,lib.hiliCanvas]);
    lib.vp = vp;
//    vp.depthBias = lib.depthBias;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    
    
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    vp.depthBump = 1;
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
        //setTimeout(function () {util.slog("HEREEPO");lib.vp.setPan(new geom.Point(lib.cpan,0.1));},1000);
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
      lib.error("UNEXPECTED");
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
    util.addDialogDiv($('.columns'));
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
      lib.vp.refresh(true);

    });
    lib.placeDivs();
    lib.hookupPanelActivators();
    if (!lib.image_only) {
      if (lib.someAlbums) {
        lib.selectPanel("albums")
      }
      //else {
      //  lib.selectPanel("aboutImage");
      //}
    }
    lib.postMessageToParent("ready");
  }
   
  
  lib.initialize = function (options) { //imD,albumDs,loggedInUser) {
    //alert("imagge");
    //window.pageshow= function () {alert("pageshow");}
    //$("document").ready(function () { alert("ready");});
    idv.pageKind = "image";
    // cut down albums to those that either owned by the current user or public
    var albumDs = options.albums;
    var imD = options.imageD;
    var falbumDs = util.arrayFilter(albumDs,
                                    function (ad) {
                                      return ad.published;
                                    });
    lib.allAlbumDs = albumDs;
    albumDs = falbumDs;
    
    util.commonInit();
    var ownern = util.lastPathElement(imD.owner)
    lib.albumString = ownern+".0"; // for logging
    imlib.selectStrokeWidth = 20;
    var qs = util.parseQS();
    lib.image_only = qs["image_only"];
    lib.album = qs["album"];
    lib.imD = imD;
    //util.slog(lib.album);
    if (lib.image_only) {
      lib.addListener();
    }
    lib.setParams(imD);
    lib.albumDs = albumDs;
    var loggedInUser = options.loggedInUser;
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