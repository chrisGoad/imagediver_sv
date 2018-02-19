


/*

Nits = evaluation graph.

Nits have an evaluation method.  The eval step on N produces a new node E, the evaluation of N, with
a _value link pointing to E from N, and a _from link pointing back.

Two special kinds of Nits:

  apply(N,{n1:v1,n2:v2....})
  
  to evaluate this, copy N, evaluate v1 ... vn, then assign to children of N named n1... then evaluate N
  
  an instantiation is a pair (N,bindings)
  instantiation in place is just running the bindings, on N, by side effect
  
  evalWith(N,[i0,i1.... ])
  
  means instantiate i0 ... in place, evaluate N and then undo the instantiations.
  
  
  
  example:
  
    in jquery land.  JNits represent jquery lemnts. A JNit has a container field, typically.
    The render method produces a rendered propery, which is a jquery node, which is then appended to the container.
    
    JNit also has attributes css fields, which are stuck into the rendered fellow r with r.attr, r.css
    
    consider a JNit which has  part way down there with css:{color:red}
    
    
    
    
Binder = (value, extension of the value)

applyWith(x,Binders...)

the fellows within x that are affected by applying the Binders are the values in those Binders.
We need a deep copy of x which rebuilds the part of x that refers to one of the values.

Method:  recurse through the nits of X, marking them __visited. when a node N with X is in the list of values,
return the bound value of N, ow return null (meaning nothing need be done).
  
  


*/



var neo = {};

neo.nit = {};

(function () {
  lib = neo.nit;
  
  
  lib.Nit = function () {};
  
  lib.Nit.prototype.evaluate = function () {
    return this;
  };
  
  lib.isNit = function (v){
   return lib.Nit.prototype.isPrototypeOf(v);
  };
  
  
  // for right now just go for deep copy within Nit land
  
  lib.Nit.prototype.deepCopy = function (dontClearCopyData) {
    var copied = [];
    function innerCopy(x) {
      if (x == null) return null;
      var tp = typeof(x);
      if (tp != "object") {
        return x;
      }
      if (!lib.isNit(x)) return x;
      var cp = x._copy;
      if (cp !== undefined) {
        return cp;
      }
      var rs = x.bareCopy(); // does not copy own properties, since those are copied below
      x._copy = rs;
      copied.push(x);
      for (var k in x) {
        if (k == "_copy") continue;
        // note that because there is no "hasOwnProperty criterion here, properties are moved up from prototypes
       // if (x.hasOwnProperty(k)) {
          var kv = x[k];
          var ckv = innerCopy(kv);
          rs[k] = ckv;
       // }
      }
      return rs;
    }
    rs = innerCopy(this);
    if (dontClearCopyData) {
      this._copied = copied;
      return rs;
    }
    var ln =  copied.length;
    for (var i = 0;i<ln;i++) {
      var cp = copied[i];
      delete cp._copy;
    }
    return rs;
  }
          
        
  
    
    
      
  
  // returns a copy with the new values inserted. does not cruise up through prototypes
  /* NOT IN USE BUT WILL REPLACE DEEP COPYING LATER 
  lib.insertNewValues = function (x,values,replacements) {
    var ln = values.length;
    for (var i=0;i<ln;i++) {
      var cv = values[i]
      var r = replacements[i];
      cv._replacement = r;
    }
    var visited = [];
    // first phase: need to build the inverse graph: which for each node has a property _parents
    // (idea _children = nodes referenced, _parents = nodes which reference.
    // Then for each replaced node, need to mark hereditary parents as needing replacement.
    // finally copy and replace.
    function addParent(x,p) {
      var tp = typeof(x);
      if (tp != "object") return;
      if (x._parents === undefined) { // we need to recurse on this fellow
        if (p) {
          x.__parents = [p];
        } else {
          x.__parents = [];
        }
        if ($.isArray(x)) {
          var ln  = x.length;
          for (var i=0;i<ln;i++) {
            var ch = x[i];
            addParent(ch,x);
          }
          return;
        }
        for (var k in x) {
          if (x.hasOwnProperty(k)) {
            var kv = x[k];
            addParent(kv,x);
          }
        }
      } else {
        x.__parents.push(p);
      }
    }
    addParent(x,null);
    
  }
  */
  neo.log = function (tag) {
   // return;
  // if (!$dt.fb) return;
    if (neo.theIEVersion  || ((typeof window != "undefined") && (typeof console=="undefined"))) return;
   if (($.inArray("all",neo.activeConsoleTags)>=0) || ($.inArray(tag,neo.activeConsoleTags) >= 0)) {
     if (typeof window == "undefined") {
       system.stdout(tag + JSON.stringify(arguments));
    } else {
      console.log(tag,arguments);
    }
   }
  };
  
  
  neo.error = function (a,b) {
    console.log("Error "+a,b);
    foob();
  };
  
  
  // match the signature of jQuery.extend, though not the full implementation
  // also only copy "ownProperties" unlike th Jquery function
  lib.extend = function (deep,target) {
    var ln = arguments.length;
    if (deep) lib.error("deep not yet supported");
    for (var i=2;i<ln;i++) {
      var m = arguments[i];
      for (var j in m) {
        if (m.hasOwnProperty(j)) {
          target[j] = m[j];
        }
      }
    }
    return target;
  };
  
  
  
  
  lib.Nit.prototype.extend = function (src) {
    if (src) {
      lib.extend(null,this,src);
    }
  };
  
  
  lib.Nit.prototype.bareCopy = function () {
    return new lib.Nit();
  }
  
  lib.Nit.prototype.copy = function () {
    var rs = new lib.Nit();
    lib.extend(null,rs,this);
    return rs;
  };
  
  
 // applySettings(x,[s0,s1,s2,...])
  
  
  // A setting is an object together with an property extension for the object
  
  lib.Setting = function (nit,extension) {
    this.nit = nit;
    this.extension = extension;
  };
  
  lib.Setting.prototype = new lib.Nit();
  
  lib.pathSelect = function (v,p) {
    if (p == "") return v;
    var sp = p.split(".");
    var ln = sp.length;
    var rs = v;
    for (var i=0;i<ln;i++) {
      if (rs == null) return undefined;
      var tp = typeof(rs);
      if (tp == "object") {
        rs = rs[sp[i]];
      } else {
        return undefined;
      }
    }
    return rs;
  }
  
  lib.Nit.prototype.pathSelect = function (p) {
    return lib.pathSelect(this,p);
  }
  
  // vnit is the nit of the variant in which this setting appears
  lib.Setting.prototype.evaluate = function (vnit) {
    var nit = this.nit;
    if (typeof(nit) == "string") {
      if (!vnit) lib.error("no operand for setting");
      var path = nit;
      nit = lib.pathSelect(vnit,path);
    } 
    var cnit = this.nit.deepCopy();
    cnit.extend(this.extension);
  }
    
    
  
  lib.Variant = function (original,settings) {
    this.original = original;
    var rst = [];
    var ln = settings.length;
    for (var i=0;i<ln;i++) {
      var cs = settings[i];
      if ($.isArray(cs)) {
        var st = lib.setting(cs[0],cs[1]);
      } else {
        st = cs;
      }
      rst.push(st);
    }
  
    this.settings = rst;
  }
  
  lib.variant = function(original,settings) {
    return new lib.Variant(original,settings);
  }
  
  lib.Variant.prototype.addSettings = function (moreSettings) {
    return new lib.Variant(this.original,this.settings.concat(moreSettings));
  }
    
  
  lib.Variant.prototype.evaluate = function () {
    var o = this.original;
    var rs = o.deepCopy(true);
    var settings = this.settings;
    var ln = settings.length;
    for (var i=0;i<ln;i++) {
      var cs = settings[i];
      var csnit = cs.nit;
      if (typeof(csnit) == "string") {
        var target = rs.pathSelect(csnit);
      } else {
        target = csnit._copy;
      }
      if (target == null || typeof(target) != "object") continue;
      target.extend(cs.extension);

    }
    var copied = o._copied;
    var cln = copied.length;
    for (var i=0;i<cln;i++) {
      var cc = copied[i];
      delete cc._copy;
    }
    return rs;
  }
  
      
  
  
  lib.setting = function(nit,args) {
    return new lib.Setting(nit,args);
  };
  
  
  
    
  
  lib.vanillafy = function (nit) {
    var rs = {};
    for (var k in nit) {
    //  if (nit.hasOwnProperty(k)) {
        var pv = nit[k];
        if (typeof(pv) != "function") {
          rs[k] = pv;
        }
  //  }
    }
    return rs;
  };
      
}
)();
    
  
  
    
    
    
/*  
  
  

var  ff = function () {
  this.a = 22;
}

var gg = function () {
  this.b = 33;
}

var f = new ff();

gg.prototype = f;

var g = new gg();

hh = function () {
  this.c = 66;
}

hh.prototype = g;
h = new hh();

f.isPrototypeOf(h);
h.constructor == gg;

*/



  
  
  