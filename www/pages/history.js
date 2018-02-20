

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/
/* the history of editing of an  album */


(function () {
  
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
 var common = idv.common;
  var util  = idv.util;
  
  lib.minLeftWd = 300;
  
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
  
  lib.imHeight = 100;
  lib.titleHt = 50;
  lib.imPaddingY = 30;
  lib.imPaddingX = 20;
  lib.minImWd = 70;
  lib.maxImWd = 300;
  lib.imEls = [];
  lib.imDivs = [];
  lib.cntEls = [];
  
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
    right.css({"display":"inline-block","font-weight":"bold","width":rightWd+"px","vertical-align":"top"});
    right.html("Albums");
  }
  
  //lib.addElement = function ()
  lib.addPic = function (table,im,leftWd,rightWd,pubWd) {
     var tp = im.topic;
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
    albums = lib.albumsByImage[tp];
    
    
    if (albums) {
      var aln = albums.length;
      for (var i=0;i<aln;i++) {
        var alb = albums[i];
        var cp = alb.caption;
        if (!cp) cp = "untitled";
        pub = null;
        if (alb.published) {
          //imRow.append(pub);
          pub = $('<span>published version</span>');
          pub.css({"text-decoration":"underline","cursor":"pointer","float":"right"});
          var pubURL = util.publishedUrl(alb.topic);
          pub.click(function () {location.href=pubURL});
        }
        var csp = $('<div/>');
        csp . css({"padding-left":"10px","padding-right":"10px"});
        url = "/topic"+(alb.topic)+"/index.html?unpublished=1";
        var icsp = $('<span/>').css({"text-decoration":"underline","cursor":"pointer"}).html(cp);
        (function (iurl) { // close over this var
         icsp.click(function () {location.href=iurl});
        })(url);
        csp.html((i+1)+".");
        csp.append(icsp);
        right.append(csp);
        if (pub){
          csp.append(pub);
        }
      }
    } else {
      right.html("No albums yet")
    }
    var newAlbumButton;
    (function (itp) { //close over itp
      newAlbumButton = addButton(right,"Create New Album",function () {
        lib.popCreateAlbumLightbox(itp);},
      true);})(tp);
    newAlbumButton.css({"font-size":"9pt"});
    newAlbumButton.css({"margin-top":"10px"});
 
    var tps = tp.split("/");
    var imo = tps[2];
    var imname = tps[3];
    var imdim = im.dimensions;
    var arti = (imdim.x)/(imdim.y);
    var ht = lib.imHeight;
    var wd = Math.max(Math.ceil(ht * arti),lib.minImWd);
    if (wd > lib.maxImWd) { // scale the pic down if it's too wide
      var sc = lib.maxImWd/wd;
      ht = ht * sc;
      wd = lib.maxImWd;
    }
    
    /*
    var imRow = $('<tr/>');
    //var imdivht = lib.imHeight+lib.titleHt+20;
    //imdiv.css({"position":"absolute","border-radius":"5px","height":imdivht+"px","width":wd+"px","background-color":"#333333","border":"solid thin white"});
    table.append(imRow);
    imRow.css({"border":"2px solid black"});
    var imCol = $('<td/>');
    imRow.append(imCol);
    var ttlDiv = $('<div/>');
    ttlDiv.html(ttl);
    imCol.append(ttlDiv);
    */
    
    //var odiv = $('<div/>');
    //odiv.html("owner "+imo);
    //imdiv.append(odiv);
    //var imsrc = util.s3imDir(imo,imname) + "resized/height_100.jpg";
    var imsrc = util.s3imDir(imo,imname) + "resized/area_50000.jpg";
    var imlink = "/topic/image/"+imo+"/"+imname+"/index.html";
    var imel = $('<img src="'+imsrc+'"/>');
    left.append(imel);
    var tolink = function () {
      var lnk = imlink;
      location.href = lnk;
    }
    imel.click(tolink);
    imel.attr("width",wd);
    imel.attr("height",ht);
    imel.css({"cursor":"pointer"});
    ttldiv.click(tolink);
    ttldiv.css({"cursor":"pointer"});
    if (im.s3Storage) {
      var bs = util.bytesstring(im.s3Storage);
      var sdiv = $('<div/>');
      left.append(sdiv);
      sdiv.html("Storage: "+bs);
    }
    // imel.css({"position":"absolute"});
    //albumsCol = $('<td>TEST</td>');
    
    //imRow.append(albumsCol);
    //var acnt = im.albumCount
    /*
     var cntel = $('<div style="position:absolute"/>');
    if (acnt == 1) {
      cntel.html("1 album");
    } else if (acnt ==0) {
      cntel.html("no albums");
    } else {
      cntel.html(acnt + " albums");
    }
    cntel.css({"width":wd+"px"});
    imdiv.append(cntel);
    */
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
    // @todo get the missing ims
    
    var importButton = $('<div id="import"><span class="clickableElement">Import an Image</span> </div>');
    pdiv.append(importButton);
    importButton.click(function(){location.href="/upload";});
     var ln = lib.images.length;
    if (ln == 0) {
      var noteDiv = $("<div> You may import images from your computer or the web, or create albums "+
                  "from other people's images (see the </div>");
      var refDiv = $("<a href='/gallery'>gallery</a>");
      refDiv.css({"color":"black","text-decoration":"underline"});
      noteDiv.append(refDiv);
      
      noteDiv.append($('<span> page) </span>'));

      pdiv.append(noteDiv);
      noteDiv.css({"margin-top":30,"margin-left":30});
      return;
    }
    //var imtable = $('<table border="0"/>');
    //imtable.css({"border":"1px thin black","border-spacing":"0px","border-collapse":"separate"});
    //lib.addHead(pdiv,20);
    //pdiv.append(imtable);
    lib.addHead(pdiv,leftWd,rightWd);
    for (var i=0;i<ln;i++) {
      var cim = lib.images[i];
      lib.addPic(pdiv,cim,leftWd,rightWd,pubWd);
    }
    lib.picsAdded = true;
  }
  
  lib.initialize = function(options) {
    idv.util.commonInit();
    var album = options.album;
    var jsonUrl = '/api/albumHistory'
    data = {album:album}
    idv.util.post(jsonUrl,data,function (rs) {
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
      lib.thePics = [];
      lib.addPics();
      //pdiv.append('<div><i>* album is published</i></div>')
    
    });
      
  }
  
  
})();


