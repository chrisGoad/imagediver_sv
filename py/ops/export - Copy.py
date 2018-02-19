#!/usr/bin/env python

"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH


cd /mnt/ebs0/imagediverdev/py
python ops/export_js.py


python
"""


last_version = "0_5"


import constants
import ops.s3
s3 = ops.s3
import shutil
import os

last_version = "0_6" # version to be archived



py_srcdir = "/mnt/ebs0/imagediverdev/py"
py_dstdir = "/mnt/ebs0/imagediver/py"
py_archive = "/mnt/ebs0/imagediver/py_archive_"+last_version
js_archive = "/mnt/ebs0/imagediver/js_archive_"+last_version

js_srcdir = "/mnt/ebs0/imagediverdev/www"
js_dstdir = "/mnt/ebs0/imagediver/www"

 
""" files needed at S3 but also at production """
s3fls = ["/ncjs/modernizr.custom.43258.js","/ncjs/common.js","/ncjs/album.js","/ncjs/swfobject.js","/ncjs/jquery-ui-1.8.21.custom.min.js"]

jsfls = ["/static_pages/home.html","/static_pages/home.json","/static_pages/maintainance.html",
       "/hx/canvas.swf","/ajax-loader.gif","/css/imagestyle.css","/css/faq.css","/css/min.css",
       "/css/ui-darkness/jquery-ui-1.8.21.custom.css", "/css/ui-darkness/images",
       "/minus.png","/plus.png","/ncjs/me.js","/ncjs/gallery.js","/pages/gallery_data.js",
       "/ncjs/images.js","/ncjs/image.js","/ncjs/staticpage.js","/ncjs/mywork.js","/ncjs/login.js","/ncjs/upload.js",
       "/ncjs/upload_iframe.js"]


pydirs = ["/api","/model","/pages","/ops","/store"]
pyfiles = ["/constants.py","/Logr.py","/dispatch.py","/misc.py","/WebClasses.py"]


def mkArchiveDirs():
  os.mkdir(py_archive)
  os.mkdir(js_archive)
  os.mkdir(js_archive+"/static_pages")
  os.mkdir(js_archive+"/hx")
  os.mkdir(js_archive+"/css")
  os.mkdir(js_archive+"/ncjs")
 
 
 
def copyFile(fl,src,dst):
  dstFile = dst + fl;
  srcFile = src  + fl 
  print "copying ",srcFile,"to",dstFile
  shutil.copyfile(srcFile,dstFile)
 


def sendFile(fl,contentType):
  path = fl;
  srcFile = js_srcdir + fl 
  print "sending ",srcFile,"to",path
  s3.s3SetContents(path,srcFile,relativeTo="/",contentType=contentType)
  print "sent "


def mvpy2archive(dr):
  print "MOVING ",dr," TO ARCHIVE "
  shutil.move(py_dstdir+dr,py_archive)


def archiveJs():
  for fl in s3fls + jsfls:
    copyFile(fl,js_dstdir,js_archive)

def exportJs():
  for fl in s3fls + jsfls:
    copyFile(fl,js_srcdir,js_dstdir)
  for fl in s3fls:
    sendFile(fl,"application/javascript")
  sendFile("/css/imagestyle.css","text/css")
  sendFile("/hx/canvas.swf","application/x-shockwave-flash")
  sendFile("/minus.png","image/png")
  sendFile("/plus.png","image/png")

  

# now the python. Scheme: copy directories over one by one



# todo autmatically create this dir

def mv2archive(dr):
  print "MOVING ",dr," TO ARCHIVE "
  shutil.move(dstdir+dr,archive)

dirs = ["/api","/model","/pages","/ops","/store"]


for dir in dirs:
  mv2archive(dir)

def copyDirFromDev(dr):
  print "Copying "+dr+" from DEV"
  shutil.copytree(srcdir+dr,dstdir+dr)

for dir in dirs:
  copyDirFromDev(dir)


for fl in files:
  mv2archive(fl)
  

def copyFileFromDev(dr):
  print "Copying "+dr+" from DEV"
  shutil.copyfile(srcdir+dr,dstdir+dr)



for fl in files:
  copyFileFromDev(fl)
  
s3.s3SetContents("/album/cg/The_Dutch_Proverbs/1/main.json",
                 srcFile="/mnt/ebs1/imagediver/topic/album/4294b0e/the_dutch_proverbs/1/main.json",relativeTo="topic",contentType="application/json")


s3.s3SetContents("/album/cg/The_Dutch_Proverbs/1/index.html",
                 srcFile="/mnt/ebs1/imagediver/topic/album/4294b0e/the_dutch_proverbs/1/index.html",relativeTo="topic",contentType="text/html")

  