

// panorama page generation



(function () {
  

  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;

  //var com = idv.common;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"}
  idv.pageKind = "album";
  lib.includeShare = false;
  lib.Markdown;


  
   lib.albumDetailsWd  = 200;
   
    
  
  
  lib.embedText = function (wd) {
    return ""; //  @cgNote needs update for snap page.
    var topic = lib.albumD.topic;
    var url = " http://s3.imagediver.org/widget.js?album=";
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
    return false;
    //return (idv.loggedInUser == lib.albumD.owner) && (!idv.atS3) && (!idv.embed);
  }
  //lib.tweetButtonText = ''; 
 
    
  
  lib.test = function () {
    var ov = new imlib.Overlay("test",new geom.Rect(new geom.Point(12000,2000),new geom.Point(5000,1000)));
    lib.vp.addOverlay(ov);
  }
  
   lib.setVis = function (el,v) {
    if (!el) return;
    if (v) el.show(); else el.hide();
  }
   lib.updateButtonVis = function () {
    lib.setVis(lib.linkButton,1);
    lib.setVis(lib.tumblrButton,0);
   
  }
  
  //lib.initialize = function (imD,albumD,albumDs,loggedInUser,callback) {
  lib.initialize = function () {
    lib.isSnap = 1;
    //var topic = "/snap/4294b0e/mabuse_adoration_of_kings/2/1";
    idv.util.commonInit();
    var lc = location.href;
    if (idv.topicDir == "/topicd") {
      var tpr = /topicd(\/[^\&\#]*)\/index.html/
    } else {
      var tpr = /topic(\/[^\&\#]*)\/index.html/;
    }
    var m = lc.match(tpr);
    if (!m) {
      lib.displayError("Bad Url")
      return;
      //lib.initialize2();
    }
    var topic = m[1];
    var tpo = new util.topicOb(topic)
    var url = idv.topicDir+topic+"/main.json";
    lib.loadingDiv = $('<div style="margin:40px"><center>LOADING...  <img src="/ajax-loader.gif"/></center></dir>');
    $('body').append(lib.loadingDiv);
    //var url = "/faq";hh
    $.ajax({
      url: url,
     //dataType: 'json',
      success: function (rs) {
    //  $.getJSON(url,function (rs) {
        if (rs.value) {
          lib.snapD =  lib.toSnapDObject(rs.value);
        } else {
          lib.snapD = lib.toSnapDObject(rs);
        }
        lib.imTopic = tpo.imageTopic();
        var imurl = idv.topicDir+lib.imTopic+"/main.json";
        $.getJSON(imurl,function (rs) {
          if (rs.value) {
            lib.imD = rs.value;
          } else {
            lib.imD = rs;
          }
          lib.imD.topic = lib.imTopic;
          $('document').ready(initialize2);
          return;
        });
        return;
      },
      error:function (jq,txt,er) {
        lib.displayError("No such snap");
        }
    });
    return;
  }
 
    
    
    
  function initialize2() {
    util.tlog("initialize");
    var imD = lib.imD;
    var imdim = imD.dimensions;
    var imx = imdim.x;
    var tps = lib.snapD.topic.split("/");
    var aid = tps[4];
    var owner = tps[2];
    
    idv.pageKind = "snap";
    var snapDs = lib.snapDs;
    lib.snapDsByTopicNum = {};
    lib.snapD.topicId = util.pathLast(lib.snapD.topic);
    var imdim = imD.dimensions;
    var imx  = imdim.x;
    lib.snapD.internalize(imx);
    var imy = imdim.y;
    var imar = imx/imy;
    //page.twoColumns = imar < 1.9;
    page.twoColums = true;
    // a bit of a hack for garden of earthly delights
    page.fullsizeOption = (imar > 1.6);
    lib.setParams(imD);
    //var albumTopic = albumD.topic;
    //var sp = albumTopic.split("/");
    //var spln = sp.length;
    //lib.albumId = sp[spln-1];
    
    
    lib.genDivs();
    lib.genViewports();

    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.placeDivs();
       lib.resizeCurrentPanel();
    });
        util.tlog("pre add snaps");
    var snapDs = [lib.snapD];
    lib.snapDs = snapDs;
    lib.addSnap(lib.snapD);
    //lib.addSnaps(snapDs,0);
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
    //if (location.hash.indexOf("msg=firstalbum") >= 0) {
    //  lib.lightboxMessage("Here is your new empty album of annotations for this image. ");
    //}
//    if (snapDs.length == 0) lib.selectPanel('createSnap');
    lib.enterShowSnapsMode();
    lib.showSelectedSnap(lib.snapD);
    $('#selectedSnapPrevLabel').hide();
    $('#selectedSnapNextLabel').hide();
    return;
    setTimeout(function () {lib.addSnaps(snapDs,500000);lib.enterShowSnapsMode();lib.checkNoSnaps();lib.showSnapByTopic()},100);
     util.tlog("initialize done");
  }
  lib.defaultPanelHeight = function () {
    return lib.theLayout.scale * lib.theLayout.panelCss.height;
  }
  
  lib.testUpdate = 3;
   
})();
  