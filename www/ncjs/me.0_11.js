(function(){var lib=page;var geom=exports.GEOM2D;var imlib=exports.IMAGE;var common=idv.common;var util=idv.util;function addButton(cn,txt,cb,inDiv){var bt=$('<span class="clickableElement"></span>');bt.html(txt);if(inDiv){var cnt=$('<div/>');cn.append(cnt);var rs=cnt;}else{cnt=cn;rs=bt;}
cnt.append(bt);bt.click(cb);return bt;}
var theUser={}
var openUpdateAccountButton;var imDiv;function showMessage(msg){var rmsg=$('#errMsg');rmsg.show();rmsg.html(msg);}
function update(cn){$("#errMsg").hide();function checkPassword(pw){var ln=pw.length;if(ln<6)return false;var mt=pw.match(/^\w*$/);if(!mt)return false;return true;}
function checkName(pw){var mt=pw.match(/^(\w|\s)*$/);if(!mt)return false;return true;}
function checkEmail(pw){var mt=pw.match(/^[^\s]*$/);if(!mt)return false;return true;}
var pw=$.trim($('#newPassword').attr('value'));var rpw=$.trim($('#repeatPassword').attr('value'));if(pw){theUser.password=pw;}
var uname=$.trim($('#updateName').attr('value'));theUser.name=uname;var email=$.trim($('#updateEmail').attr('value'));var emailChanged=email!=theUser.email
theUser.email=email
if(!checkName(uname)){showMessage("Your name must consist only of letters, digits, and spaces");return;}
if(!checkEmail(email)){showMessage("This does not look like an email address");return;}
if(pw!=rpw){showMessage("Repeated password does not match");return;}
if(pw&&!checkPassword(pw)){showMessage("Your password must consist of six or more letters and digits");return;}
var dataj=JSON.stringify(theUser);$.ajax({url:"/api/updateUser",data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",success:function(rs){var st=rs.status;if(st=="ok"){var msg="Your account information has been updated"
if(emailChanged){msg+=", and an email has been sent to "+email+" for verification. If you do not receive this email, please update your email again to a working address."}}else{if(rs.msg=="sessionTimedOut"){util.logout();location.href="/timeout";return;}
if(rs.msg=="emailInUse"){showMessage("The email address "+email+" is already allocated at ImageDiver");return;}
showMessage("Failed to send email to  "+email);}
$('.infoDiv').html(msg);}});}
var userDiv;function addUserDiv(pr){var cn=$('<div/>');pr.append(cn);userDiv=cn;var tents=[['Name','<input id="updateName" type="text"/>'],['Email ','<input id="updateEmail" type="text" value="'+theUser.email+'"/>']];if(!theUser.tumblr_name){tents=tents.concat([['New Password ','<input id="newPassword" type="password"/>'],['Repeat Password','<input id="repeatPassword" type="password"/>']]);}
var rtb=$(common.genTable('account',tents));rtb.css({'margin-top':"10px","margin-left":"10px","margin-bottom":"20px"});cn.append(rtb);var rmsg=$('<div id="errMsg"></div>');rmsg.css({color:util.errorColor,"margin-bottom":20});cn.append(rmsg);var btdiv=$('<div/>');cn.append(btdiv);addButton(btdiv,"Update",function(){update(cn);});addButton(btdiv,"Cancel",function(){userDiv.hide();openUpdateAccountButton.show();});cn.css({"border":"solid thin black","padding":"20px"});cn.hide();}
lib.imDiv=undefined;lib.imHeight=100;lib.titleHt=50;lib.imPaddingY=30;lib.imPaddingX=20;lib.minImWd=70;lib.imEls=[];lib.imDivs=[];lib.cntEls=[];lib.addHead=function(table,leftWd){var imRow=$('<div/>');imRow.css({"margin":"20px","margin-top":"50px"});table.append(imRow);var left=$('<div/>');left.css({"display":"inline-block","font-weight":"bold","width":"200px"});imRow.append(left);left.html("Image");var right=$('<div/>');imRow.append(right);right.css({"display":"inline-block","font-weight":"bold","width":"100px","vertical-align":"top"});right.html("Albums");}
lib.initialize=function(options){if(options.timed_out){$('.infoDiv').html("Your session has timed out. Please log in again, if you like.");util.logout();return;}
var jsonUrl='/api/albumsAndImages'
util.commonInit()
theUser.userId=options.userId
theUser.name=options.name
theUser.email=options.email
theUser.tumblr_name=options.tumblr_name;var pdiv=$('.infoDiv');var nameEl,uidEl;var name=$.trim(options.name);var nameDiv,emailDiv,tumblrDiv;pdiv.append(nameDiv=$('<div/>').html(name).css({"margin-bottom":"30pt","font-weight":"bold"}));if(options.tumblr_name){pdiv.append(tumblrDiv=$('<div/>').html("Logged in via Tumblr").css({"margin-bottom":"30pt"}));}
if(options.email){pdiv.append(emailDiv=$('<div/>').html("Email: "+options.email).css({"margin-bottom":"30pt"}));}
logoutButton=addButton(nameDiv,"Log out",function(){idv.util.logout(function(){location.href="/logged_out"});},false);logoutButton.css({"float":"right"});nameDiv.append()
openUpdateAccountButton=addButton(pdiv,"Update Account",function(){openUpdateAccountButton.hide();userDiv.show()},true);addUserDiv($('.infoDiv'));$('#updateName').attr("value",theUser.name);var utl=options.utilization;var alc=options.allocation;var stEl=util.appendR(pdiv,$('<div/>').css({"margin-top":"20pt","margin-bottom":"30pt"}));stEl.append($('<span/>').html("Storage allocated: "+util.bytesstring(alc.storage)),$('<span/>').html("Storage used: "+util.bytesstring(utl.storage)).css({"margin-left":"20pt"}));var bandEl=util.appendR(pdiv,$('<div/>').css({"margin-top":"20pt","margin-bottom":"30pt"}));bandEl.append($('<span/>').html("Bandwidth/month allocated: "+util.bytesstring(alc.bandwidth)),$('<span/>').html("Bandwidth used this month: "+util.bytesstring(utl.bandwidth)).css({"margin-left":"20pt"}));}})();
