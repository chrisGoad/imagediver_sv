/NOT IN USE/ support for creating and editing snapshots
(function () {
  
  var lib = page;
 
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
     
     
      var msg = $('<div id="lightboxMessage"/>');
      msg.css({'margin':'30px'});
      msg.append('<div>These are your albums of annotations of <i>'+util.imTitle(im)+'</i>:</div>');
      
      util.arrayForEach(albums,function (a) {
        var abc = 22;
        var ael = $('<div>').html(a.caption).css({'margin-top':'10px','margin-left':'20px','text-decoration':'underline','cursor':'pointer'});
        var dst = idv.topicDir+(a.topic)+'/index.html';
        ael.click(function (){ location.href = dst;})
        msg.append(ael);
      });
       util.addButton(msg,"Create New Album",function () {
        lib.popCreateAlbumLightbox(tp);},
      true).css({"margin-top":"20px"});
      lib.lightbox.popMessage(msg);
    });
    
  }
  
})();
