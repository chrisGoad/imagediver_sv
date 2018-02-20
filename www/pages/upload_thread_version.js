
(function () {

  var lib = page;
  var geom = idv.geom;
  var imlib = idv.image;

  //var com = idv.common;
  var util  = idv.util;
  idv.css.link = {"text-decoration":"underline","cursor":"pointer"}
  idv.pageKind = "album";


lib.monitorUpload = function(upload) { // called from the Iframe
  lib.theProgressBar.monitor(upload);
}


lib.jobC = new jobController();


lib.hideRetrieveOptions = function () {
  $('#orIfUpload').hide();
  $('#rt_row_1').hide();
  $('#retrieveButton').hide();
  $('#fromWhichUrl').hide(); 
}


lib.onError = function(job) {
  var isUpload = lib.jobC.theJobs[0].kind == "upload";
  $('#init').show();
  $('#uploadProgress').hide();
   if (isUpload) {
    $("#uploadIframe").attr("src","/upload_iframe");
    $("#uploadIframe").show();
    lib.hideRetrieveOptions();
  }
  util.myAlert('Error',job.error);
  //$('#initDivMsg').html("Error: "+job.error);
  if (!isUpload) $('#retrieveButton').attr("value","Try again");
}


lib.onCancel = function(job) {
  $('#init').show();
  $('#uploadProgress').hide();
  var isUpload = lib.jobC.theJobs[0].kind == "upload";
  if (isUpload) {
    $("#uploadIframe").attr("src","/upload_iframe");
    $("#uploadIframe").show();
    $('#orIfUpload').hide();
    $('#retrieveButton').hide();
    $('#fromWhichUrl').hide();
   // $('#initDivMsg').html("Canceled - try again if you like");
    $('#initDivMsg').html("Canceled");


  } else {
     $('#retrieveButton').attr("value","Try again");
     $('#initDivMsg').html("Canceled");
  }
}


lib.initProgressBar = function(jobc,job,wd) {
  var pbc = $('#uploadProgress');
  pbc.show();
  //pbc.empty();
  $('#init').hide();

  if (job.noMonitoring) return; // no monitoring needed
  var o = {units:"",container:pbc,width:400,height:5,job:job,whenDone:wd}
  if (job.kind == "upload") {
    var sbo = JSON.parse(job.subject);
    var imn = sbo.image_name;
     idv.util.extend(o,{units:" MB",stageTitle:"Uploading",mainTitle:"Importing "+imn});
  } else if (job.kind == "retrieve") {
    sbo = JSON.parse(job.subject);
    imn = sbo.image_name;
    var src = sbo.source;
    idv.util.extend(o,{units:" MB",stageTitle:"Retrieving",mainTitle:"Importing "+imn+" from "+src});
  } else if (job.kind == "build_tiling") {
    idv.util.extend(o,{stageTitle:"Creating tiles"});
  } else if (job.kind == "to_s3") {
    idv.util.extend(o,{stageTitle:"Copying to S3"});
 } else if (job.kind == "resize_image") {
    idv.util.extend(o,{stageTitle:"Resizing"});
  } else {
  
    alert("UNKNOWN KIND "+job.kind);
    return;
  }
  if (lib.theProgressBar) {
    var pb = lib.theProgressBar;
    pb.options = o;
  } else {
    var pb = new page.progressBar(o);
    lib.theProgressBar = pb;
  }
  lib.theProgressBar = pb;
  lib.theProgressBar.jobc = jobc;
  jobc.progressBar = lib.theProgressBar;
  pb.render();
  //pb.ticker();
  $("#uploadIframe").hide();  
}

function firstCharIsLetter(c) {
    var cc = c.charCodeAt(0);
    return ((65 <= cc) && (cc <= 90)) || ((97 <= cc) && (cc <= 122));
  }
lib.checkImageName = function (pw) {
  var ln = pw.length;
  if (ln == 0) return false;
  var mt = pw.match(/^\w*$/);
  if (!mt) return false;
  return firstCharIsLetter(pw);
}


function initialize2() {
  var cn = $('.infoDiv');
  util.addDialogDiv(cn);

  //cn.css('border','solid thin white');
  //var ttl = common.genTitle("File upload");
  //cn.append(ttl);
  var dialogDiv = $('<div id="dialog">Ho Ho</div>');
  cn.append(dialogDiv);
  dialogDiv.dialog({height:140,modal:true,autoOpen:false,title:"Error"});
  lib.initDiv = $('<div id="init">' +
      idv.common.genTable("rt",[
        ['<span>Name for the image at ImageDiver:</span>', '<input size=50 id="imname" type="text"/>'],
        ['<span id="fromWhichUrl">Url from which to retrieve the file:</span>','<input size=50 id="imurl" type="text"/>']])+
//      '<div><input id="retrieveButton" type="button" value="Retrieve"/></div>'+
      '<div style="margin-top:10px;margin-bottom:10px"><span id="retrieveButton" class="clickableElement">Retrieve</span></div>'+
      '<div id="orIfUpload">Or, if the image is on your computer, choose and upload it: </div>'+
      '<div id="initDivMsg"></div>'+
  '</div>');
  cn.append(lib.initDiv);
  cn.append('<div id="uploadProgress" style="width:100%"></div>');
  cn.append('<iframe id="uploadIframe" seamless="1"></iframe>');
  theIframe = $("#uploadIframe");
  theIframe.attr("src","/upload_iframe");
  lib.jobC.initProgressBar = lib.initProgressBar;
  lib.jobC.onError = lib.onError;
  lib.jobC.onCancel = lib.onCancel;
  
  
  
  
  var rb = $('#retrieveButton')
  
  rb.click(function () {
    //var nm = nmi.attr("value");
    $("#initDivMsg").html('');
    $('#orIfUpload').hide();
    $("#uploadIframe").hide();
    var usp = idv.loggedInUser.split("/")[2]
    var imn = $('#imname').attr("value");
    var ck = lib.checkImageName(imn);
    if (!ck) {
      util.myAlert('Error',"The image name may contain only numbers, letters, and the underbar, and must start with a letter");
      return;
    }
    // $('#init').hide();

    var src = $('#imurl').attr("value");
    var sbj = JSON.stringify({"image_name":imn,"source":src});
    var data = [{"subject":sbj,"kind":"retrieve","owner":usp},
       {"subject":sbj,"kind":"add_image_to_db",owner:usp},
        {"subject":imn,"kind":"resize_image","owner":usp},
       {"subject":imn,"kind":"build_tiling","owner":usp},
       {"subject":imn,"kind":"to_s3","owner":usp}
       ];
    //var data = [{"subject":imn,"kind":"to_s3","owner":usp}];
    //var data = [{"subject":imn,"kind":"resize_image","owner":usp}];
    url = "/api/allocateJob";
    lib.jobC.canceled = 0;
    lib.jobC.cjob = 0;
    idv.util.post(url,data,function (rs) {
      if (rs.value == "exists") {
        util.myAlert("","An image with that name is already present. Delete it first if you wish to replace it");
        return false;
      }
      var jobs = rs.value;
      jobs[1].noMonitoring = true;
      lib.jobC.theJobs = jobs;

      var j = jobs[0]
      var exists = j.retries;
      if (exists) {
        var ifyes = function () {console.log("yes");lib.jobC.startJob();};
        var ifno = function () {console.log("no");util.closeDialog();};
        util.myConfirm("","A file by that name exists. Overwrite?",ifyes,ifno);
        return;
      }
      lib.jobC.startJob();
      return false;
    });

  });
}
  
  
lib.initialize = function (options) {
  idv.loggedInUser = options.loggedInUser;
  $(document).ready(initialize2);


$(window).unload(function () {
  if (lib.theProgressBar) {
    var u = lib.theProgressBar.upload;
    if (u && u.status == "uploading") {
      lib.theProgressBar.cancelUpload();
      $('#dialog').html("By leaving this page, you are canceling the import");
      $('#dialog').dialog('open');
    }
  }
});

}

})();
