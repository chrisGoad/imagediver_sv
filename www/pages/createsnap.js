// support for creating and editing snapshots
(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;



  lib.startDefArea = function () {
    lib.vp.clearOverlays("both");
    lib.vp.defAreaMode = true;
    lib.vp.areaDefinedCallback = lib.finishDefArea;
    $('#cropInstructions').show();
    lib.disableClickable($('#selectSnapArea'));
  }
  
  lib.finishDefArea= function (area) {
    lib.coverageModified = true;
    util.log("area",area.tostring());
    lib.vp.defAreaMode = false;
    lib.vp.selectedImageArea = area;
    lib.vp.addOverlay(new imlib.Overlay("newSnap",area));
    $('#cropInstructions').hide();
    $('#selectSnapArea').show();
    $('#snapFields').show();
    $('#createSnapButtons').show();
     
    lib.enableClickable($('#selectSnapArea'));
    //lib.editSnapDiv.show();
    $('#selectSnapArea').html("redefine image area");
   
  }



  lib.createSnapDiv =
    $('<div class="createSnapDiv">' +
          '<div class="createSnapLine">Step 1: <span id="selectSnapArea" class="clickableElement">Define image area</span>'+
             '<span id="cropInstructions">drag box over the desired region</span></div>'+
          '<div class="createSnapLine">Step 2: Enter caption, tags, description</div>'+
          '<table id="snapFields">' +
            '<tr><td class="inputsTD">Caption<td><td><input size="60" id="snapCaption" type="text"/></td></tr>' +
            '<tr><td class="inputsTD">Description<td><td><textarea rows="5" cols="60" id="snapDescription"/></td></tr>' +
          '</table>'+
          '<div class="createSnapLine">3. Submit</div>'+
          '<div id="createSnapButtons" class="createSnapLine">' +
            '<span id="submitSnap" class="clickableElement">Create Snapshot</span>'+
            '<span id="cancelSnap" class="clickableElement">Cancel</span>'+
          '</div>' +
            
        '</div>');
      
  lib.creatingSnapDiv =
    $('<div class="creatingSnapDiv" id="creatingSnapDiv">One moment ... creating the snapshot</div>');
    
  lib.createSnapDiv.data("initializer",
    function (selsnap) {
      if (selsnap) {
        $("#submitSnap").html("Update Snapshot");
        $('#selectSnapArea').html("Redefine Image Area");
        var snapD = selsnap.snapD;
        util.log("editSnap",snapD);
        lib.zoomToSnap(snapD);
        lib.showOverlayForSnap(snapD,"selectedSnap");

        lib.enableClickable($('#selectSnapArea'))
       

        lib.editingSnap = snapD;
        lib.coverageModified = false;
        lib.setSnapFieldValues(snapD);
        lib.vp.addOverlay(new imlib.Overlay("editingSnap",snapD.coverage));
      } else {
        $("#submitSnap").html("Create Snapshot");
        $('#selectSnapArea').html("Define Image Area");

        lib.editingSnap = undefined;
       // $('#selectSnapArea').hide();
        $('#snapFields').hide();
        $('#createSnapButtons').hide();
        $('#snapCaption').attr('value',"");
         $('#snapDescription').attr('value',"");
       
      }
      //lib.startDefArea();
    }
  );
    
  lib.createSnapFieldValues = function () {
    var rs = {};
    rs.caption = $('#snapCaption').attr("value");
    rs.description = $('#snapDescription').attr("value");
    return rs;
  }
    
    
    
    
  lib.setSnapFieldValues = function (vls) {
    $('#snapCaption').attr("value",vls.caption);
    $('#snapDescription').attr("value",vls.description);
  }
                 
    
    //lib.editSnapDiv = $('<div id="editSnapDiv"/>');
    //lib.createSnapDiv.append(lib.editSnapDiv);
   
   
    lib.grabTheSnap =   function () {
      //var vl = lfields.value();
      //var data = JSON.stringify(vl);
      lib.vp.clearOverlays("both");
      lib.selectPanel("creatingSnap");
      var sdata = lib.createSnapFieldValues();
      var data = {album:lib.albumTopic,caption:sdata.caption,description:sdata.description};
      data.image = lib.imD.topic;
      if (lib.editingSnap) {
        var url = "/api/editSnap";
        var snapD = lib.editingSnap;
        data.topic=snapD.topic;
        if (lib.coverageModified) {
          data.newCrop = 1
          var newCoverage = lib.vp.selectedImageArea;
          data.coverage = newCoverage.externalize();
          snapD.coverage = newCoverage;
        } else {
          data.coverage = snapD.coverage.externalize();
          data.newCrop = 0
        }
      } else {
        var url = "/api/addSnap";
        data.coverage = lib.vp.selectedImageArea.externalize();
        data.newCrop = 0
      }
     // data.coverage = page.vp.coverage().externalize();
      util.log("api","coverage ",data.coverage);
      var cb = lib.snapCallback;
      util.post(url,data,function (rs) {
         util.log("api","data returned",rs);
         
         cb(rs);
         
      },"json");
      util.log("api","uuuuu");
    }
    
    lib.cancelTheSnap = function () {
      lib.vp.clearOverlays("both");
      lib.selectPanel(lib.lastPanel);
    }
    
    
    
    
    //lib.editSnapDiv.hide();
 
  
    
    lib.deleteSnapDiv =  $(
      '<div id="deleteSnap">'+
        '<div class="areYouSure">Are you sure you wish to delete this snapshot? There is no undo.</div>'+
        '<div>'+
          '<span  style="margin-left:20px" id="yesDeleteSnap" class="clickableElement">Yes, Delete</span>'+
          '<span   id="noDontDeleteSnap" style="margin-left:30px"  class="clickableElement">Cancel</span>'+
        '</div>'+
      '</div>');
  
    lib.deleteSnapDiv.data("initializer",function () {
      $('#deleteSnap .areYouSure').html('Are you sure you want to delete the snapshot "'+lib.nowSelectedSnap.snapD.caption+'"?');
    });

  
  lib.addCreateSnapDiv = function (container) {
    container.append(lib.createSnapDiv);
    container.append(lib.creatingSnapDiv);
    lib.setPanelPanel("createSnap",lib.createSnapDiv);
    lib.setPanelPanel("creatingSnap",lib.creatingSnapDiv);
    $('#cropInstructions').hide();  
    lib.createSnapDiv.hide();
      lib.selectSnapArea = $('#selectSnapArea');
    lib.setClickMethod(lib.selectSnapArea,lib.startDefArea);
    //lib.enableClickable(lib.selectSnapArea);

    lib.setClickMethod($('#submitSnap'),lib.grabTheSnap);
    lib.setClickMethod($('#submitAlbum'),lib.createTheAlbum);
    lib.setClickMethod($('#cancelSnap'),lib.cancelTheSnap);
    
    container.append(lib.deleteSnapDiv);
    var pn = lib.setPanelPanel("deleteSnap",lib.deleteSnapDiv);
    pn.scalable = false;
   //pn.height = 200;
    //pn.selfScaling = true;
    
    $('#noDontDeleteSnap').click(function (){
      lib.selectPanel("selectedSnap");
      lib.positionSelectedSnapElements(lib.selectedSnap);
      });


    $('#yesDeleteSnap').click(function (){
      var url = "/api/deleteSnap";
      var snap = lib.selectedSnap.snapD.topic;
      var data = {"topic":snap};
      util.post(url,data,function (rs) {
        util.log("api","data returned",rs);
        location.reload()
      },"json");      
     
      });
    

    
  }
  
    
  
    
    
    
  
})();
