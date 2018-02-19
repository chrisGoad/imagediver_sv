

// common elements for neo pages


idv = {};

idv.base = {};

(function () {
  var lib = idv.base;
  
  lib.activeConsoleTags = [];
  
  lib.log = function (tag) {
   // return;
  // if (!$dt.fb) return;
  //if (neo.theIEVersion  || ((typeof window != "undefined") && (typeof console=="undefined"))) return;
    if (($.inArray("all",lib.activeConsoleTags)>=0) || ($.inArray(tag,lib.activeConsoleTags) >= 0)) {
     if (typeof window == "undefined") {
       system.stdout(tag + JSON.stringify(arguments));
    } else {
      console.log(tag,arguments);
    }
   }
  };
  
  
  lib.error = function (a,b) {
    console.log("Error "+a,b);
    foob();
  };
  

})();

