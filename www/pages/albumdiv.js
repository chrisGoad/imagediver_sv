// support for creating and editing snapshots
(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;


    
  lib.createAlbumDiv =
    $('<div class="createlbumDiv">' +
          '<div id="createAlbumExplanation" style="text-align:center;margin-bottom:10px"></div>'+
          '<table id="albumFields">' +
            '<tr><td class="inputsTD">Album Caption<td><td><input size="40" id="albumCaption" type="text"/></td></tr>' +
            '<tr><td class="inputsTD">Description<td><td><textarea rows="6" cols="60" id="albumDescription"/></td></tr>' +
         '</table>'+
          '<div id="createAlbumButtons" class="buttonLine">' +
            '<span id="submitAlbum" class="clickableElement">Create Album</span>'+
            '<span id="cancelAlbum" class="clickableElement">Cancel</span>'+
          '</div>' +          
        '</div>');


  
  lib.createAlbumDiv.data("initializer",function (editing) {
    lib.editingAlbum = editing;
    if (editing) {
      var a=lib.albumD;
      $('#createAlbumExplanation').html('Editing the Current Album');
      $('#albumCaption').attr("value",a.caption);
      $('#albumDescription').attr("value",a.description);
      $('#submitAlbum').html("Save");
    } else {
      $('#createAlbumExplanation').html('Creating a New Album');
      $('#albumCaption').attr("value","");
      $('#albumDescription').attr("value","");
      $('#submitAlbum').html("Create Album (and go there)");
    }                                   
  });
  
  
  lib.albumDiv =
    $('<div class="albumDiv">' +
          '<div class="albumLine" id="albumOwner"></div>'+
          '<div class="albumButtonLine">'+
            '<span id="editAlbum" class="clickableElement">Edit This Album</span>'+
             '<span id="deleteAlbum" class="clickableElement">Delete This Album</span>'+
           '<span id="createAlbum" class="clickableElement">Create New Album</span>' +
          '</div>'+
          '<div class="albumLine" id="aboutOtherAlbums"><span id="aboutOtherAlbumsExplanation"></span><span id="otherAlbums">HOOB</span></div>'+
          '<div class="albumLine" id="albumExplanation">An album is a group of snapshots from an image.</div>' +

        '</div>');
 


  lib.albumDiv.data("initializer",
    function initAlbumDiv() {
      if (lib.myAlbum) {
        $('#editAlbum').show();
        $('#deleteAlbum').show();
      } else {
        $('#editAlbum').hide();
        $('#deleteAlbum').hide();
      }
      if (idv.loggedInUser) {
        $('#createAlbum').show();
      } else {
        $('#createAlbum').hide();
      }
      var albums = lib.albumDs;
      var ln = albums.length;
      var album = lib.albumD;
      if (album) {
        $('#albumOwner').html("The owner of this album is: "+lib.pathLast(album.owner));
        var atp = album.topic;
        if (ln == 1) {
          $('#aboutOtherAlbumsExplantion').html('Albums:');
        } else {
           $('#aboutOtherAlbumsExplanation').html('Other albums for this image:');
        }
      } else {
        if (ln == 0) {
          $('#aboutOtherAlbumsExplanation').html('These are no albums associated with this image yet.');
        } else {
           $('#aboutOtherAlbumsExplanation').html('Albums:');
        }        
      }
      var oae = $('#otherAlbums');
      oae.empty();
      //oae.append("HOOO");return;
      for (var i=0;i<ln;i++) {
        var ca = albums[i];
        if (ca.topic == atp) continue;
        var cc = ca.caption;
        var uname = lib.pathLast(lib.pathLast(ca.owner));
        if (i < ln-1) comma = ","; else comma = "";
        var aline = $('<span class="albumLink"><span>'+cc+'</span> by '+uname+comma+' </span>');
        oae.append(aline);
        (function (tp) { // to capture tp in its own environment
          aline.click(function () {
            util.navigateToPage("/topic"+tp+"/index.html");
          });
        })(ca.topic);
      }
    });
    
  
  lib.deleteAlbumDiv =  $(
    '<div id="deleteAlbum">'+
      '<div class="areYouSure">Are you sure you wish to delete this album, and its snapshots? There is no undo.</div>'+
      '<div>'+
        '<span  style="margin-left:20px" id="yesDeleteAlbum" class="clickableElement">Yes, Delete</span>'+
        '<span   id="noDontDeleteAlbum" style="margin-left:30px"  class="clickableElement">Cancel</span>'+
      '</div>'+
    '</div>');


 lib.createAlbumFieldValues = function () {
      var rs = {};
      rs.caption = $('#albumCaption').attr("value");
      rs.description = $('#albumDescription').attr("value");
      return rs;
    }
    
    
   
  lib.createTheAlbum = function () {
    //var vl = lfields.value();
    //var data = JSON.stringify(vl);
    var sdata = lib.createAlbumFieldValues();
    var data = {caption:sdata.caption,description:sdata.description};
    data.image = lib.imD.topic;
    if (lib.editingAlbum) {
      var url = "/api/editAlbum";
      data.topic = lib.albumD.topic;
    } else {
      var url = "/api/addAlbum";
    }
    var cb = lib.createAlbumCallback;
    util.post(url,data,function (rs) {
       util.log("api","data returned",rs);
       location.href = "/topic"+rs.value.topic;
       lib.albumDs.push(rs.value);
       lib.selectPanel("albums");
    },"json");
    util.log("api","uuuuu");
  }

  lib.addAlbumDiv = function (container) {
    container.append(lib.createAlbumDiv);
    lib.setPanelPanel("createAlbum",lib.createAlbumDiv);
    $('#cancelAlbum').click(function(){lib.selectPanel("albums",false);});
    container.append(lib.albumDiv);    
    $('#editAlbum').click(function () {lib.selectPanel("createAlbum",true);});
    container.append(lib.deleteAlbumDiv);
    var pn = lib.setPanelPanel("deleteAlbum",lib.deleteAlbumDiv);
    pn.scalable = false;
    pn.height = 100;
    lib.setClickMethod($('#submitAlbum'),lib.createTheAlbum);
    $('#deleteAlbum').click(function () {lib.selectPanel("deleteAlbum");});
    $('#createAlbum').click(function () {lib.selectPanel("createAlbum",false);});
   
    $('#noDontDeleteAlbum').click(function (){
      lib.selectPanel("albums");
      });
    $('#yesDeleteAlbum').click(function (){
      var url = "/api/deleteAlbum";
      var album = lib.albumD.topic;
      var data = {"topic":album};
      util.post(url,data,function (rs) {
        util.log("api","data returned",rs);
        location.href = "/";
      },"json");      
    });
  };
})();
