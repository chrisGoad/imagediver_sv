#!/usr/bin/env python
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python image_scripts/set_image_prop.py cg flatiron_1 title "Flat Iron Building"

python image_scripts/set_image_prop.py cg The_Dutch_Proverbs author "Pieter Bruegel the Elder"
python image_scripts/set_image_prop.py cg The_Ambassadors author "Hans Holbein the Younger"
python image_scripts/set_image_prop.py cg The_Ambassadors title "The Ambassadors"

python image_scripts/set_image_prop.py cg earthly_delights_1 author "Hieronymus Bosch"

python image_scripts/set_image_prop.py cg bathing_1 owner /user/cg
python image_scripts/set_image_prop.py cg astoria_1923_1 owner /user/cg

python image_scripts/set_image_prop.py cg astoria_1923_1 description 'On December 8, 1922, a fire burned most buildings in the business district of Astoria Oregon. This panorama was made by Frank Woodfield 9 months later, on September 23, 1923, and shows an intermediate stage of reconstruction. A <a href="http://en.wikipedia.org/wiki/Cirkut" target="idvWindow">Cirkut</a> #8 camera was used. The negative, from which this web image was scanned, was 8 inches by approximately 3 feet in size, which accounts for the very high resolution. The negative is the property of the Clatsop County Historical Society, whom we thank for its use.'

python image_scripts/set_image_prop.py cg earthly_delights_1 wikipediaPage http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights

python image_scripts/set_album_prop.py cg The_Dutch_Proverbs 1 wikipediaPage http://en.wikipedia.org/wiki/Netherlandish_Proverbs
python image_scripts/set_album_prop.py cg The_Dutch_Proverbs 1 description "The contents of this album come from the <a href='http://en.wikipedia.org/wiki/Netherlandish_Proverbs' target='idv_target'>Wikipedia page</a> about this painting: \"The Dutch Proverbs\", by Peter Bruegel the Elder"

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
prop = args[3]
value = args[4]


topic = "/image/"+user+"/"+image

print topic
import model.models
models = model.models


Logr.log("dstore","HERE")

image = models.loadImageD(topic)

image.__dict__.update({prop:value})
    
print image.__dict__
image.save()
