// support for creating and editing snapshots
(function () {
  
  var lib = page;
   var geom = idv.geom;
  var imlib = idv.image;

  var com = idv.common;
  var util  = idv.util;

  lib.createAlbumWd = 450;
   /* notnot 
  lib.createAlbumDiv =
    $('<div class="createlbumDiv" style="margin:20px">' +
          '<div id="createAlbumExplanation" style="text-align:center;margin-bottom:10px"></div>'+
          '<table id="albumFields">' +
            '<tr><td class="inputsTD">Album Title<td><td><input style="width:'+lib.createAlbumWd+'px" id="albumCaption" type="text"/></td></tr>' +
            '<tr><td class="inputsTD"></td><td></td><td>To include links or other formatting in the description, use <a target="_blank" href="http://daringfireball.net/projects/markdown/basics">Markdown</a></td></tr>' +

            '<tr><td class="inputsTD">Description<td><td><textarea style="width:'+lib.createAlbumWd+'px"  rows="10" id="albumDescription"/></td></tr>' +
             //'<tr><td class="inputsTD" colspan="2"><input type="checkbox"/> Import your snaps into this album</td></tr>'+

           // '<tr><td class="inputsTD" id="externalLinkLabel">External Link<td><td><input style="width:'+lib.createAlbumWd+'px"  id="albumExternalLink"/></td></tr>' +
         '</table>'+
          '<div id="createAlbumButtons" class="buttonLine">' +
            '<span id="submitAlbum" class="clickableElement">Create Album</span>'+
            '<span id="cancelAlbum" class="clickableElement">Cancel</span>'+
          '</div>' +          
        '</div>');

   */

  
  /* notnot
   lib.albumDivInitializer = function () {
    lib.editingAlbum = false;
  
    $('#createAlbumExplanation').html('Creating a New Album');
    $('#albumCaption').attr("value","");
    $('#albumDescription').attr("value","");
    $('#submitAlbum').html("Create Album (and go there)"); 

  };
  */
  
  /* only used now at create album time */
  lib.editAlbumDiv =
    $('<div class="editAlbumDiv">' +
          '<div id="note">Note: these fields are optional, and can be edited later via "image details/ Edit"  </div>' +
        '<hr/>' +
        '<div class="albumFields">' +
          '<div id="editAlbumExplanation" style="text-align:center;margin-bottom:10px"></div>'+
          '<table id="albumFields">' +
            '<tr><td class="inputsTD">Title<td><td><input size="40" id="albumCaption" value="Untitled" type="text"/></td></tr>' +
            '<tr><td class="inputsTD"></td><td></td><td>To include links or other formatting in the description, use   <a href="http://daringfireball.net/projects/markdown/basics" target="idvWindow">Markdown</a></i></td></tr>' +
            '<tr><td class="inputsTD">Description<td><td><textarea rows="6" cols="50" id="albumDescription"/></td></tr>' +
           // '<tr><td class="inputsTD">External Link<td><td><input size="40" id="albumExternalLink" type="text"/></td></tr>' +
         '</table>'+
        '</div>' +
         '</table>'+
          '<div id="editAlbumButtons" class="buttonLine">' +
            '<span id="submitAlbum" class="clickableElement">Save</span>'+
            '<span id="cancelAlbum" class="clickableElement">Cancel</span>'+
          '</div>' +          
        '</div>');
  /*
   lib.editAlbumDiv.data("set_css",function () {
      $("#note",lib.editAlbumDiv).css({"margin-left":"10px","margin-right":"10px","margin-top":"10px"});

     $('.albumFields',lib.editAlbumDiv).css({"margin-left":"20px"});
   });
  */
  /*
  lib.editAlbumInitializer = function () {
    lib.editingAlbum = true;
    var a=lib.albumD;
    $('#editAlbumExplanation').html('Editing Album Properties');
    $('#albumCaption').attr("value",a.caption);
    $('#albumDescription').attr("value",a.description);
    //$('#albumExternalLink').attr("value",a.externalLink);  
    //util.addToolTip($('#externalLinkLabel',editAlbumDiv),"HELLO");
                       

  };
  */
  /* notnot
  lib.albumsDiv =
    $('<div class="albumsDiv">' +
          '<div class="albumLine" id="aboutOtherAlbums"><span id="aboutOtherAlbumsExplanation"></span><span id="otherAlbums"></span></div>'+
          '<div class="albumLine" id="albumExplanation">An album is a group of snapshots from an image.</div>' +

        '</div>');
 
  */
  
  // for now, this function is duplicated in album.js; later consolidate
  /* notnot
  lib.albumsHtml = function (dst,albums,thisAlbumTopic) {
      dst.empty();
      var ln = albums.length;
      //oae.append("HOOO");return;
      for (var i=0;i<ln;i++) {
        var ca = albums[i];
        if (ca.topic == thisAlbumTopic) continue;
        var cc = ca.caption;
        var uname = ca.ownerName; //lib.pathLast(lib.pathLast(ca.owner));
        if (i < ln-1) comma = ","; else comma = "";
        if (uname) {
          var bywho = " by "+uname;
        } else {
          bywho = ""
        }
        var aline = $('<span class="albumLink"><span>'+cc+'</span> '+bywho+comma+' </span>');
        dst.append(aline);
        (function (tp) { // to capture tp in its own environment
          aline.click(function () {
            util.navigateToPage(util.publishedUrl(tp));
          });
        })(ca.topic);
      }
  }
  */
  /* notnot

  lib.albumsDiv.data("initializer",function () {
      var albums = lib.albumDs;
      var ln = albums.length;
      var album = lib.albumD;
      if (album) {
        $('#albumOwner').html("The owner of this album is: "+lib.pathLast(album.owner));
        var atp = album.topic;
        if (ln == 1) {
          $('#aboutOtherAlbumsExplantion').html('Published Album:');
        } else {
           $('#aboutOtherAlbumsExplanation').html('Other published albums for this image:');
        }
      } else {
        atp = "";
        if (ln == 0) {
          $('#aboutOtherAlbumsExplanation').html('There are no public albums associated with this image.');
        } else {
           $('#aboutOtherAlbumsExplanation').html('Published albums:');
        }        
      }
      var oae = $('#otherAlbums');
      oae.empty();
      lib.albumsHtml(oae,albums,atp);
    
    });
  */
  
  lib.deleteAlbumDiv =  $(
    '<div id="deleteAlbum">'+
      '<div class="areYouSure">Are you sure you wish to delete this album, and its snapshots? There is no undo.</div>'+
      '<div>'+
        '<span  style="margin-left:20px" id="yesDeleteAlbum" class="clickableElement">Yes, Delete</span>'+
        '<span   id="noDontDeleteAlbum" style="margin-left:30px"  class="clickableElement">Cancel</span>'+
      '</div>'+
    '</div>');


/* notnot
 lib.createAlbumFieldValues = function () {
      var rs = {};
      rs.caption = $('#albumCaption').attr("value");
      var ds  = $('#albumDescription').attr("value");
      rs.description = ds;
      //rs.externalLink = $('#albumExternalLink').attr("value");
      return rs;
    }
    
*/

/* notnot
  lib.createOrEditAlbum = function (edit,imTopic) {
    //var vl = lfields.value();
    //var data = JSON.stringify(vl);
    if (!imTopic) imTopic = lib.imD.topic;
    var sdata = lib.createAlbumFieldValues();
    var data = {caption:sdata.caption,description:sdata.description};//,externalLink:sdata.externalLink};
    data.image = imTopic;
    if (edit) {
      var url = "/api/editAlbum";
      data.topic = lib.albumD.topic;
    } else {
      var url = "/api/newAlbum";
    }
  
    var cb = lib.createAlbumCallback;
    var a = lib.albumD;
    util.post(url,data,function (rs) {
       util.log("api","data returned",rs);
       if (rs.status != "ok") {
        util.logout();
        location.href = "/timeout"
        return;
       }
       if (edit) {
        var vl = rs.value;
        util.setProperties(a,vl,["description","caption"]);//,"externalLink"]);
        lib.updateTopbarOptions(lib.topbar.options);
        lib.topbar.render();
        lib.popAlbumDetails();

       // lib.lightbox.dismiss();

       } else {
          location.href = idv.topicDir + rs.value.topic + "/index.html";
       }
       //lib.albumDs.push(rs.value);
       //lib.selectPanel("albums");
    },"json");
    util.log("api","uuuuu");
  }
  
*/
    
  lib.createAlbumJsonP = function (imTopic,cb) {
    var data = {image:imTopic};//,externalLink:sdata.externalLink};
    var url = "http://"+idv.apiHost+"/api/newAlbumJsonP";
  
    util.getJsonP(url,data,function (rs) {
            //util.closeDialog();
      cb(rs.value);
    });
  }
  

  lib.deleteTheAlbum = function () {
    var data = {topic:lib.albumD.topic};   
    var url = "/api/deleteAlbum";
    var imtp = lib.albumD.image.topic;
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
  
  /* notnot
  lib.createTheAlbum = function (imTopic) {
    lib.createOrEditAlbum(false,imTopic);
  }
  
  
  lib.editTheAlbum = function () {
    lib.createOrEditAlbum(true);
  }

  */
  /* notnot
  lib.popCreateAlbumLightbox = function (imTopic) {
    lib.lightbox.pop(false,350);
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    
    lib.lightbox.element.append(lib.createAlbumDiv);
    lib.editingAlbum = true;
  //  util.addToolTip($('#externalLinkLabel',lib.createAlbumDiv),"An external URL (eg a wikipedia page) associated with the album. Leave blank if not applicable");
    

    $('#submitAlbum').click(function () {
      lib.createTheAlbum(imTopic);});

    $('#cancelAlbum').click(function () {lib.lightbox.dismiss();});
    //lib.editAlbumInitializer(false);
    return;
   
 }
  */
  /* notnot
  lib.addAlbumsDiv = function (container) {
    container.append(lib.albumsDiv);
    lib.setPanelPanel("albums",lib.albumsDiv);
    //var csser = lib.editAlbumDiv.data("set_css");
    //csser();
    return;
  }
  */
 
 /*
  lib.addEditAlbumDiv = function (container) {
   // container.append(lib.editAlbumDiv);
   // lib.setPanelPanel("editAlbum",lib.editAlbumDiv);
   var csser = lib.editAlbumDiv.data("set_css");
    csser();
  
   
  };
 */
 
 lib.editAlbumFields = function () {
    var caption = $('#albumCaption',lib.editAlbumDiv).attr('value');
    var ds  = $('#albumDescription',lib.editAlbumDiv).attr('value');
    var data = {caption:caption,description:ds,topic:lib.albumD.topic};
    var url = "/api/editAlbum";
    util.post(url,data,function (rs) {
      lib.albumD.caption = data.caption;
      lib.albumD.description = data.description;
      lib.updateTopbarOptions(lib.topbar.options);
      lib.topbar.render()

      lib.lightbox.dismiss();
    });
 }
  
  lib.popEditAlbumLightbox = function () {
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.editAlbumDiv.css({"margin":"20px"});
    lib.lightbox.addClose();
    lib.albumD.caption = 'Untitled';
    lib.lightbox.element.append(lib.editAlbumDiv);
    $('#submitAlbum',lib.editAlbumDiv).click(function () {lib.editAlbumFields();});
    $('#cancelAlbum',lib.editAlbumDiv).click(function(){
      lib.lightbox.dismiss();
      //lib.lightbox.dismiss();}
    }
    );
    //var initializer = lib.editAlbumDiv.data("initializer");
    //lib.editAlbumInitializer(false);
    return;
   
  
 }
 
  
  /* notnot
  lib.albumsForImageFromS3 = function (im,cb) {
    var tpr = util.s3TopicRoot;
    var unm = util.pathLast(idv.loggedInUser);
    var pth = tpr + im + "/" + unm + "/albums.json";
    var ecb = function (rs) {
      cb([]);
    }
    util.get(pth,cb,ecb);
  }
  */
  /*
   var im = "/image/e244d69/batoni_gidean"
   var cb = function (albums) { console.log("ALBUMS:",albums)};
   
  page.albumsForImage(im,cb)
  
  */
  
  lib.showAlbumChoice = function (albums,im) {
    var tp = im.topic;
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
      var dst = "http://"+idv.apiHost+idv.topicDir+(a.topic)+'/index.html';
      ael.click(function (){ location.href = dst;})
      msg.append(ael);
    });
    util.addButton(msg,"Create New Album",function () {
      lib.createAlbumJsonP(tp, function (atp) {
        var dst = "http://"+idv.apiHost+idv.topicDir+atp+"/index.html?new=1";
        location.href = dst;
      });
    },
    true).css({"margin-top":"20px"});
    lib.lightbox.popMessage(msg);
  }
    
 
  lib.popAlbumChoice = function (im) {
    /*
    if (idv.atS3 && 0) {
      lib.albumsForImageFromS3(im.topic,function (albums) {lib.showAlbumChoice(albums,im)});
      return;
    }
    */
    var tp = im.topic;

    if (!idv.loggedInUser) {
      var tpo = new util.topicOb(tp);
      var url = idv.topicDir + "/album/" + tpo.imageOwner + "/" + tpo.imageName + "/-/index.html";
      location.href = url;
      return;
    }
    var url = "http://"+idv.apiHost+"/api/albumsForImageJsonP";
    
    var data = {image:tp};
    util.getJsonP(url,data,function (rs) {
            //util.closeDialog();
      var albums = rs.value;
      lib.showAlbumChoice(albums,im);
    })
    
  }
  
})();
