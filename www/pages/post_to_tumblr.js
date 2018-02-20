
(function () {
  
  /*
   http://dev.imagediver.org/post_to_tumblr?album=/album/4294b0e/van_eyck_arnolfini/1&snap=9&crop=12
  */

  var lib = page;
  lib.nowPosting = 0;  // set to true while posting to tumblr is underway
     var geom = idv.geom;
  var imlib = idv.image;

  //var com = idv.common;
  var util  = idv.util;
   var common = idv.common;

  
  lib.badInput = function (msg) {
    $('.infoDiv').append($('<div>').html(msg));
  }
  
  lib.initialize = function (options) {
    options.linkToSnap = 0;
    idv.util.commonInit();
    idv.topbar.genTopbar($('body'),{title:'Post to Tumblr'});

    //util.loggedInUserFromCookie();
    var dv = $('.infoDiv');
    var nt,bt;
    var topic = options.topic;
    var topob = new util.topicOb(topic)
    //var tops = topic.split("/");
    var emsg = "Something is amiss: no such topic."
    /*var tln = tops.length;
    if (tln < 5) {
      lib.badInput(emsg)
      return;
    }
    */
    var data = {topic:topic}
    var kind = topob.kind;
    var ownr = topob.imageOwner;
    var imname = topob.imageName;
    var albumNum = topob.albumId
    var cuser = util.pathLast(idv.loggedInUser);
    if (cuser != ownr) {
      var ownerName = options.userName; // credit in the post
    }
    if (kind == "snap") {
      var isSnap = true;
      var snapid = topob.snapId;
      var cropid = options.cropid;
      //var snapd = lib.snapDsByTopicNum[snapid];
      //var snap = util.setProperties(null,options,["caption","cropid","description","topic"]);
      //var cropid = snap.cropid;
      //data.snap = snap;
    } else if (kind == "album") {
      isSnap = false;
      //var album = util.setProperties(null,lib.albumD,["caption","description"]);
      //data.album = album;
    }
    
    
    
    scaption = options.caption;
    sdes = options.description;
    var caption;
    if (isSnap) {
      caption = "Click on the image to see the detail in a zoomable context.\n\n";
    } else {
      caption = "Click on the image to see a zoomable version.\n\n";

    }
    tags = [];
     var imageTitle = options.imageTitle;
     var imageAuthor = options.imageAuthor;
     var imageYear = options.imageYear;
    if (imageTitle)  {
      
      caption += "Detail from *"+imageTitle+"*";
      if (imageTitle.indexOf(",") < 0) tags.push(imageTitle);
      if (imageAuthor) {
        caption += ", "+imageAuthor;
        if (imageAuthor.indexOf(",") < 0) tags.push(imageAuthor);
      }
      if (imageYear) {
        caption += ", "+imageYear;
      }
    }
    if (isSnap && scaption) caption += "\n\n"+scaption
    if (isSnap && sdes) {
      caption +=  "\n\n"
      caption += sdes;
    } else {
      var imdes = options.imageDescription;
      if (imdes) {
        caption += "\n\n"+ imdes;
      }
    }
    if (ownerName) caption += "\n\n From  "+ownerName+" at [Imagediver](http://imagediver.org)"
    
    data.caption = caption;
    data.tags = tags;
    if (tags) tags.push("imagediver");
    
    /*
     data.imageTitle = options.imageTitle;
    data.imageAuthor = options.imageAuthor;
    data.imageDescription = options.imageDescription;
    */
    //var snap = options.snap;
    /*
    if (caption) {
      dst = $('<div/');
      util.creole.parse(dst[0],caption);
      rcap = dst.html();
      http://dev.imagediver.org/images/4294b0e/testd_3/snap/28.jpg?album=undefined.14
    }
    http://static.imagediver.org/images/4294b0e/mabuse_adoration_of_kings/snap/15.jpg
    */
    //var topicdir = idv.useTopicd?"topicd":"topic"
    if (isSnap) {
      var imsrc =  "http://static.imagediver.org/images/"+ownr+"/"+imname+"/snap/"+cropid+".jpg";
      var backLink = idv.topicDir+"/album/"+ownr+"/"+imname+"/"+albumNum+"/index.html#snap="+snapid

    } else {
      var imsrc =  "http://static.imagediver.org/images/"+ownr+"/"+imname+"/resized/area_250000.jpg";
      backLink = idv.topicDir+topic+"/index.html"
    }
    /*
     if (options.fromSnapPage) {
        var linkTo = "http://s3.imagediver.org"+idv.topicDir+"/album/"+ownr+"/"+imname+"/"+albumNum+"/index.html#snap="+snapid;
        //var wsn = "/"+tops.slice(2).join("/");
        //  var linkTo = "http://s3.imagediver.org"+util.topicDir+"/album/"+ownr+"/"+imname+"/"+albumNum+"/index.html#snap="+snapid;
         //var linkTo = "http://s3.imagediver.org/snap.html?topic="+wsn;
    }
    */
    data.imageSource = imsrc;
    var imel = '<img src="'+imsrc+'"/>';
    dv.append(imel);
    var url = "http://"+idv.apiHost+"/api/tumblrPost";
    var msg;
    var blogsdiv;
    function postToBlog(bnm) {
      //var data = options;
      if (lib.nowPosting) {
        util.myAlert("Posting to Tumblr is underway. This should be complete shortly, unless the Tumblr site is experiencing difficulties");
        return;
      }
      data.blog=bnm;
      if (isSnap) {
        var chk = snapAlone.attr("checked");
        if (chk)  {
          var linkTo = "http://s3.imagediver.org"+idv.topicDir+"/snap/"+ownr+"/"+imname+"/"+albumNum+"/"+snapid+"/index.html";
        } else {
          var linkTo = "http://s3.imagediver.org"+idv.topicDir+"/album/"+ownr+"/"+imname+"/"+albumNum+"/index.html#snap="+snapid;
        }
      } else {
        var linkTo = "http://s3.imagediver.org"+idv.topicDir+topic+"/index.html";
      }
      data.linkTo = linkTo;
      lib.nowPosting = 1;
      //options.blog = "chrisgoad.tumblr.com";

      util.post(url,data,function (rs) {
          lib.nowPosting = 0;

           if (rs.status == "ok") {
             var abc = 33;
             blogsdiv.hide();
             msg.html("The annotation has been posted as a draft");
          } else {
            msg.html("The post to Tumblr failed. We're not sure why, though a  Tumblr api outage is possible. Please try again later.")
          }
       
      });
    }
    //var imsrc = "http://static.imagediver.org/images/4294b0e/van_eyck_arnolfini/snap/12.jpg?album=4294b0e.1
    var blogs = options.blogs;
    var bln = blogs.length;
    var rex = /http\:\/\/([^\/]*)\//;
    if (bln > 1) {
      dv.append(blogsdiv=$('<div/>'));
      blogsdiv.append('<div>Which blog should this be posted to?</div>');
       util.arrayForEach(blogs,function (b) {
        var bnm = b.match(rex)[1]
        var bel = $('<div/>').html(bnm);
        blogsdiv.append(bel);
        bel.css({"cursor":"pointer","margin-top":"10px","margin-left":"20px","text-decoration":"underline"});
        bel.click(function () {
          postToBlog(bnm);
        })
      })
    } else if (bln == 1) {
      dv.append(blogsdiv=$('<div/>'));

      blogsdiv.append(nt = $('<div>This will post the  annotation to your Tumblr blog.</div>'));
      nt.css({'margin-bottom':'20px'});
      blogsdiv.append(
        bt = $('<div>'+
            '<span id="ok" class="clickableElement">Ok</span>'+
            '<span id="cancel" class="clickableElement">Cancel</span>'+
          '</div>'));
      bt.css({"margin-bottom":"10px"});
      var ok = $("#ok",dv);
      var cancel = $("#cancel",dv);
      var bnm =  blogs[0].match(rex)[1];
      
      ok.click(function () {postToBlog(bnm);});
      cancel.click(function () {location.href=linkTo;});
      /*
        var url = "http://"+idv.apiHost+"/api/tumblrPost";
        var data = options;
        //options.blog = "chrisgoad.tumblr.com";
        util.post(url,data,function (rs) {
             var abc = 33;
      
          });
      });
      */
    }
    else {
      dv.append("<div>You don't currently have any blogs at Tumblr</div>");
    }
    dv.append(msg = $('<div></div>'));
    msg.css({"margin-top":"20px","color":"#aa3333"});
    
    var bk,snapInAlbum,snapAlone;
    if (isSnap) {
      blogsdiv.append($('<div>Link to the snap:</div>'));
      blogsdiv.append($('<div><input id="snapAlone" type="checkbox" />1. in the context of the image only, with no other snaps displayed</div>'));
      blogsdiv.append($('<div><input id="snapInAlbum" type="checkbox" />2. in the context of the album with its other snaps</div>'));
      var snapInAlbum = $('#snapInAlbum');
      var snapAlone = $('#snapAlone');
      
      snapAlone.attr("checked","checked");
      snapInAlbum.click(function () {
         var chk = snapInAlbum.attr("checked");
         if (chk) snapAlone.removeAttr("checked");  else snapAlone.attr("checked","checked");
      });
      snapAlone.click(function () {
        var chk = snapAlone.attr("checked");  
        if (snapAlone.attr("checked")) snapInAlbum.removeAttr("checked");  else snapInAlbum.attr("checked","checked");
      });
    }
    dv.append(bk = $('<div>Back to Album</div>'));
    bk.css({"cursor":"pointer","margin-top":"10px","text-decoration":"underline"});

    bk.click(function () {location.href=backLink});
  }
 

    
 
})();
  