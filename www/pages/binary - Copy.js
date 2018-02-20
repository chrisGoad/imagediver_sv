


var page = {};

//(function () {
  var lib = page;
  var rwd = 1;
  var dim = 256;
  var dim = 243;
    var base = 3;
  var dim = 1024;
  var dpydim = 1000;// good one
  var dpydim = 1021; //good one too
 // dpydim = 1014;
  dpydim = 1024;
  var base = 2;
  
  /*
  dpydim = 729;
  dim = 729;
  base = 3;
  */
  
  var twd = dim * rwd;
  
  var ctab = ["rgb(250,0,0)","rgb(200,0,50)","rgb(150,0,100)","rgb(100,0,150)","rgb(50,0,200)","rgb(0,0,250)"];
   var ctab = ["rgb(250,250,250)","rgb(200,200,200)","rgb(150,150,150)","rgb(100,100,100)","rgb(50,50,50)","rgb(0,0,0)"];
   var ctab = ["rgb(250,250,250)","rgb(250,250,200)","rgb(200,250,200)","rgb(150,200,150)","rgb(100,150,100)","rgb(50,100,50)","rgb(0,50,0)"];
  // var ctab = ["white","yellow","red","green","magenta","black"];

  function green(n) {
    var fc = 50;
    var r = 250-(n+1)*fc;
    var g = 250-(n*fc);
    var b = 250 - (n+1)*fc;
    return "rgb("+r+","+g+","+b+")"
  }
  
  
  function grey(n) {
    var fc = 30;
    var v = 250 - n*fc;
    if (v < 0) return "rgb(255,0,0)";
  
    return "rgb("+v+","+v+","+v+")"
  }
  
  function red(n) {
    var fc = 30;
    var v = 100 + n*fc;
    if (v < 0) return "rgb(0,0,255)";
    var r = v;
    var g = 0;
    var b = 0;
    return "rgb("+r+","+g+","+b+")"
  }
  
  
  
  function bluee(n) {
    var fc = 30;
    var v = 100 + n*fc;
    if (v > 255) return "rgb(0,0,255)";
    var b = v;
    var g = 0;
    var r = 0;
    return "rgb("+r+","+g+","+b+")"
  }
  
  
  
  function greyy(n) {
    var fc = 30;
    var v = 100 + n*fc;
    if (v > 255) return "rgb(0,0,255)";
    var r = v;
    var g = v;
    var b = v;
    return "rgb("+r+","+g+","+b+")"
  }
  
  
  
  
  
  function blue(n) {
    var fc = 25;
    var sp = 150;
    var r = 0;
    var b = sp-(n*fc);
    var g = 0;
    return "rgb("+r+","+g+","+b+")"
  }
  
  ctab = [];
  for (var i=0;i <4; i++) {
    ctab.push(green(i));
  }
   for (var i=0;i <4; i++) {
    ctab.push(blue(i));
  }
  ctab = []
  
  for (var i=0;i <5; i++) {
    ctab.push(grey(i));
  }
  
  for (var i=0;i <8; i++) {
    ctab.push(red(i));
  }
    ctab = []

  for (var i=0;i <10; i++) {
    //ctab.push(greyy(i));
    ctab.push(red(i));
    ctab.push(blue(i));
  }
  
     ctab = []

  for (var i=0;i <20; i++) {
    //ctab.push(greyy(i));
    var cli = 250 - 15*i;
    var cli2 = 10 * i;
    ctab.push("rgb("+cli+","+cli+","+cli+")");
    ctab.push("rgb(0,"+cli2+",0)");
  }
  
     ctab = []

  for (var i=0;i <20; i++) {
    //ctab.push(greyy(i));
    var cli = 250 - 15*i;
    var cli2 = 10 * i;
    ctab.push("white");
    ctab.push("black");
     ctab.push("red");
     ctab.push("yellow");
     ctab.push("green");
  }
  /*
  ctab = []
  for (var i = 0;i<8;i++) {
    ctab.push("black");
  }
  for (var i=0;i <7; i++) {
   ctab.push(greyy(i));
    ctab.push(red(i));
    ctab.push(blue(i));
  }

  */
  function drawCell(x,y,n) {
    //console.log("drawCell",x,y,n);
    if (y >= dpydim) return;
    var xp = x * rwd;
    var yp = twd - (y+1)*rwd;
    
    if (n<0) {
      c = "#000000"
    } else {
      if (n >= ctab.length) var c = "rgb(250,0,0)";
      else 
      var c = ctab[n];

    }
    lib.ctx.fillStyle = c;
    var wd = rwd;
    lib.ctx.fillRect(xp,yp,wd,wd);
  }
  lib.initialize = function(options) {
    var cn = $('.content');
    $('body').css({"background-color":"black"});
    cn.css({color:"white",width:"750px","margin-bottom":"30px","margin-left":"auto","margin-right":"auto"});
    var cnv = $('<canvas width="1030" height="1030">');
    cnv.css({"background-color":"black"});
    cn.append(cnv);
    lib.ctx = cnv[0].getContext('2d');
    drawCell(2,2,0);
    drawCell(3,3,1);
    initGrid();
    drawGrid();
    
    
    
      
  }
  
  lib.grid = Array(dim*dim);
  
  function setGrid(n,m,v) {
    var c = m * dim + n;
    lib.grid[c] = v;
  }
  
  function getGrid(n,m) {
    var c = m * dim + n;
    var rs = lib.grid[c];
    //if (rs>=0) console.log("grid",c);
    return rs;
    
  }
  
  function initGrid() {
    var ub = dim;
    for (var i = 0;i<ub;i++) {
      for (var j = 0;j<ub;j++) {
        setGrid(i,j,-1);
      }
    }
    var x = 1;
    var xs = 1;
    while (xs <= dim*dim) {
      lib.grid[xs-1] = 0;
      //console.log(xs);
      xs = xs * base;
    }
  }
  
  function nextGap(cidx) {
    var tdim = dim*dim;
    if (cidx >=  tdim) return null;
    var ci = cidx+1;
    while ((ci < tdim) && (lib.grid[ci] < 0)) {
       ci++;
    }
    if (ci >= tdim) return null;
    return [cidx,ci];
  }
  
  function allGaps() {
    var rs = [];
    var ng = nextGap(0);
    while (ng) {
      rs.push(ng);
      ng = nextGap(ng[1]);
    }
    return rs;
  }
  
  function fillGap5(gp,n,v) {
    var lb = gp[0];
    var ub = gp[1];
    if (n >= (ub-lb)) return false;
    var idx0 = lb+n;
    var idx1 = ub-n;
    var idx0c = coords(idx0);
    lib.grid[idx0] = v;
    var idx1c = coords(idx1);
    lib.grid[idx1] = v;
    drawCell(idx0c[0],idx0c[1],v);
    drawCell(idx1c[0],idx1c[1],v);
    return true;
    
  }
  
  /*
  function fillGap6(gp,v) {
    var pw2 = base;
    var gpw = gp[1]-gp[0];
    while (pw2 < gpw) {
      fillGap5(gp,pw2,v);
      pw2 = base * pw2;
    }
  }
  */
  var ag;
  
  function fillAllGaps0(n,v) {
    var ln = ag.length;
    var cnt = 0;
    for (var i=0;i<ln;i++) {
      if (fillGap5(ag[i],n,v)) cnt++;
    }
    return cnt;
    
  }
  
  
  function coords(i) {
    var y = Math.floor(i/dpydim);
    var x = i - y*dpydim;
    return [x,y];
  }
  
  
  function fillGap(gp,v) {
    var lb = gp[0]+1;
    var ub = gp[1]+1;
    var pw2 = 1;
    var gsz = ub-lb;
    while (pw2 < gsz) {
      var idx0 = lb + pw2 -1;
      idx0c = coords(idx0);
      lib.grid[idx0] = v;
      var idx1 = ub - pw2 - 1;
      idx1c = coords(idx1);
      lib.grid[idx1] = v;
      
      pw2 = pw2 *base;
      drawCell(idx0c[0],idx0c[1],v);
      drawCell(idx1c[0],idx1c[1],v);
      
    }
    
  }
  
  var cv;
  
  function fillGaps1(ng,v) {
    if ( !ng) return;
    //var ng = nextGap(0);
    fillGap(ng,v);
    var lg = ng;
    var sameLine = true;
    ng = nextGap(ng[1]);
    while (sameLine && ng) {
      lg0 = lg[0];
      ng1 = ng[1]
      lg0c = coords(lg0);
      ng1c = coords(ng1);
      if (lg0c[1]<ng1c[1]) sameLine = false;
      fillGap(ng,v);
      ng = nextGap(ng[1]);

    }
    
    setTimeout(function () {fillGaps1(ng,v)},10);
  }
  
  function fillGaps(v) {
    var ng = nextGap(0);
    fillGaps1(ng,v);
  }
  
  var cs = 1;
    
  var cpw = 1;
  function substep() {
    var cnt = fillAllGaps0(cpw,cs)
    console.log("count",cpw,cnt);
    cpw = base * cpw;
    return cnt;
  }
  
  var sscnt = 0;
  function substep1() {
    if (substep() == 0) {
      cs++;
      cpw=1;
      return;
    }
    sscnt++;
    setTimeout(substep1,100);
  }
  
  function step() {
    ag = allGaps();
    substep1();
    return;
    while (true) {
      if (substep()==0) {
        cs++;
        cpw = 1;
        return;
      }
    }
  }
   
  
  function drawGrid() {
    var ub = dim;
    for (i = 0;i<ub;i++) {
      for (j = 0;j<ub;j++) {
        var gv = getGrid(i,j);
        //console.log(i,j,gv);
        drawCell(i,j,gv);
      }
    }    
  }
  
  
  function divideBy(n,m) {
    var d = n/m;
    var f = Math.floor(d);
    if (f == d) {
      return d;
    }
    return undefined;
  }
  
  
  var primes = [2]
  
  function isPrime(n) {
    var ln = primes.length;
    var sqrt = Math.floor(Math.sqrt(n));
    for (var j=0;j<ln;j++) {
      var jp = primes[j];
      if (jp > sqrt) {
        primes.push(n);
        return true;
      }
      if (divideBy(n,jp)) {
        return false;
      }
    }
  }

  function primesUpTo(n) {
    primes = [2];
    for (i=3;i<=n;i++) {
      isPrime(i);
    }
  }
  function repeatDivide(n,m) {
    var cnt = 0;
    var rs = n;
    while (true)  {
      nrs = divideBy(rs,m);
      if (nrs == undefined) {
        return [cnt,rs];
      }
      rs = nrs;
      cnt++;
    }
  }
  
  
  function numFactors(n) {
    var rs = 0;
    var sqrt = Math.ceil(Math.sqrt(n));
    var cnt = 0;
    var ln = primes.length;
    for (var i=0;i<ln;i++) {
      var cp = primes[i];
      if (cp > sqrt) return cnt;
      var rpd = repeatDivide(n,cp);
      var cnt = rpd[0] + cnt;
    }
  }
  
 primesUpTo(10000);
 
 function setGridFromFactors() {
   for (var i=0;i<dim*dim;i++) {
    if (divideBy(i,1000)) console.log(i);
    lib.grid[i] = numFactors(i);
   }
   drawGrid();
 }
 
 function randomGrid() {
    for (var i=0;i<dim*dim;i++) {
      var r = Math.random();
      if (r > 0.5) lib.grid[i]=1; else lib.grid[i]=0;
    }
    drawGrid();
 }
 
//})();


