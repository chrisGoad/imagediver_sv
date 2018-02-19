#!/usr/bin/env python

"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH


cd /mnt/ebs0/imagediverdev/py
python ops/export.py


python
execfile("ops/export.py")

recoverJs("0_28");

export()

"""

includePy = True
includeJs = False
sendToS3 = True
archiveIt = True

last_version = "0_28"

print "includePy",includePy,"includeJs",includeJs,"archiveId",archiveIt


import constants
import ops.s3
s3 = ops.s3
import shutil
import os





py_srcdir = "/mnt/ebs0/imagediverdev/py"
py_dstdir = "/mnt/ebs0/imagediver/py"
py_archive = "/mnt/ebs0/imagediver/py_archive_"+last_version
js_archive = "/mnt/ebs0/imagediver/js_archive_"+last_version

js_srcdir = "/mnt/ebs0/imagediverdev/www/dcjs"
js_dstdir = "/mnt/ebs0/imagediver/www/ncjs"

css_srcdir = "/mnt/ebs0/imagediverdev/www"
css_dstdir = "/mnt/ebs0/imagediver/www"

""" files needed at S3 but also at production """

s3jsfls = ["/modernizr.custom.43258.js","/swfobject.js","/jquery-ui-1.8.21.custom.min.js","/common.js","/album.js","/snap.js"]
""" NOTE /css/ui-darkness/images/* NOT COPIED YET """

cssfls = ["/static_pages/maintainance.html",
       "/hx/canvas.swf","/ajax-loader.gif","/css/imagestyle.css","/css/faq.css","/css/min.css",
       "/css/ui-darkness/jquery-ui-1.8.21.custom.css",
       "/css/ui-darkness/images/ui-bg_inset-soft_25_000000_1x100.png",
       "/minus.png","/plus.png"]

jsfls = ["/me.js","/gallery.js","/post_to_tumblr.js","/terms.js","/forum.js","/forgot_password.js",
       "/images.js","/image.js","/staticpage.js","/mywork.js","/login.js","/upload.js",
       "/upload_iframe.js"]

#jsflsNotVersioned = ["/pages/gallery_data.js"]

pydirs = ["/api","/model","/pages","/ops","/store"]
pyfiles = ["/constants.py","/Logr.py","/dispatch.py","/misc.py","/WebClasses.py"]


def mkArchiveDirs():
  if includePy and not os.path.exists(py_archive):
    os.mkdir(py_archive)
  if includeJs and not os.path.exists(js_archive):
    os.mkdir(js_archive)
    os.mkdir(js_archive+"/static_pages")
    os.mkdir(js_archive+"/hx")
    os.mkdir(js_archive+"/css")
    os.mkdir(js_archive+"/pages")
    os.mkdir(js_archive+"/ncjs")
    os.mkdir(js_archive+"/css/ui-darkness")
    os.mkdir(js_archive+"/css/ui-darkness/images")

 
 

def copyFile(fl,src,dst):
  dstFile = dst + fl;
  srcFile = src  + fl 
  print "copying ",srcFile,"to",dstFile
  shutil.copyfile(srcFile,dstFile)
 

# sends from production out to s3
def sendFile(fl,contentType,js=False):
  if js:
    path = "/ncjs"+fl
    srcFile = js_dstdir + fl
  else:
    path = fl;
    srcFile = css_dstdir + fl 
  print "sending ",srcFile,"to",path
  s3.s3SetContents(path,srcFile,relativeTo="/",contentType=contentType)
  print "sent "

def moveFile(dr,src,dst): # works for directories too
  fsrc = src + dr 
  print "MOVING ",fsrc,"TO",dst
  shutil.move(fsrc,dst)
  #shutil.move(py_dstdir+dr,py_archive)


def copyTree(dr,src,dst):
  fsrc = src + dr
  fdst = dst + dr
  print "Copying",fsrc,"TO",fdst
  shutil.copytree(fsrc,fdst)


def rmTree(dr,src):
  fsrc = src + dr
  print "REMOVING",fsrc
  shutil.rmtree(fsrc)

def rmFile(dr,src):
  fsrc = src + dr
  print "REMOVING",fsrc
  os.remove(fsrc)
 

def archives3Js():
  for fl in s3jsfls:
    if os.path.exists(js_dstdir+fl):
      copyFile(fl,js_dstdir,js_archive)
    else:
      print "did not find ",fl
      
def archiveJs():
  for fl in s3jsfls + jsfls:
    if os.path.exists(js_dstdir+fl):
      copyFile(fl,js_dstdir,js_archive)
    else:
      print "did not find ",fl

def exportJs():
  global sendToS3
  for fl in s3jsfls + jsfls:
    copyFile(fl,js_srcdir,js_dstdir)
  for fl in cssfls:
    copyFile(fl,css_srcdir,css_dstdir)
  
  
  if not sendToS3:
    return
  for fl in s3jsfls:
    sendFile(fl,"application/javascript",js=True)
 
  sendFile("/css/imagestyle.css","text/css")
  sendFile("/hx/canvas.swf","application/x-shockwave-flash")
  sendFile("/minus.png","image/png")
  sendFile("/plus.png","image/png")
  # widgets not in use now s3.s3SetContents("/widget.js",js_srcdir+"/ncjs/widget.0_11.js",relativeTo="/",contentType="application/javascript")


def recoverJs(archive):
  global js_srcdir
  js_srcdir = "/mnt/ebs0/imagediver/js_archive_"+archive
  for fl in s3jsfls + jsfls:
    copyFile(fl,js_srcdir,js_dstdir)
  for fl in s3jsfls:
    sendFile(fl,"application/javascript",js=True)


def recoverPy(archive):
  global py_srcdir
  removePy()
  py_srcdir = "/mnt/ebs0/imagediver/py_archive_"+archive
  exportPy()

  

  
def archivePy():
  for dr in pydirs:
    moveFile(dr,py_dstdir,py_archive)
    #mvpy2archive(dr)
  for fl in pyfiles:
    moveFile(fl,py_dstdir,py_archive)

def removePy():
  for dr in pydirs:
    rmTree(dr,py_dstdir)
  for fl in pyfiles:
    rmFile(fl,py_dstdir)
    
    
def exportPy():
  for dr in pydirs:
    copyTree(dr,py_srcdir,py_dstdir)
  for fl in pyfiles:
    copyFile(fl,py_srcdir,py_dstdir)


def export():
  global py_archive,js_archive
  """ so that the right version will be used last_version is modified after loading this file """
  py_archive = "/mnt/ebs0/imagediver/py_archive_"+last_version
  js_archive = "/mnt/ebs0/imagediver/js_archive_"+last_version

  if archiveIt:
    mkArchiveDirs()
    if includeJs: archiveJs()
    if includePy: archivePy()
  if includePy:
    if not archiveIt:
      removePy()
    exportPy()
  if includeJs:exportJs()
  
# dev files put at s3 so we can do s3 debugging

def exportJsForDev():
  cjs  = constants.commonJsFiles
  sjs = constants.jsFiles['snap']
  ajs = constants.jsFiles['album']
  ss = set(cjs+sjs+ajs)
  for s in ss:
    srcFile = css_srcdir + s
    print "saving ",s
    #print s,srcFile
    #continue
    s3.s3SetContents(s,srcFile,relativeTo="/",contentType="application/javascript")
  print "FILES ",ss

#exportPy()
#export()

"""

removePy()
exportJs()
exportPy()
 
s3.s3SetContents("/album/cg/The_Dutch_Proverbs/1/main.json",
                 srcFile="/mnt/ebs1/imagediver/topic/album/4294b0e/the_dutch_proverbs/1/main.json",relativeTo="topic",contentType="application/json")


s3.s3SetContents("/album/cg/The_Dutch_Proverbs/1/index.html",
                 srcFile="/mnt/ebs1/imagediver/topic/album/4294b0e/the_dutch_proverbs/1/index.html",relativeTo="topic",contentType="text/html")

"""
