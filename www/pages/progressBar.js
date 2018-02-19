(function () {
var common = idv.common;
var lib = page;



lib.progressBar = function (options) {
  this.options = options;
  this.uploadCancelled = false;
}

lib.progressBar.prototype.cancelUpload = function () {
   u = this.options.upload;
   if (!u) return;
   var url = "/topic"+u.topic+"/cancel()";
   var thisHere = this;
   idv.util.post(url,null,function (rs) {
        u.status = "cancelled";
        thisHere.uploadCancelled = true;
        thisHere.update(u);
        thisHere.cancelButton.hide();
      });
}

lib.progressBar.prototype.render = function () {
  var o = this.options;
  var c = o.container;
  var u = o.upload;
  var w = o.width;
  var h = o.height;
  var outerDiv = $('<div id="uploadProgressBar" />');
  this.outerDiv = outerDiv;
  outerDiv.css({width:w,height:h,"background-color":"white"});
  c.append(outerDiv);
  var innerDiv = $('<div/>');
  innerDiv.css({left:0,top:0,width:0,height:h,"background-color":"green"});
  this.innerDiv = innerDiv;
  outerDiv.append(innerDiv);
  var textDiv = $('<div id="uploadText"/>');
  textDiv.css({"margin-top":20,top:h+10,left:0,width:w});
  c.append(textDiv);
  textDiv.html("uploading "+u.name);
  this.textDiv = textDiv;
  var cancelButton = $('<input type="button" value="Cancel"/>');
  cancelButton.css("margin-top",20);
  c.append(cancelButton);
  var thisHere = this;
  this.cancelButton = cancelButton;
  cancelButton.click(function () {thisHere.cancelUpload();});
   var anotherButton = $('<input type="button" value="Upload Another File"/>');
  //cancelButton.css("margin-top",20);
  c.append(anotherButton);
  var thisHere = this;
  this.anotherButton = anotherButton;
  anotherButton.hide();
  anotherButton.click(function () {location.href = "/upload";});
}

lib.progressBar.prototype.update = function (u) {
  this.upload = u;
  var o = this.options;
  var size = u.size;
  if (u.status == "notStarted") return;
  if (u.status == "done") {
    this.innerDiv.css({width:o.width});
    this.outerDiv.hide();
    this.cancelButton.hide();
    this.anotherButton.show();
    var tmb = Math.ceil(size/1000000);
    this.textDiv.html("<p>done uploading "+u.name+" "+tmb+"MB</p>");
    return;
  }
  if (u.status == "cancelled") {
    this.outerDiv.hide();
    this.textDiv.html("<p>cancelled uploading "+u.name+"</p>");
    this.anotherButton.show();
    return;
  }

  var uploaded = u.uploaded;
  var fr = uploaded/size;
  var mb = Math.ceil(uploaded/1000000);
  var tmb = Math.ceil(size/1000000);
  var prc = Math.ceil(fr * 100);
  var idw = Math.ceil(fr * o.width)
  this.innerDiv.css({width:idw});
  this.textDiv.html("<p>uploading "+u.name+"</p><p>uploaded: "+prc+"%  -- "+mb+"MB out of "+tmb+"MB</p>");
}




lib.progressBar.prototype.monitorUpload = function (upload) {
    if (this.uploadCancelled) return;
    var topic = upload.topic;
    url = "/topic"+topic+"/get()";
    var thisHere = this;
    idv.util.post(url,null,function (rs) {
        var upload = rs.value;
        thisHere.update(upload);
        if (upload.status != "done") {
          setTimeout(function () {thisHere.monitorUpload(upload);},4000);
        }
      });
}

})();

