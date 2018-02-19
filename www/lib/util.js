

// common elements for neo pages


idv = {};

idv.util = {};
idv.css = {}; //repo for various css

idv.useS3 = true; // this applies to everything execept tilings, which always use s3
//idv.isDev = false; 


idv.alwaysUseFlash = true;
idv.useFlash = idv.alwaysUseFlash;
idv.useFlashForOverlay = false;

(function () {
  var lib = idv.util;
  
  lib.activeConsoleTags = [];
  
  
  // simple log, no tag
  lib.slog = function () {
    //if (arguments.length == 1) alert(1);
    if (typeof(console) == "undefined") return;
    if (!idv.devVersion) return;
  // for ie 8
   var aa = [];
   var ln = arguments.length;
   for (var i=0;i<ln;i++) {
     aa.push(arguments[i]);
   }
   console.log(aa.join(", "));
  return;
  }
  
  
  lib.startTime = Date.now()/1000;
  // time log, no tag
  
  
  lib.resetClock = function () {
    lib.startTime = Date.now()/1000;
  }
  
  lib.tlog = function () {
    //if (arguments.length == 1) alert(1);
    if (typeof(console) == "undefined") return;
    if (!idv.devVersion) return;
  // for ie 8
   var aa = [];
   var nw = Date.now()/1000;
   var et = nw-lib.startTime;
   var ln = arguments.length;
   for (var i=0;i<ln;i++) {
     aa.push(arguments[i]);
   }
   et = Math.round(et * 1000)/1000;
   var rs = "AT "+et+": "+aa.join(", ");
   console.log(rs);
  return;
  }
  
  
  
  
  
  lib.log = function (tag) {
    if (typeof(console) == "undefined") return;
  // if (!$dt.fb) return;
  //if (neo.theIEVersion  || ((typeof window != "undefined") && (typeof console=="undefined"))) return;
    if (($.inArray("all",lib.activeConsoleTags)>=0) || ($.inArray(tag,lib.activeConsoleTags) >= 0)) {
     if (typeof window == "undefined") {
       system.stdout(tag + JSON.stringify(arguments));
    } else {
      // for ie 8
      var aa = [];
      var ln = arguments.length;
      for (var i=0;i<ln;i++) {
        aa.push(arguments[i]);
      }
      console.log(tag,aa.join(", "));
    }
   }
  };
  
  
  lib.error = function (a,b) {
    console.log("Error "+a,b);
    foob();
  };
  
  lib.post = function (url,data,callback) {
   if (typeof data == "string") {
    dataj = data;
   } else {
    var dataj = JSON.stringify(data);
   }

   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:callback});
  }
  
  
  lib.get= function (url,callback,ecallback) {
   $.getJSON(url,callback);
   return;
   var opts = {url:url,cache:false,contentType:"application/json",type:"GET",dataType:"json", // cache was false
         success:callback};
    if (ecallback) {
      opts.error = ecallback;
    }
    $.ajax(opts);
  }



  lib.runCallbacks = function (cbs) {
    if (cbs == undefined) return;
    var a = arguments;
    var ca = [];
    var ln = a.length;
    for (i=1;i<ln;i++) {
      ca.push(a[i]);
    }
    lib.arrayForEach(cbs,function (cb) {
      cb.apply(undefined,ca);
    })
  }

// needed for pre 1.6 versions of js, eg in IE8
lib.arrayMap = function (a,fn) {
  //if (!dbug) return a.map(fn); //the code below aids in debugging
  if (a.map) {
    return a.map(fn);
  }
  var ln = a.length;
  var rs = [];
  for (var i=0;i<ln;i++) {
    rs.push(fn(a[i]));
  }
  return rs;
}


lib.arrayForEach = function (a,fn) {
  //if (!dbug) return a.map(fn); //the code below aids in debugging
  if (a.forEach) {
    a.forEach(fn);
    return;
  }
  var ln = a.length;
  for (var i=0;i<ln;i++) {
    fn(a[i]);
  }
}



lib.arrayAnyTrue= function (a,fn) {
  var ln = a.length;
  var rs = [];
  for (var i=0;i<ln;i++) {
    if (fn(a[i])) return true;
  }
  return false;
}


lib.arrayAllTrue= function (a,fn) {
  var ln = a.length;
  var rs = [];
  for (var i=0;i<ln;i++) {
    if (!fn(a[i])) return false;
  }
  return true;
}

lib.removeFromArray = function (a,v) {
  var rs = [];
  lib.arrayMap(a,function (av) {
    if (av!=v) {
      rs.push(av);
    }
  });
  return rs;
}

lib.arrayFilter = function (a,fn) {
  var ln = a.length;
  var rs = [];
  for (var i=0;i<ln;i++) {
    if (fn(a[i])) rs.push(a[i]);
  }
  return rs;
}
lib.setProperties = function (dest,src,props) {
  if (!src) return;
  lib.arrayMap(props,function (prop) {
    var srcv = src[prop];
    if (srcv != undefined) dest[prop] = src[prop];
  });
}





lib.loadScripts = function (urls,callback) {
  var ln = urls.length;
  var cindex = 0;
  function oneGet() {
    if (cindex == ln) {
      if (callback) callback();
      return;
    }
    var url = urls[cindex];
    cindex++;
    $.getScript(url,oneGet);
  }
  oneGet();
}


lib.extend = function () {
  var ln=arguments.length;
  var dst = arguments[0];
  for (var i=1;i<ln;i++) {
    var ca = arguments[i];
    for (var k in ca) {
      if (ca.hasOwnProperty(k)) {
        dst[k] = ca[k];
      }
    }
  }
  return dst;
}

lib.htmlEscape = function (s) {
  var fr = s.replace(/</g,"&lt;")
  return fr.replace(/>/g,"&gt;")
}

lib.parseQS = function (s) {
  if (s == undefined) {
    var qs = location.search;
  } else {
    qs = s;
  }
  if (!qs) return {};
  qs = qs.substring(1); // remove the ?
  args=qs.split("&");
  var rs = {};
  lib.arrayForEach(args,function (a) {
    var spa = a.split("=");
    if (spa.length == 2) {
      var k=spa[0];
      var v=spa[1];
      rs[k] = v;
    }
  });
  return rs;
}

lib.dropQS = function (s) {
   if (s == undefined) {
    s = location.href;
  }
  var qp = s.indexOf("?");
  if (qp < 0) return s;
  return s.substring(0,qp);
}

lib.navigateToPage = function(page,target) {
  if (target) {
    window.open(page,"_blank")
  } else {
   location.href=page;
  }
  return;
    
  var brie8 =   $.browser.msie && (parseFloat($.browser.version) < 9);
  //if (page[0]=="/") {
  //  page = "http://"+idv.domain+page;
  //}
  

  var inIframe = window.parent !== window;
  if (inIframe && !brie8 && !target) {
    //var idvp = "http://"+idv.domain+page;
    var msg = JSON.stringify({"command":"navigateToPage","arguments":[page]});
    // for IE8
    //var msg = '{"command":"navigateToPage","arguments":["'+page+'"]}';
    //console.log("MESSAGE IS"+msg)
    window.parent.postMessage(msg,"*");// "*" works for browsers other than IE8; .document also for IE8
    //window.parent.ie8hack.postMessage(msg,"http://dev.imagediver.org"); // "*" works for browsers other than IE8; .document also for IE8
 } else {
    if (target) {
      window.open(page,"_blank")
    } else {
     location.href=page;
    }
  }
}


idv.s3Domain = "imagediver.s3-website-us-east-1.amazonaws.com";
idv.cfDomain = "static.imagediver.org"; // cloudfront
lib.commonInit = function () {
  lib.tlog("commonInit");
  var domain = location.host;
  idv.devVersion = domain == "dev.imagediver.org";
  idv.atS3 = domain == idv.cfDomain;//idv.s3Domain;
  idv.useS3 = !(idv.devVersion); // use S3 for snaps, etc, ow use the imagediver.org for everything except tiles (which are always at s3)
  //idv.useS3 = true; //@temporary
  idv.query = lib.parseQS();
  idv.embed = idv.query.embed;
  idv.brie8 =   $.browser.msie && (parseFloat($.browser.version) < 9); // ie7 too
  

  
  /*
  var url = location.href;
  idv.devVersion = url.indexOf("http://dev.imagediver") >= 0;
  idv.atS3  = url.indexOf("imagediver.s3") >= 0;
  idv.domain = location.host;
  */
  
}


  
lib.jsonUrl = function (topic) {
  if (idv.devVersion) {
    return "/api"+topic;    
  } else {
    return "/topic"+topic+"/topic.json";
  } 
}
                 

  lib.lastPathElement =  function (s) {
    var lsl = s.lastIndexOf("/");
    return s.substr(lsl+1);
  }
  
  lib.numberAtEnd = function (s) {
    var mt = s.match(/(\d+)$/);
    if (mt) {
      var nm = mt[1];
      return parseInt(nm);
    }
  }


})();

