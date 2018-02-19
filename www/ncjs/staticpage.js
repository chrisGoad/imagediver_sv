idv={};idv.util={};idv.css={};idv.useS3=true;idv.alwaysUseFlash=false;idv.useFlash=idv.alwaysUseFlash;idv.useFlashForOverlay=false;idv.homeTopic="/album/4294b0e/the_ambassadors/1";idv.portNumber=":8080";(function(){var lib=idv.util;lib.activeConsoleTags=[];if(typeof(Markdown)!="undefined"){lib.Markdown=new Markdown.Converter();}
lib.argsToString=function(a){ if(typeof(console)=="undefined")return"";if(!idv.devVersion)return"";var aa=[];var ln=a.length;for(var i=0;i<ln;i++){aa.push(a[i]);}
return aa.join(", ");}
lib.slog1=function(s){if(typeof(console)=="undefined")return;if(!idv.devVersion)return;console.log("SLOG1",s);}
lib.slog=function(){var s=lib.argsToString(arguments);lib.slog1(s);}
lib.startTime=Date.now()/1000;
lib.resetClock=function(){lib.startTime=Date.now()/1000;}
lib.elapsedTime=function(){var nw=Date.now()/1000;var et=nw-lib.startTime;return Math.round(et*1000)/1000;}
lib.tlog=function(){if(typeof(console)=="undefined")return;if(!idv.devVersion)return; var aa=[];var nw=Date.now()/1000;var et=nw-lib.startTime;var ln=arguments.length;for(var i=0;i<ln;i++){aa.push(arguments[i]);}
et=Math.round(et*1000)/1000;var rs="AT "+et+": "+aa.join(", ");console.log(rs);return;}
lib.log=function(tag){if(typeof(console)=="undefined")return;if(($.inArray("all",lib.activeConsoleTags)>=0)||($.inArray(tag,lib.activeConsoleTags)>=0)){if(typeof window=="undefined"){system.stdout(tag+JSON.stringify(arguments));}else{ var aa=[];var ln=arguments.length;for(var i=0;i<ln;i++){aa.push(arguments[i]);}
console.log(tag,aa.join(", "));}}};lib.error=function(a,b){var est="Error: "+a+", "+b;console.log("Error "+a,b);throw est;};lib.post=function(url,data,callback){if(typeof data=="string"){dataj=data;}else{var dataj=JSON.stringify(data);}
var ecallback=function(rs,textStatus,v){if(idv.devVersion)return;alert("ERROR IN POST "+textStatus);}
$.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",success:callback,error:ecallback});}
lib.getJsonP=function(url,data,callback){var opts={url:url,cache:false,data:data,contentType:"application/json",type:"GET",dataType:"jsonp",//cache was false
success:callback};$.ajax(opts);}
lib.get=function(url,callback,ecallback){var opts={url:url,cache:false,contentType:"application/json",type:"GET",dataType:"json", success:callback};if(ecallback){opts.error=ecallback;}else{opts.error=function(rs,textStatus){if(!idv.devVersion)return;alert("ERROR IN get "+textStatus);}}
$.ajax(opts);}
lib.runCallbacks=function(cbs){if(cbs==undefined)return;var a=arguments;var ca=[];var ln=a.length;for(i=1;i<ln;i++){ca.push(a[i]);}
lib.arrayForEach(cbs,function(cb){cb.apply(undefined,ca);})}
lib.arrayMap=function(a,fn){ if(a.map){return a.map(fn);}
var ln=a.length;var rs=[];for(var i=0;i<ln;i++){rs.push(fn(a[i]));}
return rs;}
lib.arrayForEach=function(a,fn){if(a.forEach){a.forEach(fn);return;}
var ln=a.length;for(var i=0;i<ln;i++){fn(a[i]);}}
lib.arrayAnyTrue=function(a,fn){var ln=a.length;var rs=[];for(var i=0;i<ln;i++){if(fn(a[i]))return true;}
return false;}
lib.arrayAllTrue=function(a,fn){var ln=a.length;var rs=[];for(var i=0;i<ln;i++){if(!fn(a[i]))return false;}
return true;}
lib.removeFromArray=function(a,v){var rs=[];lib.arrayMap(a,function(av){if(av!=v){rs.push(av);}});return rs;}
lib.arrayFilter=function(a,fn){var ln=a.length;var rs=[];for(var i=0;i<ln;i++){if(fn(a[i]))rs.push(a[i]);}
return rs;}
lib.setProperties=function(dest,src,props){if(!src)return undefined;if(!dest)dest={};if(props){lib.arrayMap(props,function(prop){var srcv=src[prop];if(srcv!=undefined)dest[prop]=src[prop];});}else{for(k in src){if(src.hasOwnProperty(k)){dest[k]=src[k];}}}
return dest;}
lib.loadScripts=function(urls,callback){var ln=urls.length;var cindex=0;function oneGet(){if(cindex==ln){if(callback)callback();return;}
var url=urls[cindex];cindex++;$.getScript(url,oneGet);}
oneGet();}
lib.extend=function(){var ln=arguments.length;var dst=arguments[0];for(var i=1;i<ln;i++){var ca=arguments[i];for(var k in ca){if(ca.hasOwnProperty(k)){dst[k]=ca[k];}}}
return dst;}
lib.copy=function(v){return lib.extend({},v);}
lib.htmlEscape=function(s){var fr=s.replace(/</g,"&lt;")
return fr.replace(/>/g,"&gt;")}
lib.htmlRemove=function(s){var fr=s.replace(/</g,"");return fr.replace(/>/g,"")}
lib.parseQS=function(s){if(s==undefined){var qs=location.search;}else{qs=s;}
if(!qs)return{};qs=qs.substring(1);args=qs.split("&");var rs={};lib.arrayForEach(args,function(a){var spa=a.split("=");if(spa.length==2){var k=spa[0];var v=spa[1];rs[k]=v;}});return rs;}
lib.dropQS=function(s){if(s==undefined){s=location.href;}
var qp=s.indexOf("?");if(qp<0)return s;return s.substring(0,qp);}
lib.navigateToPage=function(page,target){if(target){window.open(page,"_blank")}else{if(page[0]=="/"){if(idv.atS3){location.href="http://imagediver.org"+page;return;}}
location.href=page;}}
lib.hasCanvas=function(){var elem=document.createElement('canvas');return!!(elem.getContext&&elem.getContext('2d'));}
idv.s3Domain="imagediver.s3-website-us-east-1.amazonaws.com";idv.s3Domain="s3.imagediver.org";idv.cfDomain="static.imagediver.org";idv.topicDir="/topic";lib.commonInit=function(options){lib.tlog("commonInit");var lc=location.href;if(options){idv.loggedInUser=options.loggedInUser;idv.hasEmail=options.hasEmail;}else{lib.loggedInUserFromCookie();}
var domain=location.host;idv.devVersion=domain.indexOf("dev.imagediver.org")>=0;idv.atS3=(domain==idv.cfDomain)||(domain==idv.s3Domain);idv.useS3=!(idv.devVersion);if(idv.atS3){if(lc.indexOf("s3.imagediver.org/topicd/")>0){idv.s3Dev=true;idv.devVersion=true;idv.topicDir="/topicd";}}
if(!idv.devVersion)idv.topicDir="/topic";idv.query=lib.parseQS();idv.embed=idv.query.embed;idv.brie8=$.browser.msie&&(parseFloat($.browser.version)<9);if(idv.alwaysUseFlash){idv.useFlash=true;}else{idv.useFlash=!lib.hasCanvas();}
idv.useFlashForOverlay=false;idv.apiHost=idv.devVersion?"dev.imagediver.org":"imagediver.org";idv.apiHost=idv.apiHost+idv.portNumber;return;var bim=$('<img/>');$('body').append(bim);var bwd=$('body').width();var bht=$('body').height();bim.attr({'width':bwd/3+"px"});bim.css({'position':'absolute','left':'0px',top:'0px','z-index':1});bim.attr('src','http://static.imagediver.org/images/4294b0e/the_ambassadors/resized/area_250000.jpg');}
lib.jsonUrl=function(topic){return idv.topicDir+topic+"/main.json"}
lib.lastPathElement=function(s){var lsl=s.lastIndexOf("/");return s.substr(lsl+1);}
lib.pathLast=function(s){var lsl=s.lastIndexOf("/");return s.substr(lsl+1);}
lib.numberAtEnd=function(s){var mt=s.match(/(\d+)$/);if(mt){var nm=mt[1];return parseInt(nm);}}
lib.addDialogDiv=function(container,height){if(lib.dialogDiv)return;if(!height)height=180;var dialogDiv=$('<div id="dialog"></div>');container.append(dialogDiv);if(dialogDiv.dialog){ dialogDiv.dialog({height:height,modal:true,autoOpen:false,title:"Error"});lib.dialogDiv=dialogDiv;}}
lib.addDialogDiv($('body'));lib.myConfirm=function(title,text,ifyes,ifno){var ddv=lib.dialogDiv;ddv.dialog({'title':title});ddv.html(text);ddv.dialog({'buttons':{"Ok":ifyes,"Cancel":ifno}});ddv.dialog('open');}
lib.myAlert=function(title,text){var ddv=lib.dialogDiv;ddv.dialog({'title':title,"buttons":null});ddv.html(text);ddv.dialog('open');}
lib.closeDialog=function(){lib.dialogDiv.dialog('close');}
lib.sanitize=function(s){if(typeof(s)=="string"){var s1=s.replace(/\&/g,"&amp;");var s2=s1.replace(/\</g,"&lt;");var s3=s2.replace(/\>/g,"&gt;");return s3;}else{return s;}}
lib.toInt=function(s){var ts=$.trim(s);var rs=parseInt(ts);var ck=""+rs;if(ck==ts){return rs;}else{return undefined;}}
lib.breakUpString=function(s,n){var ln=s.length;if(ln<n)return s;var rs="";var p=0;while(true){var nc=Math.min(ln,p+n);var cs=s.slice(p,nc);rs+=cs;if(nc==ln)return rs;p=p+n;rs+=" ";}}
lib.processMarkdown=function(s){var hte=lib.htmlEscape(s);var nxt=lib.Markdown.makeHtml(hte);return nxt;}
lib.removeWikiSymbols=function(s){var md=lib.Markdown.makeHtml(s);return md.replace(/<[^>]*>?/gi,"");}
lib.topicOb=function(topic){sp=topic.split("/")
var ln=sp.length;this.kind=sp[1];this.imageOwner=sp[2];this.imageName=sp[3];if(ln>4)this.albumId=sp[4];if(ln>5)this.snapId=sp[5];}
lib.topicOb.prototype.topic=function(){var knd=this.kind;var rs="/"+this.kind+"/"+this.imageOwner+"/"+this.imageName;if((knd=="album")||(knd=="snap")){rs+="/"+this.albumId;}
if(knd=="snap"){rs+="/"+this.snapId;}
return rs;}
lib.topicOb.prototype.imageTopic=function(){var knd=this.kind;this.kind="image";var rs=this.topic();rs.kind=knd;return rs;}
lib.topicOb.prototype.snapsAlbum=function(){var k=this.kint;var a=this.albumId;this.kind="album";this.albumId="-";var rs=this.topic();this.kind=k;this.albumId=a;return rs;}
lib.s3ImageRoot="http://static.imagediver.org/images/";lib.s3TopicRoot="http://s3.imagediver.org/topic";lib.localImageRoot="/images/"
lib.localTopicRoot="/topics_local";lib.s3imDir=function(user,imname){return lib.s3ImageRoot+user+"/"+imname+"/"}
lib.localImDir=function(user,imname){return lib.localImageRoot+user+"/"+imname+"/"}
lib.s3TilingDir=function(user,imname){return lib.s3imDir(user,imname)+"tiling/"}
lib.publishedUrl=function(albumTopic){return"http://s3.imagediver.org"+idv.topicDir+albumTopic+"/index.html"}
lib.appendR=function(el,a){el.append(a);return a;}
lib.nDigitsPrecision=function(x,n){var n10=Math.pow(10,n);var xsh=x*n10;var xf=Math.floor(x);var ad=Math.floor(xsh-xf*n10);return xf+"."+ad;}
var oneMeg=1000*1000;var oneGig=oneMeg*1000;lib.bytesstring=function(n,pixels){if(n<1000){if(pixels){return n+" pixels"}else{return n+" bytes";}}
if(n<oneMeg){var ns=lib.nDigitsPrecision(n/1000,1);if(pixels){return ns+"K pixels";}else{return ns+" KB";}}
if(n<oneGig){var ns=lib.nDigitsPrecision(n/oneMeg,1);if(pixels){return ns+" megapixels";}else{return ns+" MB";}}
var ns=lib.nDigitsPrecision(n/oneGig,1);if(pixels){return ns+" gigapixels";}else{return ns+" GB";}}
lib.loggedInUserFromCookie=function(){if(idv.loggedInUser)return;var ck=document.cookie;if(!ck)return;var mt=ck.match(/userId=(\w*)/);if(mt){var uid=mt[1];idv.loggedInUser="/user/"+uid;}}
lib.logout=function(cb){lib.post("/api/logout",{},function(rs){document.cookie="sessionId=deleted;userId=deleted; expires="+new Date(0).toUTCString()+"; Domain=.imagediver.org; path=/;"
document.cookie="userId=; expires="+new Date(0).toUTCString()+"; Domain=.imagediver.org; path=/;"
if(cb)cb();});}
lib.errorColor="#770000";lib.linkColor="#004B91";lib.linkColor="#002B51";lib.bkColor="#444444";lib.activateAnchors=function(el){var anchors=$('a',el);lib.arrayForEach(anchors,function(a){var dst=$(a).attr('href');$(a).click(function(){var dst=$(a).attr('href');window.open(dst,"imagediverTarget")});});}
lib.addToolTipDiv=function(){lib.toolTipDiv=$('<div class="toolTip" style="position:absolute;background-color:black;border:solid thin white;padding:3px;font-size:8pt;z-index:3000">TESTT</div>');$('body').append(lib.toolTipDiv);lib.toolTipDiv.hide();}
lib.addToolTipDiv();lib.popToolTip=function(el,txt){var eloff=el.offset();var eltop=eloff.top;if(eltop<20){var tooltop=eltop+20}else{tooltop=eltop-20;}
var toolleft=eloff.left;var tooloff={"left":toolleft,"top":tooltop};lib.toolTipDiv.show();lib.toolTipDiv.html(txt);lib.toolTipDiv.offset(tooloff);}
lib.addToolTip=function(el,txt){el.mouseover(function(){lib.popToolTip(el,txt);});el.mouseout(function(){lib.toolTipDiv.hide();});}
lib.appendm=function(jel,els){lib.arrayForEach(els,function(el){jel.append(el);});}
lib.addButton=function(cn,txt,cb,inDiv){var bt=$('<span class="clickableElement"></span>');bt.html(txt);if(inDiv){var cnt=$('<div/>');cn.append(cnt);var rs=cnt;}else{cnt=cn;rs=bt;}
cnt.append(bt);bt.click(cb);return rs;}
lib.imTitle=function(im){if(im.title)return im.title;return lib.pathLast(im.topic);}
lib.createNewAlbum=function(image){var data={image:image};var url="http://"+idv.apiHost+"/api/newAlbum";lib.post(url,data,function(rs){if(rs.status=="fail"){lib.myAlert("You already have annotations of this image");}else{var tp=rs.value;var dst="/topic"+tp+"/index.html"
location.href=dst;}});}
lib.benchCount=10;lib.benchCC=0;lib.benchToGet='http://dev.imagediver.org/topic/album/4294b0e/the_ambassadors/7/main.json';lib.benchInterval=1000;lib.bench=function(){lib.benchCC=0;lib.benchLoop();}
lib.benchLoop=function(){lib.benchCC=lib.benchCC+1;if(lib.benchCC>lib.benchCount){console.log("DONE");return;}
var tm=(new Date).getTime();console.log("start grab");lib.get(lib.benchToGet,function(rs){var etm=((new Date).getTime())-tm;console.log("Grab in ",etm," millisecs");setTimeout(function(){lib.benchLoop();},lib.benchInterval);});}
lib.toTopicPage=function(tp){dst="/topic"+tp+"/index.html";location.href=dst;}
lib.toVirtualAlbum=function(im){var tpo=new lib.topicOb(im.topic);tpo.kind="album";tpo.albumId="-";return tpo.topic();}
lib.closeX='<div class="closeX" style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:10pt;color:white;float:right">X</div>';lib.addClose=function(el){var thisHere=this;var close=$(lib.closeX);close.click(function(){el.hide();});el.append(close);}})();
idv.topbar={};(function(){var lib=idv.topbar; var geom=idv.geom;var util=idv.util;lib.Topbar=function(container,options){this.container=container;this.options=options;}
lib.Topbar.prototype.render=function(){function installOvers(el){el.mouseover(function(){el.css({"color":"yellow"})});el.mouseleave(function(){el.css({"color":"white"})});}
var options=this.options;var cnt=this.container;var embed=idv.embed;if(embed){$('.topDivTop').hide();}
var thisHere=this;util.loggedInUserFromCookie();var loggedInUser=idv.loggedInUser;var logo=$('<span class="logo">imageDiver <sup style="font-size:8pt">beta</sup></span>');if(embed){logo.click(function(){util.navigateToPage(util.dropQS(),embed);});}else{logo.click(function(){util.navigateToPage("/");});}
if(embed){cnt.append(logo);var titleSpan=$('<span>'+options.title+'</span>');cnt.append(titleSpan);lib.titleSpan=titleSpan;return;}
var topDvTop=$('.topDivTop');if(topDvTop.length==0){var topDvTop=$('<div class="topDivTop"></div>');cnt.append(topDvTop);}
var tdt=topDvTop;tdt.empty();tdt.append(logo);var brie8=$.browser.msie&&(parseFloat($.browser.version)<9);var okb=!brie8;okb=true; if(brie8&&false){var ie8Note=$('<span class="titleRight" style="font-size:8pt">To see more ImageDiver content, please upgrade your browser (Internet Explorer 8) to version 9, or come back with Chrome, Firefox, or Safari.</span>');tdt.append(ie8Note);return;}
if(!loggedInUser){var loginIDV=$('<span class="titleRight">sign in</span>');tdt.append(loginIDV);installOvers(loginIDV);loginIDV.click(function(){util.navigateToPage("/login")});}
if(loggedInUser){var workIDV=$('<span class="titleRight">my content</span>');tdt.append(workIDV);installOvers(workIDV);workIDV.click(function(){util.navigateToPage("/mywork")});var meIDV=$('<span class="titleRight">account</span>');tdt.append(meIDV);installOvers(meIDV);meIDV.click(function(){util.navigateToPage("/me")});}
function addPullDownMember(pulldown,txt,action){var el=$("<div class='pulldownElement'/>");el.html(txt);pulldown.append(el);el.click(action);installOvers(el);}
function addPullDown(container,wd){var pd=$('<div style="position:absolute"></div>');pd.css({"z-index":10000,width:(wd+40)+"px","background-color":"black","border":"solid thin white"});container.append(pd);pd.mouseleave(function(){pd.hide();});installOvers(pd);return pd;}
function activateAboutPulldown(spn){var wd=spn.width();var offs=spn.offset();offs.left=offs.left-10;var pd=lib.aboutPulldown;var cnt=$('body');if(!pd){var pd=addPullDown(cnt,wd);addPullDownMember(pd,'FAQ',function(){util.navigateToPage("/faq")});if(idv.loggedInUser)addPullDownMember(pd,'forum',function(){util.navigateToPage("/forum")});addPullDownMember(pd,'Contact',function(){util.navigateToPage("/contact")});addPullDownMember(pd,'Terms of Service',function(){util.navigateToPage("/tos")});lib.aboutPulldown=pd;}else{pd.show();}
pd.offset(offs);}
var aboutIDV=$('<span class="titleRight">about</span>');if($.browser.mozilla||1){aboutIDV.append('<span>&#x25BC;</span>');}else{aboutIDV.append('<span style="font-family:webdings">6</span>');}
tdt.append(aboutIDV);aboutIDV.mouseover(function(){activateAboutPulldown(aboutIDV);});var detailsLink=options.detailsLink;if(detailsLink){var dtxt=detailsLink.text;var daction=detailsLink.action;var detailsEl=$('<span class="titleRight">'+dtxt+'</span>');detailsEl.click(daction);tdt.append(detailsEl);installOvers(detailsEl);util.addToolTip(detailsEl,"About this image");}
function activateImagesPulldown(spn){var wd=spn.width();var offs=spn.offset();offs.left=offs.left-10;var pd=lib.imagesPulldown;var cnt=$('body');if(!pd){var pd=addPullDown(cnt,wd);addPullDownMember(pd,'All',function(){util.navigateToPage("/pimages")});addPullDownMember(pd,'My Images',function(){util.navigateToPage("/myimages")});lib.imagesPulldown=pd;}else{pd.show();}
pd.offset(offs);}
if(options.imagePage&&0){var imagePage=$('<span class="titleRight">image</span>');tdt.append(imagePage);installOvers(imagePage);lib.imagePage=imagePage;imagePage.click(function(){util.navigateToPage(options.imagePage);});}
var importI=$('<span class="titleRight">import</span>');tdt.append(importI);installOvers(importI);util.addToolTip(importI,"Import an image");importI.click(function(){if(idv.loggedInUser){util.navigateToPage('/upload');}else{util.myAlert("Import","You must be logged in to import an image. You can log in with your Tumblr or Twitter account. In any case, registration is free.");}
});var images=$('<span class="titleRight">images</span>');tdt.append(images);util.addToolTip(images,"Images ready for annotation");installOvers(images);images.click(function(){util.navigateToPage('/images');});var gallery=$('<span class="titleRight">gallery</span>');tdt.append(gallery);installOvers(gallery);util.addToolTip(gallery,"Gallery of annotated images");gallery.click(function(){util.navigateToPage('/gallery');});var blog=$('<span class="titleRight">blog</span>');tdt.append(blog);installOvers(blog);blog.click(function(){util.navigateToPage('http://imagediver.tumblr.com');});var titleDiv=$('.titleDiv');if(titleDiv.length==0){titleDiv=$('<div class="titleDiv">'+options.title+'</div>');cnt.append(titleDiv);}else{titleDiv.show();if(options.title){titleDiv.html(options.title);}}
lib.titleDiv=titleDiv;if((typeof(page)!="undefined")&&page.theLayout)page.applyTopDivCss(page.theLayout)}
lib.genTopbar=function(container,options){if(container){var topDiv=$('.topDiv');if(topDiv.length==0){var topDiv=$('<div class="topDiv"/>');container.append(topDiv);}}else{topDiv=$('.topDiv');}
lib.topDiv=topDiv;lib.topbar=new lib.Topbar(topDiv,options);lib.topbar.render();return lib.topbar;}})();
