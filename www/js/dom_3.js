
/*
 
*/

neo.dom  = {};


(function () {
  var lib=neo.dom;
  
  var nit = neo.nit;
  
  
  

  // an element (if it is not serving a prototype for another class, eg list or elements) is an atomic dom element
  // without children

  lib.Element = function (options,jqtext) {
    if (jqtext) this.jqueryText = jqtext; // to build this element, $(jqtext)
    this.css = new nit.Nit();
    this.attributes = new nit.Nit();
    if (options) {
      if (options.css) {
        this.css.extend(options.css);
      }
      if (options.attributes) {
        this.attributes.extend(options.attributes);
      }
    }
    this.Class = lib.Element;
    // other attributes: rendered, parent
  //  this.apply();
  };
  
  lib.Element.prototype = new nit.Nit();

  lib.Element.prototype.bareCopy = function () {
    return new lib.Element()
  }
  /*
  lib.Element.prototype.apply  = function (options) {
    return neo.apply(this,options);
  }
  */
  
  /*
  lib.adopt("Element", $f.applyNew(jlib.Element, // the Slider component
            {container:"_v",tag:"_v",htmlGen:"_v", // htmlGen is a function that generates html from the value
              content:"_v",selectedCss:"_v",hoverCss:"_v",css:"_v",attributes:"_v",click:"_v"}));

  */
  // the common part of the rendering process
  lib.Element.prototype.updateRendered = function () {
    var r = this.rendered;
    var click = this.click;
    var hcss = this.hoverCss;
    if (this.css) {
      var bcss = this.css;
      r.css(nit.vanillafy(bcss));
    }
    if (this.attributes) {
      r.attr(nit.vanillafy(this.attributes));
    }
    if (click) {
      var appClick = function () {
        click(this);
      };
      r.click(appClick);
    }
    if (hcss) {
        r.mouseover(function () {neo.log("domcss",hcss);r.css(nit.vanillafy(hcss));});
        r.mouseleave(function () {r.css(nit.vanillafy(bcss));});
      }
  }
  
  lib.Element.prototype.getContainer = function () {
    var c = this.container;
    if (c) return c;
    var p  = this.parent;
    if (p) {
      return p.rendered;
    }
  }
  
  lib.Element.prototype.render = function () {
    var v = this;
    if (v.doNotRender) return null;
    var c = this.getContainer();// a jquery element
    var  jqt = this.jqueryText;
    var el = $(jqt);
    this.rendered = el;
    this.updateRendered();
    c.append(el);
    
    var cn  = v.content;
    var g = v.htmlGen; // either a generator or a value should be specified
    var html = v.html;
    if (g) {
      var h = g(cn);
    } else {
      if (html) {
        h = html;
      } 
    }
    if (h) el.html(h);
    
    return el;
  }

  lib.Element.prototype.select = function () {
    var r = this.rendered;
    r.css(this.selectedCss);
  }
  
  
  lib.Element.prototype.deselect = function () {
    var r = this.rendered;
    r.css(this.css);
  }
  
  
  
  // elements of iparts may have the form {name:value}; for these, a named value is assigned to partsByName
  
  lib.Assembly = function (options,jqtext,partOrder) {
    
    this.extend(options);
    this.jqueryText = jqtext;
    this.Class = lib.Assembly;
    this.partOrder = partOrder;
  }
  
  
  
  lib.Assembly.prototype = new lib.Element();



  lib.Assembly.prototype.bareCopy = function () {
    return new lib.Assembly()
  }
  // Assembly.parts is an array of subelements
  // each might have the form of named part {name: value:}
  // if it does, then that part is accessible
  
  lib.Assembly.prototype.render = function () {
    var prf = lib.Element.prototype.render;
    prf.call(this); 
    var pns = this.partOrder;
    if (!pns) {
      return;
    }
    var ln = pns.length;
    for (var i=0;i<ln;i++) {
      var pn = pns[i];
      var cp = this[pn];
      if (!cp) neo.error("No such part "+pn);
      cp.parent = this;
      cp.render();
    }
  }
 
  
// a concise version of Element/Assembly

lib.El =  function (options,jqtext,partOrder) {
  return new lib.Assembly(options,jqtext,partOrder);
}

// assemblies need to clone their parts.

lib.Field = function (options,inputClass,jqueryText) {
  if (arguments.length < 2) return;
  if (!jqueryText) {
    this.jqueryText = '<div/>'; // to build this element, $(jqtext)
  }
  this.extend(options);
  var initialValue = options.initialValue;
  this.Class = lib.Field;
  var title = new lib.Element({},'<span/>');
  var input = new inputClass({},initialValue);
  var warning = new lib.Element({},'<span/>');
  this.partOrder = ["title","input","warning"];
}

lib.Field.prototype = new lib.Assembly();



lib.Field.prototype.bareCopy = function () {
    return new lib.Field()
  }

lib.Field.prototype.value = function () {
  var input = this.input;
  return input.value();
}

lib.Field.prototype.setValue = function (v) {
  var input = this.input;
  input.setValue(v);
}

lib.Field.prototype.setWarning = function (w) {
  var wr = this.warning;
  wr.show()
  wr.html(w)
  
}

lib.Field.prototype.clearWarning = function (w) {
  var wr = this.warning;
  wr.hide()
  wr.html("")
}

lib.Field.prototype.render = function () {
  lib.Assembly.prototype.render.call(this);
  var iv = this.initialValue;
  if (iv) {
    this.setValue(iv);
  }
}

  // parta has the form [{name0:value0},{name1:value1} ....
lib.installPartArray = function (dst,parta) {
  var partOrder = [];
  var ln = parta.length;
  for (var i=0;i<ln;i++) {
    var cpp = parta[i];
    for (var k in cpp) {
      dst[k] = cpp[k];
      partOrder.push(k);
    }
  }
  dst.partOrder = partOrder;
}

  

// here the parts are <td>'s plus the input element inside the middle field
lib.RowField = function (options,inputClass) {
  if (arguments.length < 2) return;
  this.jqueryText = '<tr/>'; 
  this.extend(options);
  var initialValue = options.initialValue;
  this.Class = lib.RowField;
  var title = new lib.Element({},'<td/>');
  var input = new inputClass({},initialValue);
  var warning = new lib.Element({css:{display:"none"}},'<td/>');
  var inputtd = new lib.Element({},'<td/>');
  lib.installPartArray(this,[{title:title},{inputtd:inputtd},{input:input},{warning:warning}]);
}


lib.RowField.prototype = new lib.Field();



lib.RowField.prototype.bareCopy = function () {
    return new lib.RowField();
}


lib.RowField.prototype.render = function () {
  var prf = lib.Element.prototype.render;
  prf.call(this);
  var title = this.title;
  title.parent = this;
  title.render();
  var inputtd = this.inputtd;
  inputtd.parent=this;
  inputtd.render();
  var input = this.input;
  input.parent = inputtd;
  input.render();
  var warning = this.warning;
  warning.parent = this;
  warning.render();
  var iv = this.initialValue;
  if (iv) {
    this.setValue(iv);
  }
}




  

// the fields are the parts

lib.Fields = function (options,fields,jqueryText) {
  this.extend(options);
  if (fields) {
    lib.installPartArray(this,fields);
  }
  if (jqueryText) {
    this.jqueryText = jqueryText;
  } else {
    this.jqueryText = '<div/>';
  }
  this.Class = lib.Fields;
  var thisHere = this;
  this.callApi =   function () {
    var vl = thisHere.value();
    var data = JSON.stringify(vl);
    var url = thisHere.apiUrl;
    if (url) {
      var cb = thisHere.apiCallback;
      $.post(url,{data:data},function (data) {
         neo.log("api","data returned",data);
         cb(data);
         
      });
    }
  }
}

lib.Fields.prototype = new lib.Assembly();



lib.Fields.prototype.bareCopy = function () {
    return new lib.Fields()
}


lib.Fields.prototype.value = function () {
  var rs = {};
  var pns = this.partOrder;
  var ln = pns.length;
  for (var i=0;i<ln;i++) {
    var k = pns[i];
    var cp = this[k];
    if ((typeof cp.value) === "function") {
      rs[k] = cp.value();
    }
  }
  return rs;
}

lib.Fields.prototype.render = function () {
  var prf = lib.Assembly.prototype.render;
  prf.call(this);
  var sb = this.submit;
  var thisHere = this;
  if (sb) {
    var r = sb.rendered;
    r.click(this.callApi);
  }
}
    

lib.Fields.prototype.warn = function (name,warning) {
  var pbn = this.parts;
  var p = pbn[name];
  if (!p) return;
  p.setWarning(warning)
}


lib.Fields.prototype.clearWarning= function (name) {
  var pbn = this.parts;
  var p = pbn[name];
  if (!p) return;
  p.clearWarning()
}

lib.TextInput = function (options) {
  this.jqueryText = '<input type="text"/>'; // to build this element, $(jqtext)
  this.css = new nit.Nit();
  this.extend(options);
  this.Class = lib.TextInput;
}


lib.TextInput.prototype = new lib.Element();



lib.TextInput.prototype.bareCopy = function () {
    return new lib.TextInput()
}

lib.TextInput.prototype.render = function () {
  var prf = lib.Element.prototype.render;
  prf.call(this);
  var r = this.rendered;
  var ival = this.initialValue;
  if (ival) {
    r.attr("value",ival);
  }
}
  
lib.TextInput.prototype.value = function () {
  var r = this.rendered;
  if (r) {
    var rs = r.attr("value");
    this.currentValue = rs;
    return rs;
  }
}


lib.TextInput.prototype.setValue = function (vl) {
  var r = this.rendered;
  if (r) {
    r.attr("value",vl);
  }

}




lib.TextArea = function (options) {
  this.jqueryText = '<TEXTAREA/>'; // to build this element, $(jqtext)
  this.css = new nit.Nit();
  this.extend(options);
  this.Class = lib.TextInput;
}


lib.TextArea.prototype = new lib.Element();



lib.TextArea.prototype.bareCopy = function () {
    return new lib.TextArea()
}

lib.TextArea.prototype.render = function () {
  var prf = lib.Element.prototype.render;
  prf.call(this);
  var r = this.rendered;
  var ival = this.initialValue;
  if (ival) {
    r.attr("value",ival);
  }
}
  
lib.TextArea.prototype.value = function () {
  var r = this.rendered;
  if (r) {
    var rs = r.attr("value");
    this.currentValue = rs;
    return rs;
  }
}


lib.TextArea.prototype.setValue = function (vl) {
  var r = this.rendered;
  if (r) {
    r.attr("value",vl);
  }

}



  
  
  
  lib.loadImages = function (ims) {
    var ln = ims.length;
    for (var i=0;i<ln;i++) {
      var ci = ims[i];
      var imel = $('<img>');
      imel.attr("src",ci);
    }
  }
  
  

  
  lib.Lightbox = function (container,rect) {
    this.container = container;
    var xt = rect.extent;
    var cr = rect.corner;
    this.left = cr.x;
    this.top = cr.y;
    this.width = xt.x;
    this.height = xt.y;
  
  }
  
  lib.Lightbox.prototype.setElementProperties = function () {
    var element = this.element;
    element.css({width:(this.width+"px"),height:(this.height+"px"),
                top:(this.top+"px"),left:(this.left+"px")});
  }
  
  
  lib.Lightbox.prototype.dismiss = function () {
    this.element.hide();
    this.shade.hide();
    this.loading.hide();
  }
  
  
  lib.Lightbox.prototype.pop = function () {
    this.setElementProperties();
    var wd = $(document).width();
    var ht = $(document).height();
    var w = $(window);
    var stop = w.scrollTop();
    var bht = w.height();
    var bwd = w.width();
    var lwd = this.width;
    /* center the fellow */
    var lft = Math.max((bwd - lwd)/2,50);
    
    var eht = Math.max(bht - (this.top) - 50,50);
    //console.log("wd "+wd+" ht "+ht+" stop "+stop+"  bht "+bht+" bwd "+bwd+" lwd "+lwd+" lft "+lft);
    this.element.css({width:lwd+"px",height:(eht+"px"),top:(stop+35)+"px",left:(lft+"px")});
    this.loading.css({top:stop+10});
    this.element.show();
    this.addClose();
    this.shade.css({width:(wd+"px"),height:(ht+"px"),
                top:"0px",left:"0px"});
    this.shade.show();
  }
  
  lib.Lightbox.prototype.insertContent = function (url) {
    var e = this.element;
    this.loading.show();
    e.empty();
    this.addClose(e);
   // var loading = $('<p class="lightboxloading">Loading...</p>');
   // e.append(loading);
    var wd = this.width-25;
    var ifrs = '<iframe class="lightboxiframe" src="'+url+'" frameborder="0" width="'+wd+'" height="100%"/>';
   // console.log(ifrs);
    var ifr = $(ifrs);
    var thisHere = this;
    ifr.load(function () {thisHere.loading.hide();});
    e.append(ifr);
  }
  

  lib.Lightbox.prototype.afterClose = function () {
    if (this.afterCloseCallback) {
      this.afterCloseCallback();
    }
  }
  lib.Lightbox.prototype.addClose = function () {
    var thisHere = this;
    this.close = $('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold;border:thin solid white;font-size:12pt;color:white;float:right">X</div>');
    this.close.click(function () {thisHere.element.empty();thisHere.dismiss();thisHere.afterClose();});
    this.element.append(this.close);
  }

  lib.Lightbox.prototype.render = function () {
    var thisHere = this;
    var loading = $('<div class="loading">Loading...</div>');
    this.loading = loading;
    this.container.append(loading);
    loading.hide();
    var element = $('<div class="lightbox"/>');
    var wd = $(document).width();
    var ht = $(document).height();
    var shades = '<div style="position:absolute;top:0px;left:0px;width:'+wd+'px;height:'+ht+'px;z-index:1500;opacity:0.8;background-color:black;"/>';

    var shade = $(shades);
    this.element = element;
    this.shade = shade;
    this.setElementProperties();
    this.container.append(element);
    this.container.append(shade);
    //this.addClose();
    
    this.dismiss();
    
  }
  
  
  
 
 
  lib.setRect = function (el,rect,canvas,ocanvas,noHeight) {
    var c = rect.corner;
    var ex = rect.extent;
    var css = {left:(c.x)+"px",top:(c.y)+"px",width:(ex.x)+"px"};
    if (!noHeight) css.height = (ex.y)+"px";
    el.css(css);
    if (canvas) {
      canvas.attr("width",rect.extent.x);
      canvas.attr("height",rect.extent.y);
    }
    if (ocanvas) {
      ocanvas.attr("width",rect.extent.x);
      ocanvas.attr("height",rect.extent.y);
    }
  }
  
  
  
  
})();
  
  


  
    
  
  