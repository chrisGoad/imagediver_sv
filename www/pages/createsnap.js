// support for creating and editing snapshots
(function () {
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;



  lib.startDefArea = function () {
    lib.vp.clearOverlays("both");
    lib.vp.defAreaMode = true;
    lib.vp.setDisplayParamsForZoom();
    lib.vp.areaDefinedCallback = lib.finishDefArea;
    $('#cropInstructions').show();
  //  lib.disableClickable($('#selectSnapArea'));
  }
  
  lib.finishDefArea= function (area,screenArea) {
    var sxt = screenArea.extent;
    if ((sxt.x < 20) || (sxt.y < 20)) {
      lib.startDefArea(); // a rectangle that is too small is too hard to deal with
      util.myAlert("Alert","Dragged area is too small. Try zooming in, and dragging again");
      return;
    }
    
    
    lib.coverageModified = true;
    
    util.log("area",area.tostring());
    lib.vp.defAreaMode = false;
    lib.vp.selectedArea = area;
    lib.vp.areaEditorActive = true;
    lib.vp.drawEdRect(area,"image","red",false);
    //lib.vp.addOverlay(new imlib.Overlay("newSnap",area));
    $('#cropInstructions').hide();
    $('#selectSnapArea').show();
    $('#snapDetails').show();
    //$('#submitSnap').show();
     
    //lib.enableClickable($('#selectSnapArea'));
    //lib.editSnapDiv.show();
    $('#selectSnapArea').hide();
    $('#areaSelected').show();
   
  }



  lib.createSnapDiv =
    $('<div class="createSnapDiv">' +
          '<div class="createSnapStep"><span>Creating New Annotation</span></div>'+
          '<div class="createSnapStep">Step 1: <span id="areaSelected"><i>Take snapshot: done</i></span><span id="selectSnapArea">Take snapshot</span>'+
             '<span id="cropInstructions">drag box over the desired region</span></div>'+
          '<div class="createSnapStep">Step 2: Enter caption, tags, description</div>'+
          '<div id="snapDetails">' +
          //'<table id="snapFields">' +
            '<div><i>To include links or formatting, use <a href="http://daringfireball.net/projects/markdown/basics" target="idvWindow">Markdown</a></i></div>'+
            '<div class="inputsTD">Caption</div>' +
            '<div><input  id="snapCaption" type="text"/></div>' +
            '<div class="inputsTD">Description</div>' +
            '<div><textarea rows="8"  id="snapDescription"/></div>' +
            '<div >Step 3. Submit</div>'+
            '<div id="createSnapButtons" class="createSnapLine">' +
              '<span id="submitSnap" class="clickableElement">Save</span>'+
              '<span id="cancelSnap" class="clickableElement">Cancel</span>'+
            '</div>' +
          '</div>' +
            
        '</div>');
      
  lib.creatingSnapDiv =
    $('<div class="creatingSnapDiv" id="creatingSnapDiv">One moment </div>');
    
  lib.createSnapDiv.data("initializer",
    function (selsnap) {
      $("#areaSelected").hide();
      $("#selectSnapArea").show();
      $('#snapDetails').css({"margin-top":"20px","margin-left":"20px"});
      util.activateAnchors($('#creoleNote'));
      lib.preCreateSnapShowSnapsMode = lib.showSnapsMode;
      lib.showSnapsButton.hide();
      if (lib.publishButton) lib.publishButton.hide();
      lib.showSnapsMode = 0;
      $('#snapDescription').css({"width":"90%","font-size":"10pt"});
      $('#snapCaption').css({"width":"90%","font-size":"10pt"});

      if (selsnap) {
        $("#submitSnap").html("Update Snapshot");
        //$('#snapFields').show();
        //$("#submitSnap").show();

        $('.createSnapStep').hide();
        //$('#selectSnapArea').hide();//html("Redefine Image Area");
        var snapD = selsnap.snapD;
        util.log("editSnap",snapD);
        lib.immediateZoomToSnap(snapD,2);
        var vp = lib.vp;
        vp.clearOverlays("both");
        var r = snapD.coverage;
        vp.selectedArea = r;
        vp.areaEditorActive = true;
        vp.selectedAreaModified = false;
        //vp.initialSelectedArea = r;
        vp.drawEdRect(r,"image","red",false);
  
        //lib.showOverlayForSnap(snapD,"selectedSnap");
        //lib.enableClickable($('#selectSnapArea'))
       
        $('#snapDetails').show();

        lib.editingSnap = snapD;
        lib.coverageModified = false;
        lib.setSnapFieldValues(snapD);
        lib.vp.addOverlay(new imlib.Overlay("editingSnap",snapD.coverage));
        lib.creatingSnapDiv.html("One moment  ... editing the snapshot")

      } else {
        $("#submitSnap").html("Save");
        $('#selectSnapArea').html("Take Snapshot");
        $('.createSnapStep').show();

        lib.editingSnap = undefined;
       // $('#selectSnapArea').hide();\
       $('#snapDetails').hide();
        lib.creatingSnapDiv.html("One moment  ... creating the snapshot")
       
        $('#snapCaption').attr('value',"");
         $('#snapDescription').attr('value',"");
        lib.startDefArea();
       
      }
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
      var data = {caption:sdata.caption,description:sdata.description};
      if (lib.albumD) data.album = lib.albumD.topic;// there might not be an album yet in the isSnaps case
      data.image = lib.imD.topic;

      if (lib.editingSnap) {
        var url = "/api/editSnap";
        var snapD = lib.editingSnap;
        data.topic=snapD.topic;
        if (lib.vp.selectedAreaModified) {
          data.newCrop = 1;
          var newCoverage = lib.vp.selectedArea;
          data.coverage = newCoverage.externalize();
          snapD.coverage = newCoverage;
        } else {
          data.coverage = snapD.coverage.externalize();
          data.newCrop = 0;
          data.cropid = snapD.cropid;

        }
      } else {
        var url = "/api/addSnap";
        data.coverage = lib.vp.selectedArea.externalize();
        data.newCrop = 0
      }
      lib.vp.deactivateAreaEditor();
     // data.coverage = page.vp.coverage().externalize();
      util.log("api","coverage ",data.coverage);
      var cb = lib.snapCallback;
      function callSnapOp() {
          util.post(url,data,function (rs) {
            util.log("api","data returned",rs);
            lib.exitCreateSnap();
             if (rs.status != "ok") {
               if (rs.msg == "testing") {
                 console.log("TESTING ADDSNAP");
                 return;
               }
               util.logout();
               location.href = "/timeout"
               return;
             }
            cb(rs);
          },"json");
      }
      if (lib.imOnly) {  // now is the time to create or access the snaps album
        nsurl = "/api/newAlbum";
        util.post(nsurl,{image:lib.imD.topic,caption:"Untitled"},function (rs) {
          // ok, now set the vars for the new album
          var atp = rs.value.topic; // the new album's topic
          var alb = {topic:atp,caption:"Untitled",image:lib.topic,owner:idv.loggedInUser};
          lib.albumD = alb;
          lib.albumTopic = atp;
          lib.imOnly = false;
          lib.updateButtonVis();
          data.album = atp;
          callSnapOp();
          var abc = 22;
        });
      } else { 
        callSnapOp();
      }
    }
    
    lib.exitCreateSnap = function () {
      lib.showSnapsButton.show();
      if (lib.publishButton) lib.publishButton.show();
      lib.vp.defAreaMode = false;
      lib.vp.deactivateAreaEditor();
      lib.vp.selectedArea = undefined;
      lib.showSnapsMode = lib.preCreateSnapShowSnapsMode;
      if (lib.showSnapsMode) {
        lib.redisplaySnaps();
      }
  
    }
    lib.cancelTheSnap = function () {
      lib.exitCreateSnap();
      lib.selectPanel(lib.lastPanel);
    
    }
    
    
  
  lib.deleteSnap = function (snap) {
  
    var nsnaps = util.removeFromArray(lib.snaps,snap);
    /*
     ilter(lib.snaps,function (snap){
      var rs = snap.snapD != snapD;
      return rs;
    });
    */
    snap.container.remove();
    var ln = nsnaps.length;
    lib.snapsActive = ln;
    var nsnapDs = [];
    for (var i=0;i<ln;i++) {
      var cs = nsnaps[i].snapD;
      cs.myIndex = i;
      nsnapDs.push(cs);
    }
    lib.snapDs = nsnapDs;
    
    lib.snaps = nsnaps;
    //lib.resetSnapOrdinals();
    lib.selectPanel("snapArray");
    lib.clearSelectedSnaps();
    if (lib.showSnapsMode) lib.redisplaySnaps();
  //  lib.positionSnaps(undefined,true);

  }
    

    
    //lib.editSnapDiv.hide();
 
  
  lib.serverDeleteSnap = function () {
    var url = "/api/deleteSnap";
    var snap = lib.selectedSnap.snapD.topic;
    var data = {"topic":snap};
    util.post(url,data,function (rs) {
      util.log("api","data returned",rs);
      if (rs.status != "ok") {
        util.logout();
        location.href = "/timeout"
        return;
      }

      lib.deleteSnap(lib.selectedSnap.snap);

      //location.reload()
    },"json");      
  }
  
  
  lib.addCreateSnapDiv = function (container) {
    container.append(lib.createSnapDiv);
    container.append(lib.creatingSnapDiv);
    lib.setPanelPanel("createSnap",lib.createSnapDiv);
    lib.setPanelPanel("creatingSnap",lib.creatingSnapDiv);
    //$('#cropInstructions').hide();  
    lib.createSnapDiv.hide();
      lib.selectSnapArea = $('#selectSnapArea');
    //stlib.setClickMethod(lib.selectSnapArea,lib.startDefArea);
    //lib.enableClickable(lib.selectSnapArea);

    lib.setClickMethod($('#submitSnap'),lib.grabTheSnap);
    lib.setClickMethod($('#submitAlbum'),lib.createTheAlbum);
    lib.setClickMethod($('#cancelSnap'),lib.cancelTheSnap);
    
   //pn.height = 200;
    //pn.selfScaling = true;
  

    
  }
  
    
  
    
    
    
  
})();
