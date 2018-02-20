

// panorama page generation



(function () {
  

  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;

  //var com = idv.common;
  var util  = idv.util;
   var common = idv.common;

  
  
  lib.initialize = function (options) {
    idv.util.commonInit();
    util.loggedInUserFromCookie();
    var dv = $('.infoDiv');
   
    var r = /image=(\/image\/\w*\/\w*)/;
    var mt = location.href.match(r);
    if (mt) {
      var image = mt[1];
      var ims = image.split("/");
      var imo = ims[2];
      var imname= ims[3];
       var imsrc = util.s3imDir(imo,imname) + "resized/area_250000.jpg";
      //lib.createNewAlbum(imt);
    }
    var imel = $('<img src="'+imsrc+'"/>');
    dv.append(imel);
    if (!idv.loggedInUser) {
      dv.append(msg = $('<div/>').html('To annotate images, you need to <a href="/login">log in or register</a> at ImageDiver. It\'s free.'));
      return;
    }
    
    // put in the lightbox
    var lbwd = 600;
    var lft = winCenter = 0.5 * lbwd;
    var wht = $(window).height();
    var lbht = 200; 
    var lightboxRect = new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));
    var lb = new common.Lightbox($('body'),lightboxRect);
    lb.render();
    lib.lightbox = lb;
    
    //var host = idv.devVersion?"dev.imagediver.org":"imagediver.org";
    var url = "http://"+idv.apiHost+"/api/albumsForImage";
    var data = {image:image};
    util.post(url,data,function (rs) {
            //util.closeDialog();
     
      var albs = rs.value;
      if ((!albs) || (albs.length == 0)) {
        var firstAlbum = $('<div/>').html('Please confirm:do you wish to start annotating this image?');
        dv.append(firstAlbum);
        var ok,cancel,buttons;
        dv.append(buttons = $('<div/>'));
        buttons.append(ok=  $('<span class="clickableElement">Ok</span>'));
        buttons.append(cancel=  $('<span class="clickableElement">Cancel</span>'));
        buttons.css({'margin-top':'20px'});
        ok.click(function () {util.createNewAlbum(image);});
        cancel.click(function () {history.back();});
      } else {
        dv.append($('<div/>').html("These are your albums of annotations for this image (click to open):"));
        util.arrayForEach(albs,function (alb) {
          
          var adiv = $('<div/>').html(alb.caption);
          dv.append(adiv);
          adiv.css({'margin-left':'20px','margin-top':'10px','cursor':'pointer','text-decoration':'underline'});
          var  tp = alb.topic;
          var url = "http://"+idv.apiHost+"/topic"+tp+"/index.html"
          adiv.click(function () {location.href=url});
        });
        var newAlbum;
        dv.append($('<div/>').html("Or:").css({'margin-top':'10px'}));
        dv.append(newAlbumDiv =  $('<div/>').append(newAlbum=$('<span class="clickableElement">Create New Album</span>')));
        newAlbumDiv.css({'margin-top':'20px','font-size':'10pt'})
        newAlbum.click(function () {
           lib.popCreateAlbumLightbox(image);
        });

      }
    });

    
  }
 
})();
  