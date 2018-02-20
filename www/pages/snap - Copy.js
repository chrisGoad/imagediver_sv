

// panorama page generation



(function () {
  

  var lib = page;

  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  //var com = idv.common;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"}
  idv.pageKind = "album";
  lib.includeShare = false;
  lib.Markdown;


  
   lib.albumDetailsWd  = 200;
   lib.albumDetailsDiv =
    $('<div class="albumDetailsDiv">' +
         '<div id="title"></div>' +
        '<div id="description" style="word-wrap:break-word"></div>' +
        
       '<table id="albumFields">' +
            '<tr  id="authorRow"><td  class="rowTitle">Image By:</td><td class="rowValue"><span style="width:'+lib.albumDetailsWd+'px" id="author"/></td></tr>' + 
            '<tr  id="yearRow" ><td class="rowTitle">Year:</td><td class="rowValue"><span style="width:'+lib.albumDetailsWd+'px" id="year"/></td></tr>' + 
            '<tr id="externalLinkRow"><td  class="rowTitle">External Link:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="externalLink"/></td></tr>' + 
            '<tr id="contributorRow"><td  class="rowTitle">Album created by:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="contributor"/></td></tr>' + /*
            '<tr  id="otherAlbumsRow" ><td class="rowTitle">Other albums for<br/> this image:</td><td class="rowValue"><span style="width:'+lib.albumDetailsWd+'px" id="otherAlbums"/></td></tr>' + /*
            '<tr><td id="externaLinkRow" class="rowTitle">External Link:</td><td class="rowValue"><span style="width:'+lib.imageDetailsWd+'px" id="externalLink"/></td></tr>' + /*
            '<tr><td class="inputsTD">Year Created</td><td><input style="width:'+lib.editImageWd+'px" id="imageYear" type="text"/></td></tr>' +
            '<tr><td class="inputsTD">External Link</td><td><input style="width:'+lib.editImageWd+'px" id="imageExternalLink" type="text"/></td></tr>' +
             '<tr><td class="inputsTD">Source</td><td><div style="width:'+lib.editImageWd+'px;;word-wrap:break-word" id="imageSource"></div></td></tr>' +
           '<tr><td class="inputsTD">Dimensions</td><td id="imageDimensions"></td></tr>' +
            */
          '</table>'+
          //'<div id="imagePageRow"><a id="imagePage">The image page</a></div>' + 
          '<div id="jsonRow"><a target="_blank" id="json">JSON</a></div>'+
          '<div id="docs"><span id="albumsWhat">about albums</span><span id="jsonWhat">about JSON</span></div>' + 
          "<div id='aboutJSON'>"+   idv.common.closeX +
            "<p>The JSON link above resolves to a machine-readable encoding of the contents of this album, in the "+
            '<a target="_blank" href="http://json.org">JSON format</a>. The form of the data should be '+
            "should be self-explanatory to those familiar with JSON, except for one detail. The encoding of the area covered by  a snap looks like this: </p> "+
            '<table id="jsonTable"><tr><td>{"coverage": </td><td>{"corner": {"x": 0.25, "y": 0.5},</td><tr><tr><td></td><td>"extent": {"x": 0.01, "y": 0.02}}</td></tr></table></p> '+
            '<p>The x and y values are normalized to the '+
            'width of the image. So, in this example, if the image is 1000 pixels wide,  the upper left corner of the snap is at pixel coordinates (250,500), its width '+
            ' is 10 pixels, and its height is 20 pixels.</p>'+
          '</div>' + 
          "<div id='aboutAlbums'>"+   idv.common.closeX +
          "<p>Each image may have many albums associated with it, each with  a different set of snap shots, and a different author. There is "+
          "an ImageDiver page for each album (this is one such page).  Each image also has its own page, linked to from the top bar.</p>" +
          "</div>"+
          '<div id="buttons"><span id="editButton" class="clickableElement">Edit Album Properties</span><span id="deleteButton" class="clickableElement">Delete the Album</span></div>' +
          
        '</div>');
    
    
    
   lib.albumsHtml = function (dst,albums,thisAlbumTopic) {
      dst.empty();
      var ln = albums.length;
      //oae.append("HOOO");return;
      for (var i=0;i<ln;i++) {
        var ca = albums[i];
        if (ca.topic == thisAlbumTopic) continue;
        var cc = ca.caption;
        var uname = lib.pathLast(lib.pathLast(ca.owner));
        if (i < ln-1) comma = ","; else comma = "";
        var aline = $('<span class="albumLink"><span>'+cc+'</span> by '+uname+comma+' </span>');
        dst.append(aline);
        (function (tp) { // to capture tp in its own environment
          aline.click(function () {
            util.navigateToPage("/topic"+tp+"/index.html");
          });
        })(ca.topic);
      }
  }
  
  lib.lightboxMessage = function (msg) {
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    msgdiv = $('<div/>');
    msgdiv.css({'text-align':'center','margin-top':'30px'})
    msgdiv.html(msg);
    lib.lightbox.element.append(msgdiv);
   
  }
  
  lib.popAlbumDetails = function () {
    obsolete(); // now lib.popImageDetails is the thing
    lib.lightbox.pop();
    lib.lightbox.element.empty();
    lib.lightbox.addClose();
    
    lib.lightbox.element.append(lib.albumDetailsDiv);
    if ($.trim(lib.imD.description)) {
      var dst = $("#description",lib.albumDetailsDiv);
      dst.empty();
      dst.html(util.processMarkdown(lib.imD.description));
       // util.creole.parse(dst[0],lib.imD.description);
      
    } else {
      $("#descriptionRow",lib.albumDetailsDiv).hide();
    }
    $("#title",lib.albumDetailsDiv).css({"font-weight":"bold","margin-left":"10px","margin-right":"10px","margin-top":"10px","text-align":"center"});
    $("#albumFields",lib.albumDetailsDiv).css({"margin-left":"10px","margin-right":"10px","margin-top":"10px"});
    $(".rowTitle",lib.albumDetailsDiv).css({"padding-left":"10px","padding-right":"20px"});
    $("td",lib.albumDetailsDiv).css({"padding-top":"10px"});
    //$("#imagePageRow",lib.albumDetailsDiv).css({"padding-left":"20px","padding-top":"20px"});
    $("#jsonRow",lib.albumDetailsDiv).css({"padding":"20px"});
    $("#aboutJSON",lib.albumDetailsDiv).css({"display":"none","border":"solid thin white","margin":"20px"});
    $("#aboutAlbums",lib.albumDetailsDiv).css({"display":"none","border":"solid thin white","margin":"20px"});
    $("#jsonTable",lib.albumDetailsDiv).css({"padding-left":"30px"});
    $("#docs",lib.albumDetailsDiv).css({"cursor":"pointer","text-decoration":"underline","font-size":"8pt","padding-left":"20px"});
    $("#jsonWhat",lib.albumDetailsDiv).css({"margin-left":"30px"});
    $("#buttons",lib.albumDetailsDiv).css({"margin":"30px"});

    //$("#titleTitle",lib.imageDetailsDiv).css({"margin-right":"10px"});
    var ttl = lib.genFullTitle();
    //if ($.trim(lib.albumD.title)) {
     $("#titleRow",lib.albumDetailsDiv).show();
     $("#title",lib.albumDetailsDiv).html(util.sanitize(ttl));
   // } else {
   //   $("#titleRow",lib.albumDetailsDiv).hide();
   // }
    // use the image description if the album description is unavailable
    var desc  = $.trim(lib.albumD.description);
    if (!desc) {
      var desc  = $.trim(lib.imD.description);
    }
     if (desc) {
      $("#descriptionRow",lib.albumDetailsDiv).show();
      var dst = $("#description",lib.albumDetailsDiv);
      dst.empty();
      dst.html(util.processMarkdown(desc));
      //util.creole.parse(dst[0],desc);
    } else {
      $("#descriptionRow",lib.albumDetailsDiv).hide();
    }
   // var imlink = "/topic"+lib.imD.topic+"/index.html";
    //var imdomain = lib.forS3Dev?"http://dev.imagediver.org":"http://imagediver.org";
    //$("#imagePage").attr("href",imdomain+imlink);
    
    if ($.trim(lib.imD.author)) {
      $("#authorRow",lib.albumDetailsDiv).show();
      $("#author",lib.albumDetailsDiv).html(util.sanitize(lib.imD.author));
    } else {
      $("#authorRow",lib.albumDetailsDiv).hide();
    }

    if ($.trim(lib.imD.year)) {
      $("#yearRow",lib.albumDetailsDiv).show();
      $("#year",lib.albumDetailsDiv).html(util.sanitize(lib.imD.year));
    } else {
      $("#yearRow",lib.albumDetailsDiv).hide();
    }
    var lnk = $.trim(lib.albumD.externalLink);
    if (!lnk) {
      var lnk = $.trim(lib.imD.externalLink);
    }
    if (lnk) {
      $("#externalLinkRow",lib.albumDetailsDiv).show();
      var edv = $("#externalLink",lib.albumDetailsDiv);
      var a = $('<a>');
      var sanlnk = util.sanitize(lnk);

      a.attr("href",lnk);
      a.attr("target","imagediverTarget");
      a.html(sanlnk);
      edv.empty();
      edv.append(a);
    } else {
      $("#externalLinkRow",lib.albumDetailsDiv).hide();
    }
    var ownm = lib.albumD.ownerName;
    var cdiv = $("#contributor",lib.albumDetailsDiv);
    if (ownm) {
      cdiv.show()
      cdiv.html(util.sanitize(lib.albumD.ownerName));
    } else {
      cdiv.hide();
    }
   
    /*var aln = lib.albumDs.length;
    if (aln <= 1) {
      $("#otherAlbumsRow",lib.albumDetailsDiv).hide();
    } else {
       $("#otherAlbumsRow",lib.albumDetailsDiv).show();
       lib.albumsHtml($('#otherAlbums',lib.albumDetailsDiv),lib.albumDs,lib.albumD.topic);
    }
    24th july 3:15pm
    */
    var json = util.jsonUrl(lib.albumD.topic);
    $('#json').attr('href',json);
    function adjustLightBoxHeight() {
      return; // no longer needed, since overflow:auto in lightbox css
      var ht = lib.albumDetailsDiv.height();
      var lbh = lib.lightbox.element.height();
      lib.lightbox.element.css({"height":(ht + 40)+"px"});
    
    }
    $("#jsonWhat",lib.albumDetailsDiv).click(function () {$("#aboutAlbums").hide();$("#aboutJSON").show();adjustLightBoxHeight();});
     $("#albumsWhat",lib.albumDetailsDiv).click(function () {$("#aboutJSON").hide();$("#aboutAlbums").show();adjustLightBoxHeight();});
   $(".closeX",lib.albumDetailsDiv).click(function () {$("#aboutJSON").hide();$("#aboutAlbums").hide();;adjustLightBoxHeight();});
    if (lib.published) {
      $('#editButton').hide();
      $('#deleteButton').hide();
    } else {
      $("#editButton",lib.albumDetailsDiv).click(function () {lib.popEditAlbumLightbox();});
    
      $("#deleteButton",lib.albumDetailsDiv).click(function () {
          lib.lightbox.tempDismiss();

      util.myConfirm("Delete Album","Are you sure you wish to delete this album, and all of its snaps?",
                   function () {lib.deleteTheAlbum();},
                   function () {util.closeDialog();lib.lightbox.bringBack();});  //snapAdvice.hide();
   });
    }
    if (idv.loggedInUser  && (lib.albumD.owner==idv.loggedInUser)) {
      $("#buttons",lib.albumDetailsDiv).show();
    } else {
       $("#buttons",lib.albumDetailsDiv).hide();
    }

    adjustLightBoxHeight();
 }
  
  

lib.facebookLikeButton = function (topic,width,height) {
  // for now
  //page = "/like_button_test";
  //return ''; // @undo
  var url = "http://s3.imagediver.org/topic"+topic+"/index.html";
  var qs = "href="+encodeURI(url)+"&send=false&layout=button_count&width="+width+"&height="+height+
           "&action=like&colorscheme=light&appId=252341458175463"
  var rs = '<iframe src="//www.facebook.com/plugins/like.php?'+qs+
          '" scrolling="no" frameborder="0" style="padding-left:15px;display:inline-block;border:none;overflow:hidden;width:'+width+'px;height:'+height+'px"'+
          ' allowTransparency="true"></iframe>';
  return rs;
}

  /*
  lib.setSelectedSnap = function (snap) {
    lib.nowSelectedSnap = snap;
    if (snap) {
      lib.zoomToSnap.show();
    } else {
      lib.zoomToSnap.hide();
      var dv = lib.vpSelectDiv;
      dv.hide();
    }
    if (lib.showSnapsMode) lib.showOverlaysForSnaps(lib.snapDs);

  }
  */
  
  lib.setSelectedSnapCallbacks.push(function () {
    return;
    if (lib.selectedSnap) {
      lib.zoomToSnap.show();
    } else {
      lib.zoomToSnap.hide();
    }
  });
  
  
  lib.stdSnapAdvice = function () {
    if (lib.showSnapsMode) {
      return "click within outline for detail, doubleclick to zoom there";
    } else {
      if (lib.selectedSnap) {// && (lib.currentPanel.name=="selectedSnap")) {
        return "double click to zoom to the selected snap";
      } else {
        return "";
      }
    }
  }
 
  
  lib.renderZoomControl = function (container) {
    var cnt = container;

    //pn.scalable = true;
    //pn.height = lib.standardPanelHeight;
    var setZoom = function (z) {lib.vp.setZoom(z);};
    var getZoom = function () {return lib.vp.zoom;};
    var zmropts = {container:cnt,maxZoom:lib.vp.maxZoom,setZoom:setZoom,getZoom:getZoom,
       zoomIncrement:1.05,zoomFactor:2,zoomDelay:50};
    var zmr =  new idv.zoomSlider(zmropts);
    lib.zSlider = zmr;
    lib.vp.zoomCallbacks.push(function (z) {lib.zSlider.positionSliderFromZoom(z);});
   var otherButtons = $('<span></span>');
   otherButtons.css({left:lib.zSlider.totalWidth+20,top:15,position:"absolute"});
   cnt.append(otherButtons);

   var viewAll = $('<span class="clickableElement">view all</span>');
   viewAll.css({"margin-right":"10px"});
   //viewAll.css({left:lib.zSlider.totalWidth+0,top:10,position:"absolute"});
   otherButtons.append(viewAll);
   viewAll.click(function () {
    // view all also normalizes the snap grid if the snap array panel is up;
    if (lib.vp.zoom == 1) {
      lib.computeSnapVisibility();
    } else {
      lib.vp.setZoom(1);
    }
    if (lib.currentPanel.name=="snapArray") {
      //lib.setSnapsMessage();
      lib.selectClickable(lib.snapArrayButton);
    }
   });
   var showSnaps = $('<span class="clickableElement">show outlines</span>');
   showSnaps.css("font-size","9pt");
   lib.showSnapsButton = showSnaps;
   //showSnaps.css({left:lib.zSlider.totalWidth+70,top:10,position:"absolute"});
   //cnt.append(showSnaps);
   otherButtons.append(showSnaps);
   showSnaps.click(function () {
      if (lib.showSnapsMode) {
        lib.exitShowSnapsMode();
      } else {
        lib.enterShowSnapsMode();
      }});
   var snapAdvice = $('<span></span>');
   snapAdvice.html(lib.stdSnapAdvice());
   //snapAdvice.css({left:lib.zSlider.totalWidth+170,top:15,position:"absolute"})
   snapAdvice.css({left:lib.zSlider.totalWidth,top:45,position:"absolute"})
   // snapAdvice.css({"font-style":"italic",left:10,top:45,position:"absolute"})
    lib.snapAdvice = snapAdvice;
   cnt.append(snapAdvice);
    var gap = $('<div class="gap"></div>');
    container.append(gap);
 
  }
  
  lib.embedText = function (wd) {
    var topic = lib.albumD.topic;
    var url = " http://s3.imagediver.org/widget.js?album=";
    // var rs = http://s3.imagediver.org/widget.js?album=4294b0e.astoria_1923.1&width=201
    if (wd >= 700) {
      var ht = Math.round(wd * 0.666);
      var url = "http://s3.imagediver.org/topic"+topic+"/index.html?embed=true";
      var rs = '<iframe src = "'+url+'" width="'+wd+'" height="'+ht+'"></iframe>';
    } else {
      var tps = topic.split("/");
      url += tps[2]+"."+tps[3]+"."+tps[4]+"&width="+wd;
      var rs = '<script type="text/javascript" src="'+url+'"></script>'
    }
    var ers = util.htmlEscape(rs);
    return ers;
  }
  
  
  lib.tweetButtonText = '<a href="https://twitter.com/share" class="twitter-share-button" data-via="imagediver">Tweet</a>'+
'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
  lib.editPermissions = function () {
    return (idv.loggedInUser == lib.albumD.owner) && (!lib.published) && (!idv.embed);
  }
  //lib.tweetButtonText = ''; 
  lib.renderButtons = function (container,floatRight) {
    var testingEmbed = 0; //@rremove
    var cnt = container;
    var elements = {};
    var loggedInUser = idv.loggedInUser;
    if (!lib.custom) {
      if (lib.editPermissions()) {
        var createSnapActivator = $('<span class="clickableElement">new snap</span>');
        pn = lib.setPanelActivator("createSnap",createSnapActivator);
        pn.scalable = false;
        pn.height = null;
        //var editAlbumActivator = $('<span class="clickableElement">edit album properties</span>');
       //pn = lib.setPanelActivator("editAlbum",editAlbumActivator);
        pn.scalable = false;
        pn.height = null;
        if (!testingEmbed) {
          var publishButton =  $('<span class="clickableElement">publish</span>');
          lib.publishButton = publishButton;
          publishButton.click(function () {
            var ttl = page.albumD.title;
            if (!ttl) ttl = "...";
            util.myAlert("notice","Publishing "+ttl);
            var data = {topic:page.albumD.topic};
            util.post("/api/publishAlbum",data,function (rs) {
              //util.closeDialog();
              util.dialogDiv.html("Done");
              lib.beenPublished = 1;
              publishedButton.show();
            });
            
          })
          var publishedButton =  $('<span class="clickableElement">public version</span>');
          publishedButton.click(function () {
             var url = util.publishedUrl(lib.albumD.topic);
            location.href =  url ;
          });
          if (!lib.beenPublished) {
            publishedButton.hide();
          }
      }
     }
      var selectedSnapActivator = $('<span class="clickableElement">1 by 1</span>');
      pn =lib.setPanelActivator("selectedSnap",selectedSnapActivator);
      pn.selfScaling = true;
      lib.setPanelNominalHeight("selectedSnap",400);
  
  
      var snapArrayActivator = $('<span class="clickableElement">all snaps</span>');
      lib.snapArrayButton = snapArrayActivator;
      snapArrayActivator.click(function () {
        if (lib.hideLinks) lib.hideLinks();
        lib.computeSnapVisibility();
        //snapArrayActivator.html("all visible snaps");
      }); // not in initializer, because snap arrays are activated from clicking multiple snaps in viewport. 
      pn = lib.setPanelActivator("snapArray",snapArrayActivator);
      pn.selfScaling = true;
    }
    if (floatRight) {
      if (!lib.custom) {
        if (loggedInUser) {
          createSnapActivator.css("float","right");
          cnt.append(createSnapActivator);
          cnt.append(publishButton);
          cnt.append(publishedButton);
          //editAlbumActivator.css("float","right");
          //cnt.append(editAlbumActivator);
        }
        selectedSnapActivator.css("float","right");
        cnt.append(selectedSnapActivator);
        snapArrayActivator.css("float","right");
        cnt.append(snapArrayActivator);
      }
    } else {
      if (!lib.custom) {
        cnt.append(snapArrayActivator);      
        cnt.append(selectedSnapActivator);
        if (loggedInUser) {
          cnt.append(createSnapActivator);
          cnt.append(publishButton);
          cnt.append(publishedButton);
          //cnt.append(editAlbumActivator);
        }
      }
      if (idv.embed) return;
      var tumblrButton =  $('<span style="vertical-align:top" class="clickableElement">&#x25BA;tumblr</span>');
      cnt.append(tumblrButton);
      tumblrButton.click(function () {
        var ssn = lib.selectedSnap;
        var url = "http://"+idv.apiHost+"/post_to_tumblr";
        
        if (ssn) {
          var sd = ssn.snapD;          
          var data =  util.setProperties(null,sd,["caption","cropid","description","topic"]);
        } else {
          var data =  util.setProperties(null,lib.albumD,["caption","description","topic"]);
          if (lib.imD.description) data.imageDescription = lib.imD.description;
        }
        if (lib.imD.title) data.imageTitle = lib.imD.title;
        if (lib.imD.author) data.imageAuthor = lib.imD.author;
        var dataj = JSON.stringify(data);
        sessionStorage.signingInWithTumblr = "";
        sessionStorage.post_to_tumblr_args = dataj; // this is retrieved if the user needs to enable tumblr
        var url = "http://"+idv.apiHost+"/post_to_tumblr";
        var inp;
        var frm = $('<form enctype = "text/plain" action="'+url+'" method="POST">').append(
        inp = $('<input type="hidden" name="data"/>'));
        inp.attr("value",dataj);
        frm.submit();
        return;
         // location.href = url;

        });
        
      if (!loggedInUser || lib.published || testingEmbed) { //1 )
        var shareButton;
        if (lib.includeShare) {
          shareButton = $('<span class="clickableElement">share</span>');
          lib.shareButton = shareButton;
          cnt.append(shareButton);
        }
        var embedButton = $('<span style="vertical-align:top" class="clickableElement">embed</span>');
        cnt.append(embedButton);
        var linkButton = $('<span style="vertical-align:top" class="clickableElement">links</span>');
        cnt.append(linkButton); //@note put back in for link
        
       
        
        var annotateButton = $('<span style="vertical-align:top" class="clickableElement">annotate</span>');
        cnt.append(annotateButton);
        var albumDs = lib.albumDs;
        var otherAlbumsButton = undefined;
        if (lib.includeShare) {
          var shareDiv = $('<div class = "shareDiv"></div>');
          cnt.append(shareDiv);        
          var fbl = $(lib.facebookLikeButton(lib.albumD.topic,120,30));
          shareDiv.append(fbl);
          var tweetButton = $(lib.tweetButtonText);
           shareDiv.append(tweetButton);
          shareDiv.hide();
          shareButton.click(function (){
            if (shareDiv.css("display")=="none") {
              shareButton.html("hide share");
              shareDiv.show();
              embedButton.hide();
              linkButton.hide();
              var tweetIframe = $(".twitter-share-button");
              tweetIframe.css({"position":"relative","top":"-8px"});
              if (otherAlbumsButton) {
                otherAlbumsButton.hide();
              }
      
            } else {
               shareButton.html("share");
               shareDiv.hide();
               embedButton.show();
               linkButton.show();
               //embedDiv.hide();
               lib.theLayout.additionalHeight = lib.originalAdditionalHeight;
  
               //embedButton.html("embed");
               if (otherAlbumsButton) {
                otherAlbumsButton.show();
              }
            }
          });
        }
  
    
    }

  if (!loggedInUser || lib.published || testingEmbed) { //1 ) 
    var embedDiv = $('<div class="embedDiv"></div>');
    cnt.append(embedDiv);
    embedDiv.css({'border':'solid thin green'});
    embedDiv.hide();
    var embedTextarea = $('<textarea rows="4" wrap="on" cols="50" readonly="readonly" onclick="this.focus();this.select()"></textarea>');
    embedDiv.append("<p >Copy and paste the script or iframe tag below into your webpage or blog after setting the width. If less than 700, an image is embedded, which, when clicked, displays the album in a lightbox. If greater than 700 the album itself will be embedded.</p>")
    var widin = $('<input type="text" size = "6" value="200"/>');
    widin.blur(function () {
      vl = widin.attr('value');
      var pint = parseInt(vl);
      if (isNaN(pint) || (pint <= 0)) {
        util.myAlert("Error","Width should be a positive integer");
      } else {
        embedTextarea.html(lib.embedText(pint));
      }
    });
  var widdiv = $('<div/>');
  embedDiv.append(widdiv);
  widdiv.html("Width in pixels of the embed: ")
  widdiv.append(widin);
   embedDiv.append(embedTextarea);
    var eht = 150;//embedDiv.height();
      embedButton.click(function () {
        if (embedDiv.css("display")=="none") {
          embedButton.html("hide embed");
          embedDiv.show();
          if (shareButton) shareButton.hide();
          linkButton.hide();
          $(document).scrollTop(embedDiv.offset().top);
          //lib.theLayout.additionalHeight = lib.theLayout.additionalHeight+eht;
        } else {
           embedButton.html("embed");
           embedDiv.hide();
           if (shareButton) shareButton.show();
           linkButton.show();
            lib.theLayout.additionalHeight = lib.originalAdditionalHeight;
        }
        lib.placeDivs();

      });
      embedTextarea.html(lib.embedText(200));
      embedDiv.hide();
    }
    if (!loggedInUser || lib.published || testingEmbed) { //1 )
    //if (1) {
      var linkDiv = $('<div class="embedDiv"></div>');
      cnt.append(linkDiv);
      linkDiv.css({'border':'solid thin green'});
      //linkDiv.hide();
      var linkstart = "http://s3.imagediver.org/";
      function addLine(caption,link) {
        var lnk = $('<input type="text" onclick="this.focus();this.select()"/>');
        var line =  $('<div><span id="caption"></span></div>').append(lnk);
        $('#caption',line).html(caption).css({"margin-right":"10px"})
        lnk.css({width:"85%","font-size":"8pt"});
        lnk.attr("value",link);
        linkDiv.append(line);
 
      }
      
      function addLines() {
        addLine("This page:",linkstart+"topic"+lib.albumTopic+"/index.html");
        if (lib.selectedSnap) {
          var snapNum = page.selectedSnap.snapD.topicId;
          var cropNum = page.selectedSnap.snapD.cropid;
          addLine("This snap:",linkstart+"topic"+lib.albumTopic+'/index.html#snap='+snapNum);
        }
        //http://static.imagediver.org/images/4294b0e/Saint_Francis_Bellini/resized/area_250000.jpg
        // http://dev.imagediver.org/images/4294b0e/bosch_st_anthony/snap/10.jpg?album=4294b0e.1
        //http://dev.imagediver.org/images/4294b0e/bosch_st_anthony/snap/10.jpg?album=4294b0e.1
        var imagestart = "http://static.imagediver.org/images/";
        var imtps = page.imD.topic.split("/");
        var imu = imtps[2];
        var imt = imtps[3];
        linkDiv.append('<hr/>');
        linkDiv.append($('<span>Images:</span>'));
        //http://static.imagediver.org/images/4294b0e/Saint_Francis_Bellini/resized/area_250000.jpg
        addLine("Full image:",imagestart+imu+"/"+imt+"/resized/area_250000.jpg");
        addLine($("<span>smaller:</span>").css({'margin-left':'10px'}),imagestart+imu+"/"+imt+"/resized/area_50000.jpg");
        addLine($("<span>larger:</span>").css({'margin-left':'10px'}),imagestart+imu+"/"+imt+"/resized/area_1000000.jpg");
        if (lib.selectedSnap) {
          addLine("Snap:",imagestart+imu+"/"+imt+"/snap/"+cropNum+".jpg");
          addLine($("<span>smaller:</span>").css({'margin-left':'10px'}),imagestart+imu+"/"+imt+"/snapthumb/"+cropNum+".jpg");
        }


      }
      
    var eht = 150;//embedDiv.height();
      lib.hideLinks = function () {
           linkButton.html("links");
           linkDiv.hide();
           linkButton.show();
           if (shareButton) shareButton.show();
           embedButton.show();
      }
      lib.updateLinks = function () {
        if (linkDiv.css("display")!="none") {
          linkDiv.empty();
          addLines();
        }
      }
      linkButton.click(function () {
        if (linkDiv.css("display")=="none") {
          linkButton.html("hide links");
          linkDiv.show();
          if (shareButton) shareButton.hide();
          embedButton.hide();
          linkDiv.empty();
          addLines();
          $(document).scrollTop(linkDiv.offset().top);
          //lib.theLayout.additionalHeight = lib.theLayout.additionalHeight+eht;
        } else {
          lib.hideLinks();
        }
        lib.placeDivs();

      });
      linkDiv.hide();
    }
    if (annotateButton) {
     // if (loggedInUser) {
     //   if (lib.published || testingEmbed) { //1 )
      annotateButton.click(function () {
        var im = lib.imD.topic;
        //var ims = im.split("/");
        var host = idv.devVersion?"dev.imagediver.org":"imagediver.org";
        var url = "http://"+host+"/annotate?image="+im;
        location.href = url;
      });
  }
 
  }
  }
  
  /*
  lib.createNewAlbum = function () {
     var data = {image:lib.imD.topic};
       var host = idv.devVersion?"dev.imagediver.org":"imagediver.org";
       var url = "http://"+host+"/api/newAlbum";
       alert(url);
      util.post(url,data,function (rs) {
            //util.closeDialog();
            if (rs.status == "fail") {
              util.myAlert("You already have annotations of this image");
            } else {
              //util.myAlert("Now opening your new, empty album of annotations");
              var tp = rs.value.album;
              var dst = "/topic"+tp+"/index.html#msg=firstalbum"
              location.href = dst;
              //setTimeout(function () {location.href=dst;},3000);
            }
          
          });
     
    
  }
  */
  // A view
  
  lib.setParams = function(imD) {
    if (page.twoColumns) {
      lib.aspectRatio = 1; // aspect ratio of the viewport
    } else {
      lib.aspectRatio = 2;
    }
    var imTopic = imD.topic
    var imTopicS = imTopic.split("/");
    lib.imOwner = imTopicS[2];
    lib.imName = imTopicS[3];
    // the snap params are all scaled by page.scale before use
    lib.snapThumbMinWidth=250; // for selected snap
    lib.snapArrayMinThumbWidth = 180; // for the array of snaps
    lib.prevNextWidth = 100; // amount of width allocated to each of the prev and next thumbs
    lib.snapThumbMargin = 20;
    lib.snapThumbHeight=150;
    lib.snapThumbBottomMargin = 40;
    lib.snapThumbCaptionHeight=90;
    lib.snapGapX = 10;
    lib.snapGapY = 10;
    lib.snapHeight = 550; // for the selected snap // was 650
    lib.snapTop = 120; // was 20
    lib.thumbTop = 180;
    
    lib.zoomDelay = 50;
    lib.zoomIncrement = 1.05;
    lib.maxZoom = 256; // for astoria 1923 panorama
    lib.initialZoom = 1;

    lib.imD = imD;
  
   // lib.depthBias = -1; // gone/computed applies for all images; determines when to go to higher res images. higher values=higher res
    lib.image = new imlib.Image(imD);
    lib.tiling = new imlib.Tiling(lib.image,256,1,imD.tilingDepthBump);
    lib.maxDepth = lib.tiling.depth;
    

  }
  
  
 
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new geom.Rect(corner,nex);
    return rs;
  }
    
    
  
  
  
  lib.defaultPanelHeight = function () {
    return lib.standardPanelHeight * lib.theLibrary.scale;
  }
  
  
  
  lib.placeDivs = function () {
    lib.theLayout.placeDivs();
    lib.vp.scale = lib.theLayout.scale;
    lib.vp.refresh(true);
  }
  
  lib.genFullTitle = function  () {
    if (document.location.pathname == "/") {
      var fullTitle = "the depths of high-resolution images, annotated";
    } else {
      var author = lib.imD.author;
      if (author) {
        author = ", "+author;
      } else {
        author = "";
      }
      var imt = lib.imD.title;
      if (!imt) imt = lib.imD.name;
      var caption = lib.albumD.caption;
      if (caption) {
        caption = ": "+$.trim(caption);
      } else {
        caption = "";
      }
      fullTitle = imt + author +  caption;
    }
    return fullTitle;
  }
  
  
  lib.updateTopbarOptions = function (options) {
    
    var title = lib.genFullTitle();
    options.title = util.sanitize(title);
     var dp = [];
/*
    var json = util.jsonUrl(lib.albumD.topic);
    dp.push({title:"json",url:json});
    options.detailPages = dp;
*/
   
  }

  
  
  lib.genDivs = function () {
    var b = $('body');
    fullTitle = lib.genFullTitle();
    var twoC = page.twoColumns;
    twoC = 1;
   /*
    var wpg = lib.albumD.wikipediaPage;
    var json = util.jsonUrl(lib.albumD.topic);
    
    if (idv.atS3) {
      var json = "/topic"+lib.albumD.topic+"/topic.json";
    } else {
      var json = "/api"+lib.albumD.topic;
    }
    */
     if (page.fullsizeOption) {
      var fullsize = "/topic"+lib.albumD.image+"/index.html";
    } else {
      fullsize = false;
    }
    var pqs = util.parseQS();
    var embed = idv.embed;
    var title = lib.genFullTitle();
    var imlink = "/topic"+lib.imD.topic+"/index.html";
    //var imdomain = lib.forS3Dev?"http://dev.imagediver.org":"http://imagediver.org";
    var imdomain = "http://imagediver.org";
    var fimlink = imdomain +  imlink;
    var topbarOptions = {title:util.sanitize(title),embed:embed,imagePage:fimlink,detailsLink:{text:"image details",action:lib.popImageDetails},includeGallery:1};
    if (twoC) { // the only option left
      var outerDiv = $('.outerDiv');
      if (outerDiv.length == 0) {
        outerDiv = $("<div class='outerDiv'/>");
        b.append(outerDiv);
      }
      lib.outerDiv = outerDiv;
      lib.topbar = imlib.genTopbar(outerDiv,topbarOptions);
      var colsDiv = $("<div class='columns'/>")
      outerDiv.append(colsDiv);
      /*
     colsDiv.mousedown(function (e) {
        //idv.util.slog("mouseDown");
        if (!idv.loggedInUser) e.preventDefault();// this prevent default prevents some bluing, but also prevents text entry
      });
      */
      var c0Div = $("<div class='leftColumnDiv'/>");
      lib.c0Div = c0Div;
      colsDiv.append(c0Div);
      var c1Div = $("<div class='columnDiv'/>");
      lib.c1Div = c1Div;
      colsDiv.append(c1Div);

    } else {
      var c1Div = $("<div class='columnDiv'/>");
      lib.c1Div = c1Div;
      b.append(c1Div);
      if (!idv.embed) lib.topDiv = imlib.genTopbar(c1Div,topbarOptions);
      

    }
    //if (lib.thisIsHomePage) {
    if (false) {
      lib.noteDiv = $('<div class="noteDiv"><p> See the <span id="galleryLink">gallery</span> for a few more images</p>'+
                      '<p style="line-height:10px;top:0px;width:100%;text-align:center">Astoria in 1923</p></div>');
      b.append(lib.noteDiv);
      $('#galleryLink').click(function () {location.href = "/gallery";});
      lib.noteSdiv.element = lib.noteDiv;
    }
    
    
    
    lib.vpDiv = $('<div class="viewport" id="viewport0" style="z-index:0"/>');
    c1Div.append(lib.vpDiv);
     // add a div to catch events
    var evDiv = $('<div id="evDiv"></div>');
    evDiv.css({"position":"absolute","background-color":"transparent"});
 
    lib.evDiv = evDiv;
    lib.vpDiv.append(evDiv);
    // captions over image when in showsnaps mode
    lib.vpCapDiv = $('<div class="vpCap" id="viewport0" style="position:absolute;background-color:black;border:solid thin white;padding:3px;font-size:8pt;z-index:1000">TEST</div>');
    lib.vpDiv.append(lib.vpCapDiv);
    lib.vpCapDiv.hide();
    lib.vpSelectDiv = $('<div class="vpSelect" id="vpSelect" style="margin:0px;padding:0px;position:absolute;background-color:transparent;font-size:8pt;z-index:2000;border:solid yellow;border-width:2px;"></div>');
    lib.vpDiv.append(lib.vpSelectDiv);
    lib.vpSelectDiv.hide();
    lib.zoomDiv = $('<div class="controls"/>');
    c1Div.append(lib.zoomDiv);
    if (!lib.custom) {
      lib.panels = {};  // indexed by panel names; values have form {activator:,panel: }
      lib.panelDiv = $('<div class="panel_container" />'); // lower panel container
      if (!idv.loggedInUser) {
        lib.panelDiv.mousedown(function (e) { // was click
          e.preventDefault();
         });
      }
    }
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
  
    if (twoC) {
      if (!lib.custom) {
        lib.panelDiv.css("overflow","auto");
        c0Div.append(lib.panelDiv);

      }
      lib.buttonsDiv = $('<div class="controls"/>');
      c0Div.append(lib.buttonsDiv);
      lib.renderButtons(lib.buttonsDiv,false);
      if (idv.embed) {
        var margin = 10;
      } else {
        margin = 20;
      }
      //outerDiv.append(lib.bottomDiv);
      var aheight = idv.embed?110:140;
      lib.theLayout = new lib.LayoutTwo({
        outerDiv:lib.outerDiv,
        colsDiv:colsDiv,
        leftDiv:lib.c0Div,
        rightDiv:lib.c1Div,
        panelDiv:lib.panelDiv,
        vpDiv:lib.vpDiv,
        evDiv:lib.evDiv,
        margin:margin,
        aspectRatio:lib.aspectRatio,
        minScale:0.33, // was .3
        additionalHeight:aheight, //was 200
        includeLightbox:(!idv.embed)
      });
    } else {
      c1Div.append(lib.panelDiv);
      lib.renderButtons(lib.zoomDiv,true);

      c1Div.append(lib.bottomDiv);
      lib.theLayout = new lib.LayoutOne({
        centerDiv:lib.c1Div,
        vpDiv:lib.vpDiv,
        margin:20,
        aspectRatio:lib.aspectRatio,
        minScale:0.6, 
        additionalHeight:165
      });
    }
    lib.originalAdditionalHeight = lib.theLayout.additionalHeight;

    lib.theLayout.placeDivs();
    lib.topbar.lightbox = lib.theLayout.lightbox;
    lib.lightbox = lib.theLayout.lightbox;

  //  lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",container:lib.vpDiv,extent:vpRect.extent,zIndex:100,backgroundColor:"#000000"});
  // lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",container:lib.vpDiv,extent:vpRect.extent,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
 
    var vpExtent = lib.theLayout.vpExtent;
    lib.vpCanvas = imlib.genCanvas({whichCanvas:"vp",extent:vpExtent,container:lib.vpDiv,zIndex:-1,backgroundColor:"#000000"});
   lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
   if (!idv.useFlash) {
      lib.selCanvas = imlib.genCanvas({whichCanvas:"sel",extent:vpExtent,container:lib.vpDiv,zIndex:300,backgroundColor:"transparent"}); // overlay canvas
      lib.hiliCanvas = imlib.genCanvas({whichCanvas:"hili",extent:vpExtent,container:lib.vpDiv,zIndex:400,backgroundColor:"transparent"}); // overlay canvas
   }

    //lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:1,backgroundColor:"green"}); // overlay canvas


    

   
    lib.bottomDiv = $('<div class="bottomDiv"></div>');
   // b.append(lib.bottomDiv);
   // lib.bottomSdiv.element=lib.bottomDiv;
   
    if (!lib.custom) {    
      lib.addSnapArrayDiv(lib.panelDiv);
   
      lib.addSelectedSnapDiv(lib.panelDiv);
      //lib.addCreateSnapDiv(lib.panelDiv);
    }
    //lib.addEditAlbumDiv(lib.panelDiv);
   // lib.addAboutImageDiv(lib.panelDiv);
    
    /*
    lib.theLayout.topDiv = lib.titleDiv;
    lib.theLayout.vpDiv = lib.vpDiv;
    //lib.theLayout.controlDiv = lib.controlDiv;
    lib.theLayout.zoom
    lib.theLayout.panelDiv = lib.panelDiv;
    lib.theLayout.bottomDiv = lib.bottomDiv;
    */
    
    lib.theLayout.placeDivs();
    lib.theLayout.afterPlacement = function () {
    if (lib.vp) {
        var layout = lib.theLayout;
        lib.vp.scale = layout.scale;
        var vpCss = layout.vpCss;
        //lib.setCss(lib.vp,vpCss);
       lib.vpCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y});
      /* /NEW 
      lib.ovCanvas = imlib.genCanvas({whichCanvas:"ov",extent:vpExtent,container:lib.vpDiv,zIndex:200,backgroundColor:"transparent"}); // overlay canvas
      lib.vp.ovContext =  lib.ovCanvas[0].getContext('2d');
      lib.ovCanvas.viewport = lib.vp
      //var dovCanvas = ovCanvas[0];
      lib.vp.ovCanvas = lib.ovCanvas;
      //END NEW
      */
    
        if (lib.ovCanvas) lib.ovCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        if (lib.selCanvas) lib.selCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
        if (lib.hiliCanvas) lib.hiliCanvas.attr({width:layout.vpExtent.x,height:layout.vpExtent.y})
       //lib.setCss(lib.vpCanvas,vpCss);
        //lib.setCss(lib.ovCanvas,vpCss);
         lib.vp.refresh(true);
      }
    }
  }
  
  
    
  
  lib.genViewports = function () {   
    lib.tiling.createTiles();
    var vpExtent = lib.theLayout.vpExtent;

    var vp = new imlib.Viewport(lib.vpDiv,lib.vpCanvas,lib.tiling,vpExtent,[lib.ovCanvas,lib.selCanvas,lib.hiliCanvas]);
    lib.vp = vp;
    //vp.changeViewCallbacks.push(lib.computeSnapVisibility);
    //vp.changeViewCallbacks.push(lib.setSnapsMessage);
    //vp.changeViewCallbacks.push(lib.drawSelectedSnaps);
 //   vp.depthBias = lib.depthBias;
    vp.zoom = lib.initialZoom;
    lib.vp = vp;
    imlib.mainVP = vp;
    vp.maxZoom = lib.maxZoom;
    vp.maxDepth = lib.maxDepth;
    vp.depthBump = lib.imD.zoomDepthBump;
    lib.vp.panControl = new imlib.PanControl(lib.vpDiv,vp);
    lib.renderZoomControl(lib.zoomDiv);

  }
  
  lib.test = function () {
    var ov = new imlib.Overlay("test",new geom.Rect(new geom.Point(12000,2000),new geom.Point(5000,1000)));
    lib.vp.addOverlay(ov);
  }
  
  //lib.initialize = function (imD,albumD,albumDs,loggedInUser,callback) {
  lib.initialize = function () {
    var topic = "/snap/4294b0e/mabuse_adoration_of_kings/2/1";
    idv.util.commonInit();
    var url = "/topic"+topic+"/main.json";
    lib.loadingDiv = $('<div style="margin:40px"><center>LOADING...  <img src="/ajax-loader.gif"/></center></dir>');
    $('body').append(lib.loadingDiv);
    $.getJSON(url,function (rs) {
      lib.snapD = rs.value;
      lib.albumTopic = lib.snapD.album;
      var aurl = "/topic"+lib.albumTopic+"/main.json";
      $.getJSON(aurl,function (rs) {
        lib.albumD = rs.value;
        lib.imD = rs.value.image;
        $('document').ready(initialize2);
        return;
      });
      return;
    });
    return;
  }
 
    
    
    
  function initialize2() {
    lib.custom = false;    // custom left panel; html
    util.tlog("initialize");
    var albumD = lib.albumD;
    var imD = lib.imD;
    var imdim = imD.dimensions;
    var imx = imdim.x;
    var tps = albumD.topic.split("/");
    var aid = tps[4];
    var owner = tps[2];
    lib.albumOwner = owner;
    lib.albumNum = aid;
    lib.albumString = owner+"."+aid; // for logging
    util.commonInit();
    idv.pageKind = "album";
    var snapDs = lib.snapDs;
    lib.snapDsByTopicNum = {};
    lib.snapD.topicId = util.pathLast(lib.snapD.topic);
    var imdim = imD.dimensions;
    var imx  = imdim.x;
    lib.internalizeSnapD(lib.snapD,imx);
    var imy = imdim.y;
    var imar = imx/imy;
    //page.twoColumns = imar < 1.9;
    page.twoColums = true;
    // a bit of a hack for garden of earthly delights
    page.fullsizeOption = (imar > 1.6);
    lib.setParams(imD);
    var albumTopic = albumD.topic;
    var sp = albumTopic.split("/");
    var spln = sp.length;
    lib.albumId = sp[spln-1];
    
    
    lib.genDivs();
    lib.genViewports();

    $(window).resize(function() {
      util.log("resize",$(window).width());
      lib.placeDivs();
       lib.resizeCurrentPanel();
    });
        util.tlog("pre add snaps");
    var snapDs = [lib.snapD];
    lib.snapDs = snapDs;
    lib.addSnap(lib.snapD);
    //lib.addSnaps(snapDs,0);
    util.tlog("after add snaps");
    lib.hookupPanelActivators();
    lib.selectPanel("snapArray");
 
    util.tlog("pre place divs");
    lib.placeDivs();
    util.tlog("after place divs");
    lib.resizeCurrentPanel();
    lib.loadingDiv.hide();
    lib.vp.refresh(true);
    util.slog("REFRESH");
    util.addDialogDiv($('.columns'));
    //if (location.hash.indexOf("msg=firstalbum") >= 0) {
    //  lib.lightboxMessage("Here is your new empty album of annotations for this image. ");
    //}
//    if (snapDs.length == 0) lib.selectPanel('createSnap');
    lib.enterShowSnapsMode();
    lib.showSelectedSnap(lib.snapD);

    return;
    setTimeout(function () {lib.addSnaps(snapDs,500000);lib.enterShowSnapsMode();lib.checkNoSnaps();lib.showSnapByTopic()},100);
     util.tlog("initialize done");
  }
  lib.defaultPanelHeight = function () {
    return lib.theLayout.scale * lib.theLayout.panelCss.height;
  }
  
  lib.testUpdate = 3;
   
})();
  