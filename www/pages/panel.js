(function () {
  
  var lib = page;
  var geom = exports.GEOM2D;
  var imlib = exports.IMAGE;
  var com = idv.common;
  var util  = idv.util;

  
  lib.scaleDivForPanel = function (panel) {
    return;
    util.log("scale",panel.name);
    if (panel.selfScaling) return;
    var scalable = panel.scalable;
    var iht = panel.height;
    if (iht) {
      if (scalable) {
        var ht = lib.scale*iht;
      } else {
        ht = iht;
      }
    } else {
      ht = null;
    }
    lib.panelDiv.css("height",ht);
  }
  
  
  lib.resizeCurrentPanel = function () {
    if (!lib.currentPanel) return;
    var pn = lib.currentPanel.panel;
    var resizer = pn.data("resizer");
    if (resizer) {
      resizer();
    }
  }
   
   
  // a panel, rather than a panelName, can be passed
  lib.selectPanel = function (panelName,initData,dontCallInitializer) {
    if (lib.currentPanel) {
      //if (panelName == lib.currentPanel.name) return;
      lib.lastPanel = lib.currentPanel;
    }
    if (typeof (panelName) != "string") {
      panelName = panelName.name;
    }
    var selPanel = lib.panels[panelName];
    //if (panelName == "selectedSnap") debugger;
  //  var pnh = selPanel.nominalHeight;
  //  if (!pnh) {
  //    pnh = lib.defaultPanelNominalHeight;
  //  }
  //  lib.panelSdiv.height = pnh;
    //lib.placeDivs();
    var selActv = selPanel.activator; 
    for (var nm in lib.panels) {
      var cpan = lib.panels[nm];
      var cpn = cpan.panel;
      var actv = cpan.activator;
    
        
     
      if (!cpn) continue;
      if (nm == panelName) {
        if (actv) {
          lib.selectClickable(actv);
        }
        if (lib.vp) {
          if (!lib.showSnapsMode) lib.vp.clearOverlays();
        }
        cpn.show();
        lib.scaleDivForPanel(cpan);
        lib.currentPanel = cpan;
        var initializer = cpn.data("initializer");
        if (initializer && !dontCallInitializer) {
          if (initData) {
            initializer(initData);
          } else {
            initializer();
          }
        }
        
      } else {
        if (actv && selActv) { // if no activator for the newly selected panel, don't mess with the activator state
          lib.enableClickable(actv);
        }
        cpn.hide();
      }
    }
  }
  
  /*
  lib.showLastLowerPanel = function () {
    var llp = lib.lastLowerPanel;
    if (llp) {
      lib.showLowerPanel(llp);
    }
  }
  */
    
  lib.setPanelPanel = function (name,panel) {
    var pn =lib.panels[name];
    if (!pn) {
      pn = {panel:panel,name:name};
      lib.panels[name] = pn;
      return pn;
    }
    pn.panel=panel;
    return pn;
  }
  
  lib.setPanelNominalHeight = function (name,ht) {
    var pn =lib.panels[name];
    pn.nominalHeight = ht;
  }
    
  
  
  lib.setPanelActivator = function (name,activator) {
    var pn =lib.panels[name];
    if (!pn) {
      pn = {activator:activator,name:name};
      lib.panels[name] = pn;
      return pn;
    }
    pn.activator=activator;
    return pn;
  }
  
  lib.hookupPanelActivator = function (name) {
    var pnd = lib.panels[name];
    var actv = pnd.activator;
    if (pnd && actv) {
      lib.setClickMethod(actv,function (){lib.selectPanel(name);})
      actv.mousedown(function (e){e.preventDefault();});
    }
    
  }
  
  lib.hookupPanelActivators = function () {
    for (nm in lib.panels) {
      lib.hookupPanelActivator(nm);
    }
  }
  
  lib.pathLast = function (p) {
    var sp = p.split("/");
    var ln = sp.length;
    return sp[ln-1];
  }
  
  lib.setPanelDivHeight = function (ht) {
    lib.panelDiv.css("height",ht);
    var ofs = lib.panelDiv.offset();
   // var btop = ofs.top + ht;
   // lib.bottomDiv.css("top",btop);
  }
  
})();

