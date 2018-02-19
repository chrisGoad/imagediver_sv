#!/usr/bin/env python
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python image_scripts/set_album_prop.py cg The_Dutch_Proverbs 1 wikipediaPage http://en.wikipedia.org/wiki/Netherlandish_Proverbs
python image_scripts/set_album_prop.py cg The_Dutch_Proverbs 1 description "The contents of this album come from the <a href='http://en.wikipedia.org/wiki/Netherlandish_Proverbs' target='idv_target'>Wikipedia page</a> about this painting: \"The Dutch Proverbs\", by Peter Bruegel the Elder"


python image_scripts/set_album_prop.py cg earthly_delights_1 1 wikipediaPage http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights
python image_scripts/set_album_prop.py cg earthly_delights_1 2 wikipediaPage http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights
python image_scripts/set_album_prop.py cg earthly_delights_1 3 wikipediaPage http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights
python image_scripts/set_album_prop.py cg earthly_delights_1 4 wikipediaPage http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights

python image_scripts/set_album_prop.py cg earthly_delights_1 2 description "The images and descriptoins in  this album come from the <a href='http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights' target='idv_target'>Wikipedia page</a> about this painting: \"The Garden of Earthly Delights\", by Hieronymus Bosch"


"""

import constants
import re
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr
import subprocess
import sys
args = sys.argv
user = args[1]
image = args[2]
album = args[3]
prop = args[4]
value = args[5]


topic = "/album/"+user+"/"+image+"/"+album;

print topic
import model.models
models = model.models


Logr.log("dstore","HERE")

album = models.loadAlbumD(topic)

album.__dict__.update({prop:value})
    
print album.__dict__
album.save()
