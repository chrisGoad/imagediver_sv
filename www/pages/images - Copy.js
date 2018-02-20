

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
  
  lib.whichGallery = "art";
  
  lib.genDivs = function () {
    var fullTitle = "<i>the depths of high resolution images, annotated</i>";
    var b = $('body');
  
    var topbarOptions = {title:fullTitle};
    var outerDiv = $("<div class='outerDiv'/>");
    lib.topDiv = imlib.genTopbar(outerDiv,topbarOptions);
    lib.outerDiv = outerDiv;
    b.append(outerDiv);
    //outerDiv.append(importButton);
    var cb = function (nm) {
      lib.whichGallery = nm;
      lib.renderContents();
    }
    lib.tabGroup = lib.genTab(outerDiv,cb,"Images: click on any image to annotate it");
    var cDiv = $("<div class='imagesDiv'/>");
    cDiv.css({"position":"relative","background-color":"black"});
    lib.cDiv = cDiv;
    outerDiv.append(cDiv);

    //lib.titleDiv = imlib.genTopbar(cDiv,{title:fullTitle,includeAbout:true,includeGallery:true});
    
    
  
  
    cDiv.append(lib.bottomDiv);
    lib.theLayout = new lib.LayoutZero({
      outerDiv:lib.outerDiv,
      centerDiv:lib.cDiv,
      margin:50,
      minScale:0.6,
      aspectRatio:1, //has no effect in this case
      maxScale:1,
       includeLightbox:1

    });
 
  }
  
  lib.cimTop = 0;
  lib.cimLeft = 0;
  lib.imDiv = undefined;
  lib.imHeight = 130;
  lib.maxImWd = 400;
  lib.titleHt = 60; // for the material above the image
  lib.imPaddingY = 50; // between rows
  lib.imPaddingX = 20;
  lib.minImWd = 220;
  lib.imEls = [];
  lib.imDivs = [];
  lib.cntEls = [];
  lib.maxTitleChars = 30;

  // @todo consolodate this with the  version in album.js
  
  lib.lightboxMessage = function (el) {
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    //msgdiv = $('<div/>');
    //msgdiv.css({'text-align':'center','margin-top':'30px'})
    //msgdiv.append(el)
    lib.lightbox.element.append(el);
   
  }
  
  lib.goToSnaps = function (im) {
    var url = "/api/newAlbum";
    var data = {"image":im.topic,"caption":".snaps."}
    util.post(url,data,function (rs) {
      var atp = rs.value;
      var aurl = "/topic"+atp+"/index.html";
      location.href=aurl;
      
    });
  }
  
  lib.popAlbumChoice = function (im) {
    var url = "http://"+idv.apiHost+"/api/albumsForImage";
    
    var tp = im.topic;
    var data = {image:tp};
    util.post(url,data,function (rs) {
            //util.closeDialog();
      var albums = rs.value;
      if (!albums || (albums.length==0)) {
        
        var tpo = new util.topicOb(tp);
        tpo.albumId = "-";
        tpo.kind = "album";
        var atp = tpo.topic();
      //var atp = tp;
        var dst = "http://"+idv.apiHost+idv.topicDir+atp+"/index.html";
        location.href = dst;
        return;
      }
     
     
      var msg = $('<div/>');
      msg.css({'margin':'30px'});
      msg.append('<div>These are your albums of annotations of <i>'+util.imTitle(im)+'</i>:</div>');
      
      util.arrayForEach(albums,function (a) {
        var abc = 22;
        var ael = $('<div>').html(a.caption).css({'margin-top':'10px','margin-left':'20px','text-decoration':'underline','cursor':'pointer'});
        var dst = idv.topicDir+(a.topic)+'/index.html';
        ael.click(function (){ location.href = dst;})
        msg.append(ael);
      });
    
    /* maybe later
      var bt = util.addButton(msg,"Create New Album",function () {lib.createTheAlbum(tp);},true);
      bt.css({"margin-top":"30px"});
    */
      lib.lightboxMessage(msg);
    });
    
  }
  
  lib.truncate = function (s,mx) {
    var ln = s.length;
    // break at words
    if (ln > mx) {
      var ssp = s.split(" ");
      var rs = "";
      var sln = ssp.length;
      for (i=0;i<sln;i++) {
        var cw = ssp[i];
        var cln = rs.length;
        var wln = cw.length;
        if ((cln + wln) > mx-3) {
          rs += "..."
          return rs;
        }
        rs += cw + " ";
      }
      
    }
    return s;
  }
  
  lib.addPic = function (im) {
    /*
    if (!lib.hasTag(im,lib.whichGallery)) {
      return;
    }
    */
    var tp = im.topic;
    var albs = im.albums;
    var acnt = albs?albs.length:0;//im.albumCount
      
    
    lib.shownImages.push(im);
    var ttl = im.title;
    if (!ttl) {
      ttl = im.name;
    }
    ttl = lib.truncate(ttl,lib.maxTitleChars);
    var tps = tp.split("/");
    var imo = tps[2];
    var imname = tps[3];
    var imdim = im.dimensions;
    var arti = (imdim.x)/(imdim.y);
    var ht = lib.imHeight;
    var wd = Math.max(Math.ceil(ht * arti),lib.minImWd);
    if (wd > lib.maxImWd) {
      ht = ht * (lib.maxImWd/wd);
      wd = lib.maxImWd;
    }
    var imdiv = $('<div/>');
    var imdivht = lib.imHeight+lib.titleHt+20;
   // imdiv.css({"position":"absolute","border-radius":"5px","height":imdivht+"px","width":wd+"px","background-color":"#333333","border":"solid thin white"});
    imdiv.css({"position":"absolute","height":imdivht+"px","width":wd+"px"});
    lib.imDiv.append(imdiv);
    var ttldiv = $('<div/>');
    ttldiv.css({"text-align":"center","font-size":"8pt"});
    ttldiv.html(ttl);
    imdiv.append(ttldiv);
    if (im.author) {
      var authordiv = $('<div/>');
      authordiv.css({"margin-top":"5px","font-style":"italic","text-align":"center","font-size":"8pt"});
      authordiv.html(lib.truncate(im.author,lib.maxTitleChars));     
      imdiv.append(authordiv);
    }
    var dimsdiv = $('<div/>');
    dimst = imdim.x + " x "+imdim.y;
    dimsdiv.html(dimst);
    dimsdiv.css({"text-align":"center","font-size":"8pt","margin-top":"5px"});
    imdiv.append(dimsdiv);
    //var odiv = $('<div/>');
    //odiv.html("owner "+imo);
    //imdiv.append(odiv);
    var imsrc = util.s3imDir(imo,imname) + "resized/height_100.jpg";
    var imsrc = util.s3imDir(imo,imname) + "resized/area_50000.jpg";
    var thelink = "/topic/image/"+imo+"/"+imname+"/index.html";
    var imel = $('<img src="'+imsrc+'"/>');
    imel.css({"cursor":"pointer"});
    /*var tolink = function () {
      var lnk = imlink;
      location.href = lnk;
    }
    imel.click(tolink);
    */
    //imel.attr("width",wd);
    var imwd  = ((imdim.x)/(imdim.y))*ht;
    imel.attr("width",imwd);
    imel.attr("height",ht);
    imel.css({"position":"absolute","cursor":"pointer"});
    imdiv.append(imel);
    (function (iim) {
      imdiv.click(function () {lib.popAlbumChoice(iim);});
    })(im);
  
  
    //cntel.css({"width":wd+"px","text-align":"center","text-decoration":"underline","cursor":"pointer"});
    //imel.click(function () {lib.goToSnaps(im);})
    /*if (acnt == 1) {
      imdiv.click(function () {location.href = thelink;});
    } else if (acnt > 1) {
      imdiv.click(function () {lib.popAlbumChoice(im);});
    }
    */
    //imdiv.append(cntel);
   lib.imDivs.push(imdiv);
    lib.imEls.push(imel);
    //lib.cntEls.push(cntel);
    return;
    var cntel = $('<div style="position:absolute"/>');
    var uniqueAlbum = true;
    if (ia) {
      if (acnt == 1) {
        var alb = albs[0];
        var cap = alb.caption;
        //var cap = alb.topic;
        if (cap) {
          var htm = "1 album: "+cap;
        } else {
          htm = "1 album";
        }
        cntel.html(htm);
        cntel.css({"text-decoration":"underline","cursor":"pointer"});
        var tp = alb.topic;
        thelink = "http://s3.imagediver.org/topic"+tp+"/index.html";
        cntel.click(function () {location.href=thelink;});    
        imel.click(function () {location.href=thelink;});    
      } else if (acnt ==0) {
        cntel.html("no albums");
      } else {
        if (alb) {
          var tp = alb.topic;
          alink = "http://s3.imagediver.org/topic"+tp+"/index.html";
          uniqueAlbum = false;
          var fts = $('<div/>');
          cntel.append(fts);
          var cap = alb.caption;
          if (cap) {
            var htm = "Featured : "+cap;
          } else {
            htm = "featured album";
          }
          fts.html(htm);
          fts.css({"text-decoration":"underline","cursor":"pointer"})
          fts.click(function () {location.href=alink;});
          var rst = $('<div/>');
          rst.html((acnt-1)+ " more albums");
          cntel.append(rst);
        } else {
          cntel.html(acnt + " albums");
          cntel.click(function () {
            lib.popAlbumChoice(im);
          })
          imel.click(function () {lib.popAlbumChoice(im);})
        }
      } 
    } else {
      var tpo = new util.topicOb(tp);
      tpo.albumId = "-";
      tpo.kind = "album";
      var atp = tpo.topic();
      //var atp = tp;
      var dst = "http://"+idv.apiHost+"/topic"+atp+"/index.html";
      imdiv.click(function () {location.href = dst;});
    }
    
    
    cntel.css({"width":wd+"px","text-align":"center","text-decoration":"underline","cursor":"pointer"});
    //imel.click(function () {lib.goToSnaps(im);})
    /*if (acnt == 1) {
      imdiv.click(function () {location.href = thelink;});
    } else if (acnt > 1) {
      imdiv.click(function () {lib.popAlbumChoice(im);});
    }
    */
    imdiv.append(cntel);
   lib.imDivs.push(imdiv);
    lib.imEls.push(imel);
    lib.cntEls.push(cntel);
  }
  
  
  lib.addPics = function () {
    lib.imDiv.empty();
    //var importButton = $('<div id="import"><span class="clickableElement">Import an Image</span> </div>');
    /*
     if (lib.filter=="myimages") {
      lib.imDiv.append(importButton);
      importButton.click(function(){location.href="/upload";});
      //var hr = $('<hr>');
      //lib.imDiv.append(hr);
    }
    */
    var ln = lib.images.length;
    // sort by area
    function imarea(im) {
      var dim = im.dimensions;
      return dim.x * dim.y;
    }
    var compare = function (im1,im2) {
      var a1 = imarea(im1);
      var a2 = imarea(im2);
      return (a1 < a2)?1:-1;
    }
    lib.images.sort(compare);
    for (var i=0;i<ln;i++) {
      var cim = lib.images[i];
      lib.addPic(cim);
    }
    lib.picsAdded = true;
  }
  
  lib.placePics = function () {
    if (!lib.picsAdded) lib.addPics();
    var wd = lib.imDiv.width();
    var ctop = 40;
    var cleft = 10;
    var ofs = lib.imDiv.offset();
    var oft = ofs.top;
    var ofl = ofs.left;
    //console.log("OFL",ofl);
    //ofl = 0;
    $("#import").offset({top:oft+20,left:ofl+10});
    $("hr").offset({top:oft+50,left:ofl});

    var ln = lib.imEls.length;
    for (var i=0;i<ln;i++) { // for debugging, so i can watch addition of images
      var el = lib.imDivs[i];
      el.hide();
    }
  
    if (ln == 0) {
      var msg = $('<div id="msg">You have not yet imported any images</div>');
      lib.imDiv.append(msg);
      msg.offset({top:oft+ctop,left:ofl+20});
    }
    for (var i=0;i<ln;i++) {
      var el = lib.imDivs[i];
      var cim = lib.shownImages[i];
      if (!lib.hasTag(cim,lib.whichGallery)) {
        el.hide();
        continue;
      }
      el.show();
 
      //var cntel = lib.cntEls[i];
      
      var elwd = el.width();
      if ((cleft + elwd) > wd) { // next row
        ctop = ctop + lib.imHeight + lib.titleHt + lib.imPaddingY;
        cleft = 10;
      }
      var imel = lib.imEls[i];
      var elwd = el.width();
      var imwd = imel.width();
      var imoff = 0.5 * (elwd - imwd);
      el.offset({top:oft+ctop,left:ofl+cleft});
           // console.log(ofl,cleft,imoff,ofl+cleft+imoff);

      //console.log("top",oft,ctop,lib.titleHt);
      imel.offset({top:oft+ctop+lib.titleHt,left:ofl+cleft+imoff});
      //cntel.offset({top:oft+ctop+lib.imHeight+lib.titleHt,left:ofl+cleft});
      cleft = cleft + elwd + lib.imPaddingX;
    }
    var tht = ctop + lib.imHeight + lib.titleHt + lib.imPaddingY;
    lib.imDiv.css({"height":tht+"px"});
  }
  
  lib.renderContents = function () {
    //lib.imEls.length = 0;
   // lib.imDiv.empty();
   // lib.picsAdded = false;
    lib.placePics();
  }
  
  var cg = "/image/4294b0e/";
  // the initial images
  lib.ordering = [cg + "the_dutch_proverbs",
                  cg + "the_ambassadors",
                  cg + "garden_of_earthly_delights",
                  cg + "Saint_Francis_Bellini"]
  
  lib.initialize = function() {
    var url = "/api/allImages";
    util.commonInit();
    util.post(url,{},function (rs) {
      $('document').ready(function () {
        lib.initialize2(rs);
      });
    });
  }
  
  
  lib.initialize2 = function (rs) {
      var images = rs.value;


    var ibyt = {};
    util.arrayForEach(images,
      function (im) {
        var tp = im.topic;
        ibyt[tp] = im;
      });
    var oimages = [];
    var ino = {};
    util.arrayForEach(lib.ordering,
      function (tp) {
        var im = ibyt[tp];
        if (im) {
          ino[tp] = 1;
          oimages.push(im);
        }
      });
    // add the rest: the ones not mentioned in the ordering
    util.arrayForEach(images,
      function (im) {
        var tp = im.topic;
        if (ino[tp]) return;
        oimages.push(im);
        
      });
    images = oimages;

    idv.loggedInUser = loggedInUser;
    util.commonInit()
    lib.images = images;
    lib.shownImages = [];
    lib.filter = "all"; // filter not in use
    lib.genDivs();
    lib.theLayout.placeDivs();
    lib.thePics = [];
    lib.imDiv = $(".imagesDiv");
    //var noteDiv = $('<div/>').html("<div>Images: click on any image to annotate it.</div>")
    //lib.imDiv.append(noteDiv);
    lib.theLayout.afterPlacement = function () {
      lib.placePics();
      lib.lightbox = lib.theLayout.lightbox;
    };
    lib.tabGroup.selectElement(lib.whichGallery);

    var cDiv = lib.cDiv;
    
    

    
    cDiv.append('<div style="width:100;height:50px"></div>');
    lib.theLayout.placeDivs();
    
    
    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.theLayout.placeDivs();
    });
    
    return;
    
      
  }
  
  
})();


