

// common elements for neo pages




//var lib = {}; // @removee
(function () {
  var lib = {};
  /* this fails in IE (even IE9 for some reason) */
  lib.extend = function () {
    var ln=arguments.length;
    var dst = arguments[0];
    for (var i=1;i<ln;i++) {
      var ca = arguments[i];
      for (var k in ca) {
        if (ca.hasOwnProperty(k)) {
          dst[k] = ca[k];
        }
      }
    }
  }
  /*
  lib.extend = function (dst,src) {
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        dst[k] = src[k];
      }
    }
    return dst;
  }
  */

               

  
  
  lib.Lightbox = function () {
    
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
    var stop = lib.scrollTop();
    //console.log(bht,stop);
    lib.extend(this.element.style,{left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});
    this.shade.style.display = "none";
    this.close.style.display = "none";
    this.loading.style.display = "none";
    this.visible = 0;
  }
  
  

  
  lib.windowWidth = function () { // for IE8}
    var w = window;
    if (window.innerWidth) {
      var rs = window.innerWidth;
    } else {
      rs = document.documentElement.clientWidth;
      if (rs == 0) {
        //quirks mode
        rs = document.body.clientWidth;
      }
    }
    return rs;
  }
  
  
  lib.windowHeight = function () { // for IE8}
    var w = window;
    if (window.innerHeight) {
      var rs = window.innerHeight;
    } else {
      rs = document.documentElement.clientHeight;
      if (rs == 0) {
        //quirks mode
        rs = document.body.clientHeight;
      }
    }
    return rs;
  }
  
  
  lib.scrollTop = function () { // for IE8}
    var w = window;
    if (w.pageYOffset != null) return w.pageYOffset;
    if (w.scrollTop  != null) return w.scrollTop;
    // IE8
    return document.documentElement.scrollTop
  }
  
  
  
  lib.closeXcss = {position:"absolute",right:"0px",padding:"3px",widthh:"20px",cursor:"pointer","backgroundColor":"red","fontWeight":"bold",border:"thin solid white","fontSize":"12pt",color:"white","float":"right"};
  
  
lib.lightboxCss = {
  border:"white solid",
   position:"absolute",
   "zIndex":2000,
   "backgroundColor":"#999999",
   "color":"black"
   
};


//<div style="padding: 3px; width: 20px; cursor: pointer; background-color: red; font-weight: bold; border: thin solid white; font-size: 12pt; color: white; display: block;">X</div>

  
  lib.Lightbox.prototype.addClose = function () {
    var thisHere = this;
    this.close = document.createElement('div');
    this.close.innerHTML = "X";
    lib.extend(this.close.style,lib.closeXcss);
    //$(lib.closeX);
    //$('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>');
    this.close.onclick = function () {thisHere.dismiss();};
    //this.close.click(function () {thisHere.element.empty();thisHere.dismiss();thisHere.afterClose();});
    this.element.appendChild(this.close);
  }

  lib.Lightbox.prototype.setsize = function () {
    var wd = lib.windowWidth();//window.innerWidth;
    var ht = lib.windowHeight();//window.innerHeight;
    var lft = 50;
    var top = 40;
    var lbwd = wd - 2 * lft;
    var lbht = ht - 2 * top;
    var b = document.getElementsByTagName('body')[0];
    var stop = lib.scrollTop();
 
    var elps = {left:lft+"px",top:(stop+top)+"px",position:"absolute",width:lbwd+"px",height:lbht+"px","zIndex":"1500"};
    lib.extend(this.element.style,elps);
    var shcss = {position:"absolute",top:stop + "px",left:"0px",width:wd+'px',height:ht+'px','zIndex':'800',opacity:'0.8','backgroundColor':"black"}
    lib.extend(this.shade.style,shcss);
    //if (this.iframe) {
      this.iframe.setAttribute("width",lbwd-25);
      this.iframe.setAttribute("height","100%");

    //}
    return lbwd;

  }
  
  lib.Lightbox.prototype.resize = function () {
    if (this.visible) {
      //console.log("resizing");
      this.setsize();
    }
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
      lib.extend(element.style,lib.lightboxCss);
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
    //var lbwd = this.setsize();
    /*
    var wd = lib.windowWidth();
    var ht = lib.windowHeight();
    var lft = 50;
    var top = 50;
    var lbwd = wd - 2 * lft;
    var lbht = ht - 2 * top;
    var elps = {left:lft+"px",top:top+"px",position:"absolute",width:lbwd+"px",height:lbht+"px","zIndex":"1500"};
    lib.extend(element.style,elps);
    var shcss = {position:"absolute",top:"0px",left:"0px",width:wd+'px',height:ht+'px','zIndex':'800',opacity:'0.8','backgroundColor':"black"}
    lib.extend(this.shade.style,shcss);
    */
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
        thisHere.visible = 1;
      };
      this.iframe = ifr;
      var thisHere = this;
      if (window.addEventListener) {
        // resizing wont happen in ie7 or 8 - too bad
        window.addEventListener("resize",function () {thisHere.resize();});
      }
    } else {
      ifr = this.iframe;
    }
    this.setsize();
    //ifr.setAttribute("width",lbwd-25);
    //ifr.setAttribute("height","100%");
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
  
  lib.extractAlbum = function (src) {
    var idx = src.indexOf("album=");
    var aidx = src.indexOf("&",idx);
    return src.substring(idx+6,aidx).replace(/\./g,"/");
  }
  
  
  lib.extractWidth = function (src) {
    var idx = src.indexOf("width=");
    return src.substring(idx+6).replace(/\./g,"/");
  }
  
  lib.install = function () {
    var scrs = document.getElementsByTagName('script');
    var scr = scrs[scrs.length-1]; // this is us
    var source = scr.src;
    var wd = parseInt(lib.extractWidth(source));
    var album = lib.extractAlbum(source);
    var url = "http://s3.imagediver.org/topic/album/"+album+"/index.html?embed=1";
    //var url = "http://dev.imagediver.org/topic/album/"+album+"/index.html?embed=1";
    var pr = scr.parentNode;
    if (wd > 700) {
      var ifr = document.createElement("iframe");
      var ht = wd * 0.666;
      pr.insertBefore(ifr,scr);
      ifr.height = ht;
      ifr.width = wd;
      ifr.src = url;
      return;
    }
    var als = album.split("/");
    var whichArea=(wd>200)?"250000":"50000";
    var imurl = "http://static.imagediver.org/images/"+als[0]+"/"+als[1]+"/resized/area_"+whichArea+".jpg"
    var bt = document.createElement("img");
    bt.style.cursor = "pointer";

    //bt.setAttribute("width","200");
    bt.src = imurl;
    bt.width = wd;
    //var bt = document.createElement('div');
    //bt.innerHTML = "ALBUM "+album;
    pr.insertBefore(bt,scr);
    bt.onclick = function () {
      lib.popLightbox(url);
    }
   
    var src = scr.src;
    var dd = 22;
  }
  
  lib.install();

})();

