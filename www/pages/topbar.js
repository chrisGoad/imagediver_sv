NOT IN USE
/*
 http://dev.imagediver.org/topic/image/cg/earthly_delights_1/index.html?image_only=1
 vp = page.vp
 cnv = page.vp.canvas
 //cnv.strokeRect(100,100,100,100)
 //cnv.strokeRect(10,50,10,50)
 page.vp.extent
 dims = page.imD.dimensions
 cntx = dims.x/2;
 cnty = dims.y/2;
 geom = exports.GEOM2D;
 cr = new geom.Rect(new geom.Point(cntx-500,cnty-500),new geom.Point(1000,1000));
 vp.drawRect(cr,"image","yellow")

cr = new geom.Rect(new geom.Point(cntx-10,cnty-10),new geom.Point(20,20));
 vp.drawRect(cr,"image","yellow")


cr = new geom.Rect(new geom.Point(cntx-1500,cnty-0),new geom.Point(20,20));
 vp.drawRect(cr,"image","yellow")
 
 //vp.drawRect(new geom.Rect(new geom.Point(100,100),new geom.Point(500,500)),"image")
  rr = new geom.Rect(new geom.Point(50,50),new geom.Point(dims.x-50,dims.y-50))
vpr = vp.rectImageToViewport(rr)
cnv = vp.viewportToCanvas(vpr)

vp.drawRect(rr,"image","yellow")
    //ctx.strokeRect(corner.x,corner.y,extent.x,extent.y);


rrr = new geom.Rect(new geom.Point(68.4931640625,83.7138671875),new geom.Point(631.6591796875,738.2041015625))
vp.drawRect(rrr,"image","yellow")



*/
 
 
(function () {
  var lib = exports.IMAGE;
  //lib.noCanvas = false; // true mode not in use, nor will be; code fossil
  var geom = exports.GEOM2D;
  var util = idv.util;
 


  lib.Topbar = function (container,options)  {
    this.container = container;
    this.options = options;
    //util.setProperties(this,options,["title","aboutText","aboutTitle","includeGallery","fullsize","wikipediaPage","json","embed","inIframe"]);
  }
  
  

  lib.Topbar.prototype.render = function () {
    function installOvers(el) {
      el.mouseover(function () {el.css({"color":"yellow"})});
      el.mouseleave(function () {el.css({"color":"white"})});
    }
    var options = this.options;
    var cnt = this.container;
    cnt.empty();
    var embed = idv.embed;
    var thisHere = this;
    var loggedInUser = idv.loggedInUser;
    //var caption = lib.albumD.caption;
    var logo = $('<span class="logo">imageDiver</span>');
    if (embed) {
      logo.click(function () {util.navigateToPage(util.dropQS(),embed);});
    } else {
      logo.click(function () {util.navigateToPage("http://imagediver.org/");});
    }
    if (embed) {
      cnt.append(logo);
      var titleSpan = $('<span>'+options.title+'</span>');
      cnt.append(titleSpan);
      lib.titleSpan = titleSpan;
      return;
    }
    var topDivTop = $(".topDivTop");
    /*
    var topDivTop = $('<div class="topDivTop"></div>');
    cnt.append(topDivTop);
    */
    var tdt = topDivTop;
    tdt.empty();
    tdt.append(logo);
    var brie8 =   $.browser.msie && (parseFloat($.browser.version) < 9);
    var okb = !brie8;
    okb = true; // now ie8 just navigates around s3
    if (brie8 && false) {
      var ie8Note =  $('<span class="titleRight" style="font-size:8pt">To see more ImageDiver content, please upgrade your browser (Internet Explorer 8) to version 9, or come back with Chrome, Firefox, or Safari.</span>');
      tdt.append(ie8Note);
      return;
    }
    
    if (!loggedInUser) {
      var loginIDV = $('<span class="titleRight">sign up/in</span>');
     //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
      tdt.append(loginIDV);
      installOvers(loginIDV);
      loginIDV.click(function () {util.navigateToPage("/login")});
    }
 
    if (loggedInUser) {
      var accountIDV = $('<span class="titleRight">account</span>');
     //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
      tdt.append(accountIDV);
      installOvers(accountIDV);

      accountIDV.click(function () {util.navigateToPage("/account")});

      var logoutIDV = $('<span class="titleRight">sign out</span>');
     //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
      tdt.append(logoutIDV);
      installOvers(logoutIDV);

      logoutIDV.click(function () {util.navigateToPage("/logout")});
    }
    //var contactIDV = $('<span class="titleRight">contact</span>');
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
    //tdt.append(contactIDV);
    //contactIDV.click(function () {util.navigateToPage("http://imagediver.org/contact")});
    function activateAboutPulldown(spn) {
      var wd = spn.width();
      var offs  = spn.offset();
      offs.left = offs.left - 10;
      var pd = lib.pulldown2;
      var cnt = $('.outerDiv');
      if (cnt.length == 0) {
        cnt = $('.columnDiv');
      }
      if (!pd) {
        var pd = $('<div style="position:absolute"></div>');
        pd.css({"z-index":10000,width:(wd+30)+"px","background-color":"black","border":"solid thin white"});
        cnt.append(pd);
        var why = $("<div class='pulldownElement'>why?</div>");
        pd.append(why);
        installOvers(why);

        why.click(function () {util.navigateToPage("/why")});
        var contactIDV = $('<div class="pulldownElement">contact</div>');
        pd.append(contactIDV);
        contactIDV.click(function () {util.navigateToPage("/contact")});
        installOvers(contactIDV);
        lib.pulldown2 = pd;
        pd.mouseleave(function () {util.slog("out");pd.hide();});
      } else {
        pd.show();
      }
      pd.offset(offs);
    }
    var aboutIDV = $('<span class="titleRight">about</span>');
    
   //   var about = $('<span style="float:right;margin-left:20px" class="smallClickableElement">about</span>');
    aboutIDV.append('<span style="font-family:webdings">6</span>');
    tdt.append(aboutIDV);
    aboutIDV.mouseover(function () {activateAboutPulldown(aboutIDV);});
        var detailsLink = options.detailsLink;
        if (detailsLink) {
          var dtxt = detailsLink.text;
          var daction = detailsLink.action;
          var detailsEl = $('<span class="titleRight">'+dtxt+'</span>');
          detailsEl.click(daction);
           tdt.append(detailsEl);
           installOvers(detailsEl);
        }


    var images = $('<span class="titleRight">images</span>');
      // var gallery = $('<span style="float:right" class="smallClickableElement">gallery</span>');
    tdt.append(images);
    installOvers(images);

   
    images.click(function () {
        util.navigateToPage('/images');
      });
  
    if (options.imageUrl) {
       var imageEl = $('<span class="titleRight">image</span>');
      // var gallery = $('<span style="float:right" class="smallClickableElement">gallery</span>');
      tdt.append(imageEl);
      installOvers(imageEl);

      imageEl.click(function () {
        util.navigateToPage(options.imageUrl);
      });
    }



      var blog = $('<span class="titleRight">blog</span>');
      // var gallery = $('<span style="float:right" class="smallClickableElement">gallery</span>');
      tdt.append(blog);
      //debugger;
      installOvers(blog);

      blog.click(function () {
        util.navigateToPage('/blog/index.html');
      });
    
    if (options.includeGallery) {
      var gallery = $('<span class="titleRight">gallery</span>');
      // var gallery = $('<span style="float:right" class="smallClickableElement">gallery</span>');
      tdt.append(gallery);
      installOvers(gallery);

      gallery.click(function () {
        util.navigateToPage('/gallery/index.html');
      });
    }
    
    
    
    var titleDiv = $('<div class="titleDiv">'+util.sanitize(options.title)+'</div>');
    //titleDiv.css(page.css.titleDiv);
    cnt.append(titleDiv);
    lib.titleDiv = titleDiv;
    if (page && page.theLayout) page.applyTopDivCss(page.theLayout)

  }
  
  
  
  lib.genTopbar = function (container,options) {
    //title,includeAbout,includeGallery) {
    var topDiv = $('<div class="topDiv"/>');
     container.append(topDiv);
    lib.topDiv = topDiv;
    //b.setRect(lib.controlDiv,lib.controlRect);
    lib.topbar =  new lib.Topbar(topDiv,options);
    lib.topbar.render();
    return lib.topbar;
  }
    
})();
