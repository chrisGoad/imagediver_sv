
/*
 http://dev.imagediver.org/topic/image/cg/The_Ambassadors/index.html?image_only=1&album=/album/cg/The_Ambassadors/1
*/

(function () {
  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;
  var com = idv.common;
  var util  = idv.util;
  
  lib.imageDetailsWd  = 400;
   lib.imageDetailsDiv =
    $('<div class="imageDetailsDiv">' +
        '<div id="title"></div>' +
        '<div id="description"></div>' +
       '<table id="imageFields">' +
            '<tr id="authorRow"><td  class="rowTitle">Artist/Photographer:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="author"/></td></tr>' + 
            '<tr  id="yearRow"><td  class="rowTitle">Year:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="year"/></td></tr>' + 
            '<tr  id="tagsRow"><td  class="rowTitle">Tags:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="tags"/></td></tr>' + 
            '<tr id="externalLinkRow" ><td class="rowTitle">External Link:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="externalLink"/></td></tr>' + 
            '<tr id="contributorRow" ><td class="rowTitle">Contributed by:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="contributor"/></td></tr>' +
            '<tr class="dimensionRow"><td class="rowTitle">Dimensions:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="dimensions"/></td></tr>' +
           '<tr><td class="rowTitle">Source</td><td><div style="width:'+lib.imageDetailsWd+'px;;word-wrap:break-word" id="imageSource"></div></td></tr>' +
           '<tr id="licenseRow" ><td class="rowTitle">License:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="license"/></td></tr>' +
            '<tr class="publicRow"><td id="isPublic" class="rowTitle">Public</td></tr>' +
            '<tr class="albumTitleRow"><td class="rowTitle">Album title:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="albumTitle"/></td></tr>' +
             '<tr class="albumDescriptionRow"><td class="rowTitle">Album Description:</td></tr>' +
             '</table>'+
          
          '<div id="albumDescription"></div>' +
          '<div id="buttons"><span id="editButton" class="clickableElement">Edit</span></div>' +

        '</div>');
    
  
  lib.licenseText = {
    "PD-old":'<a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a> in the United States, and those countries with a copyright term of life of the author plus 100 years or less',
    "PD-author":'Released into the <a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a> by the author',
    "PD-self":'Released into the <a href="http://en.wikipedia.org/wiki/Public_domain">Public Domain</a> by the author',
   "cc-by-sa-3.0":'Creative Commons Attribution-ShareAlike 3.0',
   "cc-by-3.0":'<a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0</a>'}
   
  
  
  lib.computeAboutText = function () {
    var imD = lib.imD;
    var imd = ""
    if (imD.title) {
      imd += "{{{"+imD.title+"}}}"; // nowiki
    }
    if (imD.author) {
      imd += " by " + imD.author
    }
    imd += "\n\n"
    var ds = imD.description;
    if (ds) {
      imd += ds
    }
    return imd;
  }
 
  lib.popImageDetails = function () {
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    function adjustLightBoxHeight() {
        var ht = lib.imageDetailsDiv.height();
        var lbh = lib.lightbox.element.height();
        lib.lightbox.element.css({"height":(ht + 40)+"px"});
    }
    
    lib.imageDeleteable = function () {
  // check for divergent ownership
      var aln = lib.allAlbumDs.length;
      if (aln == 0) return true;
      var imowner = lib.imD.owner;
      for (var i=0;i<aln;i++) {
        var calb = lib.allAlbumDs[i];
        if (calb.owner != imowner) {
         return false;
        }
      }
      return true;
    }
    
    
    lib.lightbox.element.append(lib.imageDetailsDiv);
    if ($.trim(lib.imD.description)) {
      var dst = $("#description",lib.imageDetailsDiv);
      dst.empty();
      dst.css({"word-wrap":"break-word","margin-left":"20px","margin-bottom":"10px","margin-top":"10px"});
      dst.html(util.processMarkdown(lib.imD.description));
      //util.creole.parse(dst[0],lib.imD.description);
    } else {
      $("#descriptionRow",lib.imageDetailsDiv).hide();
    }
    $("#title",lib.imageDetailsDiv).css({"font-weight":"bold","margin-left":"10px","margin-right":"10px","margin-top":"10px","text-align":"center"});
    $("#imageFields",lib.imageDetailsDiv).css({"margin-left":"10px","margin-right":"10px","margin-top":"10px"});
    $(".rowTitle",lib.imageDetailsDiv).css({"padding-left":"10px","padding-right":"20px"});
    $("tr",lib.imageDetailsDiv).css({"padding-top":"10px"});
    $("#albumDescription",lib.imageDetailsDiv).css({"margin-left":"50px"});
  
    $("#buttons",lib.imageDetailsDiv).css({"margin-top":"30px","margin-left":"30px"});

    //$("#titleTitle",lib.imageDetailsDiv).css({"margin-right":"10px"});
    var ttl = $.trim(lib.imD.title);
    if (!ttl) {
      ttl = util.pathLast(lib.imD.topic);
    }
   
    $("#titleRow",lib.imageDetailsDiv).show();
    $("#title",lib.imageDetailsDiv).html(util.sanitize(ttl));
    var ownm = lib.imD.ownerName;
    var cdiv = $("#contributor",lib.imageDetailsDiv);
    if (ownm) {
      cdiv.show()
      cdiv.html(util.sanitize(lib.imD.ownerName));
    } else {
      $('#contributorRow').hide();
    }
   /*
    Detail-Head-Saint Francis in Ecstasy - Bellini.jpg
    
    
    http://en.wikipedia.org/wiki/Wikipedia:Upload?wpDestFile=Detail_-_Head_-_Saint_Francis_in_Ecstasy_-_Bellini.jpg
   */
    
    if ($.trim(lib.imD.author)) {
      $("#authorRow",lib.imageDetailsDiv).show();
      //var dst = $("#author",lib.imageDetailsDiv)
      //util.creole.parse($("#author",lib.imageDetailsDiv)[0],lib.imD.author);
      $("#author",lib.imageDetailsDiv).html(util.sanitize(lib.imD.author));
    } else {
      $("#authorRow",lib.imageDetailsDiv).hide();
    }

    if ($.trim(lib.imD.year)) {
      $("#yearRow",lib.imageDetailsDiv).show();
      $("#year",lib.imageDetailsDiv).html(util.sanitize(lib.imD.year));
    } else {
      $("#yearRow",lib.imageDetailsDiv).hide();
    }
    var tags = lib.imD.tags;
    var tagel = $("#tags",lib.imageDetailsDiv)
    if (tags && (tags.length > 0)) {
      var tagst = tags.join(", ");
      tagel.html(tagst);
      
    }

    var lnk = $.trim(lib.imD.externalLink);
    if (lnk) {
      $("#externalLinkRow",lib.imageDetailsDiv).show();
      var edv = $("#externalLink",lib.imageDetailsDiv);
      var a = $('<a>');
      var sanlnk = util.sanitize(lnk);
      a.attr("href",lnk);
      a.attr("target","imagediverTarget");
      edv.empty();
      edv.append(a);
      a.html(sanlnk);
    } else {
      $("#externalLinkRow",lib.imageDetailsDiv).hide();
    }
    
    var dim = lib.imD.dimensions;
    var dims = dim.x + " pixels wide by "+ dim.y+ " pixels high";
    $('#dimensions',lib.imageDetailsDiv).html(dims);
    var src = lib.imD.source;
    var srcel = $('#imageSource');
    srcel.css({'text-decoration':'underline','cursor':'pointer'});
    if (src) {
      srcel.show();
      srcel.html(src);
      srcel.click(function () {window.open(src)});
    } else {
      srcel.hide();
    }
    $('#imageSource').html((lib.imD.source)?(lib.imD.source):'');
    if ( !lib.imOnly) {
      var cap = lib.albumD.caption;
      if (cap && (cap != "Untitled")) $('#albumTitle').html(cap); else  $('.albumTitleRow').hide();
      var ads = lib.albumD.description;
      var adsel = $('#albumDescription');
      if (ads) {
        adsel.show();
        adsel.empty();
        adsel.css({"word-wrap":"break-word"});
        adsel.html(util.processMarkdown(ads));
        //util.creole.parse(adsel[0],ads);
      } else {
          $('.albumDescriptionRow').hide();
      }
    }
    $('p',lib.imageDetailsDiv).css({"margin":"0px"}); // creole generates a <p>
    if (lib.imD.isPublic) {
      var pubtxt = "Public Image";
    } else {
      pubtxt = "Private Image";
    }
    $('#isPublic',lib.imageDetailsDiv).html(pubtxt);
    
    var lic = lib.imD.license;
    if ((!lic) || (lic == "none")) {
      $('#licenseRow').hide();
    } else {
      $('#license').html(lib.licenseText[lic]);
    }
    if (lib.isSnaps) {
      $(".albumTitleRow").hide();
      $(".albumDescriptionRow").hide();
    }
//    if (idv.loggedInUser  && (lib.imD.owner==idv.loggedInUser) && (!idv.atS3)) {
    var canEditImage = lib.imD.owner == idv.loggedInUser;
    var canEditAlbum = lib.albumD && (lib.albumD.owner == idv.loggedInUser);
    // if there is no album, only display the image button if the image can be edited
    if ( (!idv.atS3) && ( (lib.imOnly && canEditImage) || (!lib.imOnly && (canEditImage || canEditAlbum)))) {
      $("#buttons",lib.imageDetailsDiv).show();
      $("#editButton",lib.imageDetailsDiv).click(function () {lib.popEditImageLightbox();});
      //if (0 && lib.imageDeleteable()) { // move image delete into mycontent
      $("#buttonMsg").hide();
     
     } else {
      
    
       $("#buttons",lib.imageDetailsDiv).hide();
    }

    //adjustLightBoxHeight() 
  
 }
  
  
  
  
})();