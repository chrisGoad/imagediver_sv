


// common  code for the snap and album pages

(function () {
  

  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  //var com = idv.common;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"};



    
  
  
  
  lib.setSelectedSnapCallbacks.push(function () {
    return;
  //if (lib.selectedSnap) {
  //    lib.zoomToSnap.show();
  //  } else {
  //    lib.zoomToSnap.hide();
  //  }
  
  });
  
  
  lib.stdSnapAdvice = function () {
    if (idv.pageKind != "album") return "";
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
   var otherButtons = $('<span></span>');
   otherButtons.css({left:lib.zSlider.totalWidth+20,top:15,position:"absolute"});
   cnt.append(otherButtons);

   var viewAll = $('<span class="clickableElement">view all</span>');
   viewAll.css({"margin-right":"10px"});
   //viewAll.css({left:lib.zSlider.totalWidth+0,top:10,position:"absolute"});
   otherButtons.append(viewAll);
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
   if (idv.pageKind != "album") {
    showSnaps.hide();
   }
   //showSnaps.css({left:lib.zSlider.totalWidth+70,top:10,position:"absolute"});
   //cnt.append(showSnaps);
   otherButtons.append(showSnaps);
   showSnaps.click(function () {
      if (lib.showSnapsMode) {
        lib.exitShowSnapsMode();
      } else {
        lib.enterShowSnapsMode();
      }});
  
   

   var snapAdvice = $('<span></span>');
   snapAdvice.html(lib.stdSnapAdvice());
   //snapAdvice.css({left:lib.zSlider.totalWidth+170,top:15,position:"absolute"})
   snapAdvice.css({left:lib.zSlider.totalWidth,top:45,position:"absolute"})
   // snapAdvice.css({"font-style":"italic",left:10,top:45,position:"absolute"})
    lib.snapAdvice = snapAdvice;
   cnt.append(snapAdvice);
    var gap = $('<div class="gap"></div>');
    container.append(gap);
 
  }
  
  
  lib.embedText = function (wd) {
    return ""; //  @cgNote needs update for snap page.
  }
 
  //lib.tweetButtonText = ''; 
  lib.renderButtons = function (container) {
    var testingEmbed = 0; //@rremove
    var cnt = container;
    var elements = {};
    var loggedInUser = idv.loggedInUser;
    var canAddSnap = false;
    if ((idv.pageKind == "album") && lib.editPermissions()) {
      canAddSnap = true;
      var createSnapActivator = $('<span class="clickableElement">new snap</span>');
      pn = lib.setPanelActivator("createSnap",createSnapActivator);
      pn.scalable = false;
      pn.height = null;
      //var editAlbumActivator = $('<span class="clickableElement">edit album properties</span>');
     //pn = lib.setPanelActivator("editAlbum",editAlbumActivator);
      pn.scalable = false;
      pn.height = null;
     
   }
    var selectedSnapActivator = $('<span class="clickableElement">1 by 1</span>');
    lib.selectedSnapActivator= selectedSnapActivator;
    pn =lib.setPanelActivator("selectedSnap",selectedSnapActivator);
    pn.selfScaling = true;
    lib.setPanelNominalHeight("selectedSnap",400);

    if (idv.pageKind == "album") {
      var snapArrayActivator = $('<span class="clickableElement">all snaps</span>');
      lib.snapArrayButton = snapArrayActivator;
      snapArrayActivator.click(function () {
        lib.computeSnapVisibility();
        //snapArrayActivator.html("all visible snaps");
      }); // not in initializer, because snap arrays are activated from clicking multiple snaps in viewport. 
      pn = lib.setPanelActivator("snapArray",snapArrayActivator);
      pn.selfScaling = true;
    }
   
    
    if (1) {
      if (idv.pageKind == "album") {
        cnt.append(snapArrayActivator);      
        cnt.append(selectedSnapActivator);
        if (loggedInUser) {
          cnt.append(createSnapActivator);
          //cnt.append(editAlbumActivator);
        }
      }
      
      if (idv.embed) return;
      if (idv.pageKind == "album") {
        var tumblrButton =  $('<span style="vertical-align:top" class="clickableElement">&#x25BA;tumblr</span>');
        lib.tumblrButton = tumblrButton;
        cnt.append(tumblrButton);
        tumblrButton.click(function () {
          var ssn = lib.selectedSnap;
          var url = "http://"+idv.apiHost+"/post_to_tumblr";
          
          if (ssn) {
            var sd = ssn.snapD;          
            var data =  util.setProperties(null,sd,["caption","cropid","description","topic"]);
          } else {
            var data =  util.setProperties(null,lib.albumD,["caption","description","topic"]);
            if (lib.imD.description) data.imageDescription = lib.imD.description;
          }
          data.linkToSnap = 1;
          if (lib.imD.title) data.imageTitle = lib.imD.title;
          if (lib.imD.author) data.imageAuthor = lib.imD.author;
          if (lib.imD.year) data.imageYear = lib.imD.year;
          var dataj = JSON.stringify(data);
          sessionStorage.signingInWithTumblr = "";  
          sessionStorage.post_to_tumblr_args = dataj; // this is retrieved if the user needs to enable tumblr
          var url = "http://"+idv.apiHost+"/post_to_tumblr";
          var inp;
          var frm = $('<form enctype = "text/plain" action="'+url+'" method="POST">').append(
          inp = $('<input type="hidden" name="data"/>'));
          inp.attr("value",dataj);
          frm.submit();
          return;
           // location.href = url;
  
          });
      }
      var linkButton = $('<span style="vertical-align:top" class="clickableElement">links</span>');
      cnt.append(linkButton); //@note put back in for link        
      if (lib.imOnly) linkButton.hide();
      lib.linkButton = linkButton;
    

 
      var linkstart = "http://s3.imagediver.org/";
      function addLine(caption,link,includeClose) {
        var lnk = $('<input type="text" onclick="this.focus();this.select()"/>');
        var line =  $('<div><span id="caption"></span></div>').append(lnk);
        $('#caption',line).html(caption).css({"margin-right":"10px"})
        lnk.css({width:"80%","font-size":"8pt"});
        lnk.attr("value",link);
         line.css({"margin-right":"10px","margin-left":"10px","margin-top":"10px"})
        lnk.css({width:"75%","font-size":"8pt"});
        lnk.attr("value",link);

        lib.linkDiv.append(line);
        
 
      }
      
      function addLinkLine(caption,link) {
        var lnk = $('<a href = "'+link+'" target="idvPage">'+link+'</a>');
        var line =  $('<div><span id="caption"></span></div>').append(lnk);
        lib.linkDiv.append(line);
        $('#caption',line).html(caption);
        line.css({"margin-right":"10px","margin-left":"10px","margin-top":"10px"})
        lnk.css({width:"75%","font-size":"8pt"});
        lnk.attr("value",link);
      }
      
      function addLines() {
        //linkDiv.append(lib.closeLinks = $(idv.common.smallCloseX));
        //lib.closeLinks.click(lib.hideLinks);
        lib.linkDiv.css({"margin-left":"20px","margin-right":"20px"});

        var linkstart = "http://s3.imagediver.org"+idv.topicDir;
        var imageJson = linkstart+lib.imD.topic+"/main.json";
        var imagestart = "http://static.imagediver.org/images/";

        var snapD = page.selectedSnap?page.selectedSnap.snapD:undefined;
       
        if (idv.pageKind == "album") {
          
          var pageUrl = linkstart+lib.albumD.topic+"/index.html";
          var pageJson = linkstart+lib.albumD.topic+"/main.json";
          addLine("Album page:",pageUrl);
          var albumJson = linkstart+lib.albumD.topic+"/main.json";

        }
        var itpo = new util.topicOb(page.imD.topic);
        //var imtps = page.imD.topic.split("/");
        var imu = itpo.imageOwner;
        var imt = itpo.imageName;
        if (snapD) {
         var snapNum = snapD.topicId;
          var cropNum = snapD.cropid;
          var snapPageUrl = linkstart+snapD.topic+'/index.html';
          var snapJson = linkstart+snapD.topic+"/main.json";
          if (idv.pageKind == "snap") {
            addLine("This page:",snapPageUrl);
          } else {
            var snapInAlbum = pageUrl + "#"+snapNum;
            addLine("Snap in album:",snapInAlbum);
            addLine("Snap only:",snapPageUrl);
            addLinkLine("",snapPageUrl);
        
          }
          var snapImage = imagestart+imu+"/"+imt+"/snap/"+cropNum+".jpg"

        }
      
        var embedCaption ;
        var embedTextarea = $('<textarea rows="6" wrap="on"  readonly="readonly" onclick="this.focus();this.select()"></textarea>');
        embedTextarea.css({width:"95%","margin-left":"10px","font-size":"8pt"});
        var lnm = (idv.pageKind == "album")?"album":"snap";
        lib.linkDiv.append(embedCaption = $('<div>Paste this into your web page to link to this '+lnm+'</div>').css({"margin-top":"10px"}));
        lib.linkDiv.append(embedTextarea);

        if (snapD) {
          embedCaption.css({"margin-right":"10px","margin-left":"10px","margin-top":"10px","font-size":"10pt"})
          var eUrl =  (idv.pageKind == "album")?snapInAlbum:snapPageUrl;
          var emtxt = '<a href="'+eUrl+'"><img src="'+snapImage+'"/></a>';
        } else {
          var fullImage = imagestart+imu+"/"+imt+"/resized/area_250000.jpg";
          var emtxt = '<a href="'+pageUrl+'"><img src="'+fullImage+'"/></a>';

        }
        embedTextarea.html(emtxt);

        lib.linkDiv.append('<hr/>');

        lib.linkDiv.append($('<span>Images:</span>'));
        var fullImage = imagestart+imu+"/"+imt+"/resized/area_250000.jpg";
        addLine("Full image:",fullImage);
        var smallerImage = imagestart+imu+"/"+imt+"/resized/area_50000.jpg";
        addLine($("<span>smaller:</span>").css({'margin-left':'10px'}),smallerImage);
        addLine($("<span>larger:</span>").css({'margin-left':'10px'}),imagestart+imu+"/"+imt+"/resized/area_1000000.jpg");
        if (snapD) {
          addLine("Snap image:",snapImage);
          addLine($("<span>smaller:</span>").css({'margin-left':'20px'}),imagestart+imu+"/"+imt+"/snapthumb/"+cropNum+".jpg");
        }
        lib.linkDiv.append('<hr/>');

        lib.linkDiv.append($('<span>JSON:</span>'));
        
        var qm= $('<span>?</span>').css({"margin-left":"10px","color":"blue","font-size":"8pt","cursor":"pointer"});
        lib.linkDiv.append(qm);
        lib.linkDiv.append(explain = $('<div/>'));
        explain.css({"border":"solid thin black","width":"90%","font-size":"8pt","padding":"5px"});
        util.addClose(explain);
        explain.append($('<div>The <a href="http://json.org">JSON</a> files convey complete information about images, albums, and snaps '+
                     'in machine readable form.   The form of the data should be should be self-explanatory to those familiar with JSON, except for one detail. '+
                     ' The encoding of the area covered by  a snap looks like this: </div>').css({"margin-right":"30px","margin-bottom":"20px"}));
                       
        explain.append(
                      '<table id="jsonTable">'+
                             '<tr><td>{"coverage": </td><td>{"corner": {"x": 0.25, "y": 0.5},</td></tr>'+
                              '<tr><td></td><td>"extent": {"x": 0.01, "y": 0.02}}</td></tr>' +
                      '</table>');
        explain.append($('<div>The x and y values are normalized to the width of the image. So, in this example, if the image is 1000 pixels wide,'+
                      'the upper left corner of the snap is at pixel coordinates (250,500), its width is 10 pixels, and its height is 20 pixels.</div>').css({"margin-top":"10px"}));
        
        //explain.css({""})
        qm.click(function () {explain.show()});
        explain.hide();
        

        addLine("For image:",imageJson);
        addLinkLine("",imageJson);
        
        if (idv.pageKind == "album") {
          addLine("For album",albumJson);
          addLinkLine("",albumJson);
        }
        if (snapD) {
          addLine("For snap",snapJson);
          addLinkLine("",snapJson);
        }
          
 
      }
    }
  
    lib.updateLinks = function () {
      if (linkDiv.css("display")!="none") {
        linkDiv.empty();
        addLines();
      }
    }


    if (linkButton) linkButton.click(function () {         
        lib.lightbox.pop();
        lib.lightbox.element.empty();
        lib.lightbox.addClose();
        lib.linkDiv = $('<div/>').css({"margin-bottom":"10px"});
        lib.lightbox.element.append(lib.linkDiv);
        addLines();
    });
    if (!canAddSnap  && !(lib.imOnly && !idv.loggedInUser)) {
      var annotateButton = $('<span style="vertical-align:top" class="clickableElement">annotate</span>');
      cnt.append(annotateButton); //@note put back in for link
      util.addToolTip(annotateButton,"Perform your own annotation of this image");
      annotateButton.click(function (){
        if (idv.loggedInUser) {
          lib.popAlbumChoice(lib.imD);
        } else {
          lib.lightbox.popMessage("You need to  <a href='"+"http://"+idv.apiHost+"/login'>sign in</a> to add your own annotations to this image. "+
                                  "You can sign in with your Tumblr or Twitter account, and in any case registration is quick and free.");
        }
      });
    }
    lib.updateButtonVis();
    
  }
   
 
  
  
  
  lib.setParams = function(imD) {
    lib.aspectRatio = 1; // aspect ratio of the viewport
    var imTopic = imD.topic
    var imTopicS = imTopic.split("/");
    lib.imOwner = imTopicS[2];
    lib.imName = imTopicS[3];
    // the snap params are all scaled by page.scale before use
    lib.snapThumbMinWidth=250; // for selected snap
    lib.snapArrayMinThumbWidth = 180; // for the array of snaps
    lib.prevNextWidth = 100; // amount of width allocated to each of the prev and next thumbs
    lib.snapThumbMargin = 20;
    lib.snapThumbHeight=150;
    lib.snapThumbBottomMargin = 40;
    lib.snapThumbCaptionHeight=90;
    lib.snapGapX = 10;
    lib.snapGapY = 10;
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
    if (lib.vp) {
      lib.vp.scale = lib.theLayout.scale;
    }
    if (lib.vp) lib.vp.refresh(true);
  }
  
  lib.genFullTitle = function  () {
    if (lib.badUrl) {
      return "Error";
    }
    if (document.location.pathname == "/") {
      var fullTitle = "the depths of high-resolution images, annotated";
    } else {
      var author = lib.imD.author;
      if (author) {
        author = ", "+author;
      } else {
        author = "";
      }
      var imt = lib.imD.title;
      if (!imt) imt = util.pathLast(lib.imD.topic);
      var caption = lib.albumD?lib.albumD.caption:"";
      if (caption) {
        caption = ": "+$.trim(caption);
      } else {
        caption = "";
      }
      fullTitle = imt + author +  caption;
    }
    return fullTitle;
  }
  
  
  lib.updateTopbarOptions = function (options) {
    
    var title = lib.genFullTitle();
    options.title = util.sanitize(title);
     var dp = [];
   
  }

 
    
 
  lib.homeTitle = "ImageDiver allows you to annotate images in a zoomable context. To see what the results of annotation look like, try " +
  ' clicking on a few of the thumbs on the left below,  over the outlined areas on the right,  and otherwise poking around. (The image is "The Ambassadors" by '+
  " Hans Holbein the Younger, 1533.) Images can be uploaded from your computer, or grabbed " +
  " from the web. You can sign in with your Tumblr or Twitter account, and in any case registration is quick and free. ";
  
  
  lib.genDivs = function () {
    var b = $('body');
    fullTitle = lib.genFullTitle();
    fullsize = false;
    var pqs = util.parseQS();
    var embed = idv.embed;
    if (idv.homePage) {
      var title = lib.homeTitle;
    } else { 
      var title = lib.genFullTitle();
    }
     var topbarOptions = {title:util.sanitize(title),embed:embed,detailsLink:{text:"image details",action:lib.popImageDetails},includeGallery:1};
    var outerDiv = $('.outerDiv');
    if (outerDiv.length == 0) {
      outerDiv = $("<div class='outerDiv'/>");
      b.append(outerDiv);
    }
    lib.outerDiv = outerDiv;
    lib.topbar =   idv.topbar.genTopbar(outerDiv,topbarOptions); 
    var colsDiv = $("<div class='columns'/>")
    outerDiv.append(colsDiv);
  
    var c0Div = $("<div class='leftColumnDiv'/>");
    lib.c0Div = c0Div;
    colsDiv.append(c0Div);
    var c1Div = $("<div class='columnDiv'/>");
    lib.c1Div = c1Div;
    colsDiv.append(c1Div);

    //if (lib.thisIsHomePage) {
   
    
    if (lib.badUrl) {
       lib.theLayout = new lib.LayoutZero({
        outerDiv:lib.outerDiv,
        centerDiv:lib.cDiv,
        margin:50,
        minScale:0.6,
        aspectRatio:1, //has no effect in this case
        maxScale:1

      });
      return;
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
    lib.panels = {};  // indexed by panel names; values have form {activator:,panel: }
    lib.panelDiv = $('<div class="panel_container" />'); // lower panel container
    if (!idv.loggedInUser) {
      lib.panelDiv.mousedown(function (e) { // was click
        e.preventDefault();
       });
    }
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
    var twoC = 1;
    lib.panelDiv.css("overflow","auto");
    c0Div.append(lib.panelDiv);
    lib.buttonsDiv = $('<div class="controls"/>');
    c0Div.append(lib.buttonsDiv);
    lib.renderButtons(lib.buttonsDiv);
    lib.updateButtonVis();
    if (idv.embed) {
      var margin = 10;
    } else {
      margin = 20;
    }
    //outerDiv.append(lib.bottomDiv);
    var aheight = idv.embed?110:(idv.homePage?200:140);
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
      minScale:(idv.pageKind=="albums")?0.45:0.33, // was .33
      additionalHeight:aheight, //was 200
      includeLightbox:(!idv.embed)
    });
  
    lib.originalAdditionalHeight = lib.theLayout.additionalHeight;

    lib.theLayout.placeDivs();
    lib.topbar.lightbox = lib.theLayout.lightbox;
    lib.lightbox = lib.theLayout.lightbox;

  //  lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",container:lib.vpDiv,extent:vpRect.extent,zIndex:100,backgroundColor:"#000000"});
  // lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",container:lib.vpDiv,extent:vpRect.extent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
 
    var vpExtent = lib.theLayout.vpExtent;
    lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",extent:vpExtent,container:lib.vpDiv,zIndex:-1,backgroundColor:"#000000"});
   lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
   if (!idv.useFlash) {
      lib.selCanvas = imlib.genCanvas({whichCanvas:"sel",extent:vpExtent,container:lib.vpDiv,zIndex:300,backgroundColor:"transparent"}); // overlay canvas
      lib.hiliCanvas = imlib.genCanvas({whichCanvas:"hili",extent:vpExtent,container:lib.vpDiv,zIndex:400,backgroundColor:"transparent"}); // overlay canvas
   }

    //lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:1,backgroundColor:"green"}); // overlay canvas


    

   
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
   // b.append(lib.bottomDiv);
   // lib.bottomSdiv.element=lib.bottomDiv;
   
    lib.addSnapArrayDiv(lib.panelDiv);
   
    lib.addSelectedSnapDiv(lib.panelDiv);
    if (idv.pageKind == "album") lib.addCreateSnapDiv(lib.panelDiv);
   
    
    lib.theLayout.placeDivs();
    lib.theLayout.afterPlacement = function () {
    if (lib.vp) {
        var layout = lib.theLayout;
        lib.vp.scale = layout.scale;
        var vpCss = layout.vpCss;
       lib.vpCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y});
    
        if (lib.ovCanvas) lib.ovCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        if (lib.selCanvas) lib.selCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        if (lib.hiliCanvas) lib.hiliCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        lib.vp.refresh(true);
      }
    }
  }
 
 
  lib.genViewports = function () {   
    lib.tiling.createTiles();
    var vpExtent = lib.theLayout.vpExtent;

    var vp = new imlib.Viewport(lib.vpDiv,lib.vpCanvas,lib.tiling,vpExtent,[lib.ovCanvas,lib.selCanvas,lib.hiliCanvas]);
    lib.vp = vp;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    lib.vp.panControl = new imlib.PanControl(lib.vpDiv,vp);
    lib.renderZoomControl(lib.zoomDiv);

  } 
  
  
  
  lib.displayError = function (msg) {
    $('document').ready(function () {
      if (lib.loadingDiv) lib.loadingDiv.hide();
      lib.aspectRatio = 1;
      lib.badUrl = 1;
      lib.genDivs();
      lib.placeDivs();
      lib.resizeCurrentPanel();
      var err = $('<div/>').html(msg);
     err.css({"font-size":"14pt","margin-top":"40px","text-align":"center","margin-left":"auto","margin-right":"auto"});
    $('.columns').empty();
     $(".columns").append(err);
      return;
    });
  }
  
  
})();
 
