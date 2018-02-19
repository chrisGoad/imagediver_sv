
function browserCheck() {
  var ua = navigator.userAgent;
  if (ua.indexOf("Firefox") >= 0) return "firefox"
  if (ua.indexOf("Chrome") >= 0) return "chrome";
  if (ua.indexOf("Safari") >= 0) return "safari";
  if (ua.indexOf("Opera") >= 0) return "opera";
  var iere = /MSIE (\d)/;
  var m = ua.match(iere);
  if (!m) return "unknown"; // unknown browser
  var v = parseInt(m[1]);
  return v;
  
}
function browserCheckAction() {
  idv.useFlash = idv.alwaysUseFlash;
  var br = browserCheck();
  if (typeof br == "number") {
    //if (br < 9) {
      idv.useFlash = true;
      //location.href = "/unsupported_browser";
    //}
  } else  {
    if (br == "unknown") {
      location.href = "/unsupported_browser";
    }
  }
}

browserCheckAction();




