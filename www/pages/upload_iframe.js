

function myAlert(title,text) {
  parent.idv.util.myAlert(title,text);
}

function initialize() {
  idv.util.commonInit()

  var ppage = parent.page;
  var b = $('#theButton');
  //var nmi = $("#nameInput");
  var fli = $("#fileInput");
  /*
  imnf.change(function () {
    ppage.imageNameFromFileName = false;
  });
  */
  //fli.click();
  var imname = "";
  var ext = "";
  //jobC.initProgressBar = parent.initProgressBar;

  fli.change(function () {
    var imnf = $("#imname",window.parent.document);
    parent.page.hideRetrieveOptions();
    var pth = fli.attr("value");
    var rfs = pth.lastIndexOf("\/");
    var bsl = String.fromCharCode(92); // backslash
    var rfbs = pth.lastIndexOf(bsl);
    var rf = Math.max(rfs,rfbs);
    if (rf < 0) {
      var fimname = pth;
    } else {
      fimname = pth.substr(rf+1);
    }
    var rfd = fimname.lastIndexOf(".");
    if (rfd < 0) {
      var imname = fimname;
      ext = "";
      
    } else {
      imname = fimname.substr(0,rfd);
      ext = fimname.substr(rfd+1);
      
    }
   // var imnf = $("#imname",window.parent.document);
    var cimn = $.trim(imnf.attr("value"));
    if ((!cimn)||(ppage.imageNameFromFileName)) { //&& ppage.checkImageName(imname))
      var imnf = $("#imname",window.parent.document);
      imnf.attr("value",ppage.fixImageName(imname));
      ppage.imageNameFromFileName = true;
    }
  });
  b.click(function () {
    var pth = fli.attr("value");
    var imnf = $("#imname",window.parent.document);
    if (!pth) {
      myAlert("Error","No file chosen");
      return;
    }
    // var imnf = $("#imname",window.parent.document);
    var imn = $.trim(imnf.attr("value"));
    if (!imn) {
      myAlert("Error","Please enter the name that the image should be assigned at ImageDiver");
      return;
    }
    if (!ppage.checkImageName(imn)) {
      myAlert("Error","The image name must contain only letters, numbers, and the underbar, and must start with a letter. After upload, you can assign an image title without restriction");
      return;
    }
    parent.idv.imageName = imn;
    var usp = idv.loggedInUser.split("/")[2]
    var sbj = JSON.stringify({"image_name":imn,"source":"upload"});

    var data = [{"subject":sbj,"kind":"upload","owner":usp},
       {"subject":imn,"kind":"resize_image","owner":usp},
       {"subject":imn,"kind":"build_tiling","owner":usp},
       {"subject":imn,"kind":"to_s3","owner":usp}];
   
    /*
      {"subject":sbj,"kind":"add_image_to_db",owner:usp},
        {"subject":imn,"kind":"resize_image","owner":usp},
       {"subject":imn,"kind":"build_tiling","owner":usp},
       {"subject":imn,"kind":"to_s3","owner":usp}];
    */
    url = "/api/allocateJob";
    var jobC = parent.page.jobC;
    jobC.canceled = 0;
    jobC.cjob = 0;
    idv.util.post(url,data,function (rs) {
      if (rs.value == "exists") {
        myAlert("","An image with that name is already present. Delete it first if you wish to replace it");
        return false;
      }
      if (rs.msg =="sessionTimedOut") {
        util.logout();
        location.href = "/timeout";
        return false;
      }        

      var jobs = rs.value;
      //jobs[1].noMonitoring = true;
      jobC.theJobs = jobs;
      jobC.uploadForm = $('#theForm');
      var upload = jobs[0]
      var exists = upload.retries;
      ppage.initDiv.hide();
      ppage.storageDiv.hide();
      jobC.startJob();
      return false;
    });
  });
}

