(function () {
var common = idv.common;
var lib = page;
var util  = idv.util;




lib.progressBar = function (options) {
  this.options = options;
  this.status = "not_started";
}

lib.progressBar.prototype.cancel = function () {
   u = this.options.job;
   this.canceled = 1;
   this.jobc.canceled = 1;
   if (!u) return;
   var url = "/topic"+u.topic+"/cancel()";
   var thisHere = this;
   idv.util.post(url,null,function (rs) {
        thisHere.jobc.cancel();
        //thisHere.update(u);
        //thisHere.cancelButton.hide();
      });
}

lib.progressBar.prototype.render = function () {
  var o = this.options;
   var c = o.container;
  var u = o.job;
  var err = u.error;
  if (err) {
    c.empty();
    c.append('<div id="errorMsg">');
    $("#errorMsg").html(err);
    this.beenRendered = false; // meaning, refresh the whole thing on next call
    return;
  } 
  var ttl = o.mainTitle;
  var brnd = this.beenRendered;
  //var sttl = "Stage "+(this.jobc.cjob) + ":"+o.stageTitle;// + u.subject;
  var sttl = o.stageTitle;
  var w = o.width;
  var h = o.height;
  var wd = o.whenDone;
  if (!brnd) {
    c.empty();
    var mainDiv = $(
    '<div id="mainDiv">' +
      '<div id="mainTitle"/>'  +
      '<div id="stageTitle"/>'  +
      '<div id="jobProgressBar">'+
        '<div id = "innerBar"/>'+
      '</div>' +
      //'<div id ="jobTime">Elapsed time: 0</div>'+
    '</div>');
    c.append(mainDiv);
    $(" div",mainDiv).css({"margin-top":"20px","margin-bottom":"20px"});
    this.beenRendered = true;
  }
  $('#jobProgressBar').css({width:w,height:h,"background-color":"white"});
  $('#innerBar').css({left:0,top:0,width:0,height:h,"background-color":"green"});
  if (ttl) $('#mainTitle').html(ttl);
  $('#stageTitle').html(sttl);

  /* 
  var titleDiv = $('<div id="jobTitle"/>');
  c.append(titleDiv);
  titleDiv.html(fttl);
  var outerDiv = $('<div id="jobProgressBar" />');
  this.outerDiv = outerDiv;
  outerDiv.css({width:w,height:h,"background-color":"white"});
  c.append(outerDiv);
  var innerDiv = $('<div/>');
  innerDiv.css({left:0,top:0,width:0,height:h,"background-color":"green"});
  this.innerDiv = innerDiv;
  outerDiv.append(innerDiv);
  var timeDiv = $('<div id ="jobTime">FOOB</div>');
  this.timeDiv = timeDiv;
  c.append(timeDiv);*/
  
  this.initTime = new Date().getTime();
  this.monitorCount = 0;
  if (!brnd) {
    c.append( '<div id = "jobText"></div>');
  }
  var textDiv = $('#jobText');
  textDiv.css({"margin-top":20,top:h+10,left:0,width:w});
  //c.append(textDiv);
  textDiv.html("Not started");
  this.textDiv = textDiv;
  if (!brnd) {
    //var cancelButton = $('<input type="button" value="Cancel"/>');
    var cancelContainer = $('<div></div>').css("margin-top",20);
    c.append(cancelContainer);
    var cancelButton = $('<span class="clickableElement">Cancel</span>');
    cancelContainer.append(cancelButton);
    var thisHere = this;
    this.cancelButton = cancelButton;
    cancelButton.click(function () {thisHere.cancel();});
  }
}

lib.progressBar.prototype.allDone = function (area) { // area is specified only if so big the backend will complete the work
  if (area) {
    $('#mainDiv').hide();
    this.cancelButton.hide();
    var o = this.options;
    var u = o.job;
    var sb = u.subject;
    if (sb.indexOf("{") >=0) {
      var imnm = $.parseJSON(sb).image_name;
    } else {
      imnm = sb;
    }
    var knd = lib.isRetrieval?"retrieval":"upload";
    $('#jobText').css({"width":"700px"});
    var msg = "The "+knd+" of "+imnm+" is complete. Now the image needs to be prepared for zooming. "+
                       "For an  image of this size (" + idv.util.bytesstring(area,1) +"), this will take a little while. ";
    if (idv.hasEmail) {
      msg += "An email notification will be sent when the image is ready for use."
    } else {
      msg += "Please check your content page for completion (we would send an email, but don't have your address)."
    }
    $('#jobText').html(msg);
  } else {
    var uid = idv.util.pathLast(idv.loggedInUser);
    var imn = idv.imageName;
    var dst = idv.topicDir+"/album/"+uid+"/"+imn+"/-/index.html";
    location.href = dst;
  }
}
  
lib.progressBar.prototype.update = function (u) {
  this.job = u;
  var o = this.options;
  var units = o.units;
  var size = u.total;
  if (u.status == "not_started") return;
  if (u.status == "done") {
    return;
    this.status = "done";
   
    this.textDiv.html("done");
    var wd = o.whenDone;
    if (wd) {
      wd();
    }
    return;
  }
  if ((u.status == "error") || (u.status == "canceled")) return;
  if (u.status == "error") {
    this.status = "error";
    //$('#mainDiv').hide();
    //this.cancelButton.hide();
    /*
    this.innerDiv.css({width:o.width});
    this.outerDiv.hide();
    this.cancelButton.hide();
    var tmb = Math.ceil(size/1000000);
    */
    $("#jobProgressBar").hide();
    this.textDiv.html("ERROR "+u.error);
    return;
  }
  if (u.status == "canceled") {
   $('#mainDiv').hide();
    this.cancelButton.hide();
    //this.outerDiv.hide();
    this.textDiv.html("canceled import of "+u.subject);
    return;
  }

  var sofar = u.so_far;
  var fr = sofar/size;
  //var mb = Math.ceil(sofar);
  //var tmb = Math.ceil(size);
  var prc = Math.ceil(fr * 100);
  var idw = Math.ceil(fr * o.width)
  $('#innerBar').css({width:idw});
  if (units==" MB") {
    sofarst = util.bytesstring(sofar);
    sizest = util.bytesstring(size);
   // sofar = Math.floor(sofar/1000000);
   // size = Math.floor(size/1000000)
  } else {
    sofarst = sofar;
    sizest = size;
  }
  this.sizeString = sizest;
  this.textDiv.html("completed: "+prc+"% -- "+sofarst+" out of "+sizest);
}


lib.progressBar.prototype.updateTime = function () {
  $('#jobTime').html("Elapsed time: ",Math.floor(((new Date().getTime()) - this.initTime)/1000));
}

/*
lib.progressBar.prototype.updateTime = function () {
  this.timeDiv.html( Math.floor(((new Date().getTime()) - this.initTime)/1000));
}
*/
/*
lib.progressBar.prototype.ticker = function () {
  this.updateTime();
  var thisHere = this;
  var j = this.job;
  if ((!j) || (j.status == "active")) {
    setTimeout(function () {thisHere.ticker()},200);
  }
}

lib.progressBar.prototype.imonitor = function (job) {
    if (this.canceled) {
      return;
    }
    //var mnc = this.monitorCount;
    //this.monitorCount = mnc + 1;
    var thisHere = this;
    var topic = job.topic;
    url = "/topic"+topic+"/get()";
    idv.util.post(url,null,function (rs) {
      thisHere.ccount = thisHere.ccount + 1;
      if (rs) {
        var job = rs.value;
        if (job.status == "error") {
          thisHere.jobc.onError(job);
          return;
        } 
        thisHere.update(job);
      }
      if ((thisHere.ccount < 1500) && (job.status != "done")) {
        setTimeout(function () {thisHere.imonitor(job);},2000);
      }
    });
}


lib.progressBar.prototype.monitor = function (job) {
  this.ccount = 0;
  if (this.status == "active") {
      alert("REENTRANT MONITORING")
  }    
  this.status = "active";
  //this.ticker();
  this.imonitor(job);
}
*/

})();

