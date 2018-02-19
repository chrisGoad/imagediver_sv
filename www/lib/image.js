


var IMAGE = {};
exports.IMAGE = IMAGE;

//var neo = require('/var/www/neo.com/lib/neo.js').neo;



(function () {
  var lib = IMAGE;
  var util  = idv.util;
  //var util = idv.util;
   // var util  = idv.util;

  var Process;
  var geom;
  if (typeof require == "function") { // at the server
    Process = require("process").Process;
    geom = require('/var/www/neo.com/lib/geom2d.js').GEOM2D;
  } else {
    geom = exports.GEOM2D;
  }
  lib.process = null;
  lib.system = function (cmd) {
    lib.allocProcess();
    return lib.process.system(cmd);
  }
  
  lib.allocProcess = function () {
    if (!lib.process) {
      lib.process = new Process();
    }
  }
  // turn the untyped imD into an object
  lib.Image = function (imD) {
    var imDimx = imD.dimensions.x;
    var imDimy = imD.dimensions.y;
    var imDim = new geom.Point(imDimx,imDimy);
    this.extent = imDim;

    var tilingDir = imD.tilingDir; // the old way (as of 12/17/10)
    if (tilingDir && 0) {
      this.tilingDir = imD.tilingDir;
      this.tilingUrl = imD.tilingUrl;
    } else { // the new way: compute the directory,url from imname,user
      var user = imD.owner;
      if (!user) {
        user = imD.user; // for backward compatibility
      }
    
      
      var imname = imD.name;
      var lin = user.lastIndexOf("/");
      var uname = user.substr(lin+1);
      this.tilingDir = "/mnt/ebs1/imagediver/tilings/"+uname+"/"+imname+"/";
      /*
       if (idv.isDev) {
        var domain = "dev.imagediver.org";
      } else {
        domain = "imagediver.org";
      }
      */
      var bucket = imD.bucket;
      if (!bucket) {
        bucket = "idv_"+uname;
      }
      //bucket = "idv";
      //domain = "s3.amazonaws.com";
      //this.tilingUrl = "http://"+domain+"/idv/tilings/"+uname+"/"+imname+"/";
      //domain = "imagediver.s3-website-us-east-1.amazonaws.com"
      //domain = bucket+".s3.amazonaws.com";
      domain = idv.cfDomain ;
      this.tilingUrl = "http://"+domain+"/tilings/"+uname+"/"+imname+"/";
      this.name = imname;
      this.user = user;

    }
  }
  
  // imageSize is the dimension in pixels of the tiles we are producing
 //   var pt  = new lib.Tiling(im0,256,0.5,"/var/www/neo.com/tilings/liberty_1/",null,0);

  lib.Tiling = function (image,tileImageSize,aspectRatio,depthIncrement) {
    var di = depthIncrement?depthIncrement:0;
    this.image = image;
    var directory = image.tilingDir;
    var url = image.tilingUrl;
    var imxt = image.extent;
    var height = imxt.y;
    var width = imxt.x;
    //var maxdim = Math.max(height,width);
    // specialized to images whose actual aspect ratio is less than the stated value (eg panoramas)
    var topTileSizeH = Math.pow(2,Math.ceil(Math.log(height)/Math.LN2));
    var topTileSizeW= Math.pow(2,Math.ceil(Math.log(width)/Math.LN2));
    var topTileSize = Math.max(topTileSizeH,topTileSizeW);
 // recursion depth
    // subdivide until tile size = target image size (ie no loss in resolution)
   //ystem.stdout("DEPTH INC "+di+"\n");
    //util.log("tiling","topTileSize",topTileSize,"tileImageSize",tileImageSize);
    this.depth =   Math.ceil(Math.log(topTileSize/tileImageSize)/Math.LN2)+di;// -1 for this app
    //this.depth = 2;
    this.aspectRatio = aspectRatio; // of the tiles
    this.topTileSize = topTileSize;
    this.tiles = [];
    this.tilesById = {};

    this.directory = directory; // directory on the server
    this.url = url; // url of web directory from client
    this.tileImageSize = tileImageSize; // the  dimension of the jpg (or png) for a tile.
  }
    
  // Tiling is the description of the tiling as a whole.
  // this is width and height of the image in pixels, and the topTileSize. topTileSize should be at least half
  // height, so there are at most two rows (this is panorama oriented).
  
  
  
    
  //A  Tile within a tiling has the form  {topx:,topy:,path:,x:,y:,size:} ; it represents a rectangle with upper 
  // left corner at x,y 
  // the path is a sequence of integers between 0 and 3 (as in gigapan  http://geocoder.us/gigapan/embed.html)
  // 0 is upper left corner, 1 is upper right, 2 lower left, and 3 lower right.
  
  
  lib.Tile = function (tiling,path) {
    this.tiling = tiling;
    this.path = path;
  
  }
  
  
  // take into account the fact that the tile might be at the edge of the image,
  // and compute the actual extent of the tile in pixels, and the extent of its coverage in the original image
  
  lib.Tile.prototype.computeExtent = function () {
    if (this.outsideImage) return;
    var tl = this.tiling;
    var ar = tl.aspectRatio;
    var tim = tl.image;
    var imxt = tim.extent;
    var imwd = imxt.x;
    var imht = imxt.y;
    var imsz = tl.tileImageSize;
    var srcszx = this.size;
    var srcszy = ar * srcszx;
    var cr = this.corner;
    var x = cr.x;
    var y = cr.y;
    var ex = Math.min(imwd-x,srcszx); // only grab as many pixels as there are
    var ey = Math.min(imht-y,srcszy);
    if (ey < 0) {
      debugger;
    }
    var imszx = Math.floor(imsz * (ex/srcszx));
    var imszy = Math.floor(ar*imsz * (ey/srcszy));
    //if ((imszx < 256) || (imszy < 256)) util.log("tile",this.id,imszx,imszy,ex,ey);
    this.extent = new geom.Point(imszx,imszy); // the extent of the tile image
    this.coverage = new geom.Point(ex,ey); //the number of pixels covered in the originl image by this tile
   
  }
  
  lib.Tiling.prototype.newTile = function (path) {
    var id = "r"+path.join("");
    var byId = this.tilesById;
    var tl = byId[id];
    if (tl) return tl;
    var rs = new lib.Tile(this,path);
    rs.id = id;
    var ln = path.length;
    var tim = this.image;
    var timxt = tim.extent;
    var tts = this.topTileSize;
    var csz = tts;
    var cx = 0;
    var cy = 0;
    var ar = this.aspectRatio;
    for (var i=0;i<ln;i++) {
      csz = csz/2;
      cpe = path[i];
      switch (cpe) {
        case 1:
          cx = cx + csz;
          break;
        case 2:
          cy = cy + ar*csz;
          break;
        case 3:
          cx = cx + csz;
          cy = cy + ar*csz;
          break;
      }
    }
    rs.corner = new geom.Point(cx,cy);
    rs.size = csz; // this is the size without taking into consideration that the tile might be chopped off at the edget of the image
    
    rs.id = id;
    var outside = (cx >= timxt.x) || (cy >= timxt.y); // this tile is outside of the original image
    byId[id] = rs;
    if (!outside) this.tiles.push(rs);
    rs.outsideImage = outside;
    rs.computeExtent();
    return rs;
  }

  lib.Tile.prototype.parent = function () {
    var path = this.path;
    if (path.length == 0) return null;
    var ppath = path.slice(0,path.length-1);
    var pid = "r"+ppath.join("");
    return this.tiling.tilesById[pid]
  }
    

  lib.Tile.prototype.createImageFile = function () {
    if (this.outsideImage) return;
    var xt = this.extent;
    var cv = this.coverage;
    var cx = cv.x;
    var cy = cv.y;
    var ex = xt.x; 
    var ey = xt.y;
    var tl = this.tiling;
    var ar = tl.aspectRatio;
    var tim = tl.image;
    var imxt = tim.extent;
    var imwd = imxt.x;
    var imht = imxt.y;
    var imsz = tl.tileImageSize;
    var cr = this.corner;
    var x = cr.x;
    var y = cr.y;
    var dstfile = (tl.directory)+(this.id)+".jpg";
    var fl = new File(dstfile);
    if (fl.exists()) {
      system.stdout(dstfile + " exists\n\n");
      return;
    }
    var cmd = "convert -size "+imwd+"x"+imht+" -depth 8 -extract "+cx+"x"+cy+"+"+x+"+"+y+
               " -resize "+ex+"x"+ey+" "+(tim.filename)+"[1] "+dstfile;
    if (typeof system=="undefined") return cmd;
     system.stdout(cmd + "\n");
     lib.system(cmd);
     system.stdout("done\n\n");
    
      
  }
  
  lib.Tiling.prototype.createImageFiles = function () {
    var tiles = this.tiles;
    var ln = tiles.length;
    for (var i=0;i<ln;i++) {
      var ct = tiles[i];
      ct.createImageFile();
    }
  }
  
  //var cmd = "convert -size 25053x4354 -depth 16 -extract 4096x4096+10000+0 -resize 200x200 /mnt/ebs0/projects/panorama/Panorama1924.TIF /var/www/neo.com/images/panorama/p0_r.jpg";


  // create the tile for path, and its descendants

  lib.Tiling.prototype.createTiles = function (path) {
    if (typeof path=="undefined")  path = [];
    var pathc = path.concat();
    var tl = this.newTile(pathc);
    if (tl.outsideImage) return;
    var ln = path.length;
    var d = this.depth;
    if (ln < d) {
      path.push(0);
      this.createTiles(path);
      path.pop();
      path.push(1);
      this.createTiles(path);
      path.pop();
      path.push(2);
      this.createTiles(path);
      path.pop();
      path.push(3);
      this.createTiles(path);
      path.pop();
    }
  }
      

 lib.toFullsizeJpeg = function (im) {
  var fln = im.filename;
  var sp = fln.split(".");
  var wext =  sp.slice(0,-1);
  wext.push("jpg");
  var jfln = wext.join(".");
   var cmd = "convert "+fln+"[1] "+jfln;
  system.stdout(cmd);
    lib.system(cmd);

   return cmd;
 }
 
 lib.toScaledJpeg =  function (im,dstnm) {
  var fln = im.filename;
  var xt = im.extent;
  var sc = 700/xt.x;
  var scp = Math.floor(sc * 100);
  var dstfl = "/var/www/imagediver.com/nottiled/"+dstnm+".jpg";

  var cmd = "convert "+fln+" -resize "+scp+"% "+dstfl;
  system.stdout(cmd);
   lib.system(cmd);

   return cmd;
 }
  
  lib.loadedImages = {}; // by src
  
  lib.imageLoadQueue = [];
  
  lib.imagesLoading = [];

  // if a long list of images are set up for load simultaneously, a new image request always gets last
  // priority (at least in chrome).  Hence this sequential image loader
  
  lib.addToImQEnd = function (imel,src,whenLoaded) {
    var el = {element:imel,src:src,whenLoaded:whenLoaded};
    lib.imageLoadQueue.push(el);
  }
  
  
  lib.addToImQFront = function (imel,src,whenLoaded) {
    var el = {element:imel,src:src,whenLoaded:whenLoaded};
    lib.imageLoadQueue.unshift(el);
  }
  
  lib.execImQ = function () {
    var imq = lib.imageLoadQueue;
    if (imq.length > 0) {
      var el = imq.shift();
      lib.imagesLoading.push(el);
      var imel = el.element;
      var src = el.src;
      var whn = el.whenLoaded;
      util.tlog("starting load of "+src);
      imel.load(function () {
        util.tlog("LOADED "+src);
        if (whn) {
          whn(imel);
        }
        el.loaded = true;
      });
      imel.attr("src",src);
      return true;
    } else {
      return false;
    }
  }
  
  lib.checkImagesLoading = function () {
    var rs = [];
    var ln = lib.imagesLoading.length;
    if (ln > 0) {
      for (var i=0;i<ln;i++) {
        var el = lib.imagesLoading[i];
        if (!el.loaded){
          rs.push(el);
        }
      }
      lib.imagesLoading = rs;
      return rs.length;
    } else {
      return 0;
    }
  }
  
  lib.imqTick = function () {
    var numloading = lib.checkImagesLoading();
    if (numloading > 0) return true;
    var exq = lib.execImQ();
  //  var exq = lib.execImQ();
    return exq;
  }
  
  
  lib.imqTicker = function () {
    var tk = lib.imqTick();
    if (tk) {
      lib.imqTickerActive = true;
      setTimeout(lib.imqTicker,50);
    } else {
      lib.imqTickerActive = false;
    }
  }
  
  lib.loadImage = function (imel,src,whenLoaded,highPriority) {
    if (highPriority) {
      lib.addToImQFront(imel,src,whenLoaded);
    } else {
      lib.addToImQEnd(imel,src,whenLoaded);

    }
    if (!lib.imqTickerActive) lib.imqTicker();
 /*   imel.load(function () {
     //if (src.indexOf("/1.jpg") > 0)
      util.tlog("LOADED "+src);
      if (lib.loadedImages[src]) util.slog("RELOADING",src);
      lib.loadedImages[src] = 1;
      if (whenLoaded) whenLoaded(imel);
    });
    
    imel.attr("src",src);
 */
  }


})();

