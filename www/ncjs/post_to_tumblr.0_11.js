(function(){var lib=page;var geom=exports.GEOM2D;var imlib=exports.IMAGE;var util=idv.util;var common=idv.common;lib.badInput=function(msg){$('.infoDiv').append($('<div>').html(msg));}
lib.initialize=function(options){idv.util.commonInit();util.loggedInUserFromCookie();var dv=$('.infoDiv');var nt,bt;var topic=options.topic;var tops=topic.split("/");var emsg="Something is amiss: no such topic."
var tln=tops.length;if(tln<5){lib.badInput(emsg)
return;}
var data={topic:topic}
var ownr=util.topicOwner(topic,tops);var imname=util.topicImageName(topic,tops);var albumNum=util.topicAlbumNum(topic,tops);var cuser=util.pathLast(idv.loggedInUser);if(cuser!=ownr){var ownerName=options.userName;}
if(tops[1]=="snap"){var isSnap=true;var snapid=tops[tln-1];var cropid=options.cropid;}else if(tops[1]=="album"){isSnap=false;}
scaption=options.caption;sdes=options.description;var caption;if(isSnap){caption="Click on the image to see the detail in a zoomable context.\n\nDetail from ";}else{caption="Click on the image to see a zoomable version.\n\n";}
tags=[];var imageTitle=options.imageTitle;var imageAuthor=options.imageAuthor;if(imageTitle){caption+="*"+imageTitle+"*";if(imageTitle.indexOf(",")<0)tags.push(imageTitle);}
if(imageAuthor){caption+=", "+imageAuthor;if(imageAuthor.indexOf(",")<0)tags.push(imageAuthor);}
if(isSnap&&scaption)caption+="\n\n"+scaption
if(isSnap&&sdes){caption+="\n\n"
caption+=sdes;}else{var imdes=options.imageDescription;if(imdes){caption+="\n\n"+imdes;}}
if(ownerName)caption+="\n\n From  "+ownerName+" at [Imagediver](http://imagediver.org)"
data.caption=caption;data.tags=tags;if(isSnap){var linkTo="http://s3.imagediver.org/topic/album/"+ownr+"/"+imname+"/"+albumNum+"/index.html#snap="+snapid;var imsrc="http://static.imagediver.org/images/"+ownr+"/"+imname+"/snap/"+cropid+".jpg"}else{var linkTo="http://s3.imagediver.org/topic"+topic+"/index.html";var imsrc="http://static.imagediver.org/images/"+ownr+"/"+imname+"/resized/area_250000.jpg";}
data.imageSource=imsrc;data.linkTo=linkTo;var imel='<img src="'+imsrc+'"/>';dv.append(imel);var url="http://"+idv.apiHost+"/api/tumblrPost";var msg;var blogsdiv;function postToBlog(bnm){data.blog=bnm;util.post(url,data,function(rs){var abc=33;blogsdiv.hide();msg.html("The annotation has been posted as a draft");});} 
var blogs=options.blogs;var rex=/http\:\/\/([^\/]*)\//;if(blogs.length>1){dv.append('<div>Which blog should this be posted to?</div>');dv.append(blogsdiv=$('<div/>'));util.arrayForEach(blogs,function(b){var bnm=b.match(rex)[1]
var bel=$('<div/>').html(bnm);blogsdiv.append(bel);bel.css({"cursor":"pointer","margin-top":"10px","margin-left":"20px","text-decoration":"underline"});bel.click(function(){postToBlog(bnm);})})}else if(blogs.length==1){dv.append(blogsdiv=$('<div/>'));blogsdiv.append(nt=$('<div>This will post the  annotation to Tumblr.</div>'));nt.css({'margin-bottom':'20px'});blogsdiv.append(bt=$('<div>'+'<span id="ok" class="clickableElement">Ok</span>'+'<span id="cancel" class="clickableElement">Cancel</span>'+'</div>'));var ok=$("#ok",dv);var cancel=$("#cancel",dv);var bnm=blogs[0].match(rex)[1];ok.click(function(){postToBlog(bnm);});cancel.click(function(){location.href=linkTo;});}
else{dv.append("<div>You don't currently have any blogs at Tumblr</div>");}
dv.append(msg=$('<div></div>'));msg.css({"margin-top":"20px","color":"#aa3333"});var bk;dv.append(bk=$('<div>Back to the annotation</div>'));bk.css({"cursor":"pointer","margin-top":"10px","text-decoration":"underline"});bk.click(function(){location.href=linkTo});}})();
