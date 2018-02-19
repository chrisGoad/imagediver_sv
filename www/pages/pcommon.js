

// common elements for neo pages



neo.pcommon = {};

(function () {
  var lib = neo.pcommon;
  var geom = exports.GEOM2D;
  var nit = neo.nit;
  
  var dom = neo.dom;

  var E = dom.El;
 /*
   var itxt = new dom.TextInput({initialValue:"abcdefg"});

   var itxtwv = new neo.ApplyWith(itxtb,[neo.bind(itxt,{"initialValue":"zub",container:cnt})],"render");
 */
 
   var rf = new dom.RowField({},dom.TextInput,"horf");
   var vr = nit.variant(rf,
    [[rf.title.css,{"font-weight":"bold","color":"green"}],
     [rf.warning.css,{"color":"red"}]]);
  var vre = vr.evaluate();
  lib.textField = vre;
  
  
  
   var rf = new dom.RowField({},dom.TextArea,"horf");
   var vr = nit.variant(rf,
    [[rf.title.css,{"font-weight":"bold","color":"green"}],
     [rf.input.attributes,{"COLS":40,"ROWS":6}],
     [rf.warning.css,{"color":"red"}]]);
  var vre = vr.evaluate();
  lib.textArea = vre;

 /*
 lib.textField = new neo.ApplyWith(new dom.RowField({},dom.TextInput,"horf"),
    {title:{css:{"font-weight":"bold","color":"green","_extensible":1}},"warning":{css:{"color":"red"}}});

 lib.usernameField = lib.textField.apply({},
     {title:{html:"Username"},"warning":{html:"Unknown username/password"}});


 lib.passwordField = lib.textField.apply({},
     {title:{html:"Password"},"warning":{html:"Unknown username/password"}});

 */

 lib.button = E({},'<input type="button"/>');

  vr = nit.variant(lib.button,[['attributes',{value:"Sign in"}]]);
  lib.signin = vr.evaluate();
  /*
  lib.loginCallback = function (data) {
    alert(data);
  }
  lib.loginFields= new dom.Fields({apiUrl:"/api/login",apiCallback:lib.loginCallback},[{username:lib.usernameField},{password:lib.passwordField},{submit:lib.signin}],'<table/>');
 */


  
  lib.genLogo = function () {
    var rs = $('<div class="logo"/>');
    
    var left = $('<span class="logoLeft">image</div>');
    var right = $('<span class="logoRight">Diver</div>');
    
    rs.append(left);
    rs.append(right);
    return rs;
  }

})();

