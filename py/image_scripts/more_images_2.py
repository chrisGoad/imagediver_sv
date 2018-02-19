#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/more_images_2.py

"""
import model.models
models = model.models



im0 = models.ImageD("/image/cg/vintage_1")
im0.__dict__.update(
    {"title":"Vintage Hardware",
     "dimensions":{"x":23400,"y":19369}, 
     "imFile":"/mnt/ebs1/imagediver/image/cg/vintage_1.TIF",
     "tilingDepthBump":0,
    "untiledDimensions": {"x":663,"y":82}, # fix this
     "zoomDepthBump":3,
     "tilingDir":"/mnt/ebs1/imagediver/image/cg/vintage_1",
     "tilingUrl":"http://imagediver.com/tilings/vintage_1/"
     })

print "HOOHAH"

im0.save()

print "DONE"
