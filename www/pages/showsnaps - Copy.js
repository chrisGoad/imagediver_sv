(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;
  
  /* this code manages the overlay  set. There are three states for a snap: selected, outlined, noOverlay (undefined counts as invisible)
    This state is held in the overlayState property of the snapD. updateOverlays() updates the overlays from the snaps
    There are three gglobal variables holding snaps:
    lib.snaps : the thumb elements in the snap arra
    lib.allSelectedSnaps: the big elements for when a snap is selected indexed by topic
    lib.snapDs: the snapDs.
  */
  
  lib.clearOverlayState = function () {
    var dfs = lib.showSnapsMode?"outlined":"noOverlay";
    util.arrayForEach(lib.snapDs, function (snapD) {
    util.arrayForEach(lib.snaps, function (snap) {
      snap.snapD.overlayState = dfs
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
    util.arrayForEach(lib.snapDs,function (snapD) {
      var st = snapD.overlayState;
      if ((st == "selected") && ((which == "selected") || (which == "both"))  ||
          ((st == "outlined") &&  ((which == "outlined") || (which == "both")))) {
        var cv = snapD.coverage;
        var nm = snapD.topicId;
        var ov = new imlib.Overlay(nm,cv);
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
  
  imlib.mouseMoveCallback = function (ps) {
    
  }
  // draws a single rect on the specified clip/layer, ignoring other considerations
  lib.drawOneRect = function (r,color,sel) {
    var vp = lib.vp;
    vp.clearOverlay(sel);
    vp.drawRect(r,"image",color,sel);

  }
  
  // returns a count if more than one snap, or no snaps, at ps;  ow returns the snap.
  lib.computeSnapRelevance = function (ps) {
    var cnt = 0;
    var theSnap;
    //var ovs = lib.vp.overlays;
    util.arrayForEach(lib.snapDs,function (snapD) {
      var cv = snapD.coverage;
      var rl = cv.contains(ps);
      //if (rl) console.log(snapD,cv,ps,rl);
      snapD.relevant = rl;
      snapD.clickSelected = rl;
      /*
       var ov = ovs[snapD.topicId];
      if (ov) {
        ov.selected = rl;
      }
      */
      if (rl) {
        theSnap = snapD;
        cnt++;
      }
    });
    if (cnt == 1) return theSnap; else return cnt;
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
  
  
  lib.snapHit = function (ps) {
    var snapDs = lib.snapDs;
    var ln = snapDs.length;
    for (var i=0;i<ln;i++) {
      var snapD = snapDs[i];
      var cv = snapD.coverage;
      if (cv.contains(ps)) return snapD;
    };
  }
  
 // takes care of the captions over the snap outlines
  imlib.mouseMoveCallback = function (ps,vps) {
    if (!lib.showSnapsMode) return;
    var snhit = lib.snapHit(ps);
    var dv = lib.vpCapDiv;
    if (snhit) {
     // lib.showSelectedSnap(snhit);  this is kinda cool; EXPERIMENT LATER
      var cpt = snhit.caption;
      if (cpt) {
        dv.show();
        dv.html(util.removeWikiSymbols(snhit.caption));
        dv.css({left:vps.x+13,top:vps.y-13});
      }
    } else {
      dv.hide();
    }
  }
  
  imlib.mouseOutCallback = function () {
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
  imlib.clickCallback = function (ps,vps,dclick) {
    //lib.vpCapDiv.css({left:vps.x,top:vps.y});
    //if (!dclick) lib.preClickSelectedSnap = lib.selectedSnap; // so we know what snap to zoom to if this the first click of a double click
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
    function selectMultipleSnaps() {
      lib.leaveSnapVisibilityAlone = true;
      lib.selectPanel("snapArray");
      lib.leaveSnapVisibilityAlone = false;
      lib.positionSnaps(undefined,true,false); // capht, force, showall
      lib.enableClickable(lib.snapArrayButton);
      lib.DclickTimeoutId = undefined;
      lib.preClickSelSnap = undefined;
      lib.snapAdvice.html("multiple snaps selected. choose one from left panel");
          
    }
    if (typeof csr == "number") {
      lib.preClickSelSnap = lib.selectedSnap;
      var csls = lib.clickSelectedSnaps();
      lib.setSelectedSnaps(csls,"nochange");
      lib.DclickTimeoutId = setTimeout(selectMultipleSnaps,imlib.dclickInterval+50);
      return;
    //lib.setSnapsMessage();
      //lib.snapArrayButton.html("all snaps in view");
      
      //    lib.showOverlaysForSnaps(lib.snapDs);

    } else {
      lib.preClickSelSnap = undefined;
      lib.showSelectedSnap(csr);
      lib.selectPanel("selectedSnap");
    }
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
      var snapD = snapDs[i];
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
    lib.showSnapsButton.html('hide outlines');
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
    //lib.showOverlaysForSnaps(snapDs);
  }
  
  lib.exitShowSnapsMode = function () {
    if (!lib.showSnapsMode) return;
    lib.vpCapDiv.hide();
    lib.vpSelectDiv.hide(); //zuuub

    lib.showSnapsMode = false;
    var vp = lib.vp;
    //util.removeFromArray(vp.changeViewCallbacks,lib.computeSnapVisibility);
    //vp.clearOverlay();
    //vp.clearOverlays();
    lib.showSnapsButton.html('show outlines');
    lib.snapAdvice.html("");
    util.arrayForEach(lib.snapDs,function (snapD) {
      snapD.clickSelected = false;
    });
    lib.clearOverlayState(); 
    lib.updateOverlays("outlined");
    //if (lib.selectedSnap) lib.snapAdvice.html("double click to zoom to the selected snap");
     lib.snapAdvice.html(lib.stdSnapAdvice());
  }

  lib.ss = function () {
    lib.enterShowSnapsMode();
  }
  /*
  lib.showOverlaysForSnaps = function (snapDs) {
    var vp = lib.vp;
    vp.clearOverlay();
    vp.clearOverlays();
    util.arrayForEach(snapDs,function (snapD) {if (snapD.visible) lib.showOverlayForSnap(snapD);});
    vp.drawOverlays("both");
  }
  */
  // ok now the handling of selected snaps. These are handled with divs.
  /*
  lib.selectDivs = [];
  
  lib.allocateSelDivs = function (n) {
    var divs = lib.selectDivs;
    var ln = divs.length;
    if (n <= ln) return;
    for (var i = ln; i<n;i++) {
      var cdv =  $('<div class="vpSelect" id="vpSelect" style="margin:0px;padding:0px;position:absolute;background-color:transparent;font-size:8pt;z-index:2000;border:solid yellow;border-width:2px;"></div>');
      lib.vpDiv.append(cdv);
      lib.selectDivs.push(cdv);
    }
  }
  
  lib.drawVpRect = function (r) {
      lib.allocateSelDivs(1);
      var dv = lib.selectDivs[0]
      dv.show();
      lib.vp.divToRect(r,"image",dv);
  }
  lib.drawSelectedSnaps = function () {
    var snps = lib.selectedSnaps;
    var ln = snps.length;
    var vp = lib.vp;
    lib.allocateSelDivs(ln);
    for (var i=0;i<ln;i++) {
      var dv = lib.selectDivs[i];
      dv.show();
      var s = snps[i];
      vp.divToRect(s.snapD.coverage,"image",dv);
    }
    var fln = lib.selectDivs.length;
    for (var i=ln;i<fln;i++) {
      lib.selectDivs[i].hide();
    }
  }
  

  lib.hideSnapSelections = function () {
   var fln = lib.selectDivs.length;
    for (var i=0;i<fln;i++) {
      lib.selectDivs[i].hide();
    }
  }
 
  */
    


})();

