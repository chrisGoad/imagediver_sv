



// common elements for neo pages




(function () {
  
  var lib = {};
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
    return dst;
  }
  
  lib.Lightbox = function () {
  }
  
  
  lib.Lightbox.prototype.dismiss = function () {
    var fr = this.iframe;
    if (fr) fr.setAttribute("width","1px");
    var w = window;
    var bht = lib.windowHeight();
    var b = document.getElementsByTagName('body')[0];
    var stop = b.scrollTop;
    lib.extend(this.element.style,{left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});
    this.shade.style.display = "none";
    this.close.style.display = "none";
    this.loading.style.display = "none";
  }
  
  

  
  lib.windowWidth = function () { // for IE8}
    if (window.innerWidth) return window.innerWidth;
    return document.documentElement.clientWidth; 
  }
  
  
  lib.windowHeight = function () { // for IE8}
    if (window.innerHeight) return window.innerHeight;
    return document.documentElement.clientHeight; 
  }
  
  
  lib.closeXcss = {position:"absolute",right:"0px",padding:"3px",widthh:"20px",cursor:"pointer","backgroundColor":"red","fontWeight":"bold",border:"thin solid white","fontSize":"12pt",color:"white","float":"right"};
  
  
lib.lightboxCss = {
  border:"white solid",
   position:"absolute",
   "zIndex":2000,
   "backgroundColor":"#999999",
   "color":"black"
   
};



  
  lib.Lightbox.prototype.addClose = function () {
    var thisHere = this;
    this.close = document.createElement('div');
    this.close.innerHTML = "X";
    lib.extend(this.close.style,lib.closeXcss);
     this.close.onclick = function () {thisHere.dismiss();};
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
    var wd = lib.windowWidth();//window.innerWidth;
    var ht = lib.windowHeight();//window.innerHeight;
    var lft = 50;
    var top = 50;
    var lbwd = wd - 2 * lft;
    var lbht = ht - 2 * top;
    var elps = {left:lft+"px",top:top+"px",position:"absolute",width:lbwd+"px",height:lbht+"px","zIndex":"1500"};
    lib.extend(element.style,elps);
    var shcss = {position:"absolute",top:"0px",left:"0px",width:wd+'px',height:ht+'px','zIndex':'800',opacity:'0.8','backgroundColor':"black"}
    lib.extend(this.shade.style,shcss);
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
  
  lib.extractAlbum = function (src) {
    var idx = src.indexOf("album=");
    var aidx = src.indexOf("&",idx);
    return src.substring(idx+6,aidx).replace(/\./g,"/");
  }
  
  
  lib.install = function () {
    var scrs = document.getElementsByTagName('script');
    var scr = scrs[scrs.length-1]; // this is us
    var source = scr.src;
    var album = lib.extractAlbum(source);
    var url = "http://s3.imagediver.org/topic/album/"+album+"/index.html";
    var pr = scr.parentNode;
    var bt = document.createElement('div');
    bt.innerHTML = "ALBUM "+album;
    pr.insertBefore(bt,scr);
    bt.onclick = function () {
      alert(album);
      lib.popLightbox(url);
    }
   
    var src = scr.src;
    var dd = 22;
  }
  
  lib.install();

})();

