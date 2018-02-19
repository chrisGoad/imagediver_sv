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


python image_scripts/set_album_prop.py cg bathing_1 1 description "This photograph was taken at Belle Isle Park, Detroit, Michigan some time between 1910 and 1920. It comes from the Library of Congress collection of photographs from the Detroit Publishing Company. Further details are available at the  <a href ='http://www.loc.gov/pictures/item/det1994022006/PP/' target='_blank'>LOC website</a>."

"The images and descriptoins in  this album come from the <a href='http://en.wikipedia.org/wiki/Garden_of_Earthly_Delights' target='idv_target'>Wikipedia page</a> about this painting: \"The Garden of Earthly Delights\", by Hieronymus Bosch"


python image_scripts/set_album_prop.py cg The_Ambassadors 1 description "The information in this album comes from  the <a href='http://en.wikipedia.org/wiki/The_Ambassadors_(Holbein)' target='idv_target'>Wikipedia page</a> about this painting, and from  <i>The Scientific Instruments in Holbein's Ambassadors: A Re-Examination</i>, Elly Dekker and Kristen Lippincott, Journal of the Warburg and Courtauld Institutes, Vol. 62 (1999),pp. 93-125"


python image_scripts/set_album_prop.py cg The_Ambassadors 1 wikipediaPage "http://en.wikipedia.org/wiki/The_Ambassadors_(Holbein)"


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
