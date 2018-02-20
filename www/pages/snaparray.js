(function () {
  
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;



    lib.snapArrayDiv = $(
      '<div id="snapArray">' +
        '<div id="snapArrayNoSnaps">No snapshots have been added to this album yet</div>'+
        '<div id="snapArrayIntro">Click on snapshot for detail</div>'+
        '<div id="snapArraySnaps"></div>'+
      '</div'
    );
    
    
    lib.checkNoSnaps = function () {
        if (lib.snaps.length == 0) {
        $('#snapArrayNoSnaps').show();
        $('#snapArrayIntro').hide();
      } else {
        $('#snapArrayNoSnaps').hide();
         $('#snapArrayIntro').show();
       lib.positionSnaps(undefined,false,true);
      }
    }
    
    lib.snapArrayDiv.data("initializer",function () {
      //lib.checkNoSnaps();
       $('#snapArrayNoSnaps').hide();
        $('#snapArrayIntro').hide();

      if (lib.selectedSnaps.length < 2) { // that is unless we are in a multiple snap click-selected situation
        lib.setSelectedSnap(undefined,lib.showSnapsMode?lib.stdSnapAdvice():" ");
      }
      lib.positionSnaps(undefined,false,true);

    });
   

  lib.minAspectRatio = 0.82;
  lib.snapArrayThumbWidth = function (snapD) {
    var xt = snapD.coverage.extent;
    var aspectRatio =  Math.max(lib.minAspectRatio,xt.y/xt.x);
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
    //var sc = snapD.cropid;
    if (sc >  0) {
      var sw = lib.snapDsByTopicNum[sc];
      snapD.coverage = sw.coverage;
      snapD.cropid = sw.cropid;
    }
  }
  
  idv.SnapD.prototype.width = function () {
  //lib.snapWidth = function (snapD) {
    var xt = this.coverage.extent;
    var aspectRatio =  xt.y/xt.x;
    var snapH = lib.snapHeight;
    return snapH/aspectRatio;
  }
    
  
    // useThisCapHeight if present has been computed by a previous iteration; if non zero it is the scaled height to use
    // tooWideScale is defined if the snap doesn't fit in the panel, and must be scaled down
    
    // returns [<capHt>,<snapHt>]
   // left,top are unscaled
  
  idv.Snap.prototype.setThumbCss = function (left,top,sc,useThisCapHeight) {
  //lib.setThumbCss = function (snap,left,top,sc,useThisCapHeight) {
    var snap = this;
    //useThisCapHeight = useThisCapHeight; // leave some space
    if (useThisCapHeight) {
      //debugger;
    }
   sc = Math.max(sc,lib.minSnapScale);
    var snapH = lib.snapThumbHeight;
    var snapBottomMargin = lib.snapThumbBottomMargin;

    var snapCapHeight = lib.snapThumbCaptionHeight;
    if (useThisCapHeight) {
      var aaa = 22;
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
    var cap = util.removeWikiSymbols(snapD.caption);

    if (useThisCapHeight) {
      var chta = useThisCapHeight;// + 20; // 20 padding;
    } else {
      var chta = sc*(snapCH - snapH); // available height for caption
    }
    snapD.thumbCaptionEl.html(cap);
    var cht = snapD.thumbCaptionEl.height(); // actual height of caption
    if (cht < 10) cht = 10; // for the null caption case
    var cnt = 0;
   
    if (lib.shortCaptions) return [cht,snapH]
    while ((cht > chta) && (cnt <3)) { // caption won't fit; shorten it
      var cln = cap.length;
      var ratio = chta/(cht);// + 25);
      var nln = Math.max(Math.floor(cln*ratio)-3,1);
     
      
      var cap = cap.substr(0,nln);
      snapD.thumbCaptionEl.html(cap);
      cht = snapD.thumbCaptionEl.height(); // actual height of caption
      cnt++;
    }
    if (cnt>0) {
      snapD.thumbCaptionEl.html("<p>"+cap+"...</p>");
    } else {
      snapD.thumbCaptionEl.html("<p>"+cap+"</p>");
      
    }
    return cht;
  }
  
  
  idv.Snap.prototype.mouseenterSnap = function () {
    var snapD = this.snapD;
    var cv = snapD.coverage;    
    var vp = lib.vp;
    lib.setSelectedSnap(this,lib.stdSnapAdvice());
    var cnt = this.container;
    cnt.css({"background-color":"#dddddd"});

    var cap = this.caption;
    cap.css({"color":"black"});
  }
  
  
  
  idv.Snap.prototype.mouseleaveSnap = function () {
    var snap = this;
    var cnt = snap.container;
    cnt.css({"background-color":"black"});
    var cap = snap.caption;
    cap.css({"color":"white"});
    if (page.currentPanel.name != "snapArray") return;
    lib.setSelectedSnap(undefined,lib.stdSnapAdvice());

  }
  
  lib.minSnapScale = 0.4;
  
  // mxn is the maximum number of snaps to deal with; an optimiztion for start up when there are many snaps
  
  lib.showAllSnaps = 1; //
  // if iShowAll is undefined use the global lib.showAllSnaps. Ow set the global. Position the snaps
  // if forced, or if the showAll status has changed
  lib.positionSnaps = function (rowHeights,force,iShowAll) {
    if (iShowAll == undefined) {
      if (!force) return;
      var showAll = lib.showAllSnaps;
    } else {
      lib.showAllSnaps = iShowAll;
      showAll = iShowAll;
    }
  
    if (lib.zooming) return;
    var firstPass = !rowHeights;
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
    var snapCapBottom = lib.snapThumbBottomMargin;
    var cx = gapX;
    var cy = gapY;
    var cy = 40;
    var noSnaps = true;
    var ns = lib.snapsActive;
    var lastSnapTooWide = false; // where a snap doesn't fit in the available width and must be scaled
    if (firstPass) {
      rowHeights = [];
      maxCapHt = 0;
      
    }
    // rows can have different heights due to different length captions; this is computed in the first pass and used in the second
    var rowNum = 0;
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
        rowNum++;
        if (firstPass) {
          rowHeights.push(Math.min(100,maxCapHt)); 
          maxCapHt = 0;
        } //else {
          //snapCapH = (rowHeights[rowNum]+10)/sc; //leave some space
        //  cy = cy + rowHeights[rowNum] + gapY + snapCapBottom+lib.snapThumbHeight + 30;
        //}
        cy = cy + lastThumbHt + gapY;//rowHeights[rowNum] + gapY + snapCapBottom+lib.snapThumbHeight + 30;

        cx = gapX;
        nx = cx + snapW + gapX;
      }
      if (firstPass) {
        var cht = cs.setThumbCss(cx,cy,sc,undefined); // compute the height
      } else {
        cs.setThumbCss(cx,cy,sc,rowHeights[rowNum]);
        
      }
      var lastThumbHt = cs.container.height()/sc;
      if (cht > maxCapHt) maxCapHt = cht;
      cx = nx;
    }
    rowHeights.push(Math.min(50,maxCapHt)); 
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
       $("#snapArrayIntro").html("Click on snapshot for detail")      
    }
    if (firstPass) lib.positionSnaps(rowHeights,1);//another pass with actual caption heights
   
  }
  
  
  lib.snapArrayDiv.data("resizer",function () {lib.positionSnaps(undefined,true);});
    
  
  lib.snaps = [];
  
  
  idv.SnapD.prototype.imUrl = function(thumb){
    var snapD = this;
    var cv = snapD.coverage;
    var xt = cv.extent;
    var aratio = xt.y/xt.x;
    /* since thumbs are produced at a uniform 100 width, very low aspect ratio */
    var tp = snapD.topic; // hs form /snap/<username>/<imagename/<albumindex>/<snapid>
    var tps = tp.split("/");
    var tpln = tps.length; 
    var uname = tps[2];
    var imname = tps[3];
    var imowner = uname; 
    
    var sc = snapD.cropid;
    if (sc != undefined) {
      var snapNum = sc;
    } else {
      util.error("NO CROPID");
      snapNum = tps[tpln-1];
    }
    var cropId = snapD.cropid;
    if (cropId == undefined) {
      cropId = snapNum;
    }
    if (thumb) {
      var rimd = "snapthumb/" + cropId + ".jpg";
    } else {
      var rimd = "snap/" + cropId + ".jpg";
      
    }
    if (idv.atS3) {
       var rs = util.s3imDir(imowner,imname) + rimd+"?album="+lib.albumString;
   } else {
      var rs = util.localImDir(imowner,imname) + rimd+"?album="+lib.albumString;
    }
   return rs;
    
  }
  
  idv.SnapD.prototype.thumb = function () {
    return this.imUrl(true);
  }
  
  
  idv.SnapD.prototype.fullsize = function () {
    return this.imUrl(false);
  }
  
  
  
  lib.showSnapsMode = false; // a global mode wherein snaps in the current view re shown
  //lib.snapDsByTopic = {};
  lib.snapsByTopic = {};
  
  lib.displayTopicId = 0; //turn on for ordering snaps
  
  lib.showSnapByTopic = function (n) {
    if (n==undefined) {
      n = lib.urlSnap;
    }
    var snd = page.snapDsByTopicNum[n];
    if (snd) {
      lib.showSelectedSnap(snd);
    }
  }
  lib.addSnap = function(isnapD,editingSnap) {
    var snapD = lib.toSnapDObject(isnapD);
    var topicId = util.lastPathElement(snapD.topic);
    snapD.topicId = topicId; // a slight efficiency hack
    
    if (editingSnap) { // updating this snap
     var dst = editingSnap;
     util.setProperties(dst,snapD,["caption","description","cropid"]);
    } else {
      dst = snapD;
    }
    dst.coverage = geom.internalizeRect(snapD.coverage);
    var imsrc = snapD.thumb();
      //var im= document.createElement('img');
    if (editingSnap) {
      var imjq = editingSnap.thumbImageEl;
    } else {
      var thumbc = $("<div class='thumbc'/>");
      var caption = $("<div class='thumbCaption'></div>");
      snapD.thumbCaptionEl = caption;
      if (lib.displayTopicId) {
        thumbc.append(topicId);
      } else {
       thumbc.append(caption);
      }
      //caption.html(snapD.caption);
      var imjq = $("<img class='thumb' />");
      snapD.thumbImageEl = imjq;
      thumbc.append(imjq);
      lib.snapArraySnapsDiv.append(thumbc);
      thumbc.click(function (){lib.vp.setZoom(1);lib.showSelectedSnap(snapD)});
      var esd = new idv.Snap();
      util.setProperties(esd,{snapD:snapD,container:thumbc,img:imjq,caption:caption});
      thumbc.mouseenter(function (){esd.mouseenterSnap()});
      thumbc.mouseleave(function (){esd.mouseleaveSnap();});
      thumbc.mousedown(function (e){e.preventDefault();});
      //esd.ordinal = lib.snaps.length;
      lib.snaps.push(esd);
      //lib.snapDs.push(snapD);
      var tp = snapD.topic;
      //lib.snapDsByTopic[tp] = snapD;
      lib.snapsByTopic[tp] = esd;
      lib.snapsActive = lib.snaps.length;
    }

     util.log("imsrc",imsrc);
     imlib.loadImage(imjq,imsrc);
    // imjq.attr("src",imsrc);
     //imjq.css({left:0,top:0,width:50,height:25,position:"absolute"});
    
  }
  
  lib.anyCaptions = function () {
    var ln = lib.snaps.length;
    for (var i=0;i<ln;i++) {
      var sd = lib.snaps[i].snapD;
      if (sd.caption) return true;
    }
    return false;
  }
  
  lib.longCaptions = function (cln) {
    var ln = lib.snapDs.length;
    for (var i=0;i<ln;i++) {
      var sd = lib.snapDs[i];
      if (sd.caption && sd.caption.length > cln) return true;
    }
    return false;
  }
  
  lib.snapsReady = false;
  
  lib.snapsActive = 0; // for initializing, we start with fewer than the whole snap set
  lib.addSnaps = function (snapDs,mxn) {
    var ln = snapDs.length;
    if (!lib.anyCaptions()) {
     lib.snapThumbCaptionHeight = 20;
    }
    if (!lib.longCaptions(12)) {
      lib.shortCaptions = true;
     lib.snapThumbCaptionHeight = 40;
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
      //sd.ordinal = i; // later the ordinal will be in the snap
      lib.addSnap(sd);
    }
    lib.positionSnaps(undefined,true,true);
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
    if (lib.editPermissions()) {
      $('#snapArrayNoSnaps').html('To add your first annotation, click "new snap"');
      $('#snapArrayNoSnaps').css({'font-size':'15pt'});
    }
    if (lib.imOnly && (!idv.loggedInUser)) {
      var txt = 'If you <a href="http://imagediver.org/login">log in</a>, you will be able to add your own annotations to this image.' +
      'You can log in with your Tumblr account, and in any case registration is quick and free.';
      $('#snapArrayNoSnaps').html(txt);
      $('#snapArrayNoSnaps').css({'font-size':'10pt',"margin":"20pt"});
    }


  }
  
  
  lib.toSnapDObject = function (snd) {
    if (snd instanceof idv.SnapD) return snd;
    var rs = new idv.SnapD();
    util.setProperties(rs,snd);
    return rs;
    
  }
  idv.SnapD.prototype.internalize= function (sc) {
    var cv = this.coverage;
    var ext = cv.extent;
    var crn = cv.corner;
    var nc = {extent:{x:ext.x * sc,y:ext.y * sc}, corner:{x:crn.x * sc,y:crn.y* sc}};
    this.coverage = nc;
  }
})();

