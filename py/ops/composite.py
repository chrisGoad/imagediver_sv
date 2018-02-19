#!/usr/bin/env python
"""

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python ops/composite.py

"""""

import constants

import re
import math
import time
import hashlib
#theStore = None
import Logr
import os
import subprocess
import traceback
import store.dynamo
dynamo = store.dynamo
import constants

import store.jobs
jobs = store.jobs
import math
import model.models
models = model.models
import model.image
image = model.image
import model.composite as  composite
Composite = composite.Composite

#import pages.album
#albumpage = pages.album
import misc
import pdb
import json
import ops.s3
s3 = ops.s3
import pages.gen as gen
import time


import urllib2

cc = Composite()
cc.name = "hats"


images = []
def addImage(url,im):
  images.append({"link":url,"image":im})

addImage('http://s3.imagediver.org/topic/snap/4294b0e/mabuse_adoration_of_kings/3/1/index.html','http://static.imagediver.org/images/4294b0e/mabuse_adoration_of_kings/snap/38.jpg');
addImage('http://s3.imagediver.org/topic/snap/d73b6a9/adorationofthemagi/2/2/index.html','http://static.imagediver.org/images/d73b6a9/adorationofthemagi/snap/4.jpg');
addImage('http://s3.imagediver.org/topic/snap/e244d69/ford_madox_brown_coat/1/4/index.html','http://static.imagediver.org/images/e244d69/ford_madox_brown_coat/snap/9.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/van_eyck_arnolfini/4/1/index.html','http://static.imagediver.org/images/4294b0e/van_eyck_arnolfini/snap/17.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/van_der_Weyden_El_Descendimiento/3/1/index.html','http://static.imagediver.org/images/4294b0e/van_der_Weyden_El_Descendimiento/snap/19.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/garden_of_earthly_delights/7/4/index.html','http://static.imagediver.org/images/4294b0e/garden_of_earthly_delights/snap/99.jpg');
addImage('http://s3.imagediver.org/topic/snap/e244d69/cranach_cupid_venus/1/2/index.html','http://static.imagediver.org/images/e244d69/cranach_cupid_venus/snap/2.jpg');
addImage('http://s3.imagediver.org/topic/snap/e244d69/Delacroix_Liberty_Leading_the_People/1/2/index.html','http://static.imagediver.org/images/e244d69/Delacroix_Liberty_Leading_the_People/snap/2.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/the_ambassadors/5/3/index.html','http://static.imagediver.org/images/4294b0e/the_ambassadors/snap/59.jpg');
addImage('http://s3.imagediver.org/topic/snap/e244d69/tiepelo_antony_cleopatra/1/2/index.html','http://static.imagediver.org/images/e244d69/tiepelo_antony_cleopatra/snap/6.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/Georg_Gisze/3/6/index.html','http://static.imagediver.org/images/4294b0e/Georg_Gisze/snap/23.jpg');
addImage('http://s3.imagediver.org/topic/snap/e244d69/altdorfer_resurrection/1/3/index.html','http://static.imagediver.org/images/e244d69/altdorfer_resurrection/snap/11.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/the_dutch_proverbs/3/3/index.html','http://static.imagediver.org/images/4294b0e/the_dutch_proverbs/snap/126.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/Thanka_of_Guhyasamaja_Akshobhyavajra/12/1/index.html','http://static.imagediver.org/images/4294b0e/Thanka_of_Guhyasamaja_Akshobhyavajra/snap/68.jpg');
addImage('http://s3.imagediver.org/topic/snap/4294b0e/young_knight_in_a_landscape/5/2/index.html','http://static.imagediver.org/images/4294b0e/young_knight_in_a_landscape/snap/23.jpg');
addImage('http://s3.imagediver.org/topic/snap/d73b6a9/theharvesters/2/3/index.html','http://static.imagediver.org/images/d73b6a9/theharvesters/snap/9.jpg');



cc.images = images[0:9]

print cc.publish()

def sendJs():
  srcFile = "/mnt/ebs0/imagediverdev/www/pages/composite.js"
  path = "/ncjs/composite.js"
  print "sending ",srcFile,"to",path
  s3.s3SetContents(path,srcFile,relativeTo="/",contentType="application/x-javascript")
  
sendJs()

"""
http://s3.imagediver.org/topic/composite/hats/index.html
"""

