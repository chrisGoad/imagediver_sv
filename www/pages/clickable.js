
(function () {
  
  var lib = page;
   var geom = idv.geom;
  var imlib = idv.image;
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
  
  
  
  lib.deselectClickable = function (el) {
    el.removeClass("clickableElementDisabled");
    el.removeClass("clickableElementSelected");
    el.addClass("clickableElement");
    //el.data("enabled",false);
  }
  
  
  
  lib.enableClickable = function (el) {
    el.removeClass("clickableElementDisabled");
    el.removeClass("clickableElementSelected");
    el.addClass("clickableElement");
    el.data("enabled",true);
  }
  // els should be an array of [name,value] pairs
  lib.clickableGroup = function (els,selectedCss,deselectedCss,callBack) {
    this.selectedCss = selectedCss;
    this.deselectedCss = deselectedCss;
    this.callBack = callBack;
    var dict = {};
    var ar = [];
    var thisHere= this;
    util.arrayForEach(els,function (el) {
      var nm = el[0];
      var vl = el[1];
      dict[nm] = vl;
      ar.push(vl);
      vl.click(function () {
        thisHere.selectElement(nm,true);
      });
    })
    this.listOf = ar;
    this.dictOf = dict;
    this.selected = undefined; // the name of the selected element
  }
  
  lib.clickableGroup.prototype.appendTo = function (container) {
    var els = this.listOf;
    var thisHere = this;
    util.arrayForEach(els,function (el) {
      container.append(el);
      el.css(thisHere.deselectedCss);
    });
  }
  
  lib.clickableGroup.prototype.selectElement= function (nm,fromClick) {
    if (this.selected == nm) {
      return;
    }
    if (this.selected) {
      var sel = this.dictOf[this.selected];
      sel.css(this.deselectedCss);
    }
    var el = this.dictOf[nm];
    el.css(this.selectedCss);
    this.selected = nm;
    if (this.callBack  && fromClick) {
      this.callBack(nm,this);
    }
  }
})();
