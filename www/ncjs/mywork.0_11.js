
(function(){var lib=page;var geom=exports.GEOM2D;var imlib=exports.IMAGE;var com=idv.common;var util=idv.util;lib.createAlbumWd=450;lib.createAlbumDiv=$('<div class="createlbumDiv" style="margin:20px">'+'<div id="createAlbumExplanation" style="text-align:center;margin-bottom:10px"></div>'+'<table id="albumFields">'+'<tr><td class="inputsTD">Album Title<td><td><input style="width:'+lib.createAlbumWd+'px" id="albumCaption" type="text"/></td></tr>'+'<tr><td class="inputsTD"></td><td></td><td>To include links or other formatting in the description, use <a target="_blank" href="http://en.wikipedia.org/wiki/Creole_(markup)">creole wikitext</a></td></tr>'+'<tr><td class="inputsTD">Description<td><td><textarea style="width:'+lib.createAlbumWd+'px"  rows="10" id="albumDescription"/></td></tr>'+
'</table>'+'<div id="createAlbumButtons" class="buttonLine">'+'<span id="submitAlbum" class="clickableElement">Create Album</span>'+'<span id="cancelAlbum" class="clickableElement">Cancel</span>'+'</div>'+'</div>');lib.albumDivInitializer=function(){lib.editingAlbum=false;$('#createAlbumExplanation').html('Creating a New Album');$('#albumCaption').attr("value","");$('#albumDescription').attr("value","");$('#submitAlbum').html("Create Album (and go there)");};lib.albumsDiv=$('<div class="albumsDiv">'+'<div class="albumLine" id="aboutOtherAlbums"><span id="aboutOtherAlbumsExplanation"></span><span id="otherAlbums"></span></div>'+'<div class="albumLine" id="albumExplanation">An album is a group of snapshots from an image.</div>'+'</div>'); lib.albumsHtml=function(dst,albums,thisAlbumTopic){dst.empty();var ln=albums.length;for(var i=0;i<ln;i++){var ca=albums[i];if(ca.topic==thisAlbumTopic)continue;var cc=ca.caption;var uname=ca.ownerName;if(i<ln-1)comma=",";else comma="";if(uname){var bywho=" by "+uname;}else{bywho=""}
var aline=$('<span class="albumLink"><span>'+cc+'</span> '+bywho+comma+' </span>');dst.append(aline);(function(tp){ aline.click(function(){util.navigateToPage(util.publishedUrl(tp));});})(ca.topic);}}
lib.albumsDiv.data("initializer",function(){var albums=lib.albumDs;var ln=albums.length;var album=lib.albumD;if(album){$('#albumOwner').html("The owner of this album is: "+lib.pathLast(album.owner));var atp=album.topic;if(ln==1){$('#aboutOtherAlbumsExplantion').html('Published Album:');}else{$('#aboutOtherAlbumsExplanation').html('Other published albums for this image:');}}else{atp="";if(ln==0){$('#aboutOtherAlbumsExplanation').html('There are no public albums associated with this image.');}else{$('#aboutOtherAlbumsExplanation').html('Published albums:');}}
var oae=$('#otherAlbums');oae.empty();lib.albumsHtml(oae,albums,atp);});lib.deleteAlbumDiv=$('<div id="deleteAlbum">'+'<div class="areYouSure">Are you sure you wish to delete this album, and its snapshots? There is no undo.</div>'+'<div>'+'<span  style="margin-left:20px" id="yesDeleteAlbum" class="clickableElement">Yes, Delete</span>'+'<span   id="noDontDeleteAlbum" style="margin-left:30px"  class="clickableElement">Cancel</span>'+'</div>'+'</div>');lib.createAlbumFieldValues=function(){var rs={};rs.caption=$('#albumCaption').attr("value");var ds=$('#albumDescription').attr("value");rs.description=ds;return rs;}
lib.createOrEditAlbum=function(edit,imTopic){if(!imTopic)imTopic=lib.imD.topic;var sdata=lib.createAlbumFieldValues();var data={caption:sdata.caption,description:sdata.description};data.image=imTopic;if(edit){var url="/api/editAlbum";data.topic=lib.albumD.topic;}else{var url="/api/addAlbum";}
var cb=lib.createAlbumCallback;var a=lib.albumD;util.post(url,data,function(rs){util.log("api","data returned",rs);if(rs.status!="ok"){util.logout();location.href="/timeout"
return;}
if(edit){var vl=rs.value;util.setProperties(a,vl,["description","caption"]);lib.updateTopbarOptions(lib.topbar.options);lib.topbar.render();lib.popAlbumDetails();}else{location.href="/topic"+rs.value.topic;}
},"json");util.log("api","uuuuu");} 
lib.deleteTheAlbum=function(){var data={topic:lib.albumD.topic};var url="/api/deleteAlbum";var imtp=lib.albumD.image.topic;util.post(url,data,function(rs){if(rs.status!="ok"){util.logout();location.href="/timeout";return;}
location.href="/mywork";},"json");util.log("api","uuuuu");}
lib.createTheAlbum=function(imTopic){lib.createOrEditAlbum(false,imTopic);}
lib.editTheAlbum=function(){lib.createOrEditAlbum(true);}
lib.popCreateAlbumLightbox=function(imTopic){lib.lightbox.pop(false,350);lib.lightbox.element.empty();lib.lightbox.addClose();lib.lightbox.element.append(lib.createAlbumDiv);lib.editingAlbum=true;$('#submitAlbum').click(function(){lib.createTheAlbum(imTopic);});$('#cancelAlbum').click(function(){lib.lightbox.dismiss();});return;}
lib.addAlbumsDiv=function(container){container.append(lib.albumsDiv);lib.setPanelPanel("albums",lib.albumsDiv);return;}
lib.popEditAlbumLightbox=function(){lib.lightbox.pop();lib.lightbox.element.empty();lib.lightbox.addClose();lib.lightbox.element.append(lib.editAlbumDiv);$('#submitAlbum',lib.editAlbumDiv).click(function(){lib.editTheAlbum();});$('#cancelAlbum',lib.editAlbumDiv).click(function(){lib.popAlbumDetails();});lib.editAlbumInitializer(false);return;}})();
(function(){var lib=page;var geom=exports.GEOM2D;var imlib=exports.IMAGE;var common=idv.common;var util=idv.util;lib.minLeftWd=300;function addButton(cn,txt,cb,inDiv){var bt=$('<span class="clickableElement"></span>');bt.html(txt);if(inDiv){var cnt=$('<div/>');cn.append(cnt);var rs=cnt;}else{cnt=cn;rs=bt;}
cnt.append(bt);bt.click(cb);return rs;}
lib.imHeight=100;lib.titleHt=50;lib.imPaddingY=30;lib.imPaddingX=20;lib.minImWd=70;lib.maxImWd=300;lib.imEls=[];lib.imDivs=[];lib.cntEls=[];lib.closeX='<div class="closeX" style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:10pt;color:white;float:right">X</div>';lib.addClose=function(el){var thisHere=this;var close=$(lib.closeX);close.click(function(){el.hide();});el.append(close);}
lib.addHead=function(table,leftWd,rightWd){var imRow=$('<div/>');imRow.css({"margin":"20px","margin-top":"50px"});table.append(imRow);var left=$('<div/>');left.css({"display":"inline-block","font-weight":"bold","width":leftWd+"px"});imRow.append(left);left.html("Image");var right=$('<div/>');imRow.append(right);right.css({"display":"inline-block","width":rightWd+"px","vertical-align":"top"});var explain,qm;if(1||lib.hasActiveAlbum){right.append($('<span>Albums</span>').css({"display":"inline-block","font-weight":"bold","width":rightWd+"px","vertical-align":"top"}).append(qm=$('<span>?</span>').css({"margin-left":"10px","color":"blue","font-size":"8pt","cursor":"pointer"})));right.append(explain=$('<div/>'));explain.css({"border":"solid thin black","width":"300px","font-size":"8pt","padding":"5px"});lib.addClose(explain);explain.append($('<span>An album is a collection of annotated snapshots from an image. Each image may have '+'several albums. When an image is first added, an album is automatically created for it.</span>'));qm.click(function(){explain.show()});explain.hide();}}
lib.deleteAlbum=function(topic){var data={topic:topic};var url="/api/deleteAlbum";util.post(url,data,function(rs){if(rs.status!="ok"){util.logout();location.href="/timeout";return;}
location.href="/mywork";},"json");util.log("api","uuuuu");}
lib.deleteImage=function(topic){var data={topic:topic};var url="/api/deleteImage";util.post(url,data,function(rs){if(rs.status!="ok"){util.logout();location.href="/timeout";return;}
location.href="/mywork"},"json");util.log("api","uuuuu");}
lib.addPic=function(table,im,leftWd,rightWd,pubWd){var tp=im.topic;albums=lib.albumsByImage[tp];if(albums){aln=albums.length;}else{var aln=0;} 
var ttl=im.title;if(!ttl){ttl=im.name;}
var imRow=$('<div/>');imRow.css({"border-top":"solid thin black","margin":"20px"});table.append(imRow);var left=$('<div/>');left.css({"display":"inline-block","width":leftWd+"px"});imRow.append(left);var right=$('<div/>');imRow.append(right);right.css({"display":"inline-block","width":rightWd+"px","vertical-align":"top"});var ttldiv=$('<div/>');ttldiv.html(ttl);left.append(ttldiv);if(!im.atS3){right.html("Now importing ...");return;}
if(aln>=1){ var a0=albums[0];var a0url="/topic"+(a0.topic)+"/index.html?unpublished=1";}
if(albums){aln=albums.length;if(1||(aln>1)||(a0.notNew)){for(var i=0;i<aln;i++){var alb=albums[i];var cp=alb.caption;if(!cp)cp="untitled";pub=null;if(alb.published){pub=$('<span>published version</span>');pub.css({"text-decoration":"underline","cursor":"pointer","float":"right"});var pubURL=util.publishedUrl(alb.topic);pub.click(function(){location.href=pubURL});}
var csp=$('<div/>');csp.css({"padding-left":"10px","padding-right":"10px"});url="/topic"+(alb.topic)+"/index.html?unpublished=1";var icsp=$('<span/>').css({"text-decoration":"underline","cursor":"pointer"}).html(cp);(function(iurl){ icsp.click(function(){location.href=iurl});})(url);csp.html((i+1)+".");csp.append(icsp);var dl;csp.append(dl=$('<span>delete</span>'));dl.css({"margin-left":"10px","font-size":"8pt","text-decoration":"underline","cursor":"pointer"});dl.click(function(){util.myConfirm("Delete Album","Are you sure you wish to delete this album, and all of its snaps?",function(){lib.deleteAlbum(alb.topic);},function(){util.closeDialog()});});right.append(csp);if(pub){csp.append(pub);}}}}else{right.html("No albums")}
var newAlbumButton,moreAlbumsButton;(function(itp){if(0&&(aln==1)&&(!a0.notNew)){btext="Annotate This Image";addButton(right,btext,function(){location.href=a0url;},true).css({"font-size":"9pt","margin-top":"10px"});}else{addButton(right,"Create New Album",function(){lib.popCreateAlbumLightbox(itp);},true).css({"font-size":"9pt","margin-top":"10px"});}})(tp);var tps=tp.split("/");var imo=tps[2];var imname=tps[3];var imdim=im.dimensions;var arti=(imdim.x)/(imdim.y);var ht=lib.imHeight;var wd=Math.max(Math.ceil(ht*arti),lib.minImWd);if(wd>lib.maxImWd){ var sc=lib.maxImWd/wd;ht=ht*sc;wd=lib.maxImWd;}
var imsrc=util.s3imDir(imo,imname)+"resized/area_50000.jpg";var imel=$('<img src="'+imsrc+'"/>');left.append(imel);var tolink=function(){var lnk=a0url;location.href=lnk;}
imel.attr("width",wd);imel.attr("height",ht);if(im.s3Storage){var bs=util.bytesstring(im.s3Storage);var sdiv=$('<div/>');left.append(sdiv);sdiv.html("Storage: "+bs);}
if(!im.shared){var imdel=$('<div>delete</div>');left.append(imdel);imdel.css({"margin-left":"10px","font-size":"8pt","text-decoration":"underline","cursor":"pointer"});imdel.click(function(){util.myConfirm("Delete Image","Are you sure you wish to delete this image, and all of its albums?",function(){lib.deleteImage(im.topic);},function(){util.closeDialog()});})
}
lib.imEls.push(imel);}
lib.imagesByTopic={};lib.albumsByImage={};lib.maxImageWd=function(){var rs=0;util.arrayMap(lib.images,function(im){var imdim=im.dimensions;var arti=(imdim.x)/(imdim.y);var ht=lib.imHeight;var wd=Math.max(Math.ceil(ht*arti),lib.minImWd);if(wd>rs)rs=wd;});return Math.min(lib.maxImWd,rs);}
lib.organizeData=function(){var ims=lib.images;var albums=lib.albums;util.arrayMap(ims,function(im){var tp=im.topic;lib.imagesByTopic[tp]=im;});var abyim=lib.albumsByImage;lib.hasActiveAlbum=0;util.arrayMap(albums,function(album){var imtp=album.image;var aby=abyim[imtp];if(aby==undefined){aby=[album];abyim[imtp]=aby;}else{aby.push(album);}});for(var ab in abyim){var albums=abyim[ab]
albums.sort(function(a0,a1){return a0<a1?1:-1});if(albums.length>1){lib.hasMultiAlbums=1;}
}}
lib.addPics=function(){ imDiv=$('<div/>');$('.infoDiv').append(imDiv);var pdiv=imDiv;var ims=lib.images;var albums=lib.albums;var leftWd=Math.max(lib.minLeftWd,lib.maxImageWd()+10);var twd=$('.infoDiv').width();var rightWd=twd-leftWd-40;var pubWd=150;
var ln=lib.images.length;if(ln==0){var noteDiv=$("<div>To get started, we suggest that you do some practice annotation on an existing image. "+" Click on the image (Holbein's The Ambassadors) below to give it a whirl:</div>"+" <div id='imageDiv'><div id='annotate_me'>Annotate Me</div><div><img id='theimage' width='200' src='http://static.imagediver.org/images/4294b0e/the_ambassadors/resized/area_50000.jpg'/></div></div> "+"<div> It's safe to practice, since until you publish your annotations, only you have access to them, and annotations can always be edited or deleted.</div> "+"<div>Alternatively, you can choose annotate any image from the <a href='/gallery'>gallery</a>: choose any album, then click \"annotate\". Or, go ahead and "+" <a href='/upload'>import</a> your own image from your computer or from the web.</div>");pdiv.append(noteDiv);noteDiv.css({"margin-top":30,"margin-left":30});function annotate(){var im='/image/4294b0e/the_ambassadors';var im='/image/4294b0e/garden_of_earthly_delights';util.createNewAlbum(im);return;var url="http://"+idv.apiHost+"/annotate?image="+im;location.href=url;}
$('#annotate_me').css({'text-decoration':'underline','cursor':'pointer','width':'200px','text-align':'center',"color":util.linkColor}).click(annotate);$('#theimage').css({'cursor':'pointer'}).click(annotate);$('#imageDiv').css({"padding-left":"250px","padding-right":"250px"});
return;}
var importButton=$('<div id="import"><span class="clickableElement">Import an Image</span> </div>');pdiv.append(importButton);importButton.click(function(){location.href="/upload";});lib.addHead(pdiv,leftWd,rightWd);for(var i=0;i<ln;i++){var cim=lib.images[i];lib.addPic(pdiv,cim,leftWd,rightWd,pubWd);}
lib.picsAdded=true;}
lib.initialize=function(){idv.util.commonInit();util.addDialogDiv($('body'));var jsonUrl='/api/albumsAndImages'
idv.util.get(jsonUrl,function(rs){var top=50;var lbwd=600;var lft=winCenter=0.5*lbwd;var wht=$(window).height();var lbht=200;var lightboxRect=new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));var lb=new common.Lightbox($('body'),lightboxRect);lb.render();lib.lightbox=lb;var pdiv=$('.infoDiv');lib.images=rs.value.images;lib.albums=rs.value.albums;lib.organizeData();lib.thePics=[];lib.addPics();});}})();
