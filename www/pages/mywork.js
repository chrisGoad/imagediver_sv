

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/


(function () {
  
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;

  var common = idv.common;
  var util  = idv.util;
  
  lib.minLeftWd = 300;
  /*
  function addButton(cn,txt,cb,inDiv) {
    var bt =  $('<span class="clickableElement"></span>');
    bt.html(txt);
     if (inDiv) {
      var cnt = $('<div/>');
      cn.append(cnt);
      var rs = cnt;
    } else {
      cnt = cn;
      rs = bt;
    }
     cnt.append(bt);
    bt.click(cb);
    return rs;
    
  }
  */
  
  lib.imHeight = 100;
  lib.titleHt = 50;
  lib.imPaddingY = 30;
  lib.imPaddingX = 20;
  lib.minImWd = 70;
  lib.maxImWd = 300;
  lib.imEls = [];
  lib.imDivs = [];
  lib.cntEls = [];
  
  
  
  lib.closeX  = '<div class="closeX" style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:10pt;color:white;float:right">X</div>';
  
  
  lib.addClose = function (el) {
    var thisHere = this;
    var close = $(lib.closeX);
    //$('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>');
    close.click(function () {el.hide();});
    //this.close.click(function () {thisHere.element.empty();thisHere.dismiss();thisHere.afterClose();});
    el.append(close);
  }
  
  lib.addHead = function (table,leftWd,rightWd) {
    var imRow = $('<div/>');
    imRow.css({"margin":"20px","margin-top":"50px"});
    table.append(imRow);
    var left = $('<div/>');
    left.css({"display":"inline-block","font-weight":"bold","width":leftWd+"px"});
    //left.html("LEFT");
    imRow.append(left);
    left.html("Image");
    var right = $('<div/>');
    imRow.append(right);
    //right.css({"display":"inline-block","font-weight":"bold","width":rightWd+"px","vertical-align":"top"});
    right.css({"display":"inline-block","width":rightWd+"px","vertical-align":"top"});
    var explain,qm;
    if (1 || lib.hasActiveAlbum) {
      right.append($('<span>Albums</span>').css({"display":"inline-block","font-weight":"bold","width":rightWd+"px","vertical-align":"top"}).append(
        qm= $('<span>?</span>').css({"margin-left":"10px","color":"blue","font-size":"8pt","cursor":"pointer"})));
        right.append(explain = $('<div/>'));
                     //An album is a collection of annotated snapshots from an image. Each image may have '+
                     //'several albums, but always has at least one, called "Main"</div>'));
        explain.css({"border":"solid thin black","width":"300px","font-size":"8pt","padding":"5px"});
        lib.addClose(explain);
        explain.append($('<span>An album is a collection of annotated snapshots from an image. Each image may have '+
                     'several albums. When an image is first added, an album is automatically created for it.</span>'));
        //explain.css({""})
        qm.click(function () {explain.show()});
        explain.hide();
    }
  }
  
  
  lib.deleteAlbum = function (topic) {
    var data = {topic:topic};   
    var url = "/api/deleteAlbum";
    util.post(url,data,function (rs) {
        if (rs.status != "ok") {
          util.logout();
          location.href = "/timeout";
          return;
        }
        location.href = "/mywork";
        //location.href = "/topic"+imtp+"/index.html";
       },"json");
    util.log("api","uuuuu");
  }
  
  lib.deleteImage = function (topic) {
     var data = {topic:topic};
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
  /*
  lib.newSnapsAlbum = function (im) {
    // the newAlbum call returns the existing snaps album if it exists, and ow creates one
    var url = "/api/newAlbum";
    var data = {image:im.topic,caption:".snaps."};
    util.post(url,data,function (rs) {
      var aurl = "/topic"+rs.value+"/index.html"
      location.href = aurl;
    });
  }
  */
 
  
  lib.addPic = function (table,im,leftWd,rightWd,pubWd) {
    var tp = im.topic;
    var albums = lib.albumsByImage[tp];
    var aln = 0;
    if (albums) {
      aln = albums.length;
    }
    var snapCount = 0;
    var sna = im.snapsAlbum;
    if (sna) {
      snapCount = sna.snapCount;
    }
   //if (aln == 0) return; // should be an obsolete case, with Main album always being there

    var ttl = im.title;
    if (!ttl) {
      ttl = im.name;
    }
    var imRow = $('<div/>');
    imRow.css({"border-top":"solid thin black","margin":"20px"});
    table.append(imRow);
    var left = $('<div/>');
    left.css({"display":"inline-block","width":leftWd+"px"});
    //left.html("LEFT");
    imRow.append(left);
    var right = $('<div/>');
    imRow.append(right);
    
    right.css({"display":"inline-block","width":rightWd+"px","vertical-align":"top"});
    
    var ttldiv = $('<div/>');
    ttldiv.html(ttl);
    left.append(ttldiv);
  
  
    if (!im.atS3) {
      right.html("Now importing ...");
      return;
    }
    /*
    var snapsDiv = $('<div/>');
    snapsDiv.css({"text-decoration":"underline","cursor":"pointer","padding-left":"5px"});
    if (snapCount == 0) {
      var stxt = "No snaps";
    } else if (snapCount == 1) {
      stxt = "One snap";
    } else {
      stxt = snapCount + " snaps";
    }
    snapsDiv.html(stxt);
    function installToSnapsClick(el,itp) {// close over tp
      el.click(function () {
        var tpo = new util.topicOb(itp);
        var sna = tpo.snapsAlbum();
        var dstu = "http://"+idv.apiHost+idv.topicDir+sna+ "/index.html"
        location.href = dstu;
      });
    }
    */
    //installToSnapsClick(snapsDiv,tp);
    //snapsDiv.click(function () {
    //  var sna = util.snapsAlbum(im);
    //  util.toTopicPage(sna);
    //});
    //right.append(snapsDiv);
   
    if (aln > 0) {
      for (var i=0;i<aln;i++) {
        var alb = albums[i];
        var cp = alb.caption;
        //if (cp == ".snaps.") continue;
        if (!cp) cp = "untitled";
        var csp = $('<div/>');
        csp . css({"padding-left":"10px","padding-right":"10px"});
        url = idv.topicDir+(alb.topic)+"/index.html?unpublished=1";
        var icsp = $('<span/>').css({"text-decoration":"underline","cursor":"pointer"}).html(cp);
        (function (iurl) { // close over this var
         icsp.click(function () {location.href=iurl});
        })(url);
        csp.html((i+1)+".");
        csp.append(icsp);
       var dl;
        csp.append(dl = $('<span>delete</span>'));
        dl.css({"margin-left":"10px","font-size":"8pt","text-decoration":"underline","cursor":"pointer"});
        (function (atp) {
          dl.click(function () {
              util.myConfirm("Delete Album","Are you sure you wish to delete this album, and all of its snaps?",
                 function () {lib.deleteAlbum(atp);},
                 function () {util.closeDialog()});  //snapAdvice.hide();
          });
        })(alb.topic);
        right.append(csp);
      }
    } else {
      right.html("No albums")
    }
    var newAlbumButton,moreAlbumsButton;
   
    (function (itp) { //close over itp
     /* if (aln < 2) {
         newAlbumButton = addButton(right,"Start Annotating",function () {
            lib.
      } else {
     */
  
      util.addButton(right,"Create New Album",function () {
        lib.createAlbumJsonP(itp, function (atp) {
           var dst = idv.topicDir+atp+"/index.html?new=1";
           location.href = dst;
        });
      },true).css({"font-size":"9pt","margin-top":"10px"});
      })(tp);
    //newAlbumButton.css({"font-size":"9pt","margin-top":"10px"});
    var tpo = new util.topicOb(tp);
    var tps = tp.split("/");
    var imo = tpo.imageOwner;//tps[2];
    var imname = tpo.imageName;//tps[3];
    var imdim = im.dimensions;
    var arti = (imdim.x)/(imdim.y);
    var ht = lib.imHeight;
    var wd = Math.max(Math.ceil(ht * arti),lib.minImWd);
    if (wd > lib.maxImWd) { // scale the pic down if it's too wide
      var sc = lib.maxImWd/wd;
      ht = ht * sc;
      wd = lib.maxImWd;
    }
    // http://dev.imagediver.org/topic/album/d73b6a9/moghulartists/-/index.html
    
    var imsrc = util.s3imDir(imo,imname) + "resized/area_50000.jpg";
    //var imlink = "/topic/image/"+imo+"/"+imname+"/index.html";
    var imel = $('<img src="'+imsrc+'"/>');
    left.append(imel);
    imel.css({"cursor":"pointer"});
   
    //installToSnapsClick(imel,tp);
    //imel.click(tolink);
    imel.attr("width",wd);
    imel.attr("height",ht);
    //imel.css({"cursor":"pointer"});
    //ttldiv.click(tolink);
    //ttldiv.css({"cursor":"pointer"});
    if (im.s3Storage) {
      var bs = util.bytesstring(im.s3Storage);
      var sdiv = $('<div/>');
      left.append(sdiv);
      sdiv.html("Storage: "+bs);
    }
    (function (iim,aln,tpo,albums) { //close over im,aln
      if (!iim.shared) {
        var imdel = $('<div>delete image</div>');
        left.append(imdel);
        imdel.css({"margin-left":"10px","font-size":"8pt","text-decoration":"underline","cursor":"pointer"});
  
        imdel.click(function () {
                  util.myConfirm("Delete Image","Are you sure you wish to delete this image, and all of its albums?",
                     function () {lib.deleteImage(iim.topic);},
                     function () {util.closeDialog()});})  //snapAdvice.hide();
      }
      imel.click(function () {
        // for debugging
        var liim = iim;var ltpo = tpo;var laln = aln;var lalbums;
        if (aln == 0) {
          var dst = idv.topicDir + "/album/"+tpo.imageOwner + "/" + tpo.imageName + "/-/index.html";
          location.href = dst;
        } else if (aln == 1) {
          var altp = albums[0].topic;
          var dst = idv.topicDir + altp + "/index.html";
          location.href = dst;

        } else {
        lib.popAlbumChoice(iim);
        }
      });
    })(im,aln,tpo,albums);
    
    //lib.imDivs.push(imdiv);
    lib.imEls.push(imel);
 //   lib.cntEls.push(cntel);
  }
  
  lib.imagesByTopic  = {};
  lib.albumsByImage  = {};
  
  lib.maxImageWd = function () {
    var rs = 0;
    util.arrayMap(lib.images,function (im) {
      var imdim = im.dimensions;
      var arti = (imdim.x)/(imdim.y);
      var ht = lib.imHeight;
      var wd = Math.max(Math.ceil(ht * arti),lib.minImWd);
      if (wd > rs) rs = wd;
    });
    return Math.min(lib.maxImWd,rs);
  }
  
  lib.organizeData = function () {
    var ims = lib.images;
    ims.sort(function (im0,im1) { return (im0.current_item_create_time)<(im1.current_item_create_time)?1:-1});
    var albums = lib.albums;
    
    util.arrayMap(ims,function (im) {
      var tp = im.topic;
      lib.imagesByTopic[tp] = im;
    });
    var abyim = lib.albumsByImage;
    lib.hasActiveAlbum = 0;
    util.arrayMap(albums,function (album) {
      var imtp = album.image;
      if (album.caption == ".snaps.") {
        var im = lib.imagesByTopic[imtp];
        im.snapsAlbum = album;
      }
      var aby = abyim[imtp];
      if (aby == undefined) {
        aby = [album];
        abyim[imtp] = aby;
      } else {
        aby.push(album);
      }
    });
    for (var ab in abyim) {
      var albums = abyim[ab]
      albums.sort(function (a0,a1) { return a0<a1?1:-1});
      if (albums.length >1) {
        lib.hasMultiAlbums = 1;
      }
      //util.arrayForEach(albums,function (a) {if (a.notNew) lib.hasActiveAlbum = 1;});
      
    }
    
  }

  lib.addPics = function () {
    // some images are owned by others, and mentioned in albums
    imDiv = $('<div/>');
    $('.infoDiv').append(imDiv);
    var pdiv = imDiv;
    var ims = lib.images;
    var albums = lib.albums;
    var leftWd = Math.max(lib.minLeftWd,lib.maxImageWd() + 10);
    var twd = $('.infoDiv').width();
    var rightWd = twd - leftWd - 40;
    var pubWd = 150;
    /*
    util.arrayMap(ims,function (im) {
      var tp = im.topic;
      lib.imagesByTopic[tp] = im;
    });
    var abyim = lib.albumsByImage;
    util.arrayMap(albums,function (album) {
      var imtp = album.image;
      var aby = abyim[imtp];
      if (aby == undefined) {
        aby = [album];
        abyim[imtp] = aby;
      } else {
        aby.push(album);
      }
    });
    */
    // @todo get the missing ims
    
       var ln = lib.images.length;
    if (ln == 0) {
       var noteDiv = $("<div>To get started, we suggest that you do some practice annotation on an existing image. " +
                         " Click on the image (Holbein's The Ambassadors) below to give it a whirl:</div>"+
                         " <div id='imageDiv'><div id='annotate_me'>Annotate Me</div><div><img id='theimage' width='200' src='http://static.imagediver.org/images/4294b0e/the_ambassadors/resized/area_50000.jpg'/></div></div> " +
                         "<div> It's safe to practice. Annotations can always be edited or deleted.</div> " +
                         "<div>Alternatively, you can annotate any of these <a href='/images'>images</a> just by clicking on them. Or, go ahead and "+
                         " <a href='/upload'>import</a> your own image from your computer or from the web.</div>");
      //   var refDiv = $("<a href='/gallery'>gallery</a>");
      //refDiv.css({"color":"black","text-decoration":"underline"});
      //noteDiv.append(refDiv);
      //noteDiv.append($('<span> page) </span>'));

      pdiv.append(noteDiv);
      noteDiv.css({"margin-top":30,"margin-left":30});
      function annotate() {
        location.href = idv.topicDir+'/album/4294b0e/the_ambassadors/-/index.html'
        
      }
      $('#annotate_me').css({'text-decoration':'underline','cursor':'pointer','width':'200px','text-align':'center',"color":util.linkColor}).click(annotate);
      $('#theimage').css({'cursor':'pointer'}).click(annotate);
      $('#imageDiv').css({"padding-left":"250px","padding-right":"250px"});
      //$('#import').css({'text-decoration':'underline','cursor':'pointer',"color":util.linkColor}).click(function )
      
      return;
    }
    //var imtable = $('<table border="0"/>');
    //imtable.css({"border":"1px thin black","border-spacing":"0px","border-collapse":"separate"});
    //lib.addHead(pdiv,20);
    //pdiv.append(imtable);
    /*
      var importButton = $('<div id="import"><span class="clickableElement">Import an Image</span> </div>');
    pdiv.append(importButton);
    importButton.click(function(){location.href="/upload";});
    */
    lib.addHead(pdiv,leftWd,rightWd);
    for (var i=0;i<ln;i++) {
      var cim = lib.images[i];
      lib.addPic(pdiv,cim,leftWd,rightWd,pubWd);
    }
    lib.picsAdded = true;
  }
  
  lib.initialize = function() {
    idv.util.commonInit();
    idv.topbar.genTopbar(undefined,{title:"Content"});

    //util.addDialogDiv($('body'));

    var jsonUrl = '/api/albumsAndImages'
    idv.util.get(jsonUrl,function (rs) {
      if (rs.status != "ok") {
        location.href = "/timeout";
        return;
      }
      var top = 50;
      var lbwd = 600;
      var lft = winCenter = 0.5 * lbwd;
      var wht = $(window).height();
      var lbht = 200; 
      var lightboxRect = new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));
 
      var lb = new common.Lightbox($('body'),lightboxRect);
      lb.render();
      lib.lightbox = lb;
  
      var pdiv = $('.infoDiv');
      //var tdiv = $('<div><center><b>My images and albums</center></b></div>');
      //tdiv.css({"margin-top":"20px","margin-bottom":"60px"});
      //pdiv.append(tdiv);
      
      lib.images = rs.value.images;
      lib.albums = rs.value.albums;
      lib.organizeData();
      lib.thePics = [];
      lib.addPics();
      //pdiv.append('<div><i>* album is published</i></div>')
    
    });
      
  }
  
  
})();


