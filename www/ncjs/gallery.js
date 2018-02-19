(function(){var lib=page;var geom=idv.geom;var imlib=idv.image;var com=idv.common;var util=idv.util;lib.hasTag=function(im,tag){var tags=im.tags;if(!tags||(tags.length==0))return tag=="other"; var rs=$.inArray(tag,tags)>=0;return rs;}
lib.genTab=function(container,cb,title){var tabCss={'border-radius':'0px','margin-left':'0px','margin-right':'0px','margin-bottom':'0px','padding-left':'15px','padding-right':'15px','border':'solid thin black','padding-bottom':'4px'};var tabSelectedCss=util.extend(util.copy(tabCss),{"background-color":"#dddddd","color":"black"})
var tabDeselectedCss=util.extend(util.copy(tabCss),{"background-color":"#303132","color":"white"})
var tabDiv=$('<div class="tabDiv"></div>')
container.append(tabDiv);lib.tabDiv=tabDiv;var showArt=$('<span class="clickableElement">Art</span>');var showOther=$('<span class="clickableElement">Other</span>');if(title){var titleEl=$('<span></span>').html(title);titleEl.css({"font-weight":"bold","width":"100%","text-align":"center","float":"right"});tabDiv.append(titleEl);}
var tabGroup=new lib.clickableGroup([['art',showArt],['other',showOther]],tabSelectedCss,tabDeselectedCss,cb);tabGroup.appendTo(tabDiv);return tabGroup;}})();
(function(){var lib=page;var geom=idv.geom;var imlib=idv.image;var com=idv.common;var util=idv.util;lib.whichGallery="art";lib.genDivs=function(){var fullTitle="<i>the depths of high resolution images, annotated</i>";var b=$('body');var topbarOptions={title:fullTitle};var outerDiv=$(".outerDiv");lib.topDiv=idv.topbar.genTopbar(outerDiv,topbarOptions);lib.outerDiv=outerDiv;b.append(outerDiv);var cb=function(nm){lib.whichGallery=nm;lib.renderContents();}
lib.tabGroup=lib.genTab(outerDiv,cb,"Gallery");var cDiv=$("<div class='imagesDiv'/>");cDiv.css({"position":"relative","background-color":"black"});lib.cDiv=cDiv;outerDiv.append(cDiv);cDiv.append(lib.bottomDiv);lib.theLayout=new lib.LayoutZero({outerDiv:lib.outerDiv,centerDiv:lib.cDiv,margin:50,minScale:0.6,aspectRatio:1, maxScale:1,includeLightbox:1});}
lib.cimTop=0;lib.cimLeft=0;lib.maxImWd=400;lib.imDiv=undefined;lib.imHeight=130;lib.titleHt=50;lib.imPaddingY=100;lib.imPaddingX=20;lib.minImWd=70;lib.imEls=[];lib.imDivs=[];lib.cntEls=[];lib.goToSnaps=function(im){var url="/api/newAlbum";var data={"image":im.topic,"caption":".snaps."}
util.post(url,data,function(rs){var atp=rs.value;var aurl="/topic"+atp+"/index.html";location.href=aurl;});}
lib.popChoiceOfAlbum=function(im){var albums=im.albums;var ttl=im.title;if(!ttl){ttl=util.pathLast(im.topic);}
var msg=$('<div/>');msg.css({'margin':'30px'});msg.append('<div>Albums (sets of annotations of <i>'+ttl+'</i>):</div>');util.arrayForEach(albums,function(a){var abc=22;var ael=$('<div>').html(a.caption).css({'margin-top':'10px','margin-left':'20px','text-decoration':'underline','cursor':'pointer'});var dst='http://s3.imagediver.org/topic'+(a.topic)+'/index.html';ael.click(function(){location.href=dst;})
msg.append(ael);});lib.lightbox.popMessage(msg);}
lib.addPic=function(im){var tp=im.topic;var albs=im.albums;var acnt=albs.length;
if(acnt==0)return;lib.shownImages.push(im);var ttl=im.title;if(!ttl){ttl=im.name;}
var tps=tp.split("/");var imo=tps[2];var imname=tps[3];var imdim=im.dimensions;var arti=(imdim.x)/(imdim.y);var ht=lib.imHeight;var wd=Math.max(Math.ceil(ht*arti),lib.minImWd);if(wd>lib.maxImWd){ht=ht*(lib.maxImWd/wd);wd=lib.maxImWd;}
var imdiv=$('<div/>');var imdivht=lib.imHeight+lib.titleHt+20;imdiv.css({"position":"absolute","height":imdivht+"px","width":wd+"px"});lib.imDiv.append(imdiv);var ttldiv=$('<div/>');ttldiv.css({"text-align":"center"});ttldiv.html(ttl);imdiv.append(ttldiv);var imsrc=util.s3imDir(imo,imname)+"resized/height_100.jpg";var imsrc=util.s3imDir(imo,imname)+"resized/area_50000.jpg";var thelink="/topic/image/"+imo+"/"+imname+"/index.html";var imel=$('<img src="'+imsrc+'"/>');imel.css({"cursor":"pointer"});imel.attr("width",wd);imel.attr("height",ht);imel.css({"position":"absolute","cursor":"pointer"});imdiv.append(imel);var cntel=$('<div style="position:absolute"/>');var uniqueAlbum=true;if(acnt==1){var alb=albs[0];htm="1 album";cntel.html(htm);cntel.css({"text-decoration":"underline","cursor":"pointer"});var tp=alb.topic;thelink="http://s3.imagediver.org/topic"+tp+"/index.html";cntel.click(function(){location.href=thelink;});imel.click(function(){location.href=thelink;});}else if(acnt==0){cntel.html("no albums");}else{if(alb){var tp=alb.topic;alink="http://s3.imagediver.org/topic"+tp+"/index.html";uniqueAlbum=false;var fts=$('<div/>');cntel.append(fts);var cap=alb.caption;if(cap){var htm="Featured : "+cap;}else{htm="featured album";}
fts.html(htm);fts.css({"text-decoration":"underline","cursor":"pointer"})
fts.click(function(){location.href=alink;});var rst=$('<div/>');rst.html((acnt-1)+" more albums");cntel.append(rst);}else{cntel.html(acnt+" albums");cntel.click(function(){lib.popChoiceOfAlbum(im);})
imel.click(function(){lib.popChoiceOfAlbum(im);})}}
cntel.css({"width":wd+"px","text-align":"center","text-decoration":"underline","cursor":"pointer"});imdiv.append(cntel);lib.imDivs.push(imdiv);lib.imEls.push(imel);lib.cntEls.push(cntel);}
lib.addPics=function(){lib.imDiv.empty();var ln=lib.images.length;for(var i=0;i<ln;i++){var cim=lib.images[i];lib.addPic(cim);}
lib.picsAdded=true;}
lib.placePics=function(){if(!lib.picsAdded)lib.addPics();var wd=lib.imDiv.width();var ctop=40;var cleft=10;var ofs=lib.imDiv.offset();var oft=ofs.top;var ofl=ofs.left;$("#import").offset({top:oft+20,left:ofl+10});$("hr").offset({top:oft+50,left:ofl});var ln=lib.imEls.length;if(ln==0){var msg=$('<div id="msg">You have not yet imported any images</div>');lib.imDiv.append(msg);msg.offset({top:oft+ctop,left:ofl+20});}
for(var i=0;i<ln;i++){var el=lib.imDivs[i];var cim=lib.shownImages[i];if(!lib.hasTag(cim,lib.whichGallery)){el.hide();continue;}
el.show();var cntel=lib.cntEls[i];var elwd=el.width();if((cleft+elwd)>wd){ ctop=ctop+lib.imHeight+lib.titleHt+lib.imPaddingY;cleft=10;}
el.offset({top:oft+ctop,left:ofl+cleft});var imel=lib.imEls[i];var elwd=el.width();var imwd=imel.width();var imoff=0.5*(elwd-imwd);imel.offset({top:oft+ctop+lib.titleHt,left:ofl+cleft+imoff});cntel.offset({top:oft+ctop+lib.imHeight+lib.titleHt,left:ofl+cleft});cleft=cleft+elwd+lib.imPaddingX;}
var tht=ctop+lib.imHeight+lib.titleHt+lib.imPaddingY;lib.imDiv.css({"height":tht+"px"});}
lib.renderContents=function(){lib.placePics();}
var cg="/image/4294b0e/"; lib.ordering=[cg+"the_dutch_proverbs",cg+"the_ambassadors",cg+"garden_of_earthly_delights",cg+"Saint_Francis_Bellini"]
lib.initialize=function(){var url="/api/allImages";util.commonInit();util.post(url,{includeAlbums:1,featuredOnly:1},function(rs){$('document').ready(function(){lib.initialize2(rs);});});}
lib.initialize2=function(rs){var images=rs.value;var ibyt={};util.arrayForEach(images,function(im){var tp=im.topic;ibyt[tp]=im;});var oimages=[];var ino={};util.arrayForEach(lib.ordering,function(tp){var im=ibyt[tp];if(im){ino[tp]=1;oimages.push(im);}}); util.arrayForEach(images,function(im){var tp=im.topic;if(ino[tp])return;oimages.push(im);});images=oimages;util.commonInit()
lib.images=images;lib.shownImages=[];lib.filter="all"; lib.genDivs();lib.theLayout.placeDivs();lib.thePics=[];lib.imDiv=$(".imagesDiv");lib.theLayout.afterPlacement=function(){lib.placePics();lib.lightbox=lib.theLayout.lightbox;};lib.tabGroup.selectElement(lib.whichGallery);var cDiv=lib.cDiv;cDiv.append('<div style="width:100;height:50px"></div>');lib.theLayout.placeDivs();$(window).resize(function(){util.log("resize",$(window).width());lib.theLayout.placeDivs();});return;}})();
