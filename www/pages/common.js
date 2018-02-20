

// common elements for neo pages



idv.common = {};

idv.css.lightbox = {
  border:"white solid",
   position:"absolute",
   "z-index":2000,
   "background-color":"#444444",
   "color":"white"
};

idv.css.lightbox = {
  border:"white solid",
   position:"absolute",
   "z-index":2000,
   "background-color":"#999999",
   "color":"black"
   
};


idv.SnapD = function () {};
idv.Snap = function () {};


(function () {
  var lib = idv.common;
  var util = idv.util;
  
  lib.genLogo = function () {
    var rs = $('<span class="logoSpan"/>');
    
    var left = $('<span class="logoLeft">image</div>');
    var right = $('<span class="logoRight">Diver</div>');
    
    rs.append(left);
    rs.append(right);
    rs.click(function () {location.href = "/";});
    return rs;
  }
  
  lib.genTitle = function (title) {
    var rs = $('<div class="titleLine"/>');
    rs.append(lib.genLogo());
    var ts = $('<span class="titleSpan2"/>');
    ts.html(title);
    rs.append(ts);
    return rs;
  }
               
  
  lib.genTable = function (nm,rows) {
    var st = '<table>';
    var ln = rows.length;
    for (var i=0;i<ln;i++) {
      st += '<tr id="'+nm+'_row_'+i+'">';
      var cr = rows[i];
      var rln = cr.length;
      for (var j=0;j<rln;j++) {
        var cc = cr[j];
        st += '<td>'+cc+'</td>';
      }
      st += '</tr>';
    }
    st += '</table>';
    return st;
  }
  
  
  
  lib.loadImages = function (ims) {
    var ln = ims.length;
    for (var i=0;i<ln;i++) {
      var ci = ims[i];
      var imel = $('<img>');
      imel.attr("src",ci);
    }
  }
  
  

  
  
  lib.Lightbox = function (container,rect) {
    this.container = container;
    lib.setLightboxRect(this,rect);
  }
  
  lib.setLightboxRect = function (lb,rect) {
    var xt = rect.extent;
    var cr = rect.corner;
    lb.left = cr.x;
    lb.top = cr.y;
    lb.width = xt.x;
    lb.height = xt.y;
  }
  
  lib.Lightbox.prototype.setElementProperties = function () {
    var element = this.element;
    element.css({width:(this.width+"px"),height:(this.height+"px"),
                top:(this.top+"px"),left:(this.left+"px")});
  }
  
  
  lib.Lightbox.prototype.dismiss = function () {
   // this.element.hide();
    var el = this.element;
    el.empty();
    var fr = this.iframe;
    if (fr) fr.attr("width","1px");
    //move it out of the way; hiding has a problem in ff, where a swf embedded in the lightbox fails to refresh properly on reshowing
    var w = $(window);
    var bht = w.height();
    var stop = w.scrollTop();
    //console.log(bht,stop);
    this.element.css({left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});
    this.shade.hide();
    this.close.hide();
    this.loading.hide();
  }
  
   lib.Lightbox.prototype.tempDismiss = function () {
      var w = $(window);
      var bht = w.height();
      var stop = w.scrollTop();
      var ht = this.element.height();
      this.dims.height = ht + "px";
      this.element.css({left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});
      this.shade.hide();
      this.close.hide();
      this.loading.hide();
   }
   
   
   lib.Lightbox.prototype.bringBack= function () {
      this.element.css(this.dims);
      this.shade.show();
      this.close.show();

   }
   
  lib.Lightbox.prototype.pop = function (dontShow,iht) {
    this.setElementProperties();
    var wd = $(document).width();
    //var wd = this.container.width();
    var ht = $(document).height();
    //var ht = this.container.height;
    var w = $(window);
    var stop = w.scrollTop();
    var bht = w.height();
    var bwd = w.width();
    var lwd = this.width;
    /* center the fellow */
    var lft = Math.max((bwd - lwd)/2,50);
    if (iht) {
      var eht = iht;
    } else {
      eht = Math.max(bht - (this.top) - 50,50);
    }
    //console.log("wd "+wd+" ht "+ht+" stop "+stop+"  bht "+bht+" bwd "+bwd+" lwd "+lwd+" lft "+lft);
    this.dims = {width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px")}
    this.element.css(this.dims);
    this.loading.css({top:stop+10});
    if (dontShow) this.loading.hide();
    //this.element.show();
   // this.addClose();
   this.close.show();
    this.shade.css({width:(wd+"px"),height:(ht+"px"),
                top:"0px",left:"0px"});
    if (this.iframe) {
      this.iframe.attr("width",this.width-25);
    }
    if (!dontShow) {
      this.element.show();
      this.shade.show();
    } else {
      this.dismiss();
    }
  }
  
  lib.Lightbox.prototype.setHtml  = function (html) {
      var e = this.element;
      e.empty();
      this.addClose(e);
      var cn = $('<div class="lightboxContent"/>');
      e.append(cn);
      
      cn.html(html);
  }
  
  
  lib.Lightbox.prototype.setWikitext  = function (wtxt) {
      var e = this.element;
      e.empty();
      this.addClose(e);
      var cn = $('<div class="lightboxContent"/>');
      e.html(util.processMarkdown(wtxt));

      //util.creole.parse(e[0],wtxt);
  }

  
  lib.Lightbox.prototype.loadUrl = function (url) {
    var e = this.element;
    this.loading.show();
    e.empty();
    this.addClose(e);
   // var loading = $('<p class="lightboxloading">Loading...</p>');
   // e.append(loading);
    var wd = this.width-25;
    var ifrs = '<iframe class="lightboxiframe" src="'+url+'" frameborder="0" width="'+wd+'" height="100%"/>';
   // console.log(ifrs);
    var ifr = $(ifrs);
    var thisHere = this;
    this.iframe = ifr;
    ifr.load(function () {thisHere.loading.hide();});
    e.append(ifr);
    this.contentWindow = ifr[0].contentWindow;
  }
  

  lib.Lightbox.prototype.afterClose = function () {
    if (this.afterCloseCallback) {
      this.afterCloseCallback();
    }
  }
  
  lib.closeX  = '<div class="closeX" style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>';
   lib.smallCloseX  = '<div class="closeX" style="position:relative;top:-10px;left:7px;padding:2px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:10pt;color:white;float:right">X</div>';
 
  
  lib.Lightbox.prototype.addClose = function (whenClosed) {
    var thisHere = this;
    this.close = $(lib.closeX);
    //$('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>');
    this.close.click(function () {
      thisHere.dismiss();thisHere.afterClose();if (whenClosed) whenClosed();});
    //this.close.click(function () {thisHere.element.empty();thisHere.dismiss();thisHere.afterClose();});
    this.element.append(this.close);
  }

  lib.Lightbox.prototype.render = function (dontDismiss) {
    var thisHere = this;
    var loading = $('<div class="loading">Loading...</div>');
    this.loading = loading;
    this.container.append(loading);
    loading.hide();
    var element = $('<div class="lightbox"/>');
    element.css(idv.css.lightbox); // needed in album_pages where no css is available
    //var wd = $(document).width();
    //var ht = $(document).height();
    var wd =this.container.width();
    if (this.window) {
      var ht = this.window.height();
    } else {
      var ht = $('window').height();
    }
       
    var shades = '<div style="position:absolute;top:0px;left:0px;width:'+wd+'px;height:'+ht+'px;z-index:1500;opacity:0.8;background-color:black;"/>';

    var shade = $(shades);
    this.element = element;
    this.shade = shade;
    this.setElementProperties();
    this.container.append(element);
    this.container.append(shade);
    this.addClose();
    
    if (!dontDismiss) this.dismiss();  
    
  }
  
  
  
  // msg might be a string or an element
  
  lib.Lightbox.prototype.popMessage = function (msg,centerIt) {
    this.pop();
    this.element.empty();
    this.addClose();
    if (typeof(msg) == 'string') {
      var msgdiv = $('<div/>');
      msgdiv.css({"margin":"20px"});
      if (centerIt)  msgdiv.css({'text-align':'center'});
      msgdiv.html(msg);
    } else {
      msgdiv = msg;
    }
    this.element.append(msgdiv);
   
  }
  
 
 
  lib.setRect = function (el,rect,canvas,ocanvas,noHeight) {
    var c = rect.corner;
    var ex = rect.extent;
    var css = {left:(c.x)+"px",top:(c.y)+"px",width:(ex.x)+"px"};
    if (!noHeight) css.height = (ex.y)+"px";
    el.css(css);
    if (canvas) {
      canvas.attr("width",rect.extent.x);
      canvas.attr("height",rect.extent.y);
    }
    if (ocanvas) {
      ocanvas.attr("width",rect.extent.x);
      ocanvas.attr("height",rect.extent.y);
    }
  }
  
  
  
  
  
  
  
  
  
  

})();

