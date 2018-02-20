

// panorama page generation

/*
imagediver: a means for diving deep into high resolution images, and retrieving what you find
dive deep into high resolution images, and bring back what you find
for a pair of images in which panning and zooming are coordinated
*/


(function () {
  
  
  var lib = page;
   var geom = idv.geom;
  var imlib = idv.image;
 var com = idv.common;
  var util  = idv.util;
  
  
  lib.hasTag = function (im,tag) {
    var tags = im.tags;
    if (!tags || (tags.length == 0)) return tag == "other"; // this will need improvement someday
    var rs = $.inArray(tag,tags) >= 0;
    return rs;
  }
  
  lib.genTab  = function (container,cb,title) {
    var tabCss = 
   {'border-radius':'0px','margin-left':'0px','margin-right':'0px','margin-bottom':'0px','padding-left':'15px','padding-right':'15px','border':'solid thin black','padding-bottom':'4px'};
    var tabSelectedCss = util.extend(util.copy(tabCss),{ "background-color":"#dddddd","color":"black"})
    var tabDeselectedCss = util.extend(util.copy(tabCss),{ "background-color":"#303132","color":"white"})

    /*
    var cb = function (nm) {
      lib.whichGallery = nm;
      lib.renderContents();
    }
    */
    var tabDiv = $('<div class="tabDiv"></div>')
    container.append(tabDiv);
    lib.tabDiv = tabDiv;
    var showArt = $('<span class="clickableElement">Art</span>');
    var showOther = $('<span class="clickableElement">Other</span>');
    if (title) {
      var titleEl =  $('<span></span>').html(title);
      titleEl.css({"font-weight":"bold","width":"100%","text-align":"center","float":"right"});
      tabDiv.append(titleEl);
    }
    var tabGroup = new lib.clickableGroup([['art',showArt],['other',showOther]],tabSelectedCss,tabDeselectedCss,cb);
    tabGroup.appendTo(tabDiv);
    return tabGroup;
  }
  
})();


