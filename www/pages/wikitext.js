(function () {
  var lib = page;
    var geom = idv.geom;
  var imlib = idv.image;

  var com = idv.common;
  var util  = idv.util;
  
  lib.processWikipediaLink = function (dst,txt) {
    var sp = txt.split("|");
    var spaceRe = new RegExp("\ ","g");
    if (sp.length == 1) {
      var url = "http://en.wikipedia.org/wiki/"+txt.replace(spaceRe,"_");
      var text = txt;
    } else  {
      url = "http://en.wikipedia.org/wiki/"+sp[0].replace(spaceRe,"_");
      var text = sp[1];
    }
    var span = $('<span/>');
    span.css(idv.css.link);
    span.append(text);
    dst.append(span);
    span.click(function (){window.open(url,"idv_target")});
    return text;
    
  }
  
  /*
   function allMatches(txt,re) {
    
   }
  re = /(?:\*\*[^\n]*?\*\*)/g
  txt = "012345**def**  **ff** foob"
  mt = txt.match(re)
  */
  
  lib.processWikiText = function (dst,txt) {
    var ctxt = txt;
    var rs = [];
    if (!txt) return rs;
    var link_re = /(?:\[\[[^\]]*)\]\]|(?:\[[^\]]*\])/;
    var bold_re = /(?:\*\*[^\n]*?\*\*)/;
    
    function findNext() {
      //var re = /(?:\[\[([^\]]*)\]\])|(?:\[([^\]]*)\])/g;
      var re = /(?:\[\[[^\]]*)\]\]|(?:\[[^\]]*\])/g;
      var mt = re.exec(ctxt);
      if (!mt) {
        var
        rs.push(["text",ctxt]);
        return false;
      }
      var mt0 = mt[0]
      var ps = mt.index;//ctxt.indexOf(mt0);
      var sg = ctxt.substring(0,ps);
      ctxt = ctxt.substr(ps+(mt0.length));
      rs.push(sg);
      rs.push(mt0);
      return true;
    }
    while (findNext()) true;
    var txtrs = "";
    util.arrayForEach(rs,function (txt) {
      if (txt.substr(0,2) == "[[") {
       var txt1 = txt.substr(2,txt.length - 4);
       txtrs += lib.processWikipediaLink(dst,txt1);
      } else {
        dst.append(txt);
        txtrs += txt;
      }
  
    });
    return txtrs;
  }
  
  
  lib.wikipediaLinkText = function (txt) {
    if (txt.substr(0,2) == "[[") {
      var txt1 = txt.substr(2,txt.length - 4);
    // later deal with single bracket case
    } else {
      txt1 = txt;
    }
    var sp = txt1.split("|");
    if (sp.length == 1) {
      return txt1;
    } else if (sp.length >= 2) {
            return sp[1];
    }
    
  }
  // for rollovers: just remove wiki symbols
  
  lib.removeWikiSymbols = function (txt) {
    if (!txt) return "";
    var ctxt = txt;
    var rs = "";
    function findNext() {
      //var re = /(?:\[\[([^\]]*)\]\])|(?:\[([^\]]*)\])/g;
      var re = /(?:\[\[[^\]]*)\]\]|(?:\[[^\]]*\])/g;
      var mt = re.exec(ctxt);
      if (!mt) {
        rs += ctxt;
        return false;
      }
      var mt0 = mt[0]
      var ps = mt.index;//ctxt.indexOf(mt0);
      var sg = ctxt.substring(0,ps);
      ctxt = ctxt.substr(ps+(mt0.length));
      rs += sg;
      rs += lib.wikipediaLinkText(mt0);
      return true;
    }
    while (findNext()) true;
    return rs;
    
  }
 
 
})();

