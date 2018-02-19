
(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;

  lib.setClickMethod = function (el,m,doNotEnable) {
    el.click(function (e) {
      e.preventDefault();
      var enabled = el.data("enabled");
      if (enabled) {
        m();
      } 
    });
    if (doNotEnable) {
      el.data("enabled",false);
    } else  {
      lib.enableClickable(el);
    }
  }
  
  lib.disableClickable = function (el) {
    el.removeClass("clickableElement");
    el.removeClass("clickableElementSelected");
    el.addClass("clickableElementDisabled")
    //el.attr('disabled','disabled');
    el.data("enabled",false);
  }
  
  lib.selectClickable = function (el) {
    el.removeClass("clickableElementDisabled");
    el.removeClass("clickableElement");
    el.addClass("clickableElementSelected");
    //el.data("enabled",false);
  }
  
  
  
  lib.enableClickable = function (el) {
    el.removeClass("clickableElementDisabled");
    el.removeClass("clickableElementSelected");
    el.addClass("clickableElement");
    el.data("enabled",true);
  }
})();
