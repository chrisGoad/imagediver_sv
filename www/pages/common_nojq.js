

// common elements for neo pages



idv.common = {};

idv.css.lightbox = {
  border:"white solid",
   position:"absolute",
   "zIndex":2000,
   "backgroundColor":"#444444",
   "color":"white"
};

idv.css.lightbox = {
  border:"white solid",
   position:"absolute",
   "zIndex":2000,
   "backgroundColor":"#999999",
   "color":"black"
   
};


abcd = 22;


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
  
  

  
  
  lib.Lightbox = function () {
    
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
    //var el = this.element[0];
    //el.empty();
    var fr = this.iframe;
    if (fr) fr.setAttribute("width","1px");
    //move it out of the way; hiding has a problem in ff, where a swf embedded in the lightbox fails to refresh properly on reshowing
    var w = window;
    var bht = lib.windowHeight();
    var b = document.getElementsByTagName('body')[0];
    var stop = b.scrollTop;
    //console.log(bht,stop);
    util.extend(this.element.style,{left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});
    this.shade.style.display = "none";
    this.close.style.display = "none";
    this.loading.style.display = "none";
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
      util.creole.parse(e[0],wtxt);
  }

  
  lib.Lightbox.prototype.loadUrl = function (url) {
    var e = this.element;
    //this.loading.show(); @todo put back
    //e.empty();
    //this.addClose(e);
   // var loading = $('<p class="lightboxloading">Loading...</p>');
   // e.append(loading);
    //var wd = this.width-25;
    var wd = lib.windowWidth()-25;  // due to lft = 50 for the lb

    var ifr = document.createElement('iframe');
    ifr.setAttribute('class','lightboxiframe');
    ifr.setAttribute('src',url);
    ifr.setAttribute('frameborder',"0");
    ifr.setAttribute('width',wd);
    ifr.setAttribute('height',"100%");
  
    //var ifrs = '<iframe class="lightboxiframe" src="'+url+'" frameborder="0" width="'+wd+'" height="100%"/>';
   // console.log(ifrs);
    //var ifr = $(ifrs);
    var thisHere = this;
    this.iframe = ifr;
    ifr.onload = function () {thisHere.loading.hide();};
    e[0].appendChild(ifr);
    this.contentWindow = ifr.contentWindow;
  }
  

  lib.Lightbox.prototype.afterClose = function () {
    if (this.afterCloseCallback) {
      this.afterCloseCallback();
    }
  }
  
  lib.windowWidth = function () { // for IE8}
    if (window.innerWidth) return window.innerWidth;
    return document.documentElement.clientWidth; 
  }
  
  
  lib.windowHeight = function () { // for IE8}
    if (window.innerHeight) return window.innerHeight;
    return document.documentElement.clientHeight; 
  }
  
  lib.closeX  = '<div class="closeX" style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>';
  
  lib.closeXcss = {position:"absolute",right:"0px",padding:"3px",widthh:"20px",cursor:"pointer","backgroundColor":"red","fontWeight":"bold",border:"thin solid white","fontSize":"12pt",color:"white","float":"right"};
  
  


//<div style="padding: 3px; width: 20px; cursor: pointer; background-color: red; font-weight: bold; border: thin solid white; font-size: 12pt; color: white; display: block;">X</div>

  
  lib.Lightbox.prototype.addClose = function () {
    var thisHere = this;
    this.close = document.createElement('div');
    this.close.innerHTML = "X";
    util.extend(this.close.style,lib.closeXcss);
    //$(lib.closeX);
    //$('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>');
    this.close.onclick = function () {thisHere.dismiss();thisHere.afterClose();};
    //this.close.click(function () {thisHere.element.empty();thisHere.dismiss();thisHere.afterClose();});
    this.element.appendChild(this.close);
  }

  lib.Lightbox.prototype.pop = function (url) {
    var cnt =  document.getElementsByTagName('body')[0]; // $('body',window.parent.document);

    var thisHere = this;
    var element = this.element;
    var firstTime = false;
    if (!element) {
      firstTime = true;
      var loading = document.createElement('div');
      loading.innerHTML='Loading...';
      loading.setAttribute('class','loading')
      this.loading = loading;
      this.loading.style.display = "none"
    //this.container.append(loading);
    //loading.hide();
    
      var element = document.createElement('div');
      util.extend(element.style,idv.css.lightbox);
      cnt.appendChild(element);
      element.appendChild(loading);
      this.element = element;
      var shade = document.createElement('div');
      cnt.appendChild(shade);
      this.shade = shade;
    }
    this.element.style.display = "none"
    this.shade.style.display = "none";

    //$('<div class="lightbox"/>');
    //element.css(idv.css.lightbox); // needed in album_pages where no css is available
    //var wd = $(document).width();
    //var ht = $(document).height();
    var wd = lib.windowWidth();//window.innerWidth;
    var ht = lib.windowHeight();//window.innerHeight;
    var lft = 50;
    var top = 50;
    var lbwd = wd - 2 * lft;
    var lbht = ht - 2 * top;
    var elps = {left:lft+"px",top:top+"px",position:"absolute",width:lbwd+"px",height:lbht+"px","zIndex":"1500"};
    util.extend(element.style,elps);
    var shcss = {position:"absolute",top:"0px",left:"0px",width:wd+'px',height:ht+'px','zIndex':'800',opacity:'0.8','backgroundColor':"black"}
    util.extend(this.shade.style,shcss);
    
    //var shades = '<div style="position:absolute;top:0px;left:0px;width:'+wd+'px;height:'+ht+'px;z-index:1500;opacity:0.8;background-color:black;"/>';
    
   
    //this.element = element;
    //this.shade = shade;
    //this.setElementProperties();
    //this.container.append(element);
    //this.container.append(shade);
    if (firstTime) {
      this.addClose();
      var ifr = document.createElement('iframe');
      ifr.setAttribute('class','lightboxiframe');
      ifr.setAttribute('frameborder',"0");
      element.appendChild(ifr);
      var thisHere = this;
      ifr.onload = function () {
        thisHere.loading.style.display = "none";
        element.style.display = "block";
        thisHere.close.style.display = "block";
        thisHere.shade.style.display = "block";
      };
      this.iframe = ifr;
    } else {
      ifr = this.iframe;
    }
    ifr.setAttribute("width",lbwd-25);
    ifr.setAttribute("height","100%");
    ifr.setAttribute("src",url);
    
  }
  
  
  
   lib.popLightbox = function (url) {
      
      var lb = lib.lightbox;
     
      if (!lb) {
        lb = new lib.Lightbox();
        lib.lightbox = lb;
      }
      lb.pop(url);
     
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

