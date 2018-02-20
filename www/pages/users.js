

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

  var com = idv.common;
  var util  = idv.util;
  
  lib.whichGallery = "art";
  
  lib.genDivs = function () {
    var fullTitle = "<i>the depths of high resolution images, annotated</i>";
    var b = $('body');
  
    var topbarOptions = {title:fullTitle};
    var outerDiv = $("<div class='outerDiv'/>");
    lib.outerDiv = outerDiv;
    b.append(outerDiv);
    lib.topDiv =  idv.topbar.genTopbar(outerDiv,topbarOptions);//imlib.genTopbar(outerDiv,topbarOptions);
    var uDiv = $('<div/>');
    lib.uDiv = uDiv;
    outerDiv.append(uDiv);
    uDiv.css({"margin-top":"50px"});
 

    //lib.titleDiv = imlib.genTopbar(cDiv,{title:fullTitle,includeAbout:true,includeGallery:true});
    
    
  
  
    //cDiv.append(lib.bottomDiv);
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
  

  lib.addUser = function (usr) {
    var nm = usr.name;
    var udiv = $('<div><div id="titleLine"></div><div id="albums"></div></div>');
    udiv.css({'margin':'10px','cursor':'pointer'});
    lib.uDiv.append(udiv);
    var utd = $('#titleLine',udiv);
    var adiv = $('#albums',udiv);
    adiv.css({"margin-left":"30px","margin-top":"10px","cursor":"pointer"});
    utd.html(nm);
    
    utd.click(function () {
      lib.getAlbums(usr,function (rs) {
        var v = rs.value;
        adiv.empty();
        if (!v) {adiv.html("No albums");return;}
        util.arrayForEach(v,function (a) {
          var atp = a.topic;
          var tpd  = $('<div/>').html(a.topic);
          tpd.css({"margin-top":"5px"});
          adiv.append(tpd);
          (function (atp) {
            tpd.click(function () {
                    var latp = atp;
                      var url = "http://s3.imagediver.org/topic"+atp+"/index.html";
                       window.open(url,"idv_target");
            });
        
           })(a.topic);
        })
    });
  });
  }
  
  
  lib.addUsers = function (usrs) {
    lib.uDiv.empty();
    util.arrayForEach(usrs,lib.addUser);
  }
  
  lib.getAlbums = function (usr,cb){
    var url = "/api/allAlbums"
    util.post(url,{user:usr.topic},cb);
  }
  
  
  lib.initialize = function() {
    var url = "/api/allUsers";
    util.commonInit();
    util.post(url,{},function (rs) {
      $('document').ready(function () {
        var users = rs.value;
        lib.genDivs();
        lib.addUsers(users);
                lib.theLayout.placeDivs();

      });
    });
  }
  
  
  
})();


