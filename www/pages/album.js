



(function () {
  

  var lib = page;

  var geom = idv.geom;
  var image= idv.image;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"};
  idv.pageKind = "album";
  lib.includeShare = false;
  lib.Markdown;


  
   lib.albumDetailsWd  = 200;
   lib.albumDetailsDiv =
    $('<div class="albumDetailsDiv">' +
         '<div id="title"></div>' +
        '<div id="description" style="word-wrap:break-word"></div>' +
        
       '<table id="albumFields">' +
            '<tr  id="authorRow"><td  class="rowTitle">Image By:</td><td class="rowValue"><span style="width:'+lib.albumDetailsWd+'px" id="author"/></td></tr>' + 
            '<tr  id="yearRow" ><td class="rowTitle">Year:</td><td class="rowValue"><span style="width:'+lib.albumDetailsWd+'px" id="year"/></td></tr>' + 
            '<tr id="externalLinkRow"><td  class="rowTitle">External Link:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="externalLink"/></td></tr>' + 
            '<tr id="contributorRow"><td  class="rowTitle">Album created by:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="contributor"/></td></tr>' + 
          '</table>'+
          '<div id="jsonRow"><a target="_blank" id="json">JSON</a></div>'+
          '<div id="docs"><span id="albumsWhat">about albums</span><span id="jsonWhat">about JSON</span></div>' + 
          "<div id='aboutJSON'>"+   idv.common.closeX +
            "<p>The JSON link above resolves to a machine-readable encoding of the contents of this album, in the "+
            '<a target="_blank" href="http://json.org">JSON format</a>. The form of the data should be '+
            "should be self-explanatory to those familiar with JSON, except for one detail. The encoding of the area covered by  a snap looks like this: </p> "+
            '<table id="jsonTable"><tr><td>{"coverage": </td><td>{"corner": {"x": 0.25, "y": 0.5},</td><tr><tr><td></td><td>"extent": {"x": 0.01, "y": 0.02}}</td></tr></table></p> '+
            '<p>The x and y values are normalized to the '+
            'width of the image. So, in this example, if the image is 1000 pixels wide,  the upper left corner of the snap is at pixel coordinates (250,500), its width '+
            ' is 10 pixels, and its height is 20 pixels.</p>'+
          '</div>' + 
          "<div id='aboutAlbums'>"+   idv.common.closeX +
          "<p>Each image may have many albums associated with it, each with  a different set of snap shots, and a different author. There is "+
          "an ImageDiver page for each album (this is one such page).  Each image also has its own page, linked to from the top bar.</p>" +
          "</div>"+
          '<div id="buttons"><span id="editButton" class="clickableElement">Edit Album Properties</span><span id="deleteButton" class="clickableElement">Delete the Album</span></div>' +
          
        '</div>');
    
    
    
   lib.albumsHtml = function (dst,albums,thisAlbumTopic) {
      dst.empty();
      var ln = albums.length;
      //oae.append("HOOO");return;
      for (var i=0;i<ln;i++) {
        var ca = albums[i];
        if (ca.topic == thisAlbumTopic) continue;
        var cc = ca.caption;
        var uname = lib.pathLast(lib.pathLast(ca.owner));
        if (i < ln-1) comma = ","; else comma = "";
        var aline = $('<span class="albumLink"><span>'+cc+'</span> by '+uname+comma+' </span>');
        dst.append(aline);
        (function (tp) { // to capture tp in its own environment
          aline.click(function () {
            util.navigateToPage("/topic"+tp+"/index.html");
          });
        })(ca.topic);
      }
  }
  
  
  
  
 
  lib.embedText = function (wd) {
    var topic = lib.albumD.topic;
    var url = "http://s3.imagediver.org/widget.js?album=";
    // var rs = http://s3.imagediver.org/widget.js?album=4294b0e.astoria_1923.1&width=201
    if (wd >= 700) {
      var ht = Math.round(wd * 0.666);
      var url = "http://s3.imagediver.org/topic"+topic+"/index.html?embed=true";
      var rs = '<iframe src = "'+url+'" width="'+wd+'" height="'+ht+'"></iframe>';
    } else {
      var tps = topic.split("/");
      url += tps[2]+"."+tps[3]+"."+tps[4]+"&width="+wd;
      var rs = '<script type="text/javascript" src="'+url+'"></script>'
    }
    var ers = util.htmlEscape(rs);
    return ers;
  }
  
  
  lib.editPermissions = function () {
     return (!idv.atS3) && (idv.loggedInUser) && (lib.imOnly || (!lib.albumD) || (idv.loggedInUser == lib.albumD.owner));
  }
 
  
  lib.test = function () {
    var ov = new image.Overlay("test",new geom.Rect(new geom.Point(12000,2000),new geom.Point(5000,1000)));
    lib.vp.addOverlay(ov);
  }
  
  //depending on state, set the visibility of the links and post to tumblr buttons
  lib.setVis = function (el,v) {
    if (!el) return;
    if (v) el.show(); else el.hide();
  } 
  lib.updateButtonVis = function () {
      if (lib.displayingError) return;
      lib.setVis(lib.linkButton,lib.imOnly?0:1);
      lib.setVis(lib.tumblrButton,(idv.homePage || lib.imOnly || idv.atS3)?0:1);
      var lns = lib.snapDs.length;
      lib.setVis(lib.selectedSnapActivator,lns<2?0:1);
      lib.setVis(lib.snapArrayButton,lns<2?0:1);
      return;
      // now, always available
    if (idv.atS3) {
      lib.setVis(lib.linkButton,1);
      lib.setVis(lib.tumblrButton,1);
      return;
    } 
    if (lib.isSnaps) {
      if (lib.selectedSnap) {
        lib.setVis(lib.linkButton,1);
        lib.setVis(lib.tumblrButton,1);
        return;
      }
    }
    lib.setVis(lib.linkButton,0);
    lib.setVis(lib.tumblrButton,0);
   
  }
    
  
   

  //lib.initialize = function (imD,albumD,albumDs,loggedInUser,callback) {
  // two cases: if the album id is "-" this means the user as yet has no albums for this image, and one will
  // be created on demand. In this case we have lib.imOnly = 1
  
  lib.initialize = function () {
    
    idv.util.commonInit();
   
    var mt = document.location.hash.match(/snap=(\d*)/);
    if (mt) {
      lib.urlSnap = parseInt(mt[1]);
    }
    var lc = document.location.href;
    var isNew = 0;
    var sp = lc.split("#")
    var sp0 = sp[0]
    var spq = sp0.split("?")
    sp1 = spq[0]
    if (spq.length >1) {
      var qs = spq[1];
      if (qs.indexOf("new=1")>=0) {
        isNew = 1;
      }
    }
    lib.albumIsNew = isNew;
    idv.homePage = false;
    if (sp1.indexOf("/topic")<0) { // HOME PAGE
      idv.homePage = true;
      var topic = idv.homeTopic;
    } else {
      if (idv.topicDir == "/topicd") {
        var tpr = /topicd\/album\/([^\/]*)\/([^\/]*)\/([^\/]*)\//;
      } else {
        tpr = /topic\/album\/([^\/]*)\/([^\/]*)\/([^\/]*)\//;
      }
      
      var m = sp1.match(tpr);
      if (!m) {
        if (!m) {
          lib.displayError("Bad Url");
          return;
        }
        //lib.initialize2();
      }
      var topic = "/album/"+m[1]+"/"+m[2]+"/"+m[3];
    }
    tpo = new util.topicOb(topic);
   
    lib.imTopic = tpo.imageTopic();
    //lib.imTopic = "/image/"+m[1]+"/"+m[2];
    lib.topic  = topic;
    if ((!idv.atS3) && m && (m[3]=="-")) {
      lib.imOnly = true;
      lib.topic = lib.imTopic;
      topic = lib.topic;
    }
    //if (!idv.loggedInUser) idv.util.loggedInUserFromCookie();

     if ((!lib.imOnly) && (!idv.homePage) && (!idv.atS3) && (!idv.loggedInUser)) {
      var s3lnk = "http://s3.imagediver.org"+idv.topicDir+topic+"/index.html";
      lib.displayError('See the public version of this album at <a href="'+s3lnk+'">'+s3lnk+'</a>');
      return;
    }
    var url = idv.topicDir+topic+"/main.json";
    lib.loadingDiv = $('<div style="margin:40px"><center>LOADING...  <img src="/ajax-loader.gif"/></center></dir>');
    $('body').append(lib.loadingDiv);
    //var url = "/faq";hh
    $.ajax({
      url: url,
      dataType: 'json',
      success: function (rs) {
    //  $.getJSON(url,function (rs) {
        if (rs.status == "fail") { 
          lib.displayError("Missing or ill-formed URL");
          return;
        }
        if (lib.imOnly) {
          if (rs.value) lib.imD = rs.value; else lib.imD = rs;
          $('document').ready(initialize2);

        } else {
          lib.albumD = rs.value?rs.value:rs;
          lib.snaps = util.arrayMap(lib.albumD.snaps,lib.toSnapDObject);
          lib.albumD.snaps = lib.snaps;
          lib.beenPublished = lib.albumD.published;
          lib.albumD.image = lib.imTopic;
          var imurl = idv.topicDir+lib.imTopic+"/main.json";
          $.getJSON(imurl,function (rs) {
            if (rs.value) lib.imD = rs.value; else lib.imD = rs;
            lib.imD.topic = lib.imTopic;
            $('document').ready(initialize2);
            return;
          });
        return;
        }
      },
      error:function (jq,txt,er) {
        lib.displayError("Missing or ill-formed URL");
        }
    });
    return;
  }
 
 
  function initialize2() {
    //if (!idv.loggedInUser) idv.util.loggedInUserFromCookie();
    if (lib.imOnly) {
      var snaps = [];
      var snapDs = [];
      lib.isSnaps = false;
      lib.isSnaps = true;
    } else {
      var snaps = lib.snaps;
      lib.snaps = [];// gets filled by addSnaps (confusing code I know;clean this up some day)
      //lib.isSnaps = lib.albumD.caption == ".snaps.";
      // put the snaps in ordinal order. Ordinals start at 1, not 0
      var ln = snaps.length;
      var snapDs = Array(ln);
      for (var i=0;i<ln;i++) {
        var sn = snaps[i];
        var ord = sn.ordinal;
        snapDs[ord-1] = sn;
        
      }
      snapDs = util.arrayFilter(snapDs,function (v) {
        return v != undefined;
      });
      
      ln = snapDs.length;
      for (var i=0;i<ln;i++) {
        snp = snapDs[i];
        snp.myIndex = i;
      }
      
    }
    lib.snapDs = snapDs;

    $('document').ready(initialize3);
   }    
 
    
    
    
  function initialize3() {
    util.tlog("initialize");
    var albumD = lib.albumD;
    var imD = lib.imD;
    var imdim = imD.dimensions;
    var imx = imdim.x;
    var tps = lib.topic.split("/");
    if (!lib.imOnly) { 
      var aid = tps[4];
      lib.albumOwner = owner;
      lib.albumNum = aid;
      lib.albumId = aid;
      lib.albumString = owner+"."+aid; // for logging
    } else {
      var owner = tps[2];
    }
    util.commonInit();
    idv.pageKind = "album";
    var snapDs = lib.snapDs;
    lib.snapDsByTopicNum = {};
    util.arrayForEach(snapDs,function (snapD){return snapD.internalize(imx);});
    util.arrayForEach(snapDs,function (snapD) {
      var topicId = util.lastPathElement(snapD.topic);
      snapD.topicId = topicId; // a slight efficiency hack
      lib.snapDsByTopicNum[topicId] = snapD;
    });
    util.arrayForEach(snapDs,lib.fixSnapCoverage);
    if (!lib.imOnly && !albumD) {
       image.genTitleBar("No Such Album");
      return;
    };
    var imdim = imD.dimensions;
    var imx  = imdim.x;
    var imy = imdim.y;
    var imar = imx/imy;
    //page.twoColumns = imar < 1.9;
    page.twoColums = true;
    // a bit of a hack for garden of earthly delights
    page.fullsizeOption = (imar > 1.6);
    lib.setParams(imD);
   
    
    lib.genDivs();
    lib.genViewports();

    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.placeDivs();
       lib.resizeCurrentPanel();
    });
        util.tlog("pre add snaps");

    lib.addSnaps(snapDs,0);
    util.tlog("after add snaps");
    lib.hookupPanelActivators();
    lib.selectPanel("snapArray");
 
    util.tlog("pre place divs");
    lib.placeDivs();
    util.tlog("after place divs");
    lib.resizeCurrentPanel();
    lib.loadingDiv.hide();
    lib.vp.refresh(true);
    util.slog("REFRESH");
    util.addDialogDiv($('.columns'));
    // new image 
    if (lib.imOnly && (lib.imD.owner == idv.loggedInUser)  && (lib.imD.title == undefined) && (lib.imD.author == undefined)) {
          lib.popEditImageLightbox(true);
    }
    if (lib.albumIsNew  && !lib.imOnly) {
      lib.popEditAlbumLightbox();
    }
    setTimeout(function () {lib.addSnaps(snapDs,500000);lib.enterShowSnapsMode();lib.checkNoSnaps();lib.showSnapByTopic()},100);
     util.tlog("initialize done");
  }
  lib.defaultPanelHeight = function () {
    return lib.theLayout.scale * lib.theLayout.panelCss.height;
  }
  
  
  lib.testUpdate = 3;
   
})();
 