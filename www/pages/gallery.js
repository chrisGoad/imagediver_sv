

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
  
  
  lib.toAlbum = function (im,aid) {
    var tp = im.topic;
    var tps = tp.split("/");
    var imname = tps[tps.length-1];
    return "/album/"+imname+"/"+aid;
  }
  
  lib.largeImDiv = function (container,imD,impairD,album) {
    this.container = container;
    this.imD = imD;
    this.impairD = impairD;
    this.album = album;
  }
  
  lib.imageTopic = function (usr,imname) {
    return "/image/"+usr+"/"+imname;
  }
  
  
  lib.albumTopic = function (usr,imname,albumNum) {
    return "/album/"+usr+"/"+imname+"/"+albumNum;
  }
  
  lib.renderAlbum =  function (u,imname,albumnum) {
    
    var imdiv =  new lib.largeImDiv(lib.cDiv,lib.images[lib.imageTopic(u,imname)],null,lib.albums[lib.albumTopic(u,imname,albumnum)]);
    imdiv.render();
  }
  
  
  lib.largeImDiv.prototype.renderImpair= function () { // not in use right now
    var cnt = this.container;
    var impairD = this.impairD;
    var im0 = impairD.image0;
    var im1 = impairD.image1;
    var imD0 = lib.images.cg_astoria_1923_1; // a hack
    var imD1 = lib.images.cg_astoria_2010_1; // hack hack
    var title = "Astoria in 1923 and 2010 with coordinated zooming/panning"; //for now
    var imUrl0 = imD0.imUrl;
    var imUrl1 = imD1.imUrl;
    var tp = imD0.topic;
    var sp = tp.split("/");
    var imname = sp[3]; //for right now. nottiled does not yet include the user name
    var uname = sp[2];
    var s3d = "http://"+idv.cfDomain + "/resized/";
    //var s3d = "http://imagediver.s3-website-us-east-1.amazonaws.com/resized/"
    var imUrl0 = s3d+imname+".jpg";
    var tp = imD1.topic;
    var sp = tp.split("/");
    var imname = sp[3]; //for right now. nottiled does not yet include the user name
    var uname = sp[2];
    var imUrl1 =  s3d+imname+".jpg";

    var dim0 = geom.internalizePoint(imD0.untiledDimensions);
    var dim1 = geom.internalizePoint(imD1.untiledDimensions);
    // assume same aspect ratio and width for now
    var aspectRatio = dim0.x/dim0.y;
    this.aspectRatio = aspectRatio;
    this.imRelWd = 0.8;

    var ht0percent =  Math.floor(100*dim0.y/dim0.x) + "%";
    var ht1percent =  Math.floor(100 * dim1.y/dim1.x) + "%";
    var theDivStack = lib.theDivStack;

    var titleDiv = $('<div class="largeImTitle"/>');
    cnt.append(titleDiv);
    var titleP = $('<p/>')
    
    titleP.html(title);
    cnt.append(titleDiv);
    titleDiv.append(titleP);
    

    titleDiv.click(function () {util.navigateToPage("/topic"+impairD.topic+"/index.html");});

  
    
    var imDiv = $('<div class="largeImDiv"/>');
    cnt.append(imDiv);
   imDiv.click(function () {location.href = "/topic"+impairD.topic;});

    //var imEl0 = '<img class="galleryImage" width="100%" height="'+ht0percent+'" src="'+imUrl0+'"/>';
    var imEl0 = '<img class="galleryImage" width="100%"  src="'+imUrl0+'"/>';
    var imEl0 = $(imEl0);
    this.imEl0 = imEl0;
    //var imEl1 = '<img class="galleryImage" width="100%" height="'+ht1percent+'" src="'+imUrl1+'"/>';
    var imEl1 = '<img class="galleryImage" width="100%" src="'+imUrl1+'"/>';
  // var imEl1 = '<img class="galleryImage" width="100%" height="51%" src="'+imUrl1+'"/>';
    var imEl1 = $(imEl1);
    this.imEl1 = imEl1;
    imDiv.append(imEl0);
    imDiv.append(imEl1);
    lib.thePics.push(this);
    this.setImHeight();
    //lib.im0Sdiv.element = imDiv;
      
  }
  lib.largeImDiv.prototype.setImHeight = function () {
    var ly = lib.theLayout;
    var divWd = ly.vpCss.width;
    var imWd = this.imRelWd * divWd;
    var imHt = imWd / this.aspectRatio;
    if (this.imEl0) {
      this.imEl0.height(imHt);
      this.imEl1.height(imHt);
    } else {
      this.imEl.height(imHt);
    }
  }
  lib.largeImDiv.prototype.render = function () {
    var ly = lib.theLayout;
    var divWd = ly.vpCss.width;
    
    //alert(divWd);
    var cnt = this.container;
    var imD = this.imD;
    var impairD = this.impairD;
    if (impairD) {
      return this.renderImpair();
    }
    
    var title = imD.title;
    var name = imD.name; // new fellows will have this
    var author = imD.author;
    if (author) {
      author = ", "+author;
    } else {
      author = "";
    }
    if (!title) {
      title = name;
    }
    title = title + author;
    var album = this.album;
    if (album) {
      var cp = album.caption;
      if (cp) {
        title = title + ":" + cp;
      }
      var theTopic = album.topic;
    } else {
      theTopic = imD.topic;
    }
    var tp = imD.topic;
    var sp = tp.split("/");
    var imname = sp[3]; //for right now. nottiled does not yet include the user name
    var uname = sp[2];
    //var s3d = "http://imagediver.s3-website-us-east-1.amazonaws.com/resized/"
    var s3d = "http://"+idv.cfDomain + "/resized/";

  //  imUrl = "http://imagediver.com/resized/"+uname+"/"+imname+".jpg";
    imUrl = s3d +uname+"/"+imname+".jpg";
    var dim = geom.internalizePoint(imD.untiledDimensions);
    
    var htPercent =  Math.floor(100*dim.y/dim.x) + "%";
    
    var aspectRatio = dim.x/dim.y;
   // if (aspectRio)
   // var ht = Math.floor(uwd * dim.y/dim.x);

    var titleDiv = $('<div class="largeImTitle"/>');
    var titleP = $('<p/>')
    titleP.html(title);
    cnt.append(titleDiv);
    titleDiv.append(titleP);
    titleDiv.click(function () {util.navigateToPage("/topic"+theTopic+"/index.html");});

   
    if (aspectRatio < 2) {
      var imDiv = $('<div class = "squareImDiv"/>')
      var imRelWd = 0.4;
    } else {
      var imDiv = $('<div class="largeImDiv"/>');
      imRelWd = 0.8;
    }
    //var imWd = imRelWd * divWd;
    //var imHt = imWd / aspectRatio;
    this.aspectRatio = aspectRatio;
    this.imRelWd = imRelWd;
    
    imDiv.click(function () {util.navigateToPage("/topic"+theTopic+"/index.html");});

    //imDiv.append(titleDiv);
    //titleDiv.html(title);
    //var imEls = '<img class="galleryImage" width="'+uwd+'" height="'+ht+'" src="'+imUrl+'"/>';
//    var imEls = '<img class="galleryImage" width="100%" height="'+htPercent+'" src="'+imUrl+'"/>';
   var imEls = '<img class="galleryImage" width="100%"  src="'+imUrl+'"/>';
 //   var imEls = '<img class="galleryImage" width="100%" height="'+imHt+'" src="'+imUrl+'"/>';
    var imEl = $(imEls);
    this.imEl = imEl;
    this.setImHeight();
    lib.thePics.push(this);
    imDiv.append(imEl);
    cnt.append(imDiv);
    //lib.im0Sdiv.element = imDiv;
   
   
      
  }
  
  
  
  lib.genDivs = function () {
    var fullTitle = "<i>the depths of high-resolution images, annotated</i>";
    var b = $('body');
  
    var topbarOptions = {title:fullTitle};
    var outerDiv = $("<div class='outerDiv'/>");
    lib.topDiv = imlib.genTopbar(outerDiv,topbarOptions);
    lib.outerDiv = outerDiv;
    b.append(outerDiv);
    
    var cDiv = $("<div class='galleryDiv'/>");
    cDiv.css("background-color","black");
    lib.cDiv = cDiv;
    outerDiv.append(cDiv);
    //lib.titleDiv = imlib.genTopbar(cDiv,{title:fullTitle,includeAbout:true,includeGallery:true});
      
    if (false) {
      lib.noteDiv = $('<div class="noteDiv"><p> See the <span id="galleryLink">gallery</span> for a few more images</p>'+
                      '<p style="line-height:10px;top:0px;width:100%;text-align:center">Astoria in 1923</p></div>');
      b.append(lib.noteDiv);
      $('#galleryLink').click(function () {util.navigateToPage("/gallery.html");});
      lib.noteSdiv.element = lib.noteDiv;
    }
    
  
  
    cDiv.append(lib.bottomDiv);
    lib.theLayout = new lib.LayoutZero({
      outerDiv:lib.outerDiv,
      centerDiv:lib.cDiv,
      margin:50,
      minScale:0.6,
      aspectRatio:1, //has no effect in this case
      maxScale:1
    });
 
  }
  
  lib.initialize = function() {

    lib.genDivs();
    lib.theLayout.placeDivs();
    lib.thePics = [];
    
    lib.theLayout.afterPlacement = function () {
      if (lib.thePics) {
        var ln = lib.thePics.length;
        for (var i=0;i<ln;i++) {
          var pic = lib.thePics[i];
          pic.setImHeight();
        }
      }
    };

    var cDiv = lib.cDiv;
    
    
    lib.renderAlbum("cg","The_Dutch_Proverbs",1);
    lib.renderAlbum("cg","The_Ambassadors",1);
    lib.renderAlbum("cg","earthly_delights_1",1);
    lib.renderAlbum("cg","astoria_1923_1",1);

    
    /*
    var LimDiv0= new lib.largeImDiv(cDiv,lib.images.cg_The_Dutch_Proverbs,null,lib.albums.cg_The_Dutch_Proverbs_1);
    LimDiv0.render();
    
    
    var LimDiv0= new lib.largeImDiv(cDiv,lib.images.cg_earthly_delights_1,null,lib.albums.cg_earthly_delights_1_1);
    LimDiv0.render();
    
    
    
    
    var LimDiv3= new lib.largeImDiv(cDiv,lib.images.cg_bathing_1,null,lib.albums.cg_bathing_1_1);
    LimDiv3.render();
    
    //var LimDiv0= new lib.largeImDiv(b,lib.params.im0,null,[lib.params.im0a0,lib.params.im0a1]);
    //LimDiv0.render();
    
     //var ImpDiv= new lib.largeImDiv(cDiv,null,lib.impair);
    //ImpDiv.render();
 
   
 
   
    var LimDiv0= new lib.largeImDiv(cDiv,lib.images.cg_astoria_1923_1,null,lib.albums.cg_astoria_1923_1_1);
    LimDiv0.render();
    
    
    // VILE HACK until I get an album deletion thing going
    //lib.images.vh_vintage_1.albumDs = [];
    
 //   var LimDiv4= new lib.largeImDiv(cDiv,lib.images.vh_vintage_1,null,null);
  //  LimDiv4.render();
   
  
        
//     var LimDiv2= new lib.largeImDiv(cDiv,lib.images.cg_mulberry_1,null,lib.albums.cg_mulberry_1_1);
 //   LimDiv2.render();
   
 
    var LimDiv3= new lib.largeImDiv(cDiv,lib.params.im3,null,[]);
    LimDiv3.render();
 */
 
    cDiv.append('<div style="width:100;height:50px"></div>');
    lib.theLayout.placeDivs();
    
    
    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.theLayout.placeDivs();
    });
    
    return;
    
      
  }
  
  
})();


