
var jobController = function () {
  this.cjob = 0;
  this.monitorInterval = 3000;
  this.monitorMaxCount = 1000000000;
  this.backendThreshold = 60 * 1000 * 1000; // in pixels. if the pixel area is > this, give the back end the job.  IMPORTANT sync this with the corresponding python variable
  
}



jobController.prototype.nextJob = function () {
  var ln=this.theJobs.length;
  this.cjob = this.cjob + 1;
  if (this.cjob >= ln) {
    this.progressBar.allDone();
    return;
  }
  this.startJob();
}

jobController.prototype.monitor = function (job) {
  function mylog() {
    if (0)  console.log(idv.util.elapsedTime(),"monitor",idv.util.argsToString(arguments));
  }
  mylog("starting monitor",this.canceled,job.kind,job.status);
  if (this.canceled) {
    return;
  }
  var thisHere = this;
  var topic = job.topic;
  url = "/topic"+topic+"/get()";
  mylog("getting ",url);
  idv.util.post(url,null,function (rs) {
    thisHere.monitorCount = thisHere.monitorCount + 1;
    if (rs) {
      var job = rs.value;
      mylog("got",job.kind,job.status,job.so_far,job.total);
      if (job.status == "error") {
        thisHere.onError(job);
        return;
      }
      thisHere.progressBar.update(job);
      if (job.status == "done") {
        mylog("next job");
        // now need to decide whether to turn it over to the back end// NEWUPLOAD
        if ((job.kind == "retrieve")||(job.kind == "upload")) {
          var sb = job.subject;
          var sbo = JSON.parse(sb);
          var dims = sbo.dimensions;
          var area = dims.x * dims.y;
          if (area > thisHere.backendThreshold) {
            thisHere.progressBar.allDone(area); // 1 = backend needed
            var abc = 122;
          } else {
            thisHere.nextJob();
          }
        } else {
          thisHere.nextJob();
        }
        return;
      }
    }
    if (thisHere.monitorCount > thisHere.monitorMaxCount) return;
    
    if ((job.status == "active")||(job.status == "not_started")) {
      setTimeout(function () {thisHere.monitor(job);},thisHere.monitorInterval);
    }
  });
}

jobController.prototype.cancel = function () {
  this.canceled = 1;
  var j = this.theJobs[this.cjob];
  this.onCancel(j);
}


jobController.prototype.startFirstJob = function () {
  this.cjob = 0;
  this.startJob();
}

var testing = 66;
jobController.prototype.startJob = function () {
 
  function mylog() {
    if (0)  console.log(idv.util.elapsedTime(),"startJob",idv.util.argsToString(arguments));
  }

  if (this.canceled) {
    return;
  }
  var j = this.theJobs[this.cjob];
  var topic = j.topic;
  var topics = topic.split("/");
  var jId = topics[topics.length-1];
  var jurl = "/api/runJob?id="+jId;
  var thisHere = this;
  
  if  (j.kind == "upload") {
    thisHere.monitorCount = 0;
    thisHere.monitor(j);
    this.initProgressBar(this,j,function () {thisHere.nextJob();});
    var f = this.uploadForm; 
    f.attr("action",jurl);
    f.submit();
  } else {

   
    mylog("starting job",j.kind);
    idv.util.get(jurl,function (rs) {
      mylog("job started",rs.status,j.kind,j.noMonitoring);
      if (rs.status == "ok") {
        thisHere.initProgressBar(thisHere,j);
        if (j.noMonitoring) { //for this case, the job is complete on return from "Runjob"
          thisHere.nextJob();
        } else {
          thisHere.monitorCount = 0;
          thisHere.monitor(j);
        }
      } else {
        if (rs.msg == "sessionTimedOut") {
          util.logout();
          location.href = "/timeout";
          return;
        }
        j.error = rs.msg;
        j.msg = rs.msg; 
        thisHere.onError(j);
      }
    });
  }
}

// this function caused the minimizer to work; buggy 
  
function forMinimizer() {alert(22);}

