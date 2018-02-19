(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;


    lib.snapArrayDiv = $(
      '<div id="snapArray">' +
        '<div id="snapArrayNoSnaps">No snapshots have been added to this album yet</div>'+
        '<div id="snapArrayIntro">Click on snapshot for detail</div>'+
        '<div id="snapArraySnaps"></div>'+
      '</div'
    );
    
   
    //lib.captionDiv = $('<div class="caption"></div>');
    /*
     
    lib.setSnapsMessage = function () {
      var  za = $('#zoomAdvice');
      if (lib.vp.zoom == 1) {
        var msg = "";
      } else {
        msg = "Above snaps include only those visible in the right window";
      }
      za.html(msg);
    }
    
    */
    /*
    lib.setSnapsMessage = function () {
      var  za = $('#zoomAdvice');
      if (lib.vp.zoom == 1) {
        var msg = "all snaps";
      } else {
        msg = "snaps in view";
      }
     // util.slog(msg);
      lib.snapArrayButton.html(msg);
    }
    
    */
    
    lib.checkNoSnaps = function () {
        if (lib.snaps.length == 0) {
        $('#snapArrayNoSnaps').show();
      } else {
        $('#snapArrayNoSnaps').hide();
        lib.positionSnaps(undefined,false,true);
      }
    }
    
    lib.snapArrayDiv.data("initializer",function () {
      lib.checkNoSnaps();
      if (lib.selectedSnaps.length < 2) { // that is unless we are in a multiple snap click-selected situation
        lib.setSelectedSnap(undefined,lib.showSnapsMode?lib.stdSnapAdvice():" ");
      }
    });
   


  lib.snapArrayThumbWidth = function (snapD) {
    var xt = snapD.coverage.extent;
    var aspectRatio =  xt.y/xt.x;
    var snapH = lib.snapThumbHeight;
    return snapH/aspectRatio;
  }

  lib.snapArrayThumbContainerWidth = function (snapD) {
    var tw = lib.snapArrayThumbWidth(snapD);
    var rs = tw + lib.snapThumbMargin * 2;
    if (rs < lib.snapArrayMinThumbWidth) {
      rs = lib.snapArrayMinThumbWidth;
    }
    return rs;
  }
    
  
  lib.fixSnapCoverage = function (snapD) {
    var sc = snapD.shares_coverage;
    if (sc != undefined) {
      var sw = lib.snapDsByTopicNum[sc];
      return snapD.coverage = sw.coverage;
    }
  }
  
  lib.snapWidth = function (snapD) {
    var xt = snapD.coverage.extent;
    var aspectRatio =  xt.y/xt.x;
    var snapH = lib.snapHeight;
    return snapH/aspectRatio;
  }
    
  
    // useThisCapHeight if present has been computed by a previous iteration; if non zero it is the scaled height to use
  lib.setThumbCss = function (snap,left,top,sc,useThisCapHeight) {
    //useThisCapHeight = useThisCapHeight; // leave some space
    sc = Math.max(sc,lib.minSnapScale);
    var snapH = lib.snapThumbHeight;
    var snapBottomMargin = lib.snapThumbBottomMargin;

    var snapCapHeight = lib.snapThumbCaptionHeight;
    if (useThisCapHeight) {
      snapCapHeight = useThisCapHeight/sc + 20; // 20 padding
    }
    var snapW = lib.snapArrayThumbWidth(snap.snapD);
    var snapCW = lib.snapArrayThumbContainerWidth(snap.snapD);
    idv.util.log("snaparray","snapW",snapW,"snapCW",snapCW);
    var imleft = (snapCW - snapW)/2;
   
    var snapCH = snapH + snapBottomMargin + snapCapHeight;  // snap container heigh
    var cnt = snap.container;
    var css = {"border":"solid thin gray",left:sc*left,top:sc*top,width:sc*snapCW,height:sc*snapCH,position:"absolute"};
    cnt.css(css);
    var cse = snap.img;
    cse.css({left:sc*imleft,top:sc*(5+snapCapHeight),width:sc*snapW,height:sc*snapH,position:"absolute"});
   // var cap = snap.caption;
    //cap.css({left:0,top:0,width
    var snapD = snap.snapD;
    snapD.thumbCaptionEl.empty();
    var wikitxt = lib.processWikiText(snapD.thumbCaptionEl,snapD.caption);

    snapD.thumbCaptionEl.html(wikitxt);
    if (useThisCapHeight) {
      var chta = useThisCapHeight + 20; // 20 padding;
    } else {
      var chta = sc*(snapCH - snapH); // available height for caption
    }
    var cht = snapD.thumbCaptionEl.height(); // actual height of caption
    if (cht < 10) cht = 10; // for the null caption case
    var cnt = 0;
    var cap = wikitxt; // snapD.caption;
    if (cap.indexOf("To carry fire")>=0) {
      abc = 22;
    }
    //idv.util.slog("cht",cht,"chta",chta);
    if (lib.shortCaptions) return cht;
//    while ((cht+25 > chta) && (cnt <3)) { // caption won't fit; shorten it
    while ((cht > chta) && (cnt <3)) { // caption won't fit; shorten it
   // if (cht+10 > chta) { // caption won't fit; shorten it
      var cln = cap.length;
      var ratio = chta/(cht);// + 25);
      var nln = Math.max(Math.floor(cln*ratio)-3,1);
      var cap = cap.substr(0,nln);
      snapD.thumbCaptionEl.html(cap);
      cht = snapD.thumbCaptionEl.height(); // actual height of caption
      cnt++;
    }
    if (cnt>0) {
      snapD.thumbCaptionEl.html(cap+"...");
    }
    return cht;
  }
  
  
  lib.mouseenterSnap = function (snap) {
    var snapD = snap.snapD;
    // util.slog("SNAP",snapD.topic,snapD.coverage.corner.y);
    var cv = snapD.coverage;    
    var vp = lib.vp;
    lib.setSelectedSnap(snap,lib.stdSnapAdvice());
   /* if (lib.showSnapsMode) {
      var dv = lib.vpSelectDiv;
      dv.show();
      vp.divToRect(cv,"image",dv);
    } else {  
      vp.drawRect(cv,"image",idv.selectedColor);
    }
   */
    var cnt = snap.container;
    cnt.css({"background-color":"#dddddd"});
   // cnt.css({"background-color":"transparent"});

    var cap = snap.caption;
    cap.css({"color":"black"});
    //var cp = lib.captionDiv;
    //var caption = snap.snapD.caption;
   // if (!caption) caption = "No caption";
    //cp.html(caption);
  }
  
  
  
  lib.mouseleaveSnap = function (snap) {
    // this can be called when the panel is no longer up, causing trouble
    
/*
    if (lib.showSnapsMode) {
      var dv = lib.vpSelectDiv;
      dv.hide(); // zuub
 
    } else {
      lib.vp.clearOverlay("both");
      lib.vp.drawOverlays("both");
    }
*/
    var cnt = snap.container;
    cnt.css({"background-color":"black"});
    var cap = snap.caption;
    cap.css({"color":"white"});
    if (page.currentPanel.name != "snapArray") return;
    lib.setSelectedSnap(undefined,lib.stdSnapAdvice());
   // var cp = lib.captionDiv;
   // cp.empty();
  }
  
  lib.minSnapScale = 0.4;
  
  // mxn is the maximum number of snaps to deal with; an optimiztion for start up when there are many snaps
  
  lib.showAllSnaps = 1; //
  // if iShowAll is undefined use the global lib.showAllSnaps. Ow set the global. Position the snaps
  // if forced, or if the showAll status has changed
  lib.positionSnaps = function (useThisCapHt,force,iShowAll) {
    if (iShowAll == undefined) {
      if (!force) return;
      var showAll = lib.showAllSnaps;
    } else {
      lib.showAllSnaps = iShowAll;
      showAll = iShowAll;
    }
   // util.slog("position snaps "+useThisCapHt,force,iShowAll);
    if (lib.zooming) return;
    var noCapHt = !useThisCapHt;
    if (lib.custom) return;
    var minHt = lib.standardPanelHeight;
    var sc = lib.scale;
    if (lib.twoColumns) {
      var uW = 950; // unscaled width; leave room for the scrollbar
    } else {
      uW = 2000;
      sc = sc * 0.5;
    }
    var mss = lib.minSnapScale;
    var eWd = (sc < mss)?uW * (sc/mss):uW; // the effective unscaled width, taking into accout that snaps are only scaled 
    var wd = 1000;//lib.snapArrayDiv.width();
    var snaps = lib.snaps;
    var ln = snaps.length;
    var gapX = lib.snapGapX;
    var gapY = lib.snapGapY;
    var snapH = lib.snapThumbHeight;
    var snapCapH = lib.snapThumbCaptionHeight;
    if (useThisCapHt) {
      useThisCapHt = useThisCapHt+10;// leave some space
      snapCapH = useThisCapHt/sc;
    }
    var snapCapBottom = lib.snapThumbBottomMargin;
    var cx = gapX;
    var cy = gapY;
    var noSnaps = true;
    
    if (noCapHt) maxCapHt = 0; else maxCapHt = useThisCapHt;
    var ns = lib.snapsActive;
    for (var i=0;i<ns;i++) {
      var cs = snaps[i];
      var snapD = cs.snapD;
      //if (lib.showSnapsMode && !snapD.relevant) {
      if (snapD.relevant || showAll) {
        cs.container.show();
        noSnaps = false;
      } else {
        cs.container.hide();
        continue;
      }
      var snapW = lib.snapArrayThumbContainerWidth(cs.snapD);//unscaled snapwidth
      nx = cx + snapW + gapX;
      if (nx > eWd) { // the thumb does not fit in this row
        cx = gapX;
        nx = cx + snapW + gapX;
        cy = cy + snapH + snapCapH+ snapCapBottom+ gapY;
      //  idv.util.log("snaparray","cy",cy);
      }
      var cht = lib.setThumbCss(cs,cx,cy,sc,useThisCapHt);
      if (cht > maxCapHt) maxCapHt = cht;
      cx = nx;
    }
    if (!lib.twoColumns) {
      var sht = cy + snapH + snapCapH+ snapCapBottom+ gapY+20;
      // var ht = Math.max(minHt,sht);
     //   idv.util.log("snaparray","ht",sht,cy,snapH,gapY,ht);
      lib.setPanelDivHeight(sc*sht);
    }
     if (noSnaps) {
      $("#snapArrayIntro").html("No snapshot selected");
      lib.hideAllSelectedSnaps();
      return;
    } else {
       $("#snapArrayIntro").html("");//Click on snapshot for detail")      
    }
    if (maxCapHt > 50) maxCapHt = 50;
    if (noCapHt) lib.positionSnaps(maxCapHt,1);//another pass with actual caption heights
   
  }
  
  
  lib.snapArrayDiv.data("resizer",function () {lib.positionSnaps(undefined,true);});
    
  
  lib.snaps = [];
  
  lib.snapDthumb = function (snapD) {
    var tp = snapD.topic;  // hs form /snap/<username>/<imagename/<snapid>
    var tps = tp.split("/");
    var sc = snapD.shares_coverage;
    if (sc != undefined) {
      var snapNum = sc;
    } else {
      snapNum = tps[4];
    }
    var uname = tps[2];
    var bucket = "idv_"+uname;
    if (idv.useS3) {
      //var rs = "http://s3.amazonaws.com/idv/snapthumb/"+tps[2]+"/"+tps[3]+"/"+tps[4]+".jpg";
      var rs = "http://"+bucket+".s3.amazonaws.com/snapthumb/"+tps[3]+"/"+snapNum+".jpg";
      //var rs = "http://"+bucket+".s3.amazonaws.com/snapthumb/"+tps[3]+"/"+snapNum+".jpg";
      //var rs = "http://imagediver.s3.amazonaws.com/snapthumb/"+tps[3]+"/"+snapNum+".jpg";
      var rs = "http://"+idv.cfDomain+ "/snapthumb/"+tps[2]+"/"+tps[3]+"/"+snapNum+".jpg";
   } else {
      var rs = "/snapthumb/"+tps[2]+"/"+tps[3]+"/"+snapNum+".jpg";
    }
   return rs;
  }
  
  
  lib.snapDfullsize = function (snapD) {
   
    var tp = snapD.topic; // hs form /snap/<username>/<imagename/<snapid>
    var tps = tp.split("/");
    var sc = snapD.shares_coverage;
    if (sc != undefined) {
      var snapNum = sc;
    } else {
      snapNum = tps[4];
    }
    //tilingUrl = "http://idv.amazonaws.com/tilings/"+uname+"/"+imname+"/";
    //var rs = "/snap/fullsize/"+tps[2]+"/"+tps[3]+"/"+tps[4]+".jpg";
    var uname = tps[2];
    var bucket = "idv_"+uname;
    if (idv.useS3) {
      //var rs = "http://"+bucket+".s3.amazonaws.com/snap/"+tps[3]+"/"+snapNum+".jpg";
      var rs = "http://"+idv.cfDomain+"/snap/"+tps[2]+"/"+tps[3]+"/"+snapNum+".jpg";
    } else {
      rs = "/snap/"+tps[2]+"/"+tps[3]+"/"+snapNum+".jpg";
    }
    return rs;
  }
  
  lib.showSnapsMode = false; // a global mode wherein snaps in the current view re shown
  lib.snapDsByTopic = {};
  lib.addSnap = function(snapD,editingSnap) {
    if (editingSnap) { // updating this snap
     var dst = editingSnap;
     util.setProperties(dst,snapD,["caption","description"]);
    } else {
      dst = snapD;
    }
    dst.coverage = geom.internalizeRect(snapD.coverage);
    var imsrc = lib.snapDthumb(snapD);
      //var im= document.createElement('img');
    if (editingSnap) {
      var imjq = editingSnap.thumbImageEl;
    } else {
      var thumbc = $("<div class='thumbc'/>");
      var caption = $("<div class='thumbCaption'></div>");
      snapD.thumbCaptionEl = caption;
      thumbc.append(caption);
      //caption.html(snapD.caption);
      var imjq = $("<img class='thumb' />");
      snapD.thumbImageEl = imjq;
      thumbc.append(imjq);
      lib.snapArraySnapsDiv.append(thumbc);
      thumbc.click(function (){lib.vp.setZoom(1);lib.showSelectedSnap(snapD)});
      var esd = {snapD:snapD,container:thumbc,img:imjq,caption:caption};
      thumbc.mouseenter(function (){lib.mouseenterSnap(esd)});
      thumbc.mouseleave(function (){lib.mouseleaveSnap(esd);});
      thumbc.mousedown(function (e){e.preventDefault();});
      lib.snaps.push(esd);
      var tp = snapD.topic;
      lib.snapDsByTopic[tp] = snapD;
    }

     util.log("imsrc",imsrc);
     imlib.loadImage(imjq,imsrc);
    // imjq.attr("src",imsrc);
     //imjq.css({left:0,top:0,width:50,height:25,position:"absolute"});
    
  }
  
  lib.anyCaptions = function () {
    var ln = snapDs.length;
    for (var i=0;i<ln;i++) {
      var sd = snapDs[i];
      if (sd.caption) return true;
    }
    return false;
  }
  
  lib.longCaptions = function (cln) {
    var ln = snapDs.length;
    for (var i=0;i<ln;i++) {
      var sd = snapDs[i];
      if (sd.caption && sd.caption.length > cln) return true;
    }
    return false;
  }
  
  lib.snapsReady = false;
  
  lib.snapsActive = 0; // for initializing, we start with fewer than the whole snap set
  lib.addSnaps = function (mxn) {
    var ln = snapDs.length;
    if (!lib.custom) {
      if (!lib.anyCaptions()) {
       lib.snapThumbCaptionHeight = 20;
      }
      if (!lib.longCaptions(12)) {
        lib.shortCaptions = true;
       lib.snapThumbCaptionHeight = 40;
      }
    }
    if (ln > mxn) {
      var ns = mxn;
      var rs = false;
    } else {
      ns = ln;
      rs = true;
    }
    lib.snapsActive = ns;
    for (var i=0;i<ns;i++) {
      var sd = snapDs[i];
      sd.ordinal = i; // later the ordinal will be in the snap
      lib.addSnap(sd);
    }
    if (!lib.custom) lib.positionSnaps(undefined,true,true);
    if (rs) lib.snapsReady = true;
    return rs;
    //lib.ssDiv.click(function (){alert(555);});
  }
  
  
  lib.addSnapArrayDiv = function (container) {
    container.append(lib.snapArrayDiv);
     lib.setPanelPanel("snapArray",lib.snapArrayDiv);
    //lib.snapArrayDiv.append(lib.captionDiv);
    lib.snapArrayDiv.css({width:"100%"});
    lib.snapArraySnapsDiv =  $('#snapArraySnaps');

  }
  
  
  lib.internalizeSnapD = function (snapD,sc) {
    var cv = snapD.coverage;
    var ext = cv.extent;
    var crn = cv.corner;
    var nc = {extent:{x:ext.x * sc,y:ext.y * sc}, corner:{x:crn.x * sc,y:crn.y* sc}};
    snapD.coverage = nc;
  }
})();

