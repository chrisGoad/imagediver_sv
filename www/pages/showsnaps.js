
  /* this code manages the overlay  set. There are three states for a snap: selected, outlined, noOverlay (undefined counts as invisible)
    This state is held in the overlayState property of the snapD. updateOverlays() updates the overlays from the snaps
    There are three gglobal variables holding snaps:
    lib.snaps : the thumb elements in the snap arra
    lib.allSelectedSnaps: the big elements for when a snap is selected indexed by topic
    lib.snapDs: the snapDs.
  */
  
  
  
   
(function () {
  
  var lib = page;
  var geom = idv.geom;
  var image= idv.image;
  var com = idv.common;
  var util  = idv.util;

   
  
  lib.clearOverlayState = function () {
    var dfs = lib.showSnapsMode?"outlined":"noOverlay";
    util.arrayForEach(lib.snaps, function (snap) {
      snap.snapD.overlayState = dfs;
    });
  }
  
  
  
  lib.updateOverlays = function (which) {
    var vp = lib.vp;
    if (which == "selected") {
      vp.clearOverlays(1);
    } else if (which == "outlined") {
      vp.clearOverlays(0);
    } else {
      vp.clearOverlays("both");
    }
    util.arrayForEach(lib.snaps, function (snap) {
   // util.arrayForEach(lib.snapDs,function (snapD) {
      var snapD = snap.snapD;
      var st = snapD.overlayState;
      if ((st == "selected") && ((which == "selected") || (which == "both"))  ||
          ((st == "outlined") &&  ((which == "outlined") || (which == "both")))) {
        var cv = snapD.coverage;
        var nm = snapD.topicId;
        var ov = new image.Overlay(nm,cv);
        ov.color = (st == "selected")?"yellow":"red"
    //if (snapD.selected) ov.selected; // this is for the selection in showSnapMode
        vp.addOverlay(ov);
        if (st == "selected") {
          vp.addOverlay(ov,1);
        } 
      }
    });
    //vp.refresh(true);
    if (which == "selected") {
      vp.drawOverlays(1);
    } else if (which == "outlined") {
      vp.drawOverlays(0);
    } else {
      vp.drawOverlays("both");
    }
  }
  
  image.mouseMoveCallback = function (ps) {
    
  }
  // draws a single rect on the specified clip/layer, ignoring other considerations
  lib.drawOneRect = function (r,color,sel) {
    var vp = lib.vp;
    vp.clearOverlay(sel);
    vp.drawRect(r,"image",color,sel);

  }
  
  // returns a count if more than one snap, or no snaps, at ps;  ow returns the snap.
  // 7/26/12 no more multiple selectsl so replace this by selection of a single snap
  lib.computeSnapRelevance = function (ps) {
    return lib.snapHit(ps);
  }
  
  lib.clickSelectedSnaps = function () {
    var rs = [];
    util.arrayForEach(lib.snaps,function (snap) {
      if (snap.snapD.clickSelected) {
        rs.push(snap);
      }
    });
    return rs;
  }
  
  
  
  
  lib.snapsHit = function (ps) {
    var snaps = lib.snaps;
    var ln = snaps.length;
    var rs = [];
    for (var i=0;i<ln;i++) {
      var snapD = snaps[i].snapD;
      var cv = snapD.coverage;
      if (cv.contains(ps)) {
        //util.slog("HIT");
        rs.push(snapD);
      }
    };
    return rs;
  }
  
  lib.closestSnap = function (sns,ps) {
    var mind = 1000000000.0;
    var rs = undefined;
    util.arrayForEach(sns,function (sn) {
      var cv = sn.coverage;
      //var d = cv.distToEdge(ps);
      var d = cv.distToCenter(ps);
      if (d < mind) {
        rs = sn;
        mind = d;
      }
    });
    return rs;  
  }
  
  
  lib.snapHit = function (ps) {
    var snaps = lib.snapsHit(ps);
    return lib.closestSnap(snaps,ps);
  }
 
  
 // takes care of the captions over the snap outlines
  
  image.mouseMoveCallback = function (ps,vps) {
    if (!lib.showSnapsMode) return;
    var snhit = lib.snapHit(ps);
    var dv = lib.vpCapDiv;
    var vp = lib.vp;
    if (snhit) {
      if (vp.cHili != snhit) {
        var cv = snhit.coverage.expand(image.selectStrokeWidth);
        vp.clearOverlay(2);
        if (idv.useFlash) {
          vp.drawImRect(cv,"white",2,false,image.selectStrokeWidth*0.5);
        } else {
          vp.drawRect(cv,"image","white",2);
        }
        vp.cHili = snhit;
      }
     // lib.showSelectedSnap(snhit);  this is kinda cool; EXPERIMENT LATER
      var cpt = snhit.caption;
      if (cpt) {
        dv.show();
        dv.html(util.removeWikiSymbols(snhit.caption));
        dv.css({left:vps.x+13,top:vps.y-13});
      } else {
        dv.hide();
      }
      
    } else {
      dv.hide();
      vp.cHili = null;
      vp.clearOverlay(2);
    }
  }
  
  image.mouseOutCallback = function () {
    lib.vpCapDiv.hide();
  }
 
   // the actions of a multiple selection are not taken until it is clear that this is not a double click
  lib.DclickTimeoutId = undefined; // this will be defined when a wait-for-double click is underway
  
  lib.snapContains = function (snp,p) {
    var snapD = snp.snapD;
    if (snapD == undefined) {
      snapD = snp;
    }
    var cv = snapD.coverage;
    return cv.contains(p);
    
  }
  
  // ps is image  coords; vps is viewport coords
  image.clickCallback = function (ps,vps,dclick) {
    //lib.vpCapDiv.css({left:vps.x,top:vps.y});
    //if (!dclick) lib.preClickSelectedSnap = lib.selectedSnap; // so we know what snap to zoom to if this the first click of a double click
      //if ((lib.currentPanel) && (lib.currentPanel.name == "createSnap")) return; // cannot select when creating a snap
      if (!lib.showSnapsMode) return;
      if (dclick) {
        if (lib.preClickSelSnap) { // this is the snap that was selected just before multiple snaps were selected; get it back, if it is the  one clicked on
          if (lib.snapContains(lib.preClickSelSnap,ps)) {
            lib.setSelectedSnap(lib.preClickSelSnap);
            lib.preClickSelSnap = undefined;
          }
        }
        if (lib.selectedSnap) { // must also verify that the click is inside this snap
          //var cv = lib.selectedSnap.snapD.coverage;
          if (lib.snapContains(lib.selectedSnap,ps)) {
 
            if (lib.DclickTimeoutId) {  // this will occur when the first click selected multiple snaps
              clearTimeout(lib.DclickTimeoutId);
              lib.DclickTimeoutId = undefined;
            }
            lib.vp.setZoom(1);
            lib.animatedZoomToSnap(lib.selectedSnap.snapD,1.1);
           // lib.snapAdvice.html("double click to zoom to the selected snap");
          }
        }
        return; // there is nothing the second click needs to do; either the delayed action will select multipl snaps, or the selection of one snap already happened
      }
      if (!lib.showSnapsMode) {
      var sls = lib.selectedSnap;
      if (!sls) {
        lib.snapAdvice.html("no snap to select");
        return;
      }
      var cv = sls.snapD.coverage;
      var rl = cv.contains(ps);
      if (!rl) {
        lib.snapAdvice.html("no snap selected");
        return;
      }
    
      lib.snapAdvice.html("double click to zoom to the selected snap");
    //console.slog("CLICK CALL BACK",ps);
    }
    var csr = lib.computeSnapRelevance(ps);
    if (typeof csr == "number") { // OBSOLETE OPTION
      util.error("OBSOLETE");
    } 
    lib.preClickSelSnap = undefined;
    lib.selectPanel("selectedSnap");
    lib.showSelectedSnap(csr);
    lib.showSnapsMode = true; // this mode is turned off temporarilty by selecting the snap, but in this case, we want it to stay on

    //lib.showOverlaysForSnaps(lib.snapDs);
  }
  
// is this snap relevant to the current viewport; is its overlap sufficient, or is it contained in the rect
  lib.snapRelevant = function (snapD,rect) {
    var cv = snapD.coverage;
    if (!cv.intersects(rect)) return false;
    var ri = cv.intersect(rect);
    var ria = ri.area();
    var cva = cv.area();
    return ria/cva > 0.4;
  }

  lib.computeSnapVisibility = function () {
    if (lib.leaveSnapVisibilityAlone) return 0;
    if (lib.zooming) return 0; // in the midst of an animated zoom
    // normally this is run for every refresh. But when we have as stable set of snaps in mind, as when computed from a click
    // this flag is turned on
    var vp = lib.vp;
    var vw  = vp.computeCoverage();
    var cnt = 0;
    var ns = lib.snapsActive;
    for (var i =0 ;i<ns;i++) {
      var snapD = lib.snaps[i].snapD;
      snapD.visible = vw.intersects(snapD.coverage);
      if (snapD.visible) cnt++;
      snapD.relevant = lib.snapRelevant(snapD,vw);
    };
    
    if (idv.pageKind == "album") lib.positionSnaps(undefined,true);
    //if (lib.showSnapsMode) lib.showOverlaysForSnaps(lib.snapDs);
    return cnt;
  }
  
  lib.redisplaySnaps = function () {
    lib.computeSnapVisibility();
    lib.snapAdvice.show();
    lib.clearOverlayState(0); // 
    lib.updateOverlays("outlined");
  }
  
  lib.enterShowSnapsMode = function () {
    if (lib.showSnapsMode) return;
    lib.showSnapsMode = true;
    lib.redisplaySnaps();
    //vp.changeViewCallbacks.push(lib.computeSnapVisibility);
    lib.snapAdvice.html(lib.stdSnapAdvice());
    lib.showSnapsButton.html('hide outlines');

    //lib.showOverlaysForSnaps(snapDs);
  }
  
  lib.exitShowSnapsMode = function () {
    if (!lib.showSnapsMode) return;
    lib.vpCapDiv.hide();
    lib.vpSelectDiv.hide(); //zuuub

    lib.showSnapsMode = false;
    var vp = lib.vp;
     lib.showSnapsButton.html('show outlines');
    lib.snapAdvice.html("");
    util.arrayForEach(lib.snaps,function (snap) {
      snap.snapD.clickSelected = false;
    });
    lib.clearOverlayState(); 
    lib.updateOverlays("outlined");
    //if (lib.selectedSnap) lib.snapAdvice.html("double click to zoom to the selected snap");
     lib.snapAdvice.html(lib.stdSnapAdvice());
  }

  lib.ss = function () {
    lib.enterShowSnapsMode();
  }
    
  

})();

  