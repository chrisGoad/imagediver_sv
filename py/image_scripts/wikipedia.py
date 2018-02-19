
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/wikipedia.py cg The_Dutch_Proverbs 1

"""

import sys
args = sys.argv
imowner = args[1]
imname = args[2]
album = args[3]

import constants
import model.models
models = model.models
import json
import Logr
import store.theStore
theStore = store.theStore

imageTopic = "/image/"+imowner+"/"+imname
albumTopic = "/album/"+imowner+"/"+imname+"/"+album;
im = models.loadImageD(imageTopic)
snaps = models.snapsInAlbum(albumTopic)
#theStore.topicsWithPropertyValue('/type/snapD','album',albumTopic)
snapDs = theStore.descriptor(snaps,'/type/snapD')
imx = im.dimensions["x"]

def scaleCoverage(cv,sc,digits):
  rs = {}
  crn = cv["corner"]
  rs['corner'] = {"x":sc * crn["x"],"y":sc * crn["y"]}
  ext = cv["extent"]
  rs["extent"] = {"x":sc * ext["x"],"y":sc * ext["y"]}
  return rs

print snapDs[0]["coverage"]
print imx
print 1.0/imx
def nDigits(x,n):
  p = math.pow(10,n)
  ip = math.floor(x*p+0.5)
  return ip/p
  
print scaleCoverage(snapDs[0]["coverage"],1.0/imx)

  
  
  

