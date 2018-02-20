

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

  var common = idv.common;
  var util  = idv.util;
  
  
  lib.computePostsByTopic = function () {
    lib.posts.sort(function (p1,p2) {
      return (p1.create_time < p2.create_time)?1:-1;
    });
    lib.topics = []; //todo sort
    lib.byTopic = {};
    var byt = lib.byTopic;
    util.arrayForEach(lib.posts,function (p) {
      var tp = p.topic;
      var cv = byt[tp];
      if (!cv) {
        cv = [];
        byt[tp]=cv;
        lib.topics.push(tp);
      }
      cv.push(p)
    });
   }
  
  
  lib.computeUnamesByTopic = function () {
    lib.userNames = {};
    var byt = lib.userNames;
    util.arrayForEach(lib.users,function (p) {
      var tp = p.topic;
      byt[tp] = p.name;
    });
  }
    
  
  lib.formatDate = function (nw,msecs) {    
    var diff = (nw - msecs)/3600;
    if (diff < 60) return "just now";
    if (diff < 3600) {
      var mins = Math.floor(diff/60);
      return mins+((mins==1)?" minute ago":" minutes ago");
    }
    if (diff < 3600*24) {
      return Math.floor(diff/3600)+" hours ago";
      
    }
    return  Math.floor(diff/(3600*24))+" days ago";
  }
  
  
  lib.addTopic = function (cnt,tp) {
    var posts = lib.byTopic[tp];
    var plen = posts.length;
    var ttm = posts[0].create_time;
    var fttm = lib.formatDate(lib.now,ttm);
    //var tpline,postsDiv;
    var tpdiv = $('<div>'+
                    '<div id="topicLine">'+
                      '<span id="expander">'+
                      '</span><span id="theTopic"/>'+
                      '<span id="theTime"/>'+
                      '<span id="theCount"/>'+
                      '</div>' +
                    '<div id="thePosts"/>'+
                  '</div>');
   /* var tpdiv= $('<div>').append(
                  tpline = $('<div>').ahtml("Topic: "+tp).append(
                    postsDiv = $('<div/>')
                  )
                );
   */
   var expander = $('#expander',tpdiv);
   //expander.html('&#x25BC;');
    expander.html('&#x25BA;');
    expander.html('+');
    expander.css({cursor:"pointer","margin-right":"10px"});//,border:"solid thin black"});
    var tpline = $('#topicLine',tpdiv);
    $('#theTopic',tpdiv).html(tp);
    $('#theTopic',tpdiv).css({'font-weight':'bold'});
    var timeEl = $('#theTime',tpdiv);
    timeEl.css({'margin-left':'5px','font-size':'8pt'})

    timeEl.html(fttm);
    var cntEl = $('#theCount',tpdiv);
    
    cntEl.html(plen + ((plen==1)?" post":" posts"));
    cntEl.css({'margin-left':'5px','font-size':'8pt'})

    var postsDiv = $('#thePosts',tpdiv);
    tpline.css({'margin-left':'10px','margin-top':'10px'});
    cnt.append(tpdiv);
    var posts = lib.byTopic[tp];
    var nw = new Date().getTime();
    var datespan;
    var qoc = $('<div><input type="button" value="add post"/></div>');
    postsDiv.append(qoc);
    util.arrayForEach(posts,function (p) {
      var postDiv = $('<div>'+
                        '<div id="uat"><span id="postUser"/><span id="postTime"/></div>'+
                        '<div id="postText"/>'+
                      '</div>');
      postsDiv.append(postDiv);
      postsDiv.css({"margin-top":"10px"});
      postDiv.css({"margin-bottom":"15px"});
      $('#uat',postDiv).css({"margin-left":"30px","font-size":"8pt"});
      $('#postUser',postDiv).html("by "+lib.userNames[p.user]);
      $('#postTime',postDiv).html(lib.formatDate(nw,p.create_time)).css({'margin-left':'5px'});
      $('#postText',postDiv).html(util.htmlEscape(p.text)).css({"margin-left":"30px"});
    });
    //var qoc = $('<div><span id="qoc" class="clickableElement">add comment</span></div>');
    qoc.click(function () {
      $('#topicInput',lib.forumInput).attr("value",tp);
      lib.forumInput.show();
    })
    qoc.css({'margin-left':'30px','font-size':'8pt'});
    postsDiv.hide();
    expander.click(function (){
      if (postsDiv.css("display")=="none") {
        postsDiv.show();
        timeEl.hide();
        cntEl.hide();
        expander.html('&#x25BC;');
        expander.html('-');
      } else {
        postsDiv.hide();
        timeEl.show();
        cntEl.show();
        expander.html('&#x25BA;');
        expander.html('+');
       
      }});
  }
  
  lib.addTopics = function (cnt,topic) {
    var topicsCnt = $('<div/>');
    lib.topicsDiv = topicsCnt;
    cnt.append(topicsCnt);
    util.arrayForEach(lib.topics,function (tp) {
      lib.addTopic(topicsCnt,tp);
    })
  }
    
    
  lib.imHeight = 100;
  lib.titleHt = 50;
  lib.imPaddingY = 30;
  lib.imPaddingX = 20;
  lib.minImWd = 70;
  lib.maxImWd = 300;
  lib.imEls = [];
  lib.imDivs = [];
  lib.cntEls = [];
  
  
  lib.submitToForum = function (topic,text) {
    var url = "/api/addPost";
    if ($.trim(topic)=='') {
      topic = "no topic";
    }
    if ($.trim(text)=='') {
      util.myAlert("Alert","Nothing to post");
      return;
    }
    data = {topic:topic,text:text};
     util.post(url,data,function (rs) {
     // lib.posts.push({create_time:new Date().getTime(),topic:topic,text:text,user:"/user/4294b0e"});
      lib.topicsDiv.hide();
      lib.topNote.hide();
      lib.buttonDiv.hide();
      lib.forumMessage.show();
      lib.forumMessage.css({"opacity":1,'text-align':'center'});
      lib.forumMessage.html("Your question or comment has been submitted.");
       lib.forumInput.hide();
       lib.forumMessage.animate({"opacity":0},2000);
       setTimeout(function () {
        //lib.forumMessage.hide();
        //location.href = location.href;
        lib.forumMessage.css({"opacity":1,"font-weight":"bold"});
        lib.forumMessage.html("Thank You");

        //lib.buttonDiv.show();
       },2200);
     });
  }
  
  lib.addInputForm = function (cnt) {
    lib.forumInput =
    $('<div>' +
            '<div>Topic: <input id="topicInput" size="60" id="postTopic" type="text"/></div>' +
            '<div><textarea id = "textInput" rows="8" cols="60" id="postText"/></div>' +
            '<div>' +
                '<input type="button" id="forumSubmit" value="Submit">'+
                '<input type="button" id="forumCancel" value="Cancel">'+
            '</div>'+
      '</div>');
    var ctx;
    cnt.append(ctx=lib.forumInput);
    $('#forumSubmit',ctx).click(function () {
      lib.submitToForum($('#topicInput').attr('value'),$('#textInput').attr('value'));
    });
      $('#forumCancel',ctx).click(function () {
        lib.forumInput.hide();
        lib.buttonDiv.show();
    });
  }
  
  lib.addButton = function  (cnt) {
    var ntb;
    lib.buttonDiv  = $('<div/>').append(
        ntb = $('<input  type="button" value="New Topic"/>')
      );
    lib.buttonDiv.click(function (){lib.buttonDiv.hide();lib.forumInput.show();});
    cnt.append(lib.buttonDiv);
    
  }
  lib.initialize = function(options) {
    
    idv.util.commonInit();
    idv.util.addDialogDiv($(".infoDiv"));
    idv.topbar.genTopbar($('body'),{title:'Forum'});

    var container = $('.infoDiv');
    container.append(lib.topNote = $('<div>Post your comments, questions, or bug reports.</div>)'));
    lib.topNote.css({'text-align':'center','font-style':'italic'});
    container.append(lib.forumMessage=$('<div>Message</div>'));
    //lib.forumMessage.css({"border":"solid thin green"});
    lib.forumMessage.hide();
    lib.addButton(container);
    
    lib.addInputForm(container);
    lib.forumInput.hide();
    var jsonUrl = '/api/getPosts';
    idv.util.get(jsonUrl,function (rs) {
      lib.now = new Date().getTime();

      var top = 50;
      lib.posts = rs.value.posts;
      lib.users = rs.value.users;
      lib.computePostsByTopic();
      lib.computeUnamesByTopic();
      lib.addTopics(container);
      return;
    
    });
      
  }
  
  
})();


