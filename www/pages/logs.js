
(function () {
  
  
  var lib = page;
  lib.initialize = 
    function (entries) {
      var cn = $('.infoDiv');
      entries.sort(function (a,b) { return a.date - b.date;});
      var ln = entries.length;
      var tb = $('<table/>');
      cn.append(tb);
      function addCol(dt,rw,nm){
        rw.append($("<td>"+dt[nm]+"</td>"));
      };
      function addCols(dt,rw,nms) {
        $.each(nms,function (idx,nm) {addCol(dt,rw,nm);});
      };
      
      for (var i =0;i<ln;i++) {
        var ent = entries[i];
        var d = ent.date;
        var dt = new Date(d * 1000);
        var dts = dt.toDateString();
        ent.date = dts;
        ent.bytes = idv.util.bytesstring(ent.bytes)
        /*
        if (ent.bytes > 1000000) {
          ent.bytes = Math.floor(ent.bytes/1000000) + "M";
        } else {
          ent.bytes = Math.floor(ent.bytes/1000) + "K";
        }
        */
        
        var rw = $("<tr/>")
        tb.append(rw);
        addCols(ent,rw,["date","owner","image","album","bytes"]);
      }
    };
})();