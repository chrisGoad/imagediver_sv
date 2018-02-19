// support for creating and editing snapshots
(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;



  lib.editImageDiv =
    $('<div class="editImageDiv">' +
        '<table id="imageFields">' +
            '<tr><td class="inputsTD">Title</td><td><input size="60" id="imageTitle" type="text"/></td></tr>' +
            '<tr><td class="inputsTD">Description</td><td><textarea rows="5" cols="60" id="imageDescription"/></td></tr>' +
          '</table>'+
          '<div id="editImageButtons" class="editImageLine">' +
            '<span id="submitImageEdit" class="clickableElement">Submit</span>'+
            '<span id="cancelImageEdit" class="clickableElement">Cancel</span>'+
          '</div>' +
            
        '</div>');
      
     
  lib.editImageDiv.data("initializer",
    function () {
      var imD = page.imD;
      var ttl = imD.title;
      if (imD.description) ds = imD.description; else ds = "";
      $('#imageTitle').val(ttl);
      $('#imageDescription').html(ds);
    }
  );
    
  lib.editImageFieldValues = function () {
    var rs = {};
    rs.title = $('#imageTitle').attr("value");
    rs.description = $('#imageDescription').attr("value");
    return rs;
  }
    
  
  lib.editImageCallback = function (rs) {
        $('#aboutImage').html(page.imD.description);
        $('.titleSpan').html(page.imD.title);
      lib.selectPanel("aboutImage");
  }

    
    
    
    //lib.editSnapDiv = $('<div id="editSnapDiv"/>');
    //lib.createSnapDiv.append(lib.editSnapDiv);
   
   
    lib.editTheImage =   function () {
      //var vl = lfields.value();
      //var data = JSON.stringify(vl);
      var imD = page.imD;
      var sdata = lib.editImageFieldValues();
      imD.description = sdata.description;
      imD.title = sdata.title;
      var data = {image:imD.topic,title:sdata.title,description:sdata.description};
      var url = "/api/editImage";
      var cb = lib.editImageCallback;
      util.post(url,data,function (rs) {
         util.log("api","data returned",rs);
         
         cb(rs);
         
      },"json");
      util.log("api","uuuuu");
    }
    
    lib.cancelEditImage = function () {
      lib.selectPanel(lib.lastPanel);
    }
    
    
    
  
  lib.addEditImageDiv = function (container) {
    container.append(lib.editImageDiv);
    lib.setPanelPanel("editImage",lib.editImageDiv);
    var sie = $('#submitImageEdit');
    var cie = $('#cancelImageEdit')
    lib.setClickMethod(sie,lib.editTheImage);
    lib.setClickMethod(cie,lib.cancelEditImage);

    
  }
  
    
  
    
    
    
  
})();
