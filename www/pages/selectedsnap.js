
(function () {
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;

  
  lib.allSelectedSnaps = {}; // these are all of the snaps which have been selected at one time or another indexed by topic

  lib.selectedSnaps = []; // this is the currently selected snap if there is just one

  lib.selectedSnap = undefined; // this is the currently selected snap if there is just one
    
  // this computes three Rects which represent the spots to place the prev current and next snap images
  
  
  //lib.copySnapData = function (dst,src) {//  only copies data that will change in this context
 //  util.setProperties(dst,src,["caption","coverage","description"
  lib.setSelectedSnapCallbacks = [];
  /*
  lib.setSelectedSnap = function (s) {
    if (!s) {
      lib.selectedSnap = undefined;
      lib.selectedSnaps = [];
    } else {
      var ss = lib.buildSelectedSnap(s.snapD.topic); 
      lib.selectedSnap = ss;
      lib.selectedSnaps = [ss];
      //lib.allSelectedSnaps[s.snapD.topic] = ss;
    }
    lib.drawSelectedSnaps();
    util.runCallbacks(lib.setSelectedSnapCallbacks);
  }
  */
  
  lib.setSelectedSnaps = function (sns,snapAdvice,noBuild) { 
    //console.trace();
    lib.clearOverlayState();
    var ln = sns.length;
    // util.slog("setSelectedSnap "+ln);
    var sna = snapAdvice;
   var ss = [];
    for (var i=0;i<ln;i++) {
      var sn = sns[i];
      var snapD = sn.snapD;
      snapD.overlayState="selected";
      ss.push(lib.buildSelectedSnap(snapD.topic,true));
    }
    if (ln == 1) {
      lib.selectedSnap = ss[0];
      if (!sna) sna = lib.stdSnapAdvice();

    } else  if (ln==0) {
      lib.selectedSnap = undefined;
      if (!sna) sna = "no snap selected. try again if you like.";

    } else  {
      lib.selectedSnap = undefined;
      if (!sna) sna = "multiple snaps selected. choose one from left panel";
    }
    /*
    if (!lib.showSnapsMode) {
      if (ln==1) {
        sna = "double click to zoom to the selected snap";
      } else {
        sna = "";
      }
    }
    */
    if (sna != "nochange") lib.snapAdvice.html(sna);
    lib.selectedSnaps = ss;
    lib.updateOverlays("selected"); // only update the selected overlays
    util.runCallbacks(lib.setSelectedSnapCallbacks);
  }
  
  
  lib.setSelectedSnap = function (s,snapAdvice,noBuild) { // no building of the snap selection structure needed
    /*var csnap = lib.selectedSnap;
    if (csnap && ((!s) || (csnap.snapD != s.snapD))) {
      lib.hideSelectedSnap(csnap);
     // util.slog("HID SELECTED SNAP");
    }
    */
    if (s) {
      lib.setSelectedSnaps([s],snapAdvice,noBuild);
    } else {
      lib.setSelectedSnaps([],snapAdvice);
    }
  }
  // after a snap is added at the server
  
  lib.snapCallback = function (data) {
    //$('#cropSnapButtons').show();
   // $('#saveSnapButton').show();
    var snapD = data.value;
    if (!lib.editingSnap) {
      snapD.ordinal = lib.snaps.length;
    }
    lib.addSnap(snapD,lib.editingSnap);
    if (lib.editingSnap) {
      lib.showSelectedSnap(lib.editingSnap);
    } else {
      lib.showSelectedSnap(snapD);
      
    }
    //lib.showLowerPanel("snapArrayDiv");
  }
  
  
  lib.editSnap = function () {
    var selsnap = lib.selectedSnap;
    lib.selectPanel("createSnap",selsnap);
  }

  // meaning hide the selected snap view of a snap (not that it is necessarily selected now)
  lib.hideSelectedSnap = function (selsnap) {
    if (!selsnap) {
      selsnap = lib.selectedSnap;
    }
    
    //lib.vp.clearOverlays();
    //lib.setSelectedSnaps([]);
    if (!selsnap) return;
    //lib.hideSnapSelections();
    //var selsnap = lib.selectedSnap;
    if (selsnap.prevThumb) {
      selsnap.prevThumb.hide();
    }
    if (selsnap.nextThumb) {
      selsnap.nextThumb.hide();
    }
    selsnap.element.hide();
    selsnap.bigImg.hide();
    //lib.selectedSnapDiv.hide();
    //lib.snapArrayDiv.show();
  }
  
  lib.hideAllSelectedSnaps = function () {
    util.resetClock();
    var ss = lib.allSelectedSnaps;
    for (var k in ss) {
      var cs = ss[k];
      lib.hideSelectedSnap(cs);
    }
    util.tlog("hideAllSelectedSnaps");
  }
  /* moved to zoom_to_snap.js
  lib.interpolateCoverage = function (startCov,destCov,v) {
    if (v >=1) v = 1;
    var covNow = startCov.interpolate(destCov,v);
    var covRect = geom.internalizeRect(covNow);
    lib.vp.setCoverage(covRect);
    lib.zSlider.positionSliderFromZoom(lib.vp.zoom);
    if (v < 1) {
      setTimeout(function () {lib.interpolateCoverage(startCov,destCov,v+0.1);},50);
    } else {
      page.zooming = false;
      lib.zSlider.setZoom(lib.zSlider.getZoom()); // set the depth and grab tiles
    }
  }
  
  lib.zoomToSnap = function (snapD,scale) {
    if (!scale) scale = 1.1;
    var cov = snapD.coverage;
    var scov = cov.scale(scale);
    var covRect = geom.internalizeRect(scov);
    lib.vp.setCoverage(covRect);
    lib.zSlider.positionSliderFromZoom(lib.vp.zoom);
  }

  lib.animatedZoomToSnap = function (snapD,scale) {
    page.zooming = true;
    var startCov = lib.vp.coverage();
    if (!scale) scale = 1.1;
    var destCov = snapD.coverage.scale(scale);
    lib.interpolateCoverage(startCov,destCov,0);
   
  }
  
  lib.zoomToSelectedSnap = function () {
    lib.vp.setZoom(1);
    lib.animatedZoomToSnap(lib.selectedSnap.snapD,1.1);
  }
    
  */
  lib.thumbWidth = function (snapD) {
    var xt = snapD.coverage.extent;
    var aspectRatio =  xt.y/xt.x;
    var snapH = lib.snapThumbHeight;    
    return snapH/aspectRatio;
  }
    
  lib.positionsForSelectedSnapElements = function (snapC) {
    // treatment of one column; treat available width of panel as 2000, and halve the scaling
    
    var halveHeight = !lib.twoColumns;
    var divW = lib.panelDiv.width();
    if (lib.twoColumns) {
      var uW = 950; // unscaled width; leave room for the scrollbar
    } else {
      uW = 3000;
    }
    var snaps = lib.snaps;
    var snapD = snapC.snapD;
    var o = snapD.ordinal;
    //var sso = {element:ssic,snapD:snapD,prevThumb:prevThumb,nextThumb:nextThumb};
    var prevThumb = snapC.prevThumb;
    var prevNextWidth = lib.prevNextWidth;
    if (!lib.twoColumns) {
      prevNextWidth = 2 * prevNextWidth;
      var availWidthForSnap = uW - 2*prevNextWidth - 400;

    } else {
      var availWidthForSnap = uW - 2*prevNextWidth - 200;
    }
    var rs = {};

    var snapW = lib.snapWidth(snapD);
    var snapH = lib.snapHeight;
    var snapDH = 0;
    if (snapW > availWidthForSnap) {
      
      var snapH = snapH * availWidthForSnap/snapW;
      var snapDH = lib.snapHeight - snapH; // decrease in height from nominal
     idv.util.log("snapW",snapW);
      snapW = availWidthForSnap;
    }
    var snapLeft = (0.5 * (uW - snapW));
    var asnapTop = lib.snapTop + 0.5*snapDH;
    var snapCenterY = asnapTop + 0.5*snapH;
    var snapExtent = new geom.Point(snapW,snapH);
    var snapCorner = new geom.Point(snapLeft,asnapTop);
    rs.snap = new geom.Rect(snapCorner,snapExtent);
    var thumbH = lib.snapThumbHeight;

    var athumbTop = snapCenterY-0.5*thumbH;
    if (prevThumb) {
      var prevSnapC = snaps[o-1];
      var prevSnapD = prevSnapC.snapD;
      var thumbW = lib.thumbWidth(prevSnapD);
      if (thumbW <  lib.snapThumbMinWidth) {
        thumbH = thumbH * (lib.snapThumbMinWidth/thumbW);
        thumbW = lib.snapThumbMinWidth;
        util.log("thumbH",lib.snapThumbMinWidth/thumbW,thumbH);
      }

      if (thumbW > prevNextWidth) {
        thumbH = thumbH * prevNextWidth/thumbW;
        thumbW = prevNextWidth;
      }
      var prevExtent = new geom.Point(thumbW,thumbH);
      var prevCorner = new geom.Point(10,athumbTop);
      rs.prev = new geom.Rect(prevCorner,prevExtent);
      //var pcss = {width:thumbW,height:thumbH};
      //prevThumb.css(pcss);
      //var pccss = {position:"absolute","top":lib.thumbTop,width:thumbW,left:10};
      //$("#selectedSnapPrev").css(pccss);
      //$('#selectedSnapPrevLabel').show();
      //prevThumb.show();
    } 

    var nextThumb = snapC.nextThumb;
    var nextAreaWidth = 0;
    if (nextThumb) {
      var nextSnapC = snaps[o+1];
      var nextSnapD = nextSnapC.snapD;
      var thumbW = lib.thumbWidth(nextSnapD);
      var thumbH = lib.snapThumbHeight;
      var thumbW = lib.thumbWidth(nextSnapD);
      idv.util.log("snapW","thumbW",thumbW,prevNextWidth)
      if (thumbW > prevNextWidth) {
        thumbH = thumbH * prevNextWidth/thumbW;
        thumbW = prevNextWidth;
      }
      var thumbLeft = uW - thumbW - 30;
      var nextExtent = new geom.Point(thumbW,thumbH);
      var nextCorner = new geom.Point(thumbLeft,athumbTop);
      rs.nxt = new geom.Rect(nextCorner,nextExtent);
      //var ncss = {width:thumbW,height:thumbH};
      //nextThumb.css(ncss);
      //var nccss = {position:"absolute","top":lib.thumbTop,left:thumbLeft,width:thumbW};
      //$("#selectedSnapNext").css(nccss);
      //$('#selectedSnapNextLabel').show();
      //nextThumb.show();
    } 
    // this is the part of the panel which must allocated, left and right, to prev,next
    //var availWidthForSnap = divW - 2*prevNextWidth - 100;
   
    return rs;
  }
  
  lib.rectToCss = function (r,sc) {
    if (!sc) sc = 1;
    var c = r.corner;
    var xt = r.extent;
    return {"positions":"absolute","left":sc*c.x,"top":sc*c.y,"width":sc*xt.x,"height":sc*xt.y}
  }
  

  lib.positionPic = function (picElement,container,rect,sc) {
    if (!sc) sc = 1;
    var c = rect.corner;
    var xt = rect.extent;
    picElement.css({width:sc*xt.x,height:sc*xt.y});
    idv.util.log("snapW","actual",xt.x,sc*xt.x);
    var css =  {position:"absolute","top":sc*c.y,left:sc*c.x,width:sc*xt.x};
    container.css(css);
    picElement.show();
  }
  
  lib.mainImage = function (snap) {
    if (snap.bigImageLoaded) {
      return snap.bigImg;
    } else {
      return snap.element;
    }
  }
  
  lib.showMainImage = function (snap) {
     if (snap.bigImageLoaded) {
      util.tlog("SHOWING BIG IMG FOR ",snap.snapD.topic);
      snap.element.hide();
      snap.bigImg.show();
      var rs = snap.bigImg;
    } else {
      util.tlog("SHOWING SMALL IMG FOR ",snap.snapD.topic);
      rs = snap.element;
      snap.element.show();
      snap.bigImg.hide();
    }
    return rs;
  }
  
  
  lib.positionSelectedSnapElements = function (snapC) {
    var sc = lib.scale;
    if (lib.twoColumns) {
      var uW = 950; // unscaled width; leave room for the scrollbar
    } else {
      uW = 3000;
      sc = 0.333333 * sc;
    }
    var mainImg = lib.showMainImage(snapC);
    var positions = lib.positionsForSelectedSnapElements(snapC);
    var divW = lib.panelDiv.width();
    var snaps = lib.snaps;
    var snapD = snapC.snapD;
    var o = snapD.ordinal;
    //var sso = {element:ssic,snapD:snapD,prevThumb:prevThumb,nextThumb:nextThumb};
    var prevp = positions.prev;
    if (prevp) {
      var prevThumb = snapC.prevThumb;
      lib.positionPic(prevThumb,$("#selectedSnapPrev"),prevp,sc);
    }
    var nextp = positions.nxt;
    if (nextp) {
      var nextThumb = snapC.nextThumb;
      lib.positionPic(nextThumb,$("#selectedSnapNext"),nextp,sc);     
    }

    // this is the part of the panel which must allocated, left and right, to prev,next
    var snapp = positions.snap;
    lib.positionPic(mainImg,$('#selectedSnap'),snapp,sc);
    idv.util.log("snaparray","SNAPP",snapp);
    var dW = sc* uW * 0.8; // description width
    var dLeft =sc*uW*0.1;
    var dsTop = sc*(snapp.extent.y + snapp.corner.y) + $('.selectedSnapImages').position().top;
//    var dsTop = sc*(lib.snapHeight + snapp.corner.y) + $('.selectedSnapImages').position().top;
        util.log("snaparray","CORNER",snapp.corner.y);
    var capTop = sc*(snapp.corner.y) + $('.selectedSnapImages').position().top-50;

    util.log("snaparray","DSTOP",dsTop);
        $('#selectedSnapCaption').css({left:dLeft-10,top:capTop,width:dW,"text-align":"center"});

    $('#selectedSnapDescription').css({left:dLeft-10,top:dsTop,width:dW,"text-align":"center"});
    if (snapD.description)  {
       var dht = $("#selectedSnapDescription").height();
    } else {
      dht = 0;
    }
    util.log("dht",dht);
    if (!lib.twoColumns) {
      var ht = lib.theLayout.panelCss.height;
      lib.setPanelDivHeight(ht+dht);
    }
  }
  
  
  
  lib.positionMainImg = function (snapC) {
    var sc = lib.scale;
    if (lib.twoColumns) {
      var uW = 950; // unscaled width; leave room for the scrollbar
    } else {
      uW = 3000;
      sc = 0.333333 * sc;
    }
    var mainImg = lib.showMainImage(snapC);
    var positions = lib.positionsForSelectedSnapElements(snapC);

    // this is the part of the panel which must allocated, left and right, to prev,next
    var snapp = positions.snap;
    lib.positionPic(mainImg,$('#selectedSnap'),snapp,sc);
  }
  
  // direction = -1 or 1
  lib.interpolateSnapElements = function (snapC,direction,v) {
    var sc = lib.scale;
    if (!lib.twoColumns) sc = 0.5*sc;

    var snapD = snapC.snapD;
    var o = snapD.ordinal;
    var snaps = lib.snaps;
    if (o >= snaps.length-1) return;
    var nsnap = snaps[o+1]; // the representation of the snap for the snap array
    var nsnapC = lib.buildSelectedSnap(nsnap.snapD.topic,true);// build the selected snap structure
    
    var p0 = lib.positionsForSelectedSnapElements(snapC);
    var p1 = lib.positionsForSelectedSnapElements(nsnapC);
    var nxtDest = p1.snap; // in going forward, this is the destination of next
    var nxtStart = p0.nxt;
    var nxtNow = nxtStart.interpolate(nxtDest,v);
    var nextThumb = snapC.nextThumb;
    lib.positionPic(nextThumb,$("#selectedSnapNext"),nxtNow,sc);
    var snapDest = p1.prev;
    var snapStart = p0.snap;
    var snapNow = snapStart.interpolate(snapDest,v);
    lib.positionPic(snapC.element,$('#selectedSnap'),snapNow,sc);
  }
  
  lib.buildInterpolators = function (snapC,direction) {
    var rs = [];
    var snapD = snapC.snapD;
    var o = snapD.ordinal;
    var snaps = lib.snaps;
    var numSnaps = snaps.length;
    if (direction == 1) {
      if (o >= numSnaps-1) return;
      var isFirstSnap = o==0;

      var nsnap = snaps[o+1]; // the representation of the snap for the snap array
      var nsnapC = lib.buildSelectedSnap(nsnap.snapD.topic,true);// build the selected snap structure
      
      var p0 = lib.positionsForSelectedSnapElements(snapC);
      var p1 = lib.positionsForSelectedSnapElements(nsnapC);
      if (!isFirstSnap) {
        var prevDest = new geom.Rect(p0.prev.center(),new geom.Point(1,1));
        var prevStart = p0.prev;
        var prevThumb = snapC.prevThumb;
        var intr = {startRect:prevStart,destRect:prevDest,pic:prevThumb,container:$("#selectedSnapPrev")};
        rs.push(intr);
      }
      var nxtDest = p1.snap; // in going forward, this is the destination of next
      var nxtStart = p0.nxt;
      var nextThumb = snapC.nextThumb;
      var intr = {startRect:nxtStart,destRect:nxtDest,pic:nextThumb,container:$("#selectedSnapNext")};
      rs.push(intr);
      var snapDest = p1.prev;
      var snapStart = p0.snap;
      intr = {startRect:snapStart,destRect:snapDest,pic:snapC.element,container:$("#selectedSnap")};
      rs.push(intr);
      var cv0 = snapD.coverage;
      var cv1 = nsnapC.snapD.coverage;
      intr = {startRect:cv0,destRect:cv1,drawRect:true}
      rs.push(intr);
      return rs;
    } else {
      if (o == 0) return;
      var isLastSnap = o == numSnaps-1;
      var isFirstSnap = o==1;
      var nsnap = snaps[o-1]; // the representation of the snap for the snap array
      var nsnapC = lib.buildSelectedSnap(nsnap.snapD.topic,true);// build the selected snap structure
      
      var p0 = lib.positionsForSelectedSnapElements(snapC);
      var p1 = lib.positionsForSelectedSnapElements(nsnapC);
      if (!isLastSnap) {
        var nextDest = new geom.Rect(p0.nxt.center(),new geom.Point(1,1));

        //var nextDest = p0.nxt.plus(new geom.Point(100,0));
        var nextStart = p0.nxt;
        var nextThumb = snapC.nextThumb;
        var intr = {startRect:nextStart,destRect:nextDest,pic:nextThumb,container:$("#selectedSnapNext")};
        rs.push(intr);
      }
      if (!isFirstSnap) {
        var prevDest = p1.snap; // in going forward, this is the destination of next
        var prevStart = p0.prev;
        var prevThumb = snapC.prevThumb;
        var intr = {startRect:prevStart,destRect:prevDest,pic:prevThumb,container:$("#selectedSnapPrev")};
        rs.push(intr);
      }
      var snapDest = p1.nxt;
      var snapStart = p0.snap;
      intr = {startRect:snapStart,destRect:snapDest,pic:snapC.element,container:$("#selectedSnap")};
      rs.push(intr);
      var cv0 = snapD.coverage;
      var cv1 = nsnapC.snapD.coverage;
      intr = {startRect:cv0,destRect:cv1,drawRect:true}
      rs.push(intr);
      return rs;
    }
  }
  
  lib.evalInterpolators = function (interpolators,v) {
    var sc = lib.scale;
    if (!lib.twoColumns) sc = 0.3333*sc;
    var ln = interpolators.length;
    for (var i=0;i<ln;i++) {
      var intr = interpolators[i];
      var st = intr.startRect;
      var dst = intr.destRect;
      var cp = st.interpolate(dst,v);
      if (intr.drawRect) {
        var vp = lib.vp;
        lib.drawOneRect(cp,"yellow",1);
       // lib.drawVpRect(cp);
        //vp.clearOverlay();
        //vp.drawRect(cp,"image",idv.selectedColor);
      } else {
        var pic = intr.pic;
        var container = intr.container;
        lib.positionPic(pic,container,cp,sc);
      }
    }
  }
  
  lib.snapAnimateIncrement = 0.2;
  lib.snapAnimateDelay = 30;
  
  lib.animateSnapTransition = function (interpolators,v,whenDone) {
    if (v >= 1) {
      v = 1;
    }
    //lib.snapAdvice.html("<i>click within selected snap to zoom</i>");

    lib.evalInterpolators(interpolators,v);
    if (v < 1) {
      setTimeout(function () {
        lib.animateSnapTransition(interpolators,v+lib.snapAnimateIncrement,whenDone);
        util.slog("ANIMATE ",v);
        },lib.snapAnimateDelay);
    } else {
        util.slog("ANIMATE DONE");
      whenDone();
    }
  }
  
  
  lib.toNextSnap = function () {
   // lib.exitShowSnapsMode();
    var snaps = lib.snaps;
    var selsnap = lib.selectedSnap;
    $('#selectedSnapPrevLabel').css("color","black");
    //$('#selectedSnapPrev').hide();
    //selsnap.prevThumb.hide();
    var snapD = selsnap.snapD;
    var o = snapD.ordinal;
    if (o >= snaps.length-1) return;
    lib.vp.setZoom(1);
    lib.setSelectedSnaps([],lib.stdSnapAdvice()); 
    
    //lib.hideSnapSelections();
    var ints = lib.buildInterpolators(selsnap,1);
    // big images are hidden during animation
    selsnap.bigImg.hide();
    lib.animateSnapTransition(ints,0, function () {
      var nsnap = snaps[o+1].snapD;
      lib.setSelectedSnap(undefined);
      lib.hideSelectedSnap(selsnap);
      lib.showSelectedSnap(nsnap);
      lib.setSelectedSnap(snaps[o+1]);
     // lib.showMainImage(nsnap);
      $('#selectedSnapPrevLabel').css("color","white");

    });
  }
   
   
  
  lib.toPrevSnap = function () {
  //  lib.exitShowSnapsMode();
    var snaps = lib.snaps;
    var selsnap = lib.selectedSnap;
    $('#selectedSnapNextLabel').css("color","black");

    //$('#selectedSnapPrev').hide();
    //selsnap.prevThumb.hide();
    var snapD = selsnap.snapD;
    var o = snapD.ordinal;
    if (o == 0) return;
    lib.vp.setZoom(1);
    lib.setSelectedSnaps([],lib.stdSnapAdvice()); 
    var ints = lib.buildInterpolators(selsnap,-1);
    lib.animateSnapTransition(ints,0, function () {
      var nsnap = snaps[o-1].snapD;
      lib.hideSelectedSnap();
      lib.showSelectedSnap(nsnap);
      $('#selectedSnapNextLabel').css("color","white");
    });
  }
   
    
  lib.itest  = function (v) {
    var snapC = lib.selectedSnap;
    var ints = lib.buildInterpolators(snapC,1);
    lib.animateSnapTransition(ints,0);
  }
  
    
    
  
  
  // adds the elements needed for a selected snap: image elements for the snap, next and prev
  // the big image is not loaded until it needs to be 
  lib.loadSelectedSnapBigImage = function (ss) {
    var snapD = ss.snapD;
    var tp = snapD.topic;
    if (ss.bigImageLoadStarted) return;
    ss.bigImageLoadStarted = true;
    var ssbe = ss.bigImg;
    var imsrc = lib.snapDfullsize(snapD);
    util.slog("STARTING LOAD OF BIG IMAGE ",tp);

    ssbe.load(function () {
 //       $('#loadingMsg').hide();
        util.slog("LOADED BIG IMAGE ",tp);
        ss.bigImageLoaded = true;

        if (lib.selectedSnap && (ss.snapD.topic == lib.selectedSnap.snapD.topic)) {
          util.slog("POSITIONED BIG IMAGE");
          ss.element.hide();
          lib.positionMainImg(ss);
          ssbe.show();
        } else {
          ssbe.hide();
        }
    });
    ssbe.attr("src",imsrc);
  }
  
  lib.buildSelectedSnap = function (tp,hide) {
    var sso = lib.allSelectedSnaps[tp];
    if (sso) {
      if (!hide) {
        lib.loadSelectedSnapBigImage(sso);
      }
      return sso; // already there
    }
    var snapD = lib.snapDsByTopic[tp];
    var o = snapD.ordinal;
    var snaps = lib.snaps;
    var sln = snaps.length;
    var prevThumb = null;
    var nextThumb = null;
    var prev = $('#selectedSnapPrev');
    var next = $('#selectedSnapNext');
    if (o > 0) {
      var prevSnapC = snaps[o-1];
      var prevSnapD = prevSnapC.snapD;
      var prevThumb = $("<img draggable='false' class='thumb' />");
      prev.append(prevThumb);
      var imsrc = lib.snapDthumb(prevSnapD);
      prevThumb.attr("src",imsrc);
      if (hide) prevThumb.hide();
    }

    if (o < sln-1) {
      var nextSnapC= snaps[o+1];
      var nextSnapD = nextSnapC.snapD;
      var nextThumb = $("<img class='thumb' />");
      next.append(nextThumb);
      var imsrc = lib.snapDthumb(nextSnapD);
      nextThumb.attr("src",imsrc);
      if (hide) nextThumb.hide();
    }

    var sse = $('<img id="'+tp+'"/>');
    var ssbe = $('<img id="/big/'+tp+'"/>');

    //ss.bigImg = ssbe; //well at  least it's loading
 
    var ssic = $('#selectedSnap');
    var snapW = lib.snapWidth(snapD);
    ssic.append(sse);
    ssic.append(ssbe);
    //lib.selectedSnapDiv.append(sse);
    //var imsrc = lib.snapDfullsize(snapD);
    var imsrc = lib.snapDthumb(snapD); //zubzub
    var sso = {element:sse,bigImg:ssbe,snapD:snapD,prevThumb:prevThumb,nextThumb:nextThumb};
    if (hide) {
      var whenLoaded = function (imel) {
        if (lib.selectedSnap && (tp == lib.selectedSnap.snapD.topic)) {
          lib.positionMainImg(sso);
        } else {
          imel.hide(); // hide it if it isn't the current image
        }
      };
    } else {
      whenLoaded = undefined;
    }
    imlib.loadImage(sse,imsrc,whenLoaded,true);
    //sse.attr("src",imsrc);
    if (!hide) {
      lib.loadSelectedSnapBigImage(sso);
    }
    //sse.attr("src",imsrc);
    lib.allSelectedSnaps[tp] = sso;
    return sso;
  }

      //    var sso = {element:sse,snapD:snapD,prevThumb:prevThumb,nextThumb:nextThumb};

  lib.showSelectedSnap = function(snapD) {
   /* var csnap = lib.selectedSnap;
    if (csnap && (csnap.snapD != snapD)) {
      lib.hideSelectedSnap(csnap);
    }
   */
   lib.hideAllSelectedSnaps(); // overkill perhaps; an intermittent bug was leaving some visible
    var snapNum = lib.pathLast(snapD.topic);
    //window.location.hash = "snap="+snapNum; Later
    $('#selectedSnapPrev').show();
    var snapCount = lib.snaps.length;
    var isLastSnap = (snapD.ordinal + 1) ==snapCount;
    if (isLastSnap) {
      $('#selectedSnapNext').hide();
    } else {
      $('#selectedSnapNext').show();
    }
    if (snapD.ordinal == 0) {
      $('#selectedSnapPrev').hide();
    } else {
      $('#selectedSnapPrev').show();
    }      
    var lastSnap = lib.selectedSnap;
    if (snapD) {
      lib.nowSelectedSnapD = snapD;
    } else {
      snapD = lib.nowSelectedSnapD;
    }
    
    var caption = snapD.caption;
    var description = snapD.description;
    if (!caption) {
      caption = "";
    }
    var wtdst = $('#selectedSnapCaption');
    wtdst.empty();
    lib.processWikiText( wtdst,caption);
    //$('#selectedSnapCaption').html(caption);
    var ssd = $('#selectedSnapDescription');
    if (description) {
      ssd.show();
      if (description.length < 50) {
       ssd.css("text-align","center");
      } else {
       ssd.css("text-align","left");
      }
    } else {
      ssd.hide();
      
    }
    wtdst = $('#selectedSnapDescription');
    wtdst.empty();
    lib.processWikiText( wtdst,description);

    //$('#selectedSnapDescription').html(description);
    lib.selectPanel("selectedSnap",null,true); // true : dont call initializer
    lib.permissionsForSelectedSnap();
    //if (!lib.showSnapsMode) { //zuub
   // lib.exitShowSnapsMode();
    //  lib.showOverlayForSnap(snapD,"selectedSnap");
   // }

    if (lastSnap) { //hide the previous fellows
      lastSnap.element.hide();
      lastSnap.bigImg.hide();
      if (lastSnap.prevThumb) lastSnap.prevThumb.hide();
      if (lastSnap.nextThumb) lastSnap.nextThumb.hide();
    }
    var sso = lib.buildSelectedSnap(snapD.topic);
    lib.setSelectedSnap(sso);
    
    //lib.selectedSnap = sso;
    lib.positionSelectedSnapElements(sso);
    return;
  }


  lib.selectedSnapDiv =  $(
    '<div class="selectedSnap">'+
      '<div id="yesSnaps">'+
      '<div class="selectedSnapControls" >'+
        //'<input id="hideSelectedSnap" type="button" value="Back to Snaps"/>'+
        '<div id="zoomAdvice"><i>Click on central image to zoom to the snap</i></div>' +
     //   '<span id="zoomToSnap" class="clickableElement">Zoom To</span>'+
        //'<input id="zoomToSnap" type="button" value="Zoom To"/>' +
        '<span id="editSnap" class="clickableElement">Edit</span>'+
        '<span id="deleteSnap" class="clickableElement">Delete</span>'+
      '</div>'+
      '<div id="selectedSnapCaption"/>'+
      '<div class="selectedSnapImages">'+
        '<div id="selectedSnapPrev">'+
          '<div  id="selectedSnapPrevLabel" class="prevNextLabel">PREV</div>'+
          '<div id="prevSnapImageContainer" class="imageContainer"/>'+
        '</div>'+
        '<div id="selectedSnap">'+
           '<div id="loadingMsg"> loading ... <img src="/ajax-loader.gif"/></div>' +
      //    '<div id="selectedSnapImageContainer" class="imageContainer"/>'+
        '</div>'+
        '<div id="selectedSnapNext">'+
          '<div  id="selectedSnapNextLabel" class="prevNextLabel">NEXT</div>'+
          '<div id="nextSnapImageContainer" class="imageContainer"/>'+
        '</div>'+
        '<div id="selectedSnapIncoming"/>'+
        '<div id="selectedSnapOutgoing"/>'+
       
      '</div>'+
      '<div id="selectedSnapDescription"/>' +
      '</div>' +
    '</div>');
  
  
    
    lib.permissionsForSelectedSnap = function () {
      if (lib.myAlbum) {
        $('#deleteSnap').show();
        $('#editSnap').show();
      } else {
        $('#deleteSnap').hide();
        $('#editSnap').hide();
      }
    }
    
    
    lib.selectedSnapDiv.data("resizer",function () {
      if (lib.selectedSnap) {
        lib.positionSelectedSnapElements(lib.selectedSnap);
      }
    });

    
    lib.selectedSnapDiv.data("initializer",function () {
      lib.permissionsForSelectedSnap();

      if (lib.snaps.length == 0) {
        $('#noSnaps').show();
        lib.setPanelDivHeight(lib.defaultPanelHeight);
        $('#yesSnaps').hide();
        return;
      } else {
        $('#noSnaps').hide();
        $('#yesSnaps').show();
      }
        
      if (lib.selectedSnap) {
        lib.positionSelectedSnapElements(lib.selectedSnap);
        return;
      }
      //lib.selectedSnap = lib.snaps[0];
      if (lib.snaps.length == 0) {
        
      } else {
        lib.showSelectedSnap(lib.snaps[0].snapD);
      }
    });


  lib.addSelectedSnapDiv = function (container) {
    container.append(lib.selectedSnapDiv);
    lib.setPanelPanel("selectedSnap",lib.selectedSnapDiv);
    $('#selectedSnapPrev').click(lib.toPrevSnap);
    $('#selectedSnapPrev').mousedown(function (event){event.preventDefault();});
    lib.selectedSnapNext = $('#selectedSnapNext');
    $('#selectedSnapNext').click(lib.toNextSnap);
    $('#selectedSnapNext').mousedown(function (event){event.preventDefault();});
    $('#editSnap').click(lib.editSnap);
    lib.setClickMethod($('#zoomToSnap'),lib.zoomToSelectedSnap);
    $('#selectedSnap').click(lib.zoomToSelectedSnap);
    $('#deleteSnap').click(function (){lib.selectPanel("deleteSnap");});
    lib.selectedSnapDiv.css({width:"100%"});//,height:"100%"});
    $('#loadingMsg').hide();

  }
  
})();
