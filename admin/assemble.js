/*

A very tiny and simple webpack-ish tool.
Concats files, and babels and minimizes them.
Usage:

cd c:\imagediver
node admin/assemble.js <module>

eg
node  admin/assemble.js login
*/
var what = process.argv[2]; 

 
var fs = require('fs');
//var minify = require('minify');
var zlib = require('zlib');    
var babel = require("babel-core");

let commonJsFiles = ["/pagedown/Markdown.Converter.js","/lib/util.js","/lib/geom2d.js","/lib/image.js","/js/image_2.1.js",
                 "/js/topbar.js","/js/image_2.2.js","/pages/common.js",
                 "/pages/zoomslider.js","/pages/layout.js","/pages/clickable.js"];

let fileLists = {};
fileLists["snap"] = ["/pages/panel.js","/pages/snaparray.js","/pages/zoom_to_snap.js","/pages/selectedsnap.js",
              "/pages/image_details.js","/pages/editimage.js","/pages/albumdiv.js","/pages/aboutimage.js","/pages/snap_album.js","/pages/snap.js","/pages/showsnaps.js"]

fileLists["album"] = ["/pages/panel.js","/pages/snaparray.js","/pages/zoom_to_snap.js","/pages/selectedsnap.js","/pages/createsnap.js",
              "/pages/image_details.js","/pages/editimage.js","/pages/albumdiv.js","/pages/aboutimage.js","/pages/progressBar.js","/pages/job.js","/pages/showsnaps.js","/pages/snap_album.js","/pages/album.js"]
fileLists['images'] = ["/pages/albumdiv.js","pages/tab.js","/pages/images.js"]
fileLists['mywork'] = ["/pages/albumdiv.js","/pages/mywork.js"]
fileLists['history'] = ["/pages/history.js"]
fileLists['forum'] = ["/pages/forum.js"]
fileLists['me'] = ["/pages/me.js"]
fileLists['users'] = ["/pages/users.js"]
fileLists['terms'] = ["/pages/terms.js"]
fileLists['login'] = ['/pages/login.js']
fileLists['reset_password'] = ['/pages/reset_password.js']

fileLists['authorize_tumblr'] = ['pages/authorize_tumblr.js']
fileLists['post_to_tumblr'] = ['/pages/post_to_tumblr.js']
fileLists['annotate'] = ['/pages/albumdiv.js','pages/annotate.js']
fileLists['upload'] = ["/pages/progressBar.js","/pages/upload.js","/pages/job.js"]
fileLists['upload_iframe'] = ["/lib/util.js","/pages/upload_iframe.js"]
fileLists['image'] = ["/pages/zoom_to_snap.js","/pages/panel.js","/pages/albumdiv.js","/pages/editimage.js","/pages/image.js"]
fileLists['gallery'] = ["pages/tab.js","/pages/gallery.js"]
fileLists['widget'] = ["pages/widget.js"]



function doGzip(file,cb) {
  console.log("gzipping ",file);
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream(file);
  var out = fs.createWriteStream(file+'.gz');
  inp.pipe(gzip).pipe(out);
  out.on('close',cb);
}


function getContents(fl) {
  var fln = 'www'+fl;
  console.log("Reading from ",fln);
  var cn = ""+fs.readFileSync(fln)
  return cn;
}

function mextract(fls) {
  var rs = "";
  fls.forEach(function (fl) {
    rs += getContents(fl);
  });
  return rs;
}


const minimizeFiles = function (files,dstf) {
  let cn = mextract(files);
  
  let cPath = 'combined/'+dstf+'.js';
  console.log('writing to ',cPath);
  fs.writeFileSync(cPath,cn);
  
  let minified = babel.transformFileSync(cPath).code;
  let minPath = 'minified/'+dstf+'.js';

  fs.writeFileSync(minPath,minified);
  doGzip(minPath,function () { // finally ,gzip it;
    console.log("gzipping done");
  });
}

minimizeFiles(fileLists[what],what);


/*
import constants

from admin_scripts.jsmin import jsmin

minrs = ""

def minimizeFile(fln):
  print "minimizing "+fln
  global minrs
  f = open("/mnt/ebs0/imagediverdev/www/"+fln)
  fc = f.read()
  fmin = jsmin(fc)
  minrs += fmin
  minrs += "\n"

  
def minimizeFiles(files,dstd,dstf):
  print "\n\n"
  global minrs
  minrs = ""
  for f in files:
    minimizeFile(f)
  dstp = dstd+"/"+dstf
  ofl = open(dstp,"w")
  ofl.write(minrs)
  ofl.close()


#minimizeFiles(["pages/browser","pages/albumdiv"])
#exit();
dstd = "/mnt/ebs0/imagediverdev/www/cjs"


minimizeFiles(constants.commonJsFiles,dstd,"common.js")

minimizeFiles(constants.imageJsFiles,dstd,"image.js")


minimizeFiles(constants.albumJsFiles,dstd,"album.js")
minimizeFiles(constants.albumPageJsFiles,dstd,"album_page.js")


minimizeFiles(["/pages/dual.js"],dstd,"dual.js")

minimizeFiles(["/pages/gallery.js"],dstd,"gallery.js")

print "done"
*/
