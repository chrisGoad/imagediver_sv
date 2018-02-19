var Markdown;if(typeof exports==="object"&&typeof require==="function") 
Markdown=exports;else
Markdown={};(function(){function identity(x){return x;}
function returnFalse(x){return false;}
function HookCollection(){}
HookCollection.prototype={chain:function(hookname,func){var original=this[hookname];if(!original)
throw new Error("unknown hook "+hookname);if(original===identity)
this[hookname]=func;else
this[hookname]=function(x){return func(original(x));}},set:function(hookname,func){if(!this[hookname])
throw new Error("unknown hook "+hookname);this[hookname]=func;},addNoop:function(hookname){this[hookname]=identity;},addFalse:function(hookname){this[hookname]=returnFalse;}};Markdown.HookCollection=HookCollection;function SaveHash(){}
SaveHash.prototype={set:function(key,value){this["s_"+key]=value;},get:function(key){return this["s_"+key];}};Markdown.Converter=function(){var pluginHooks=this.hooks=new HookCollection();pluginHooks.addNoop("plainLinkText"); pluginHooks.addNoop("preConversion"); pluginHooks.addNoop("postConversion"); var g_urls;var g_titles;var g_html_blocks;var g_list_level;this.makeHtml=function(text){if(g_urls)
throw new Error("Recursive call to converter.makeHtml");g_urls=new SaveHash();g_titles=new SaveHash();g_html_blocks=[];g_list_level=0;text=pluginHooks.preConversion(text);text=text.replace(/~/g,"~T"); text=text.replace(/\$/g,"~D"); text=text.replace(/\r\n/g,"\n"); text=text.replace(/\r/g,"\n");text="\n\n"+text+"\n\n";text=_Detab(text);text=text.replace(/^[ \t]+$/mg,""); text=_HashHTMLBlocks(text);text=_StripLinkDefinitions(text);text=_RunBlockGamut(text);text=_UnescapeSpecialChars(text); text=text.replace(/~D/g,"$$"); text=text.replace(/~T/g,"~");text=pluginHooks.postConversion(text);g_html_blocks=g_titles=g_urls=null;return text;};function _StripLinkDefinitions(text){text=text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,function(wholeMatch,m1,m2,m3,m4,m5){m1=m1.toLowerCase();g_urls.set(m1,_EncodeAmpsAndAngles(m2)); if(m4){return m3;}else if(m5){g_titles.set(m1,m5.replace(/"/g,"&quot;"));} 
return"";});return text;}
function _HashHTMLBlocks(text){var block_tags_a="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
var block_tags_b="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"
text=text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);text=text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);text=text.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);text=text.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g,hashElement);text=text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);return text;}
function hashElement(wholeMatch,m1){var blockText=m1; blockText=blockText.replace(/^\n+/,""); blockText=blockText.replace(/\n+$/g,"");blockText="\n\n~K"+(g_html_blocks.push(blockText)-1)+"K\n\n";return blockText;}
function _RunBlockGamut(text,doNotUnhash){text=_DoHeaders(text);var replacement="<hr />\n";text=text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,replacement);text=text.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm,replacement);text=text.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm,replacement);text=_DoLists(text);text=_DoCodeBlocks(text);text=_DoBlockQuotes(text);text=_HashHTMLBlocks(text);text=_FormParagraphs(text,doNotUnhash);return text;}
function _RunSpanGamut(text){text=_DoCodeSpans(text);text=_EscapeSpecialCharsWithinTagAttributes(text);text=_EncodeBackslashEscapes(text);text=_DoImages(text);text=_DoAnchors(text);text=_DoAutoLinks(text);text=text.replace(/~P/g,"://");
text=_EncodeAmpsAndAngles(text);text=_DoItalicsAndBold(text);text=text.replace(/  +\n/g," <br>\n");return text;}
function _EscapeSpecialCharsWithinTagAttributes(text){ var regex=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>)/gi;text=text.replace(regex,function(wholeMatch){var tag=wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");tag=escapeCharacters(tag,wholeMatch.charAt(1)=="!"?"\\`*_/":"\\`*_"); return tag;});return text;}
function _DoAnchors(text){
text=text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);
text=text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^()\s])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);
text=text.replace(/(\[([^\[\]]+)\])()()()()()/g,writeAnchorTag);return text;}
function writeAnchorTag(wholeMatch,m1,m2,m3,m4,m5,m6,m7){if(m7==undefined)m7="";var whole_match=m1;var link_text=m2.replace(/:\/\//g,"~P"); var link_id=m3.toLowerCase();var url=m4;var title=m7;if(url==""){if(link_id==""){ link_id=link_text.toLowerCase().replace(/ ?\n/g," ");}
url="#"+link_id;if(g_urls.get(link_id)!=undefined){url=g_urls.get(link_id);if(g_titles.get(link_id)!=undefined){title=g_titles.get(link_id);}}
else{if(whole_match.search(/\(\s*\)$/m)>-1){ url="";}else{return whole_match;}}}
url=encodeProblemUrlChars(url);url=escapeCharacters(url,"*_");var result="<a href=\""+url+"\"";if(title!=""){title=attributeEncode(title);title=escapeCharacters(title,"*_");result+=" title=\""+title+"\"";}
result+=">"+link_text+"</a>";return result;}
function _DoImages(text){
text=text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);
text=text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);return text;}
function attributeEncode(text){
return text.replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function writeImageTag(wholeMatch,m1,m2,m3,m4,m5,m6,m7){var whole_match=m1;var alt_text=m2;var link_id=m3.toLowerCase();var url=m4;var title=m7;if(!title)title="";if(url==""){if(link_id==""){ link_id=alt_text.toLowerCase().replace(/ ?\n/g," ");}
url="#"+link_id;if(g_urls.get(link_id)!=undefined){url=g_urls.get(link_id);if(g_titles.get(link_id)!=undefined){title=g_titles.get(link_id);}}
else{return whole_match;}}
alt_text=escapeCharacters(attributeEncode(alt_text),"*_[]()");url=escapeCharacters(url,"*_");var result="<img src=\""+url+"\" alt=\""+alt_text+"\"";title=attributeEncode(title);title=escapeCharacters(title,"*_");result+=" title=\""+title+"\"";result+=" />";return result;}
function _DoHeaders(text){text=text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,function(wholeMatch,m1){return"<h1>"+_RunSpanGamut(m1)+"</h1>\n\n";});text=text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(matchFound,m1){return"<h2>"+_RunSpanGamut(m1)+"</h2>\n\n";});text=text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(wholeMatch,m1,m2){var h_level=m1.length;return"<h"+h_level+">"+_RunSpanGamut(m2)+"</h"+h_level+">\n\n";});return text;}
function _DoLists(text){ text+="~0";var whole_list=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;if(g_list_level){text=text.replace(whole_list,function(wholeMatch,m1,m2){var list=m1;var list_type=(m2.search(/[*+-]/g)>-1)?"ul":"ol";var result=_ProcessListItems(list,list_type);result=result.replace(/\s+$/,"");result="<"+list_type+">"+result+"</"+list_type+">\n";return result;});}else{whole_list=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;text=text.replace(whole_list,function(wholeMatch,m1,m2,m3){var runup=m1;var list=m2;var list_type=(m3.search(/[*+-]/g)>-1)?"ul":"ol";var result=_ProcessListItems(list,list_type);result=runup+"<"+list_type+">\n"+result+"</"+list_type+">\n";return result;});} 
text=text.replace(/~0/,"");return text;}
var _listItemMarkers={ol:"\\d+[.]",ul:"[*+-]"};function _ProcessListItems(list_str,list_type){g_list_level++;list_str=list_str.replace(/\n{2,}$/,"\n"); list_str+="~0";var marker=_listItemMarkers[list_type];var re=new RegExp("(^[ \\t]*)("+marker+")[ \\t]+([^\\r]+?(\\n+))(?=(~0|\\1("+marker+")[ \\t]+))","gm");var last_item_had_a_double_newline=false;list_str=list_str.replace(re,function(wholeMatch,m1,m2,m3){var item=m3;var leading_space=m1;var ends_with_double_newline=/\n\n$/.test(item);var contains_double_newline=ends_with_double_newline||item.search(/\n{2,}/)>-1;if(contains_double_newline||last_item_had_a_double_newline){item=_RunBlockGamut(_Outdent(item),true);}
else{item=_DoLists(_Outdent(item));item=item.replace(/\n$/,"");item=_RunSpanGamut(item);}
last_item_had_a_double_newline=ends_with_double_newline;return"<li>"+item+"</li>\n";}); list_str=list_str.replace(/~0/g,"");g_list_level--;return list_str;}
function _DoCodeBlocks(text){ text+="~0";text=text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,function(wholeMatch,m1,m2){var codeblock=m1;var nextChar=m2;codeblock=_EncodeCode(_Outdent(codeblock));codeblock=_Detab(codeblock);codeblock=codeblock.replace(/^\n+/g,""); codeblock=codeblock.replace(/\n+$/g,""); codeblock="<pre><code>"+codeblock+"\n</code></pre>";return"\n\n"+codeblock+"\n\n"+nextChar;}); text=text.replace(/~0/,"");return text;}
function hashBlock(text){text=text.replace(/(^\n+|\n+$)/g,"");return"\n\n~K"+(g_html_blocks.push(text)-1)+"K\n\n";}
function _DoCodeSpans(text){text=text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(wholeMatch,m1,m2,m3,m4){var c=m3;c=c.replace(/^([ \t]*)/g,""); c=c.replace(/[ \t]*$/g,""); c=_EncodeCode(c);c=c.replace(/:\/\//g,"~P");return m1+"<code>"+c+"</code>";});return text;}
function _EncodeCode(text){text=text.replace(/&/g,"&amp;");text=text.replace(/</g,"&lt;");text=text.replace(/>/g,"&gt;");text=escapeCharacters(text,"\*_{}[]\\",false);return text;}
function _DoItalicsAndBold(text){text=text.replace(/([\W_]|^)(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\2([\W_]|$)/g,"$1<strong>$3</strong>$4");text=text.replace(/([\W_]|^)(\*|_)(?=\S)([^\r\*_]*?\S)\2([\W_]|$)/g,"$1<em>$3</em>$4");return text;}
function _DoBlockQuotes(text){text=text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(wholeMatch,m1){var bq=m1;bq=bq.replace(/^[ \t]*>[ \t]?/gm,"~0"); bq=bq.replace(/~0/g,"");bq=bq.replace(/^[ \t]+$/gm,""); bq=_RunBlockGamut(bq); bq=bq.replace(/(^|\n)/g,"$1  ");bq=bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(wholeMatch,m1){var pre=m1;pre=pre.replace(/^  /mg,"~0");pre=pre.replace(/~0/g,"");return pre;});return hashBlock("<blockquote>\n"+bq+"\n</blockquote>");});return text;}
function _FormParagraphs(text,doNotUnhash){text=text.replace(/^\n+/g,"");text=text.replace(/\n+$/g,"");var grafs=text.split(/\n{2,}/g);var grafsOut=[];var markerRe=/~K(\d+)K/;var end=grafs.length;for(var i=0;i<end;i++){var str=grafs[i]; if(markerRe.test(str)){grafsOut.push(str);}
else if(/\S/.test(str)){str=_RunSpanGamut(str);str=str.replace(/^([ \t]*)/g,"<p>");str+="</p>"
grafsOut.push(str);}}
if(!doNotUnhash){end=grafsOut.length;for(var i=0;i<end;i++){var foundAny=true;while(foundAny){ foundAny=false;grafsOut[i]=grafsOut[i].replace(/~K(\d+)K/g,function(wholeMatch,id){foundAny=true;return g_html_blocks[id];});}}}
return grafsOut.join("\n\n");}
function _EncodeAmpsAndAngles(text){text=text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"); text=text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");return text;}
function _EncodeBackslashEscapes(text){text=text.replace(/\\(\\)/g,escapeCharacters_callback);text=text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);return text;}
function _DoAutoLinks(text){ text=text.replace(/(^|\s)(https?|ftp)(:\/\/[-A-Z0-9+&@#\/%?=~_|\[\]\(\)!:,\.;]*[-A-Z0-9+&@#\/%=~_|\[\]])($|\W)/gi,"$1<$2$3>$4");var replacer=function(wholematch,m1){return"<a href=\""+m1+"\">"+pluginHooks.plainLinkText(m1)+"</a>";}
text=text.replace(/<((https?|ftp):[^'">\s]+)>/gi,replacer);return text;}
function _UnescapeSpecialChars(text){text=text.replace(/~E(\d+)E/g,function(wholeMatch,m1){var charCodeToReplace=parseInt(m1);return String.fromCharCode(charCodeToReplace);});return text;}
function _Outdent(text){text=text.replace(/^(\t|[ ]{1,4})/gm,"~0"); text=text.replace(/~0/g,"")
return text;}
function _Detab(text){if(!/\t/.test(text))
return text;var spaces=["    ","   ","  "," "],skew=0,v;return text.replace(/[\n\t]/g,function(match,offset){if(match==="\n"){skew=offset+1;return match;}
v=(offset-skew)%4;skew=offset+1;return spaces[v];});}
var _problemUrlChars=/(?:["'*()[\]:]|~D)/g; function encodeProblemUrlChars(url){if(!url)
return"";var len=url.length;return url.replace(_problemUrlChars,function(match,offset){if(match=="~D") 
return"%24";if(match==":"){if(offset==len-1||/[0-9\/]/.test(url.charAt(offset+1)))
return":"}
return"%"+match.charCodeAt(0).toString(16);});}
function escapeCharacters(text,charsToEscape,afterBackslash){ var regexString="(["+charsToEscape.replace(/([\[\]\\])/g,"\\$1")+"])";if(afterBackslash){regexString="\\\\"+regexString;}
var regex=new RegExp(regexString,"g");text=text.replace(regex,escapeCharacters_callback);return text;}
function escapeCharacters_callback(wholeMatch,m1){var charCodeToEscape=m1.charCodeAt(0);return"~E"+charCodeToEscape+"E";}};})();
idv={};idv.util={};idv.css={};idv.useS3=true;idv.alwaysUseFlash=false;idv.useFlash=idv.alwaysUseFlash;idv.useFlashForOverlay=false;idv.homeTopic="/album/4294b0e/the_ambassadors/1";idv.portNumber="";(function(){var lib=idv.util;lib.activeConsoleTags=[];if(typeof(Markdown)!="undefined"){lib.Markdown=new Markdown.Converter();}
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
idv.geom={};(function(){var lib=idv.geom;lib.Point=function(x,y){this.x=x;this.y=y;}
lib.Point.prototype.length=function(){var x=this.x;var y=this.y;return Math.sqrt(x*x+y*y);}
lib.Point.prototype.times=function(z){return new lib.Point(z*this.x,z*this.y);}
lib.Point.prototype.timesX=function(z){return new lib.Point(z*this.x,this.y);} 
lib.Point.prototype.divideBy=function(z){var x=this.x;var y=this.y;if(!z)debugger;if(typeof z=="number"){return new lib.Point(x/z,y/z);}
return new lib.Point(x/(z.x),y/(z.y));}
lib.Point.prototype.plus=function(p){return new lib.Point(this.x+p.x,this.y+p.y);} 
lib.Point.prototype.plusX=function(x){return new lib.Point(this.x+x,this.y);}
lib.Point.prototype.plusY=function(y){return new lib.Point(this.x,this.y+y);}
lib.Point.prototype.minus=function(p){if(typeof p=="undefined"){return new lib.Point(-this.x,-this.y);}
return new lib.Point(this.x-p.x,this.y-p.y);}
lib.Point.prototype.distance=function(p){var dv=this.minus(p);return dv.length();}
lib.Point.prototype.clone=function(){return new lib.Point(this.x,this.y);}
lib.Point.prototype.externalize=function(){return{x:this.x,y:this.y}} 
lib.Point.prototype.interpolate=function(p1,v){var xd=p1.x-this.x;var yd=p1.y-this.y;return new lib.Point(this.x+v*xd,this.y+v*yd);}
lib.internalizePoint=function(p){return new lib.Point(p.x,p.y);}
lib.Bounds=function(min,max){this.min=min;this.max=max;}
lib.Bounds.prototype.intersect=function(b){var min=Math.max(this.min,b.min);var max=Math.min(this.max,b.max);if(min>=max)return null;return new lib.Bounds(min,max);}
lib.Bounds.prototype.intersects=function(b){var min=Math.max(this.min,b.min);var max=Math.min(this.max,b.max);return max>min;}
lib.Rect=function(corner,extent){this.corner=corner;this.extent=extent;}
lib.NRect=function(corner,extent){ var xtx=extent.x;var xty=extent.y;var cx=corner.x;var cy=corner.y;var cm=false;if(xtx<0){cx=cx+xtx;xtx=-xtx;}
if(xty<0){cy=cy+xty;xty=-xty;}
return new lib.Rect(new lib.Point(cx,cy),new lib.Point(xtx,xty));}
lib.Rect.prototype.times=function(s){return new lib.Rect(this.corner.times(s),this.extent.times(s));} 
lib.Rect.prototype.scale=function(s){var center=this.center();var cornerRelCenter=this.corner.minus(center);var newCorner=center.plus(cornerRelCenter.times(s));return new lib.Rect(newCorner,this.extent.times(s));}
lib.Rect.prototype.contains=function(p){var crn=this.corner;var ext=this.extent;var px=p.x
var py=p.y;var ux=crn.x+ext.x;var uy=crn.y+ext.y;var rs=(px>=crn.x)&&(px<=ux)&&(py>=crn.y)&&(py<=uy);return rs;} 
lib.Rect.prototype.distToEdge=function(p){var crn=this.corner;var ext=this.extent;var topy=crn.y;var dtop=p.y-topy;var boty=crn.y+ext.y;var dbot=boty-p.y;var leftx=crn.x;var dleft=p.x-leftx;var rightx=crn.x+ext.x;var dright=rightx-p.x;return Math.min(dtop,dbot,dleft,dright);}
lib.Rect.prototype.distToCenter=function(p){var c=this.center();return p.distance(c);}
lib.Rect.prototype.expand=function(ex){var crn=this.corner;var ext=this.extent;var ncrn=new lib.Point(crn.x-ex,crn.y-ex);var nxt=new lib.Point(ext.x+2*ex,ext.y+2*ex);return new lib.Rect(ncrn,nxt);}
lib.Rect.prototype.applyPointOperation=function(f){var ul=this.corner;var lr=this.lowerRight();var vul=f(ul);var vlr=f(lr);return lib.newRectFromCorners(vul,vlr);}
lib.Rect.prototype.plus=function(p){var c=this.corner;var nc=c.plus(p);return new lib.Rect(nc,this.extent);} 
lib.Rect.prototype.tostring=function(){var c=this.corner;var ex=this.extent;return"[rect ("+Math.floor(c.x)+","+Math.floor(c.y)+")("+Math.floor(ex.x)+","+Math.floor(ex.y)+")]"}
lib.Rect.prototype.interpolate=function(r1,v){var ixt=this.extent.interpolate(r1.extent,v);var ic=this.corner.interpolate(r1.corner,v);return new lib.Rect(ic,ixt);}
lib.internalizeRect=function(r){return new lib.Rect(lib.internalizePoint(r.corner),lib.internalizePoint(r.extent));}
lib.Rect.prototype.externalize=function(){return{corner:this.corner.externalize(),extent:this.extent.externalize()};}
lib.Rect.prototype.clone=function(){return new lib.Rect(this.corner,this.extent);}
lib.Rect.prototype.maxX=function(){return this.corner.x+this.extent.x;}
lib.Rect.prototype.maxY=function(){return this.corner.y+this.extent.y;}
lib.Rect.prototype.area=function(){var ext=this.extent;return ext.x*ext.y;}
lib.Rect.prototype.center=function(){var c=this.corner;var ext=this.extent;var cntx=c.x+0.5*ext.x;var cnty=c.y+0.5*ext.y;return new lib.Point(cntx,cnty);}
lib.Rect.prototype.upperLeft=function(){return this.corner;}
lib.fixedAspectRatio; lib.Rect.prototype.upperLeft_new=function(p){var cc=this.corner;var d=cc.minus(p);var xt=this.extent;var nxt=xt.plus(d);var far=lib.fixedAspectRatio;if(far){ var wd=nxt.x;var ht=nxt.y;var aht=far*wd;var adj=aht-ht; p.y=p.y;nxt.y=aht;}
return new lib.Rect(p,nxt);}
lib.Rect.prototype.middleLeft=function(){var p=this.corner;var ht=this.height();return p.plusY(0.5*ht);}
lib.Rect.prototype.middleLeft_new=function(p){var cc=this.corner;var dx=cc.x-p.x;var xt=this.extent;var far=lib.fixedAspectRatio;if(far){ var xt=this.extent;var wd=xt.x+dx;var ht=xt.y;var aht=far*wd;var adj=aht-ht;var nxt=new lib.Point(wd,aht);var ncr=new lib.Point(p.x,cc.y-adj);}else{var nxt=new lib.Point(xt.x+dx,xt.y);var ncr=new lib.Point(p.x,cc.y);}
return new lib.Rect(ncr,nxt);}
lib.Rect.prototype.lowerLeft=function(){var p=this.corner;var ht=this.height();return p.plusY(ht);}
lib.Rect.prototype.lowerLeft_new=function(p){var ll=this.lowerLeft();var cc=this.corner;var d=new lib.Point(ll.x-p.x,p.y-ll.y);var xt=this.extent;var nxt=xt.plus(d);var far=lib.fixedAspectRatio;if(far){ var wd=nxt.x;var ht=nxt.y;var aht=far*wd;var adj=aht-ht; cc.y=cc.y-adj;nxt.y=aht;}
var ncr=new lib.Point(p.x,cc.y);return new lib.Rect(ncr,nxt);}
lib.Rect.prototype.upperMiddle=function(){var p=this.corner;var wd=this.width();return p.plusX(0.5*wd);}
lib.Rect.prototype.upperMiddle_new=function(p){var cc=this.corner;var dy=cc.y-p.y;var xt=this.extent;var far=lib.fixedAspectRatio;if(far){ var xt=this.extent;var wd=xt.x;var ht=xt.y+dy;var awd=ht/far;var adj=awd-wd
var nxt=new lib.Point(awd,ht);var ncr=new lib.Point(cc.x-adj,p.y);}else{var nxt=new lib.Point(xt.x,xt.y+dy);var ncr=new lib.Point(cc.x,p.y);}
return new lib.Rect(ncr,nxt);}
lib.Rect.prototype.lowerMiddle=function(){var p=this.corner;var wd=this.width();var ht=this.height();return p.plus(new lib.Point(0.5*wd,ht));}
lib.Rect.prototype.lowerMiddle_new=function(p){var cc=this.corner;var ll=this.lowerLeft();var dy=p.y-ll.y;var xt=this.extent;var far=lib.fixedAspectRatio;if(far){var xt=this.extent;var wd=xt.x;var ht=xt.y+dy;var awd=ht/far;var adj=awd-wd
var nxt=new lib.Point(awd,ht);var ncr=new lib.Point(cc.x-adj,p.y);}else{var nxt=new lib.Point(xt.x,xt.y+dy);var ncr=cc;}
return new lib.Rect(cc,nxt);}
lib.Rect.prototype.upperRight=function(){var p=this.corner;var wd=this.width();return p.plusX(wd);}
lib.Rect.prototype.upperRight_new=function(p){var ur=this.upperRight();var cc=this.corner;var d=new lib.Point(p.x-ur.x,ur.y-p.y);var xt=this.extent;var nxt=xt.plus(d);var far=lib.fixedAspectRatio;if(far){ var wd=nxt.x;var ht=nxt.y;var aht=far*wd;nxt.y=aht;}
var ncr=new lib.Point(cc.x,p.y);return new lib.Rect(ncr,nxt);}
lib.Rect.prototype.middleRight=function(){var p=this.corner;var wd=this.width();var ht=this.height();return p.plus(new lib.Point(wd,0.5*ht));}
lib.Rect.prototype.middleRight_new=function(p){var cc=this.corner;var xt=this.extent;var dx=p.x-(cc.x+xt.x);var nxt=new lib.Point(xt.x+dx,xt.y);var far=lib.fixedAspectRatio;if(far){
var wd=nxt.x;var ht=nxt.y;var aht=far*wd;var nxt=new lib.Point(wd,aht);}
return new lib.Rect(cc,nxt);}
lib.Rect.prototype.lowerRight=function(){return this.corner.plus(this.extent);}
lib.Rect.prototype.lowerRight_new=function(p){var rp=this.lowerRight();var cc=this.corner;var d=new lib.Point(p.x-rp.x,p.y-rp.y);var xt=this.extent;var nxt=xt.plus(d);var far=lib.fixedAspectRatio;if(far){var wd=nxt.x;var ht=nxt.y;var aht=far*wd;var adj=aht-ht;nxt.y=aht;cc.y=cc.y-adj;}
return new lib.Rect(cc,nxt);}
lib.rectWithCenter=function(p,xt){var xd=xt.x;var yd=xt.y;var px=p.x
var py=p.y;var cx=px-0.5*xd;var cy=py-0.5*yd;return new lib.Rect(new lib.Point(cx,cy),xt);}
lib.squareWithCenter=function(p,dim){return lib.rectWithCenter(p,new lib.Point(dim,dim));}
lib.Rect.prototype.yBounds=function(){return new lib.Bounds(this.corner.y,this.corner.y+this.extent.y);}
lib.Rect.prototype.xBounds=function(){return new lib.Bounds(this.corner.x,this.corner.x+this.extent.x);}
lib.Rect.prototype.width=function(){var xt=this.extent;return xt.x;} 
lib.Rect.prototype.toMinDim=function(mindim){var xt=this.extent;var xtx=xt.x;var xty=xt.y;if(xtx<mindim){var nn=true;var xtx=mindim;}
if(xty<mindim){var nn=true;var xty=mindim;}
if(nn){return new lib.Rect(this.corner,new lib.Point(xtx,xty));}
return this;}
lib.Rect.prototype.height=function(){var xt=this.extent;return xt.y;}
lib.Rect.prototype.crop=function(minAspectRatio){ext=this.extent
art=ext.y/ext.x
if(art>=minAspectRatio){return self}
alwd=(ext.y)/minAspectRatio
lftdiff=(ext.x-alwd)*0.5
nxt=new lib.Point(alwd,ext.y)
crn=self.corner
ncrn=new lib.Point(crn.x+lftdiff,crn.y)
rs=new lib.Rect(ncrn,nxt)
return rs}
lib.newRectFromBounds=function(xb,yb){var c=new lib.Point(xb.min,yb.min);var xt=new lib.Point(xb.max-xb.min,yb.max-yb.min);return new lib.Rect(c,xt);}
lib.newRectFromCorners=function(ur,ll){var xt=ll.minus(ur);return new lib.Rect(ur,xt);}
lib.Rect.prototype.intersect=function(rc){var xb=this.xBounds().intersect(rc.xBounds());if(!xb)return null;var yb=this.yBounds().intersect(rc.yBounds());if(!yb)return null;return lib.newRectFromBounds(xb,yb);}
lib.Rect.prototype.intersects=function(rc){return this.xBounds().intersects(rc.xBounds())&&this.yBounds().intersects(rc.yBounds());}
lib.Grid=function(rows,corner,extent){this.rows=rows; this.rowCount=rows.length;this.colCount=rows[0].length;var xInc=extent.x/(this.rowCount-1);var yInc=extent.y/(this.colCount-1);this.corner=corner;this.extent=extent;this.cellDim=new lib.Point(xInc,yInc);}
lib.Grid.prototype.inCell=function(p){var rc=p.minus(this.corner);var cellDim=this.cellDim;var xidx=Math.floor(rc.x/cellDim.x);var yidx=Math.floor(rc.y/cellDim.y);var cell=new lib.Point(xidx,yidx);var cellDim=this.cellDim;var relcell=p.minus(p,new lib.Point(xidx*cellDim.x,yidx*cellDim.y));var normalizedRelcell=relcell.divideBy(cellDim);return{cell:cell,withinCell:normalizedRelcell};}
lib.Grid.prototype.valueAtGridPoint=function(p){ var rows=this.rows;var row=rows[p.y];return row[p.x];}
lib.Grid.prototype.valueAtPoint=function(p){var cin=this.inCell(p);var c=cin.cell;var incell=cin.withinCell;var vp0=this.valueAtGridPoint(c);var vp1=this.valueAtGridPoint(new lib.Point(c.x+1,c.y));var vp2=this.valueAtGridPoint(new lib.Point(c.x,c.y+1));var vp3=this.valueAtGridPoint(new lib.Point(c.x+1,c.y+1));var incx=incell.x;var incy=incell.y;var topI=vp0*(1-incx)+vp1*incx;var bottomI=vp2*(1-incx)+vp1*incx;var rs=topI*(1-incy)+bottomI*incy;return rs;}
lib.Grid1=function(values,lb,ub){this.values=values;this.count=values.length;this.increment=(ub-lb)/(this.count-1);this.lb=lb;this.ub=ub;}
lib.Grid1.prototype.inCell=function(x){var lb=this.lb;var r=x-lb;var inc=this.increment
var idx=Math.floor(r/inc);var relcell=(r-idx*inc)/inc;return{cell:idx,withinCell:relcell};}
lib.Grid1.prototype.valueAt=function(x){var cin=this.inCell(x);var idx=cin.cell;var incell=cin.withinCell;var values=this.values;var v0=values[idx];var v1=values[idx+1];var rs=v1*incell+v0*(1-incell);return rs;}
lib.scaleRect=function(rect,corner,scale){var nex=rect.extent.times(scale);var rs=new lib.Rect(corner,nex);return rs;}
lib.scaleRectX=function(rect,corner,scale){var nex=rect.extent.timesX(scale);var rs=new lib.Rect(corner,nex);return rs;}})();
idv.image={};(function(){var lib=idv.image;var util=idv.util;var geom=idv.geom;lib.Image=function(imD){var imDimx=imD.dimensions.x;var imDimy=imD.dimensions.y;var imDim=new geom.Point(imDimx,imDimy);this.extent=imDim;var tilingDir=imD.tilingDir;if(tilingDir&&0){this.tilingDir=imD.tilingDir;this.tilingUrl=imD.tilingUrl;}else{ var user=imD.owner;if(!user){user=imD.user;}
var tp=imD.topic;var imname=util.pathLast(tp);var lin=user.lastIndexOf("/");var uname=user.substr(lin+1);this.tilingDir="/mnt/ebs1/imagediver/tilings/"+uname+"/"+imname+"/";var bucket=imD.bucket;if(!bucket){bucket="idv_"+uname;}
domain=idv.cfDomain;this.tilingUrl=util.s3imDir(uname,imname)+"tiling/";this.name=imname;this.user=user;}}
lib.Tiling=function(image,tileImageSize,aspectRatio,depthIncrement){var di=depthIncrement?depthIncrement:0;this.image=image;var directory=image.tilingDir;var url=image.tilingUrl;var imxt=image.extent;var height=imxt.y;var width=imxt.x;var topTileSizeH=Math.pow(2,Math.ceil(Math.log(height)/Math.LN2));var topTileSizeW=Math.pow(2,Math.ceil(Math.log(width)/Math.LN2));var topTileSize=Math.max(topTileSizeH,topTileSizeW);this.depth=Math.ceil(Math.log(topTileSize/tileImageSize)/Math.LN2)+di; this.aspectRatio=aspectRatio; this.topTileSize=topTileSize;this.tiles=[];this.tilesById={};this.directory=directory; this.url=url; this.tileImageSize=tileImageSize;}
lib.Tile=function(tiling,path){this.tiling=tiling;this.path=path;}
lib.Tile.prototype.computeExtent=function(){if(this.outsideImage)return;var tl=this.tiling;var ar=tl.aspectRatio;var tim=tl.image;var imxt=tim.extent;var imwd=imxt.x;var imht=imxt.y;var imsz=tl.tileImageSize;var srcszx=this.size;var srcszy=ar*srcszx;var cr=this.corner;var x=cr.x;var y=cr.y;var ex=Math.min(imwd-x,srcszx); var ey=Math.min(imht-y,srcszy);if(ey<0){debugger;}
var imszx=Math.floor(imsz*(ex/srcszx));var imszy=Math.floor(ar*imsz*(ey/srcszy));this.extent=new geom.Point(imszx,imszy); this.coverage=new geom.Point(ex,ey);}
lib.Tiling.prototype.newTile=function(path){var id="r"+path.join("");var byId=this.tilesById;var tl=byId[id];if(tl)return tl;var rs=new lib.Tile(this,path);rs.id=id;var ln=path.length;var tim=this.image;var timxt=tim.extent;var tts=this.topTileSize;var csz=tts;var cx=0;var cy=0;var ar=this.aspectRatio;for(var i=0;i<ln;i++){csz=csz/2;cpe=path[i];switch(cpe){case 1:cx=cx+csz;break;case 2:cy=cy+ar*csz;break;case 3:cx=cx+csz;cy=cy+ar*csz;break;}}
rs.corner=new geom.Point(cx,cy);rs.size=csz;
rs.id=id;var outside=(cx>=timxt.x)||(cy>=timxt.y); byId[id]=rs;if(!outside)this.tiles.push(rs);rs.outsideImage=outside;rs.computeExtent();return rs;}
lib.Tile.prototype.parent=function(){var path=this.path;if(path.length==0)return null;var ppath=path.slice(0,path.length-1);var pid="r"+ppath.join("");return this.tiling.tilesById[pid]} 
lib.Tiling.prototype.createTiles=function(path){if(typeof path=="undefined")path=[];var pathc=path.concat();var tl=this.newTile(pathc);if(tl.outsideImage)return;var ln=path.length;var d=this.depth;if(ln<d){path.push(0);this.createTiles(path);path.pop();path.push(1);this.createTiles(path);path.pop();path.push(2);this.createTiles(path);path.pop();path.push(3);this.createTiles(path);path.pop();}}
lib.loadedImages={};
lib.imageLoadQueue=[];lib.imagesLoading=[];
lib.addToImQEnd=function(imel,src,whenLoaded){var el={element:imel,src:src,whenLoaded:whenLoaded};lib.imageLoadQueue.push(el);}
lib.addToImQFront=function(imel,src,whenLoaded){var el={element:imel,src:src,whenLoaded:whenLoaded};lib.imageLoadQueue.unshift(el);}
lib.execImQ=function(){var imq=lib.imageLoadQueue;if(imq.length>0){var el=imq.shift();lib.imagesLoading.push(el);var imel=el.element;var src=el.src;var whn=el.whenLoaded;imel.load(function(){if(whn){whn(imel);}
el.loaded=true;});imel.attr("src",src);return true;}else{return false;}}
lib.checkImagesLoading=function(){var rs=[];var ln=lib.imagesLoading.length;if(ln>0){for(var i=0;i<ln;i++){var el=lib.imagesLoading[i];if(!el.loaded){rs.push(el);}}
lib.imagesLoading=rs;return rs.length;}else{return 0;}}
lib.imqTick=function(){var numloading=lib.checkImagesLoading();if(numloading>0)return true;var exq=lib.execImQ();return exq;}
lib.imqTicker=function(){var tk=lib.imqTick();if(tk){lib.imqTickerActive=true;setTimeout(lib.imqTicker,50);}else{lib.imqTickerActive=false;}}
lib.loadImage=function(imel,src,whenLoaded,highPriority){if(highPriority){lib.addToImQFront(imel,src,whenLoaded);}else{lib.addToImQEnd(imel,src,whenLoaded);}
if(!lib.imqTickerActive)lib.imqTicker();}})();
(function(){var lib=idv.image;lib.noCanvas=!(Modernizr.canvas);lib.noCanvas=true;var geom=idv.geom;var util=idv.util;idv.imageLoadCount=0; idv.outlineColor="red";idv.selectedColor="yellow";lib.theDepthOffset=1; lib.theDepthBump=1; lib.resBias=3.0;
function log(){if(0){var a=util.argsToString(arguments);util.slog1(a);}}
lib.Overlay=function(name,geometry){this.geometry=geometry; this.name=name;} 
lib.Viewport=function(container,canvas,tiling,extent,ovCanvases){this.container=container;var ovCanvas=ovCanvases[0];this.ovCanvases=ovCanvases;if(!idv.useFlash){var selCanvas=ovCanvases[1];var hiliCanvas=ovCanvases[2];}
this.scale=1;this.canvas=canvas;canvas.viewport=this;if(canvas.isFlashCanvas){this.context=canvas;if(lib.noCanvas){this.ovCanvas=canvas;this.ovContext=canvas;}else{if(ovCanvas){this.ovContext=ovCanvas[0].getContext('2d');}}}else{var dcanvas=canvas[0];this.context=dcanvas.getContext('2d');this.ovContext=ovCanvas[0].getContext('2d');this.selContext=selCanvas[0].getContext('2d');this.hiliContext=hiliCanvas[0].getContext('2d');this.ovContexts=[this.ovContext,this.selContext,this.hiliContext];this.ready=true; this.fitScale=1.0;}
var ctx=this.context;ctx.strokeStyle="#ff0000";if(ovCanvas&&!lib.noCanvas){ovCanvas.viewport=this;var dovCanvas=ovCanvas[0];this.ovCanvas=ovCanvas;}
this.showTileBoundaries=false; this.tiling=tiling;this.extent=extent; this.rect=new geom.Rect(new geom.Point(0,0),new geom.Point(1000,1000/page.aspectRatio));this.aspectRatio=extent.y/extent.x;this.zoom=1;this.zoomDelay=500;this.scale=1.0; this.maxDepth=6;this.defAreaMode=0;this.pan=new geom.Point(0,0);var im=tiling.image;var imextent=im.extent;this.imExtent=imextent;this.imCenter=imextent.times(0.5);var imx=imextent.x;var imy=imextent.y;var war=this.extent.y/this.extent.x; var imar=imy/imx;var xconstrained=imar<war; this.xconstrained=xconstrained; var xsc=(extent.x)/(imextent.x);var ysc=(extent.y)/(imextent.y);this.noZoomScaling=Math.min(xsc,ysc);this.noZoomScaling=0.01;if(xconstrained){awdr=1.0;}else{var awdr=((imextent.y/imextent.x)/(this.extent.y/this.extent.x));}
var xsc=1000/(imextent.x);var ysc=1000/(imextent.y);this.noZoomScaling=1000/(awdr*imextent.x);this.overlays={} 
this.selOverlays={} 
this.hiliOverlays={};this.theOverlays=[this.overlays,this.selOverlays,this.hiliOverlays];this.tilesDrawn=[]
this.idsOfTilesDrawn=[]; this.beingLoaded=[]; this.tilesLoading=[];this.zoomCallbacks=[];this.panCallbacks=[];this.changeViewCallbacks=[];this.zoomCount=0;this.needsRefresh=true;this.zoomOneCoverage=this.computeCoverage();this.seeIfThisWorks=288;return;}
lib.Viewport.prototype.viewportToCanvas=function(x){ var scale=this.scale;return x.times(scale);}
lib.Viewport.prototype.canvasToViewport=function(x){ var invscale=1/(this.scale); return x.times(invscale);}
lib.Viewport.prototype.rectCanvasToViewport=function(r){var invscale=1/(this.scale);return r.times(invscale);}
lib.Viewport.prototype.pointViewportToImage=function(p){var zoom=this.zoom; var scaling=1/((this.noZoomScaling)*zoom);var vext=this.extent;var vcenter=new geom.Point(500,500/(page.aspectRatio)); var vrel=p.minus(vcenter); var irel=vrel.times(scaling); var panDist=this.pan.times(this.imExtent.x); var imCenter=this.imCenter;var viewCenter=this.imCenter.plus(panDist); var rs=viewCenter.plus(irel);return rs;}
lib.Viewport.prototype.pointImageToViewport=function(p){var panDist=this.pan.times(this.imExtent.x); var viewCenter=this.imCenter.plus(panDist); var relim=p.minus(viewCenter); var scaling=(this.noZoomScaling)*(this.zoom);var relvp=relim.times(scaling); var vext=this.extent;var vcenter=new geom.Point(500,500/(page.aspectRatio)); var rs=vcenter.plus(relvp);return rs;}
lib.Viewport.prototype.rectViewportToImage=function(r){var thisHere=this;var f=function(p){return thisHere.pointViewportToImage(p);}
return r.applyPointOperation(f);}
lib.Viewport.prototype.rectCanvasToImage=function(r){var vp=this.rectCanvasToViewport(r);return this.rectViewportToImage(vp);}
lib.Viewport.prototype.rectImageToViewport=function(r){var thisHere=this;var f=function(p){return thisHere.pointImageToViewport(p);}
return r.applyPointOperation(f);}
lib.Viewport.prototype.rectImageToCanvas=function(r,useFlash){var vp=this.rectImageToViewport(r);if(useFlash){return vp.times(4.0/10);}
return this.viewportToCanvas(vp);}
lib.Viewport.prototype.computeCoverage=function(){return this.rectViewportToImage(this.rect);} 
lib.Viewport.prototype.coverage=function(){if(this.cachedCoverage&&!lib.checking)return this.cachedCoverage;var tl=this.tiling;var im=tl.image;var zm=this.zoom;if(!zm)return null;var rs=this.computeCoverage();this.cachedCoverage=rs;return rs;}
lib.Viewport.prototype.coverageToPanZoom=function(coverage){if(!coverage){coverage=this.coverage();}
var covCenter=coverage.center();var offset=covCenter.minus(this.imCenter);var pan=offset.divideBy(this.imExtent.x); var im=this.tiling.image;var cvy=coverage.extent.y;var cvx=coverage.extent.x;var zm1xtX=this.zoomOneCoverage.extent.x;var zm1xtY=this.zoomOneCoverage.extent.y;var zmx=(im.extent.x)/cvx;var zmy=(im.extent.y)/cvy;var zmx=zm1xtX/cvx;var zmy=zm1xtY/cvy;var zm=Math.min(zmx,zmy);var cpan=this.pan;var czoom=this.zoom; return{zoom:zm,pan:pan}}
lib.Viewport.prototype.clearBeenDrawn=function(inFlashToo){log("beenDrawn","CLEAR",inFlashToo);if(this.canvas&&this.canvas.isFlashCanvas&&!inFlashToo)return; var td=this.tilesDrawn;var ln=td.length;for(var i=0;i<ln;i++){td[i].beenDrawn=false}
this.tilesDrawn=[];this.idsOfTilesDrawn=[];}
lib.Viewport.prototype.assertTileDrawn=function(tile){tile.beenDrawn=true;this.tilesDrawn.push(tile);this.idsOfTilesDrawn.push("r"+tile.path.join(""))}
lib.Viewport.prototype.assertTileLoading=function(tile){tile.loadingImage=true;this.tilesLoading.push(tile);}
lib.Viewport.prototype.cancelLoads=function(dp){ var ctx=this.canvas;var useFlash=ctx.isFlashCanvas;if(!useFlash)return;var el=ctx.element;if(!el)return;var tld=this.tilesLoading;var ln=tld.length;if(ln==0)return;for(var i=0;i<ln;i++){var tl=tld[i];var tlid=tl.id;var tldp=tlid.length-1;util.log("cancelload",tlid,dp,tldp,tl.beenLoaded,tl.loadingImage);if(tl.beenLoaded||!(tl.loadingImage))continue;if(tldp>dp){el.cancelLoad(tlid);}}}
lib.Viewport.prototype.addOverlay=function(o,sel){var nm=o.name;if(!sel)sel=0;var ov=this.theOverlays[sel];ov[nm]=o;}
lib.Viewport.prototype.clearOverlays=function(sel){if(sel=="both"){this.clearOverlays(0);this.clearOverlays(1);this.clearOverlays(2);return;}
this.theOverlays[sel]={}
this.clearOverlay(sel);}
lib.Viewport.prototype.normalizedCanvasToImageCoords=function(np){ var cv=this.coverage(); var cvc=cv.corner;var cvxt=cv.extent;var imx=cvc.x+(np.x*cvxt.x);var imy=cvc.y+(np.y*cvxt.y);return new geom.Point(imx,imy);}
lib.Viewport.prototype.refresh=function(force){if(force){this.needsRefresh=true;}
if(typeof this.zoom=="undefined")this.zoom=this.initialZoom;if(this.canvas.isFlashCanvas&&!this.canvas.element)return;util.log("refresh")
this.setZoom(this.zoom);}
lib.Viewport.prototype.redrawTiles=function(){ var tiles=this.tiling.tiles;util.arrayForEach(tiles,function(tile){tile.beenDrawn=false;});this.refresh(true);}
lib.relCanvas=function(div,e){var ofs=div.offset();var x=e.clientX-ofs.left;var y=e.clientY-ofs.top;var px=e.pageX-ofs.left;var py=e.pageY-ofs.top;util.log("drag",ofs.left,ofs.top,x,px,y,py);return new geom.Point(px,py);} 
lib.PanControl=function(div,vp,callbacks){ thisHere=this;this.div=div;this.vp=vp;if(typeof callback=="undefined"){this.callbacks=[];}else{this.callbacks=callbacks;} 
function relCanvas(e){var ofs=div.offset();var x=e.clientX-ofs.left;var y=e.clientY-ofs.top;var px=e.pageX-ofs.left;var py=e.pageY-ofs.top;util.log("drag",ofs.left,ofs.top,x,px,y,py);return new geom.Point(px,py);}
function relViewport(e){var rc=relCanvas(e);return rc.divideBy(vp.scale*vp.fitScale);}
div.mousemove(function(e){thisHere.mouseMoveHandler(thisHere,e);});div.mousedown(function(e){thisHere.mouseDown(thisHere,e);});div.mouseout(function(e){thisHere.mouseOutt(thisHere,e);});div.mouseup(function(e){thisHere.mouseUp(thisHere,e);});}
lib.PanControl.prototype.relCanvas=function(e){if(idv.useFlashForOverlay){}
var ofs=this.div.offset();var x=e.clientX-ofs.left;var y=e.clientY-ofs.top;var px=e.pageX-ofs.left;var py=e.pageY-ofs.top;util.log("dragg",e.clientX,e.pageX,e.clientY,e.client,e.pageY);util.log("drag",ofs.left,ofs.top,x,px,y,py);return new geom.Point(px,py);}
lib.PanControl.prototype.relViewport=function(e){var rc=this.relCanvas(e);var vp=this.vp;var rs=rc.divideBy(vp.scale*vp.fitScale);return rs;}
lib.Viewport.prototype.setDisplayParamsForZoom=function(){var cv=this.coverage();var xt=cv.extent;var mxside=Math.max(xt.x,xt.y);this.minSelectedAreaDim=mxside*0.02;lib.selectStrokeWidth=mxside*0.004;this.tenthDim=this.pointViewportToImage(new geom.Point(100,100)).x-this.pointViewportToImage(new geom.Point(0,100)).x;}
lib.Viewport.prototype.drawTheAreaEditor=function(){this.clearOverlays("both");this.drawEdRect(this.selectedArea,"image","red",false);}
lib.PanControl.prototype.mouseMoveHandler=function(pc,e){if(e.preventDefault){if(idv.useFlashForOverlay){}
e.preventDefault();}
function mylog(){if(0){util.slog(util.argsToString(arguments));}}
var vp=pc.vp;if(!vp.ready)return;util.log("mouse","movee",e);var cp=pc.relViewport(e);var cpi=vp.pointViewportToImage(cp);util.log("IMAGE COORDS ",cpi.x,cpi.y);var sela=vp.selectedArea;var cntr=vp.context.container; if(cntr)cntr.css({"-webkit-user-select":"none"}); function adjustSelectedArea(p){if(vp.whichHandle=="middle"){var nr=vp.refSelectedArea.plus(p.minus(vp.refImageP))}else{nr=vp.rectConstructor.apply(sela,[p]);nr=nr.toMinDim(vp.minSelectedAreaDim);}
vp.selectedArea=nr;vp.drawTheAreaEditor();vp.selectedAreaModified=true;}
if(vp.editAreaMode){if(!pc.mouseIsDown){vp.editAreaMode=false;}else{adjustSelectedArea(cpi);}
return;}
var inh=vp.inHandle(cpi); if(inh){if(pc.mouseIsDown){ var nwrn=inh+"_new";vp.whichHandle=inh;if(inh=="middle"){vp.refSelectedArea=vp.selectedArea;vp.refImageP=cpi;}
vp.rectConstructor=sela[nwrn]; vp.refSelectedArea=vp.selectedArea;vp.refImageP=cpi;adjustSelectedArea(cpi);vp.editAreaMode=true;vp.refSelectedArea=vp.selectedArea;}
return;}
var df=cp.minus(pc.mouseRef);if(vp.defAreaMode){if(pc.mouseIsDown){vp.clearOverlay();var r=geom.NRect(pc.mouseRef,df); pc.selectedArea=r; util.log("drag",r.corner.x,r.corner.y,df.x,df.y);vp.drawRect(r,"viewport",idv.selectedColor);return;}} 
var nrp=df.divideBy(vp.extent.x); var imext=vp.imExtent;var imar=(imext.y)/(imext.x);if(imar>1){nrp=nrp.times(imar);}
nrp=nrp.times(vp.extent.x/vp.extent.y);
if(pc.mouseIsDown){var newpan=pc.panRef.minus(nrp.divideBy(vp.zoom/(vp.scale*vp.fitScale))); mylog("pan","cp",cp.x,"zoom",vp.zoom,"scale",vp.scale,"arr",imar,"dfff",df.x,"newpan",newpan.x,newpan.y);vp.setPan(newpan);var callbacks=pc.callbacks;if(callbacks){var ln=callbacks.length;for(var i=0;i<ln;i++){var cb=callbacks[i];cb(newpan);}}}else{if(lib.mouseMoveCallback){var rc=pc.relCanvas(e);var cpi=vp.pointViewportToImage(cp);lib.mouseMoveCallback(cpi,rc);}}}
lib.PanControl.prototype.mouseDown=function(pc,e){idv.util.log("flash_mouse",e.stageX,e.stageY);e.preventDefault();var vp=pc.vp;if(!vp.ready)return;var ps=pc.relViewport(e);var ips=vp.pointViewportToImage(ps);var bps=vp.pointImageToViewport(ips);pc.mouseRef=ps;pc.panRef=vp.pan;idv.util.log("flash_mouse","ref",ps,vp.pan);util.log("mouse","down");pc.mouseIsDown=1; var dv=page.vpCapDiv;if(dv)dv.hide();}
lib.dclickInterval=350;lib.PanControl.prototype.mouseUp=function(pc,e){idv.ee=e;var vp=pc.vp;var lutm=vp.mouseUpTime;vp.mouseUpTime=Date.now();if(lutm==undefined)lutm=0;var sinceClick=vp.mouseUpTime-lutm;var dclick=sinceClick<lib.dclickInterval;if(!vp.ready)return;if(vp.defAreaMode&&pc.mouseIsDown){var cb=vp.areaDefinedCallback;if(cb){cb(vp.rectViewportToImage(pc.selectedArea),pc.selectedArea);}}else{var cp=pc.relViewport(e);var df=cp.minus(pc.mouseRef);var ln=df.length();if(ln<10){var rc=pc.relCanvas(e);var imc=vp.pointViewportToImage(cp);if(lib.clickCallback){lib.clickCallback(imc,rc,dclick);}}}
pc.mouseIsDown=0;}
lib.PanControl.prototype.mouseOutt=function(pc,e){e.preventDefault();var vp=pc.vp;if(vp.defAreaMode&&pc.mouseIsDown){var cb=vp.areaDefinedCallback;if(cb){cb(vp.rectViewportToImage(pc.selectedArea),pc.selectedArea);}}
thisHere.mouseIsDown=0;if(lib.mouseOutCallback){lib.mouseOutCallback();}
}
lib.checking=false; 
lib.Viewport.prototype.maxYpan=function(){ var zm=this.zoom;var imExtent=this.imExtent;var imx=imExtent.x;var imy=imExtent.y;var war=this.extent.y/this.extent.x; var imar=imy/imx;var xconstrained=imar<war; var zimy=zm*imy; if(xconstrained){var avy=imx*war;}else{var avy=imy;}
if(zimy<avy)return 0;var hbelow=0.5*(zimy-avy); var maxPan=hbelow/(imx*zm);return maxPan;}
lib.Viewport.prototype.maxXpan=function(){ var zm=this.zoom;var imExtent=this.imExtent;var imx=imExtent.x;var imy=imExtent.y;var war=this.extent.y/this.extent.x; var imar=imy/imx;var yconstrained=imar>=war; var zimx=zm*imx; if(yconstrained){var avx=imy/war;}else{var avx=imx;}
if(zimx<avx)return 0;var hright=0.5*(zimx-avx); var maxPan=hright/(imx*zm);return maxPan;}
lib.toBase2=function(n,d){var rs=[];var cv=n;while(cv>0){var cd=cv%2;rs.push(cv%2);cv=Math.floor(cv/2);} 
if(d){var ln=rs.length;for(var i=ln;i<d;i++){rs.push(0);}}
return rs.reverse();}
lib.Tiling.toTileId=function(xv,yv,d){ var xb2=lib.toBase2(xv,d);var yb2=lib.toBase2(yv,d);var id="r";for(var i=0;i<d;i++){var xd=xb2[i];var yd=yb2[i];if(xd){if(yd){var cpe="3";}else{cpe="1";}}else{if(yd){cpe="2";}else{cpe="0";}}
id+=cpe;}
return id;}
lib.Tiling.prototype.withinTile=function(p,d){var ar=this.aspectRatio;var tts=this.topTileSize;var x=p.x;var y=p.y;var tileDim=tts/Math.pow(2,d);var xindex=Math.floor(x/tileDim);var yindex=Math.floor(y/(tileDim));return lib.Tiling.toTileId(xindex,yindex,d);}
lib.debug=false;lib.Tiling.prototype.coveringTiles=function(r,d){ if(lib.debug)debugger;var ar=this.aspectRatio;var tts=this.topTileSize;var p=r.corner;var xt=r.extent;var q=p.plus(xt);var px=p.x;var py=p.y;var qx=q.x;var qy=q.y;var tileDim=tts/Math.pow(2,d);var pxindex=Math.max(Math.floor(px/tileDim),0);var pyindex=Math.max(Math.floor(py/(tileDim)),0);var qxindex=Math.max(Math.floor(qx/tileDim),0);var qyindex=Math.max(Math.floor(qy/(tileDim)),0);var rs=[];for(var i=pxindex;i<=qxindex;i++){for(var j=pyindex;j<=qyindex;j++){rs.push(lib.Tiling.toTileId(i,j,d));}}
util.log("coveringTiles",rs);return rs;}
lib.Viewport.prototype.clear=function(){var ctx=this.context;var useFlash=ctx.isFlashCanvas;if(useFlash){return;ctx.hideImages();}
var xt=this.rect.extent.times(this.scale);ctx.clearRect(0,0,xt.x,xt.y);var octx=this.ovContext;if(octx){octx.clearRect(0,0,xt.x,xt.y);}
this.clearBeenDrawn();}
lib.Viewport.prototype.clearOverlay=function(sel){ if(!sel)sel=0;if(sel==1){var abcd=22;}
var ctx=this.context;var xt=this.rect.extent.times(this.scale);var octx=this.ovContext;if(octx){var useFlash=octx.isFlashCanvas;if(useFlash){var el=octx.element;if(el&&el.removeShapes){el.removeShapes(sel);}}else{var ctx=this.ovContexts[sel];ctx.clearRect(0,0,xt.x,xt.y);}}}
lib.Viewport.prototype.fillOverlay=function(sel){ var ctx=this.ovContexts[sel];ctx.fillStyle="red";var xt=this.rect.extent.times(this.scale/2.0);ctx.fillRect(0,0,xt.x,xt.y);}
lib.Viewport.prototype.refreshOverlays=function(){this.clearOverlay(0);this.clearOverlay(1);this.clearOverlay(2);this.drawOverlays(0);this.drawOverlays(1);}
lib.Viewport.prototype.drawTileImage=function(tile,trycount,behind){log("TILEE",tile.id);var ctx=this.context;var useFlash=ctx.isFlashCanvas;if(useFlash){ var vc=tile.corner;var im=this.tiling.image;var imxxt=im.extent.x;var imyxt=im.extent.y;vc=new geom.Point(vc.x-imxxt/2,vc.y-imyxt/2);var ve=tile.coverage;}else{vc=tile.whereToDraw.corner.times(this.scale);ve=tile.whereToDraw.extent.times(this.scale);}
var im=tile.image;var ee;var trycountv=trycount?trycount:1;pln=tile.path.length;var thisHere=this;if(useFlash){if(tile.beenDrawn)return;var tiling=this.tiling;var imsrc=tiling.url+(tile.id)+".jpg?album="+page.albumString
log("TILE",tile.id);var imdrawn=ctx.drawImage(imsrc,vc.x,vc.y,ve.x,ve.y);if(imdrawn){this.assertTileDrawn(tile);}else{tile.loadingImage=false;}
return;}
try{if(behind)ctx.globalCompositeOperation="destination-over";ctx.drawImage(im,vc.x,vc.y,ve.x,ve.y);if(behind)ctx.globalCompositeOperation="source-over";this.assertTileDrawn(tile);var pln=tile.path.length;if(this.showTileBoundaries){if((pln%2)==0)ctx.strokeStyle="red";else ctx.strokeStyle="green";ctx.strokeRect(vc.x,vc.y,ve.x,ve.y);}}catch(e){ee=e;util.slog("drawfail",tile.path);if(trycountv<1){setTimeout(function(){thisHere.drawTileImage(tile,trycountv+1,behind);},200);}}}
lib.Viewport.prototype.canvasToImageCoords=function(p){}
lib.Viewport.prototype.divToRect=function(ir,coordSystem,div){if(coordSystem=="image"){var r=this.rectImageToCanvas(ir);}else if(coordSystem=="viewport"){r=this.viewportToCanvas(ir);}else{r=ir;}
var c=r.corner.plus(new geom.Point(-1,-1));var ex=r.extent.plus(new geom.Point(-1,-2));var ex=r.extent;div.css({left:c.x,top:c.y,width:ex.x,height:ex.y});} 
lib.Viewport.prototype.imToCim=function(inr){var imdim=geom.internalizePoint(page.imD.dimensions).times(0.5);var r=inr.plus(imdim.minus());return r;}
lib.Viewport.prototype.setStrokeWidth=function(wd){var ctx=this.ovContext;var useFlash=ctx.isFlashCanvas;if(!useFlash)util.error("non flash not supported in setStrokeWidth")
ctx.setStrokeWidth(wd);}
lib.Viewport.prototype.drawImRect=function(inr,color,sel,fill,wd){if(!sel)sel=0;if(idv.useFlash){var r=this.imToCim(inr);}else{r=inr;}
var ctx=this.ovContext;var useFlash=ctx.isFlashCanvas;if(useFlash){
ctx.setStrokeColor(color);if(wd){ctx.setStrokeWidth(wd);}}else{ctx=this.ovContexts[sel];ctx.save();ctx.strokeStyle=color;if(sel==1){ctx.lineWidth=4;}else if(sel==2){ctx.lineWidth=3;}else{ctx.lineWidth=2;}
}
if(sel==1){ var rtd=r.expand(2);}else if(sel==2){rtd=r.expand(4);}else{rtd=r;}
var rtd=r;corner=rtd.corner;extent=rtd.extent;if(fill){ctx.fillStyle=color;ctx.fillRect(corner.x,corner.y,extent.x,extent.y,sel);}else{if(useFlash){ctx.strokeRect(corner.x,corner.y,extent.x,extent.y,sel);}else{ctx.strokeRect(corner.x,corner.y,extent.x,extent.y);}}
if(!useFlash)ctx.restore();} 
lib.handleSize=0.2;lib.handleNames=["upperLeft","middleLeft","lowerLeft","upperMiddle","lowerMiddle","upperRight","middleRight","lowerRight"];lib.handleCursors=["nw-resize","w-resize","sw-resize","n-resize","s-resize","sw-resize","w-resize","se-resize"];lib.Viewport.prototype.drawEdImRect=function(r,color,sel){var c=r.upperLeft();var w=r.width();var h=r.height();var d=Math.min(w,h);if(idv.useFlash){var hd=Math.min(this.tenthDim*lib.handleSize,w/4,h/4);}else{hd=Math.min(50*lib.handleSize,w/4,h/4);}
this.drawImRect(r,color,sel);this.handles={};var ln=lib.handleNames.length;for(var i=0;i<ln;i++){var hn=lib.handleNames[i];var gop=r[hn];var p=gop.apply(r);var chandle=geom.squareWithCenter(p,hd);if(idv.useFlash){var handle=chandle;this.drawImRect(handle,color,sel,true);this.drawImRect(handle,color,sel,false);}else{var handle=this.rectCanvasToImage(chandle);this.drawRect(handle,"image",color,sel,true);this.drawRect(handle,"image",color,sel,false);}
this.handles[hn]=handle;}}
lib.Viewport.prototype.deactivateAreaEditor=function(){this.handles=undefined;this.areaEditorActive=false;this.clearOverlays("both");this.clearOverlays("both");}
lib.Viewport.prototype.inHandle=function(p){if(!this.areaEditorActive)return false;if(!this.handles)return false;var cursor="pointer";var ln=lib.handleNames.length; var cntr=this.container;for(var i=0;i<ln;i++){var hn=lib.handleNames[i];var handle=this.handles[hn];if(handle.contains(p)){var cr=lib.handleCursors[i];cntr.css({"cursor":cr});return hn;}}
if(this.selectedArea.contains(p)){var rs="middle"
cntr.css({"cursor":"move"});return rs;}
cntr.css({"cursor":"pointer"});}
lib.Viewport.prototype.toImRect=function(inr,coordSystem){var ctx=this.ovContext;var useFlash=ctx.isFlashCanvas;if(useFlash){ if(coordSystem=="viewport"){var ir=this.rectViewportToImage(inr);}else if(coordSystem=="image"){ir=inr;}else{util.error("no such option");}
return ir;}else{if(coordSystem=="image"){var r=this.rectImageToCanvas(inr,idv.useFlashForOverlay);}else if(coordSystem=="viewport"){r=this.viewportToCanvas(inr);}else{r=inr;}}
return r;}
lib.Viewport.prototype.drawRect=function(inr,coordSystem,color,sel,fill){var r=this.toImRect(inr,coordSystem);this.drawImRect(r,color,sel,fill);return;}
lib.Viewport.prototype.drawEdRect=function(inr,coordSystem,color,sel){var r=this.toImRect(inr,coordSystem);this.drawEdImRect(r,color,sel);return;}
lib.Viewport.prototype.drawOverlays=function(sel){if(sel=="both"){this.drawOverlays(0);this.drawOverlays(1);return;}
this.clearOverlay(sel);var os=this.theOverlays[sel];var cnt=0;for(var i in os){cnt++;var o=os[i];var g=o.geometry;var color=o.color;if(color==undefined){color=idv.selectedColor;} 
if(sel){color="yellow";}else{color="red"}
this.drawRect(g,"image",color,sel);}
} 
lib.Viewport.prototype.drawTile=function(tile,behind){log("drawwTile",tile.id);var ctx=this.context;var useFlash=ctx.isFlashCanvas;var tileDepth=tile.path.length;if(tile.outsideImage){log("draw","did not draw because outside ",tile.id);return;}
if(tile.beenDrawn){log("beenDrawn");return;}
util.log("beenDrawnn","drawing",tile.path.join(""));log("drawTile",tile.id);var coverage=this.coverage();
var tiling=this.tiling;var ar=tiling.aspectRatio;var timsz=tiling.tileImageSize;var zoom=this.zoom;var scaling=(this.noZoomScaling)*zoom;var tileCorner=tile.corner;var coverageCorner=coverage.corner;var vcorner=tileCorner.minus(coverageCorner).times(scaling); var cv=tile.coverage;var vwidth=(cv.x)*scaling+1; var vheight=(cv.y)*scaling+1;var vextent=new geom.Point(vwidth,vheight);tile.whereToDraw=new geom.Rect(vcorner,vextent);var im=tile.image;var thisHere=this;if(im){this.drawTileImage(tile,null,behind);}else{ var ptile=tile.parent();while(ptile){var pim=ptile.image;if(pim&&ptile.imageLoaded){util.log("parent",tile.path,ptile.path)
this.drawTile(ptile,true);break;}else{ptile=ptile.parent();}}
if(tile.loadingImage)return; tile.loadingImage=1;if(useFlash){this.assertTileLoading(tile);this.drawTileImage(tile,null,behind);return;}
var im=document.createElement('img');var imsrc=tiling.url+(tile.id)+".jpg"; util.log("imsrc",imsrc);var imjq=$(im);imjq.css({left:0,top:0,"z-index":100*tileDepth,position:"absolute"});thisHere.beingLoaded.push(tile.path.join("")); imjq.load(function(){tile.image=im;tile.loadingImage=false;tile.imageLoaded=true;idv.imageLoadCount=idv.imageLoadCount+1;util.log("loaded",tile.path.join(""));if(thisHere.depth+lib.theDepthOffset==tile.path.length){ thisHere.drawTile(tile);} 
var bld=thisHere.beingLoaded;var bln=bld.length;var nbld=[];var mid=tile.path.join("");for(var i=0;i<bln;i++){var cid=bld[i];if(cid!=mid){nbld.push(cid);}}
thisHere.beingLoaded=nbld;});imjq.attr("src",imsrc);$(".imageHolder").append(imjq);}}
lib.Viewport.prototype.coveringTiles=function(d){var coverage=this.coverage();if(!coverage)return[];var tiling=this.tiling;return tiling.coveringTiles(coverage,d);}
lib.setScale=1;lib.Viewport.prototype.setFlashScale=function(s){var e=this.canvas.element;if(e&&e.setScale){if(lib.setScale)e.setScale(s);}}
lib.Viewport.prototype.removeFlashImages=function(){var e=this.canvas.element;if(e&&e.removeImages){e.removeImages();}}
lib.Viewport.prototype.setFlashPan=function(x,y){var e=this.canvas.element;if(e&&e.setPan){if(lib.setScale)e.setPan(x,y);}}
lib.Viewport.prototype.drawTiles=function(d){var useFlash=this.canvas&&this.canvas.isFlashCanvas;if(useFlash){var cs=this.scale;var im=this.tiling.image;var imxxt=im.extent.x;var imyxt=im.extent.y;var imAR=imyxt/imxxt;var vpxxt=this.rect.extent.x;var vpyxt=this.rect.extent.y;var zm=this.zoom; var stagexxt=this.stageWd;var stageyxt=this.stageHt;if(!stagexxt){stagexxt=this.canvas.stageWidth();stageyxt=this.canvas.stageHeight();if(!stagexxt){this.ready=false;return;}
this.stageWd=stagexxt;this.stageHt=stageyxt;this.ready=true;}
var stageAR=stageyxt/stagexxt;var cntAR=this.extent.y/this.extent.x;if(stageAR<=cntAR){ this.fitScale=1.0; if(cntAR<imAR){im2flash=stagexxt/imxxt*cntAR/imAR;lib.vp2flash=(cntAR/imAR)*stagexxt/1000;var fimxxt=imxxt*imAR/cntAR;}else{var im2flash=stagexxt/imxxt;lib.vp2flash=stagexxt/1000;this.xconstrained=true;this.fitScale=1.0;var fimxxt=imxxt;}}else{var im2flash=stageyxt/imyxt;lib.vp2flash=stageyxt/1000;this.xconstrained=false;var fimxxt=imyxt/cntAR; this.fitScale=Math.max(1.0,imxxt/fimxxt);this.fitScale=Math.min(1.0,fimxxt/imxxt);}
var fsc=zm*im2flash*this.fitScale;this.setFlashScale(fsc); var pxbias=fimxxt/2*im2flash;var pybias=pxbias*this.aspectRatio;var pscale=zm*imxxt*im2flash*this.fitScale;var px=pxbias-this.pan.x*pscale;var py=pybias-this.pan.y*pscale;this.setFlashPan(px,py);}
this.clear();var tileids=this.coveringTiles(d);var byId=this.tiling.tilesById;var ln=tileids.length;for(var i=0;i<ln;i++){var tlid=tileids[i];var tl=byId[tlid];if(tl){this.drawTile(tl);}}}})();
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
(function(){var lib=idv.image; var geom=idv.geom;var util=idv.util;lib.Viewport.prototype.setPan=function(ip,skipCallbacks){ util.log("setPan","pan",ip.x,ip.y,"maxypan",this.cmaxYpan,"zoom",this.zoom,"depth",this.depth);var lp=this.limitPan(ip);if(lp!=null){this.limitedPan=lp;p=lp;}
var cv=this.coverage();var cvxt=cv.extent;var cvc=cv.corner;var imxt=this.imExtent;var bottomCv=cvc.y+cvxt.y; this.pan=p;this.cachedCoverage=null;this.drawTiles(this.depth+lib.theDepthOffset);if((!lib.noCanvas)||(!idv.useFlash)){this.clearOverlay(2); this.cHili=undefined;this.drawOverlays("both");if(this.areaEditorActive){this.drawTheAreaEditor();}}
var pcbs=this.panCallbacks;if(!skipCallbacks){util.runCallbacks(this.panCallbacks,p);util.runCallbacks(this.changeViewCallbacks);}}
lib.Viewport.prototype.setZoom=function(z,dontDraw,dontCallTheCallback){ util.log("setZoom",z);if(this.renderedZoom!=z){this.needsRefresh=true;}else{var abc=22;}
if(!this.needsRefresh)return;this.zoomCount=this.zoomCount+1;this.zoom=z;this.cmaxYpan=this.maxYpan();this.cmaxXpan=this.maxXpan();this.cmaxXpanWindow=this.maxXpan(window);util.log("setZoom","panLimit",this.cmaxXpan,this.cmaxYpan);var lp=this.limitPan(this.pan);if(lp){this.pan=lp;} 
var nd=Math.floor(Math.log(lib.resBias*z*(this.scale))/Math.LN2+lib.theDepthBump);nd=Math.min(this.maxDepth-lib.theDepthOffset,nd);if(nd!=this.depth){util.log("depth",nd,this.maxDepth);this.actualDepth=nd;if(nd<this.depth||!page.zooming){ this.depth=nd;this.cancelLoads(nd);}}
this.cachedCoverage=null;if(!dontDraw){this.drawTiles(this.depth+lib.theDepthOffset);if(!lib.noCanvas)this.drawOverlays("both");this.needsRefresh=false;this.renderedZoom=z;}
this.setDisplayParamsForZoom();if(!page.zooming||page.vp.fromZooming||(!idv.useFlash)){this.drawOverlays("both");}
if(this.areaEditorActive)this.drawTheAreaEditor(); if(dontCallTheCallback)return; util.runCallbacks(this.zoomCallbacks,z,dontDraw);util.runCallbacks(this.changeViewCallbacks,dontDraw);}
lib.Viewport.prototype.limitPan=function(p){if(!p)return null;if(typeof this.zoom=="undefined")return null;var py=p.y;py=Math.min(py,this.cmaxYpan);py=Math.max(py,-this.cmaxYpan);var px=p.x;px=Math.min(px,this.cmaxXpan);px=Math.max(px,-this.cmaxXpan);util.log("limitPan",p.x,px,p.y,py);return new geom.Point(px,py);}
lib.Viewport.prototype.setPanZoom=function(p,z){ this.setZoom(z,true);this.setPan(p);}
lib.Viewport.prototype.setCoverage=function(cov){var pz=this.coverageToPanZoom(cov);this.setPanZoom(pz.pan,pz.zoom);}
lib.DualControl=function(vp0,vp1){this.vp0=vp0; this.vp1=vp1;var thisHere=this;function vp1SetPan(p){vp1.setPan(thisHere.pan0topan1(p),true);}
this.vp0.panCallbacks.push(vp1SetPan);function vp0SetPan(p){var p0p=thisHere.pan1topan0(p);vp0.setPan(p0p,true);}
this.vp1.panCallbacks.push(vp0SetPan);function vp1SetZoom(z,dontDraw){util.log("dual"," control1 zoom to "+z);vp1.setZoom(z,dontDraw,true);}
this.vp0.zoomCallbacks.push(vp1SetZoom);}
lib.DualControl.prototype.pan0topan1=function(p){var po=p.plus(this.panOffset);util.log("adjustment","offsetonly",po.x);var px=po.x;var py=po.y;var pxg=this.panxGrid; var adx=pxg.valueAt(px); util.log("adjustment",px,adx);var spx=(px+adx)/(this.spanFactor); var rs=new geom.Point(spx,py);util.log("pastPan",p.x,rs.x);return rs;}
lib.DualControl.prototype.pan1topan0=function(p){var po=p.minus(this.panOffset);util.log("adjustment","offsetonly",po.x);var px=po.x;var py=po.y;var pxg=this.panxGrid; var adx=pxg.valueAt(px); util.log("adjustment",px,adx);var spx=(px-adx)*(this.spanFactor); var rs=new geom.Point(spx,py);util.log("presentPan",p.x,rs.x);return rs;}
lib.flashCanvasCount=0;lib.waitForInitThenRefresh=function(fc){var e=fc.element;util.log("waiting")
if(e.setScale&&e.drawImage&&fc.viewport&&page.vp){page.placeDivs();fc.viewport.refresh(true);fc.viewport.drawOverlays("both");}else{setTimeout(function(){lib.waitForInitThenRefresh(fc);},100);}}
lib.flashCanvas=function(options){var extent=options.extent;var cn=options.container;lib.flashCanvasCount=lib.flashCanvasCount+1;var fid="flashDiv"+lib.flashCanvasCount;var fdiv=$('<div id="'+fid+'" style="width:100%;height:100%">');cn.append(fdiv);this.myId=fid;var xe=300;if(extent&&extent.x)xe=extent.x;var ye=300;if(extent&&extent.y)ye=extent.y;var aext=new geom.Point(xe,ye);this.extent=aext;this.container=cn;this.isFlashCanvas=true;var thisHere=this;var fn=function(){var th=thisHere;var flashEl=document.getElementById(fid);thisHere.element=flashEl;thisHere.jel=$(thisHere.element);idv.jel=thisHere.jel; thisHere.jel.attr("width",thisHere.extent.x);thisHere.jel.attr("height",thisHere.extent.y);lib.waitForInitThenRefresh(thisHere);}
var params={scale:'showall',quality:'best',align:'left',salign:'tl',allowScriptAccess:'always',wmode:'transparent',bgcolor:"#000000",menu:'false'};var flashvars={whichCanvas:fid}
var fv=swfobject.getFlashPlayerVersion();var noFlash=fv.major==0;var flashEl=document.getElementById(fid);var flashJel=$(flashEl);if(noFlash){flashJel.html('<p>This web page requires Adobe Flash.</p><p> <img id="getFlash" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"/></p>');$('#getFlash').click(function(){location.href="http://www.adobe.com/go/getflashplayer";});}else{swfobject.embedSWF("/hx/canvas.swf",fid,"100%","100%","10","/js/expressInstall.swf",flashvars,params,null,fn);}
this.context=this;}
lib.flashCanvas.prototype.attr=function(atr,val){if(typeof atr=="object"){var wd=atr.width;if(typeof wd=="number"){this.attr("width",wd);}
var ht=atr.height;if(typeof ht=="number"){this.attr("height",ht);}
return;}
if(atr=="width"){this.extent.x=val;if(this.jel){this.jel.attr("width",val);this.jel.attr("left",0);this.jel.attr("top",0);}
}
if(atr=="height"){this.extent.y=val;if(this.jel){this.jel.attr("height",val);}
return;}}
lib.flashCanvas.prototype.drawImage=function(url,x,y,xxt,yxt){var el=this.element;if(el&&el.drawImage){el.drawImage(url,x,y,xxt,yxt);return true;}
drawImageFailed=true;return false;}
lib.flashCanvas.prototype.beginPath=function(){var el=this.element;if(el){el.beginPath();}}
lib.flashCanvas.prototype.arc=function(cx,cy,radius,i0,i1,i2){var el=this.element;if(el){el.arc(cx,cy,radius,i0,i1,i2);}}
lib.flashCanvas.prototype.stroke=function(){}
lib.flashCanvas.prototype.moveTo=function(x,y){var el=this.element;if(el){el.moveTo(x,y);}}
lib.flashCanvas.prototype.lineTo=function(x,y){var el=this.element;if(el){el.lineTo(x,y);}}
lib.flashCanvas.prototype.hideImages=function(){var el=this.element;if(el){el.hideImages();}}
lib.flashCanvas.prototype.mousedown=function(f){var cn=this.container;cn.mousedown(f);}
lib.flashCanvas.prototype.mouseup=function(f){var cn=this.container;cn.mouseup(f);}
lib.flashCanvas.prototype.mouseleave=function(f){var cn=this.container;cn.mouseleave(f);}
lib.colorsByName={"yellow":0xffff00,"white":0xffffff,"red":0xff0000,"green":0x00ff00,"black":0x000000}
lib.toIntColor=function(c){ var rs=lib.colorsByName[c];if(rs!=undefined){return rs;}
return 0xff0000;}
lib.selectStrokeWidth=2;lib.flashCanvas.prototype.setStrokeColor=function(c){var el=this.element;if(el&&el.setStrokeColor){if(c=="yellow"){ el.setStrokeWidth(lib.selectStrokeWidth);}else{el.setStrokeWidth(lib.selectStrokeWidth);}
el.setStrokeColor(lib.toIntColor(c));}}
lib.flashCanvas.prototype.setStrokeWidth=function(wd){var el=this.element;if(el){el.setStrokeWidth(wd);}}
lib.flashCanvas.prototype.stageWidth=function(){var el=this.element;if(el&&el.stageWidth){return el.stageWidth();}}
lib.flashCanvas.prototype.stageHeight=function(){var el=this.element;if(el&&el.stageHeight){return el.stageHeight();}}
lib.flashCanvas.prototype.setStageSize=function(wd,ht){var el=this.element;if(el){el.setStageSize(wd,ht);}}
lib.flashCanvas.prototype.mcWidth=function(){var el=this.element;if(el){return el.mcWidth();}}
lib.flashCanvas.prototype.mcHeight=function(){var el=this.element;if(el){return el.mcHeight();}}
lib.flashCanvas.prototype.scaleMode=function(){var el=this.element;if(el){return el.scaleMode();}}
lib.flashCanvas.prototype.strokeRect=function(lx,ly,xxt,yxt,sel){if(!sel)sel=0;var el=this.element;if(el&&el.strokeRect){el.strokeRect(lx,ly,xxt,yxt,sel);}}
lib.flashCanvas.prototype.fillRect=function(lx,ly,xxt,yxt,sel){if(!sel)sel=0;var el=this.element;if(el&&el.fillRect){el.fillRect(lx,ly,xxt,yxt,sel);}}
lib.flashCanvas.prototype.clearRect=function(xl,yl,w,h){}
lib.flashCanvas.prototype.getContext=function(wc){return this;}
lib.genCanvas=function(options){if(idv.useFlash){var wc=options.whichCanvas;if(lib.noCanvas&&(wc=="ov")){idv.useFlashForOverlay=true;return null;} 
if(wc=="vp"){var fc=new lib.flashCanvas(options);return fc;}}
var container=options.container;var extent=options.extent;var zIndex=options.zIndex;var bcolor=options.backgroundColor;if(!bcolor)bcolor="#000000"
var icanvasE=document.createElement('canvas');icanvasE.setAttribute("width",extent.x);icanvasE.setAttribute("height",extent.y);icanvas=$(icanvasE);icanvas.css("position","absolute");theCanvas=icanvas;icanvas.css("opacity",1); var corner=options.corner;icanvas.css("background-color",bcolor);icanvas.css("z-index",zIndex);container.append(icanvas);if(corner){icanvas.css({top:corner.y,left:corner.x});}else{icanvas.css({top:0,left:0});}
return icanvas;}})();function imageLoaded(x){var slidx=x.lastIndexOf("/");var didx=x.lastIndexOf(".");var tid=x.substring(slidx+1,didx);idv.util.log("imageLoaded","image loaded "+tid);var byid=page.vp.tiling.tilesById;var tl=byid[tid];tl.loadingImage=false;tl.beenLoaded=true;im="flashImage";tl.image=im;idv.imageLoadCount=idv.imageLoadCount+1;}
idv.noFlashCallbacks=true;function pc_mousedown(wc,x,y){if(idv.noFlashCallbacks)return;if(wc=="flashDiv1"){var pc=page.vp.panControl;}else{var pc=page.vp1.panControl;}
var e={stageX:x,stageY:y};pc.mouseDown(pc,e);return wc;return"testResult";}
function pc_mousemove(wc,x,y){if(idv.noFlashCallbacks)return;if(wc=="flashDiv1"){var pc=page.vp.panControl;}else{var pc=page.vp1.panControl;}
var e={stageX:x,stageY:y};pc.mouseMoveHandler(pc,e);}
function pc_mouseup(wc,x,y){if(idv.noFlashCallbacks)return;if(wc=="flashDiv1"){var pc=page.vp.panControl;}else{var pc=page.vp1.panControl;}
var e={stageX:x,stageY:y};pc.mouseUp(pc,e);}
function fp(x,y){if(!y)y=0;var e=page.vp.canvas.element;e.setPan(x,y);}
var drawImageFailed=false;
idv.common={};idv.css.lightbox={border:"white solid",position:"absolute","z-index":2000,"background-color":"#444444","color":"white"};idv.css.lightbox={border:"white solid",position:"absolute","z-index":2000,"background-color":"#999999","color":"black"};idv.SnapD=function(){};idv.Snap=function(){};(function(){var lib=idv.common;var util=idv.util;lib.genLogo=function(){var rs=$('<span class="logoSpan"/>');var left=$('<span class="logoLeft">image</div>');var right=$('<span class="logoRight">Diver</div>');rs.append(left);rs.append(right);rs.click(function(){location.href="/";});return rs;}
lib.genTitle=function(title){var rs=$('<div class="titleLine"/>');rs.append(lib.genLogo());var ts=$('<span class="titleSpan2"/>');ts.html(title);rs.append(ts);return rs;}
lib.genTable=function(nm,rows){var st='<table>';var ln=rows.length;for(var i=0;i<ln;i++){st+='<tr id="'+nm+'_row_'+i+'">';var cr=rows[i];var rln=cr.length;for(var j=0;j<rln;j++){var cc=cr[j];st+='<td>'+cc+'</td>';}
st+='</tr>';}
st+='</table>';return st;}
lib.loadImages=function(ims){var ln=ims.length;for(var i=0;i<ln;i++){var ci=ims[i];var imel=$('<img>');imel.attr("src",ci);}}
lib.Lightbox=function(container,rect){this.container=container;lib.setLightboxRect(this,rect);}
lib.setLightboxRect=function(lb,rect){var xt=rect.extent;var cr=rect.corner;lb.left=cr.x;lb.top=cr.y;lb.width=xt.x;lb.height=xt.y;}
lib.Lightbox.prototype.setElementProperties=function(){var element=this.element;element.css({width:(this.width+"px"),height:(this.height+"px"),top:(this.top+"px"),left:(this.left+"px")});}
lib.Lightbox.prototype.dismiss=function(){var el=this.element;el.empty();var fr=this.iframe;if(fr)fr.attr("width","1px"); var w=$(window);var bht=w.height();var stop=w.scrollTop();this.element.css({left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});this.shade.hide();this.close.hide();this.loading.hide();}
lib.Lightbox.prototype.tempDismiss=function(){var w=$(window);var bht=w.height();var stop=w.scrollTop();var ht=this.element.height();this.dims.height=ht+"px";this.element.css({left:"0px",top:(stop+bht+40)+"px",height:"1px",width:"1px"});this.shade.hide();this.close.hide();this.loading.hide();}
lib.Lightbox.prototype.bringBack=function(){this.element.css(this.dims);this.shade.show();this.close.show();}
lib.Lightbox.prototype.pop=function(dontShow,iht){this.setElementProperties();var wd=$(document).width();var ht=$(document).height();var w=$(window);var stop=w.scrollTop();var bht=w.height();var bwd=w.width();var lwd=this.width;var lft=Math.max((bwd-lwd)/2,50);if(iht){var eht=iht;}else{eht=Math.max(bht-(this.top)-50,50);}
this.dims={width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px")}
this.element.css(this.dims);this.loading.css({top:stop+10});if(dontShow)this.loading.hide();this.close.show();this.shade.css({width:(wd+"px"),height:(ht+"px"),top:"0px",left:"0px"});if(this.iframe){this.iframe.attr("width",this.width-25);}
if(!dontShow){this.element.show();this.shade.show();}else{this.dismiss();}}
lib.Lightbox.prototype.setHtml=function(html){var e=this.element;e.empty();this.addClose(e);var cn=$('<div class="lightboxContent"/>');e.append(cn);cn.html(html);}
lib.Lightbox.prototype.setWikitext=function(wtxt){var e=this.element;e.empty();this.addClose(e);var cn=$('<div class="lightboxContent"/>');e.html(util.processMarkdown(wtxt));}
lib.Lightbox.prototype.loadUrl=function(url){var e=this.element;this.loading.show();e.empty();this.addClose(e);var wd=this.width-25;var ifrs='<iframe class="lightboxiframe" src="'+url+'" frameborder="0" width="'+wd+'" height="100%"/>';var ifr=$(ifrs);var thisHere=this;this.iframe=ifr;ifr.load(function(){thisHere.loading.hide();});e.append(ifr);this.contentWindow=ifr[0].contentWindow;}
lib.Lightbox.prototype.afterClose=function(){if(this.afterCloseCallback){this.afterCloseCallback();}}
lib.closeX='<div class="closeX" style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>';lib.smallCloseX='<div class="closeX" style="position:relative;top:-10px;left:7px;padding:2px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:10pt;color:white;float:right">X</div>';lib.Lightbox.prototype.addClose=function(whenClosed){var thisHere=this;this.close=$(lib.closeX);this.close.click(function(){thisHere.dismiss();thisHere.afterClose();if(whenClosed)whenClosed();});this.element.append(this.close);}
lib.Lightbox.prototype.render=function(dontDismiss){var thisHere=this;var loading=$('<div class="loading">Loading...</div>');this.loading=loading;this.container.append(loading);loading.hide();var element=$('<div class="lightbox"/>');element.css(idv.css.lightbox);var wd=this.container.width();if(this.window){var ht=this.window.height();}else{var ht=$('window').height();}
var shades='<div style="position:absolute;top:0px;left:0px;width:'+wd+'px;height:'+ht+'px;z-index:1500;opacity:0.8;background-color:black;"/>';var shade=$(shades);this.element=element;this.shade=shade;this.setElementProperties();this.container.append(element);this.container.append(shade);this.addClose();if(!dontDismiss)this.dismiss();}
lib.Lightbox.prototype.popMessage=function(msg,centerIt){this.pop();this.element.empty();this.addClose();if(typeof(msg)=='string'){var msgdiv=$('<div/>');msgdiv.css({"margin":"20px"});if(centerIt)msgdiv.css({'text-align':'center'});msgdiv.html(msg);}else{msgdiv=msg;}
this.element.append(msgdiv);}
lib.setRect=function(el,rect,canvas,ocanvas,noHeight){var c=rect.corner;var ex=rect.extent;var css={left:(c.x)+"px",top:(c.y)+"px",width:(ex.x)+"px"};if(!noHeight)css.height=(ex.y)+"px";el.css(css);if(canvas){canvas.attr("width",rect.extent.x);canvas.attr("height",rect.extent.y);}
if(ocanvas){ocanvas.attr("width",rect.extent.x);ocanvas.attr("height",rect.extent.y);}}})();
(function(){var lib=idv;var geom=idv.geom;var imlib=idv.image;var util=idv.util;function log(){if(0){var a=util.argsToString(arguments);util.slog1(a);}} 
lib.zoomSlider=function(options){container=options.container;this.container=container;this.getZoom=options.getZoom;this.zoomFactor=options.zoomFactor;this.zoomIncrement=options.zoomIncrement;this.zoomDelay=options.zoomDelay;this.mouseIsDown=false;var thisHere=this;var marginX=5;var marginY=2;var ht=26;var midy=ht/2;var barWidth=60; this.barWidth=barWidth;var barLeft=marginX+ht;var smallSep=3;var totalWidth=ht*2+marginX+barWidth+smallSep;this.totalWidth=totalWidth;var zoomerContainer=$('<div id="zoomercontainer"/>');zoomerContainer.css({"left":0,"top":marginY,"width":totalWidth,"height":ht,position:"relative","background-color":util.bkColor});container.append(zoomerContainer);var circleExtent=new geom.Point(ht,ht);var corner=new geom.Point(marginX,0);var minusCanvas=$('<img/>');minusCanvas.css({"left":0,"top":0,"width":25,"height":25,"position":"absolute","background-color":util.bkColor});zoomerContainer.append(minusCanvas);minusCanvas.attr("src","/minus.png");var plusCanvas=$('<img/>');plusCanvas.css({"left":marginX+ht+barWidth+smallSep,"top":0,"width":24,"height":24,"position":"absolute","background-color":util.bkColor});zoomerContainer.append(plusCanvas);plusCanvas.attr("src","/plus.png");var linewidth=1.5;var radius=10;var leftPadding=0;var xDim=10;var centerx=radius+linewidth+leftPadding
var extent=new geom.Point(barWidth,ht);var barLeft=marginX+ht;corner=new geom.Point(barLeft,0);var barCanvas=$('<div class="zoomBar"/>');zoomerContainer.append(barCanvas);var barTop=corner.y+midy-1;var barBottom=barTop;barCanvas.css({"background-color":"white",position:"absolute","top":barTop,"left":corner.x,"width":barWidth,"bottom":barBottom});zoomerContainer.append(barCanvas);var marker=$('<div class="zoomMarker"/>');this.marker=marker;var markerWidth=3;var markerHeight=ht-6;var markerTop=3;this.markerTop=markerTop;marker.css({"background-color":"white",position:"absolute","top":markerTop,"left":barLeft,"width":markerWidth,"height":markerHeight});zoomerContainer.append(marker);var corner=new geom.Point(marginX+ht+barWidth+smallSep,0);marker.mouseenter(function(){util.log("slider","enter marker");mouseInMarker=true;});marker.mouseleave(function(){util.log("slider","leave marker");mouseInMarker=false;});var markerMaxX=barLeft+barWidth;this.markerMaxX=markerMaxX;this.markerMinX=barLeft;this.markerTop=markerTop;var maxZoom=options.maxZoom;this.maxZoom=maxZoom;var setZoom=options.setZoom;this.setZoom=setZoom;function sliderAction(p){var x=p.x+barLeft;if(x>markerMaxX)return;if(x<barLeft)return;var nx=(x-barLeft)/barWidth;marker.css({top:markerTop,left:x});var logMaxZoom=Math.log(maxZoom);var ex=nx*logMaxZoom;var newZoom=Math.pow(Math.E,ex);setZoom(newZoom);}
zoomerContainer.mousedown(function(e){e.preventDefault();var rc=imlib.relCanvas(barCanvas,e);thisHere.mouseIsDown=true;sliderAction(rc);});zoomerContainer.mousemove(function(e){e.preventDefault();if(thisHere.mouseIsDown){var rc=imlib.relCanvas(barCanvas,e);sliderAction(rc);}});zoomerContainer.mouseup(function(e){thisHere.mouseIsDown=false;});zoomerContainer.mouseleave(function(e){thisHere.mouseIsDown=false;});var thisHere=this;plusCanvas.mousedown(function(e){thisHere.startZoomingIn();});plusCanvas.mouseup(function(e){thisHere.stopZooming();});plusCanvas.mouseleave(function(e){thisHere.stopZooming();});minusCanvas.mousedown(function(e){thisHere.startZoomingOut();});minusCanvas.mouseup(function(e){thisHere.stopZooming();});minusCanvas.mouseleave(function(e){thisHere.stopZooming();});this.zoomin=plusCanvas;this.zoomout=minusCanvas;this.bar=barCanvas;} 
lib.zoomSlider.prototype.fromNormalizedZoom=function(nx){var logMaxZoom=Math.log(this.maxZoom);var ex=nx*logMaxZoom;return Math.pow(Math.E,ex);}
lib.zoomSlider.prototype.toNormalizedZoom=function(zoom){var logMaxZoom=Math.log(this.maxZoom);var logZoom=Math.log(zoom);return logZoom/logMaxZoom;}
lib.zoomSlider.prototype.positionSlider=function(v){var x=this.markerMinX+v*this.barWidth;this.marker.css({top:this.markerTop,left:x});}
lib.zoomSlider.prototype.positionSliderFromZoom=function(z){this.positionSlider(this.toNormalizedZoom(z));}
lib.zoomSlider.prototype.zoomer=function(){util.log("zoomer","zoomer",this.zoomDelay);var z=this.getZoom();var zin=this.zoomingIn;var zout=this.zoomingOut;var thisHere=this;var zoomFactor=this.zoomFactor;var nz=0;if(zin||zout){if(zin){var nz=z*this.zoomIncrement;}else{var nz=z/this.zoomIncrement;}
if((1<=nz)&&(nz<=this.maxZoom)){var dt=new Date();var ctm=dt.getTime();this.setZoom(nz);dt=new Date();var etm=dt.getTime()-ctm;log("zoomer",Math.floor(etm));setTimeout(function(){thisHere.zoomer()},this.zoomDelay);}else{this.zoomingIn=false;this.zoomingOut=false;page.zooming=false;this.setZoom(this.getZoom());}}}
lib.zoomSlider.prototype.startZoomingIn=function(){this.zoomingOut=false;this.zoomingIn=true;this.startZoomDepth=page.vp.depth;page.zooming=true;this.zoomer();}
lib.zoomSlider.prototype.stopZooming=function(){log("STOP ZOOMING");if(page.vp.depth!=page.vp.actualDepth){this.depth=this.actualDepth;}
var czm=this.getZoom();page.vp.needsRefresh=true;page.vp.fromZooming=true;page.vp.cachedCoverage=null;page.vp.needsRefresh=true;page.zooming=false;this.setZoom(czm); page.vp.fromZooming=false;this.zoomingIn=false;this.zoomingOut=false;}
lib.zoomSlider.prototype.startZoomingOut=function(){this.zoomingOut=true;this.zoomingIn=false;this.startZoomValue=page.vp.zoom;page.zooming=true;this.zoomer();}})();
var page={};(function(){var lib=page;var geom=idv.geom;var imlib=idv.image;var com=idv.common;var util=idv.util;lib.twoColumns=true; 
lib.LayoutZero=function(options){util.setProperties(this,options,["outerDiv","margin","centerDiv","minScale","maxScale","tabDiv","includeLightbox"]);return;this.outerDiv=options.outerDiv;this.margin=options.margin;this.centerDiv=options.centerDiv;this.minScale=options.minScale;this.maxScale=options.maxScale;this.aspectRatio=options.aspectRatio;this.includeLightbox=options.includeLightbox;} 
lib.LayoutZero.prototype.computeScale=function(){var ww=$(window).width();var margin=this.margin;var maxwd=ww-2*margin;var hscale=(ww-2*margin)/1000; this.scale=Math.max(this.minScale,hscale);if(this.maxScale){this.scale=Math.min(this.scale,this.maxScale);}
lib.scale=this.scale;idv.util.log("scale",this.maxScale,this.scale);}
lib.LayoutZero.prototype.placeDivs=function(){this.computeScale();var ww=$(window).width();var hh=$(window).height();var winCenter=ww/2;var scale=this.scale;var divWd=1000*scale;var left=winCenter-0.5*divWd;var vpHt=divWd/(this.aspectRatio);var cTop=10; var topDiv=this.topDiv;lib.setCss(this.outerDiv,{left:left,width:divWd});lib.setCss(this.tabDiv,{width:divWd});lib.setCss(this.centerDiv,{width:divWd});this.vpCss={width:divWd,height:vpHt};this.placeLightbox();var afp=this.afterPlacement;if(afp){afp();}} 
lib.setTopDivCss=function(layout){layout.css.titleDiv={"margin-top":"10px","margin-bottom":"20px","font-size":"10pt","font-style":"bold"};if(idv.homePage){var ttdv=layout.css.titleDiv;ttdv["text-align"]="justify";ttdv["margin-left"]="40px";ttdv["margin-right"]="40px";}
var tdHt=idv.embed?"20px":(idv.homePage?"90px":"55px");layout.css.topDiv={"margin-top":"0px",padding:"0px","margin-bottom":"10px","font-size":"10pt","font-style":"bold"};layout.css.logo={"font-size":"12pt"};layout.css.topDivTop={"height":"20px"};}
lib.applyTopDivCss=function(layout){if(!idv.embed)lib.setCss($('.titleDiv'),layout.css.titleDiv);lib.setCss($('.topDiv'),layout.css.topDiv);lib.setCss($(".logo"),layout.css.logo);lib.setCss($(".topDivTop"),layout.css.topDivTop);}
lib.LayoutOne=function(options){this.margin=options.margin;this.aspectRatio=options.aspectRatio,this.vpDiv=options.vpDiv;this.evDiv=options.evDiv;this.centerDiv=options.centerDiv;this.minScale=options.minScale;this.additionalHeight=options.additionalHeight;this.scaleToViewport=options.scaleToViewport;this.includeLightbox=options.includeLightbox;this.css={}
this.css.shareDiv={"border":"solid thin white","margin-top":"10px","padding-top":"10px"};this.css.embedDiv={"border":"solid  white","margin":"10px","background-color":"white","color":"black"};lib.setTopDivCss(this);} 
lib.LayoutOne.prototype.computeScale=function(){var ww=$(window).width();idv.util.log("scaling",ww);var margin=this.margin;var maxwd=ww-2*margin;var hscale=(ww-2*margin)/1000; var wht=$(window).height();var nVpHt=1000/(this.aspectRatio);if(this.scaleToViewport){var vpc=1;}else{vpc=1.8;}
var vscale=(wht-this.additionalHeight)/(vpc*nVpHt);this.scale=Math.max(this.minScale,Math.min(hscale,vscale));util.log("layout",vscale," hscale ",hscale,this.scaleToViewport);lib.scale=this.scale;}
lib.setCss=function(div,css){if(div){div.css(css);}}
lib.LayoutOne.prototype.placeLightbox=function(){if(this.includeLightbox){var lb=this.lightbox;var top=50;var lbwd=600;var lft=winCenter=0.5*lbwd;var wht=$(window).height();var lbht=wht-100;var lightboxRect=new geom.Rect(new geom.Point(lft,top),new geom.Point(lbwd,lbht));if(!lb){lb=new com.Lightbox($('body'),lightboxRect);lb.render();this.lightbox=lb;}}}
lib.LayoutZero.prototype.placeLightbox=lib.LayoutOne.prototype.placeLightbox;lib.LayoutOne.prototype.placeDivs=function(){this.computeScale();var ww=$(window).width();var hh=$(window).height();var winCenter=ww/2;var scale=this.scale;var divWd=1000*scale;var left=winCenter-0.5*divWd;var vpHt=divWd/(this.aspectRatio);var cTop=10; var topDiv=this.topDiv;var sep=10;this.vpExtent=new geom.Point(divWd,vpHt);lib.setCss(this.centerDiv,{left:left,width:divWd});this.vpCss={width:divWd,height:vpHt};this.panelCss={width:divWd,height:0.8*vpHt}
lib.setCss(this.vpDiv,this.vpCss);lib.setCss(this.evDiv,this.vpCss);lib.applyTopDivCss(this);lib.setCss($(".shareDiv"),this.css.shareDiv);lib.setCss($(".embedDiv"),this.css.embedDiv);this.placeLightbox();var vp=lib.vp;if(vp){lib.vp.refresh(true);}
var afp=this.afterPlacement;if(afp){afp();}}
lib.LayoutDual=function(options){this.margin=options.margin;this.aspectRatio=options.aspectRatio,this.vp1Div=options.vp1Div;this.vp0Div=options.vp0Div;this.centerDiv=options.centerDiv;this.minScale=options.minScale;this.additionalHeight=options.additionalHeight;this.scaleToViewport=options.scaleToViewport;this.includeLightbox=options.includeLightbox;} 
lib.LayoutDual.prototype.computeScale=lib.LayoutOne.prototype.computeScale;lib.LayoutDual.prototype.placeLightbox=lib.LayoutOne.prototype.placeLightbox;lib.LayoutDual.prototype.placeDivs=function(){this.computeScale();var ww=$(window).width();var hh=$(window).height();var winCenter=ww/2;var scale=this.scale;var divWd=1000*scale;var left=winCenter-0.5*divWd;var vpHt=divWd/(this.aspectRatio);var cTop=10; var topDiv=this.topDiv;var sep=10;this.vpExtent=new geom.Point(divWd,vpHt);lib.setCss(this.centerDiv,{left:left,width:divWd});this.vpCss={width:divWd,height:vpHt};lib.setCss(this.vp0Div,this.vpCss);lib.setCss(this.vp1Div,this.vpCss);this.placeLightbox();var afp=this.afterPlacement;if(afp){afp();}} 
lib.LayoutTwo=function(options){this.margin=options.margin;this.aspectRatio=options.aspectRatio,this.outerDiv=options.outerDiv;this.colsDiv=options.colsDiv;this.vpDiv=options.vpDiv;this.evDiv=options.evDiv;this.leftDiv=options.leftDiv;this.rightDiv=options.rightDiv;this.panelDiv=options.panelDiv;this.minScale=options.minScale;this.additionalHeight=options.additionalHeight;this.css={};lib.setTopDivCss(this);this.css.shareDiv={"border":"solid thin white","margin-top":"10px","padding-top":"10px"};this.css.embedDiv={"border":"solid  black","padding":"10px","margin":"10px","background-color":"white","color":"black"};this.includeLightbox=options.includeLightbox;} 
lib.LayoutTwo.prototype.computeScale=function(){var ww=$(window).width();var margin=this.margin;if(idv.embed){margin=0.5*margin;}
var maxwd=(ww-3*margin)/2;var hscale=maxwd/1000; var wht=$(window).height();var nVpHt=1000/(this.aspectRatio);var vscale=(wht-this.additionalHeight)/nVpHt;this.scale=Math.max(this.minScale,Math.min(hscale,vscale));util.log("layout","vscale ",vscale," hscale ",hscale);lib.scale=this.scale;}
lib.setCss=function(div,css){if(div){div.css(css);}}
lib.LayoutTwo.prototype.placeLightbox=lib.LayoutOne.prototype.placeLightbox;lib.LayoutTwo.prototype.placeDivs=function(){this.computeScale();var scale=this.scale;var sep=this.margin; if(idv.embed){sep=0.5*sep;}
var margin=this.margin;var ww=$(window).width();var hh=$(window).height();var divWd=1000*scale;var contentWd=sep+2*divWd; if(ww>contentWd+2*margin){var actualMargin=Math.max(margin,0.5*(ww-contentWd));}else{var actualMargin=margin;}
var contentCenter=contentWd/2;var rightLeft=contentCenter+sep/2;var vpHt=divWd/(this.aspectRatio);var cTop=10; var sep=10;this.vpExtent=new geom.Point(divWd,vpHt);lib.setCss(this.outerDiv,{left:actualMargin,width:contentWd});lib.setCss(this.colsDiv,{left:0,width:contentWd});lib.setCss(this.leftDiv,{left:0,width:divWd});lib.setCss(this.panelDiv,{left:0,width:divWd,height:vpHt});lib.setCss(this.rightDiv,{left:rightLeft,width:divWd});this.vpCss={width:divWd,height:vpHt};this.panelCss=this.vpCss;lib.setCss(this.vpDiv,this.vpCss);lib.setCss(this.evDiv,this.vpCss);lib.applyTopDivCss(this);lib.setCss($(".shareDiv"),this.css.shareDiv);lib.setCss($(".embedDiv"),this.css.embedDiv);this.placeLightbox();var afp=this.afterPlacement;if(afp){afp();}}})();
(function(){var lib=page;var geom=idv.geom;var imlib=idv.image;var com=idv.common;var util=idv.util;lib.setClickMethod=function(el,m,doNotEnable){el.click(function(e){e.preventDefault();var enabled=el.data("enabled");if(enabled){m();}});if(doNotEnable){el.data("enabled",false);}else{lib.enableClickable(el);}}
lib.disableClickable=function(el){el.removeClass("clickableElement");el.removeClass("clickableElementSelected");el.addClass("clickableElementDisabled")
el.data("enabled",false);}
lib.selectClickable=function(el){el.removeClass("clickableElementDisabled");el.removeClass("clickableElement");el.addClass("clickableElementSelected");}
lib.deselectClickable=function(el){el.removeClass("clickableElementDisabled");el.removeClass("clickableElementSelected");el.addClass("clickableElement");}
lib.enableClickable=function(el){el.removeClass("clickableElementDisabled");el.removeClass("clickableElementSelected");el.addClass("clickableElement");el.data("enabled",true);} 
lib.clickableGroup=function(els,selectedCss,deselectedCss,callBack){this.selectedCss=selectedCss;this.deselectedCss=deselectedCss;this.callBack=callBack;var dict={};var ar=[];var thisHere=this;util.arrayForEach(els,function(el){var nm=el[0];var vl=el[1];dict[nm]=vl;ar.push(vl);vl.click(function(){thisHere.selectElement(nm,true);});})
this.listOf=ar;this.dictOf=dict;this.selected=undefined;}
lib.clickableGroup.prototype.appendTo=function(container){var els=this.listOf;var thisHere=this;util.arrayForEach(els,function(el){container.append(el);el.css(thisHere.deselectedCss);});}
lib.clickableGroup.prototype.selectElement=function(nm,fromClick){if(this.selected==nm){return;}
if(this.selected){var sel=this.dictOf[this.selected];sel.css(this.deselectedCss);}
var el=this.dictOf[nm];el.css(this.selectedCss);this.selected=nm;if(this.callBack&&fromClick){this.callBack(nm,this);}}})();
