#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python image_scripts/more_images.py

"""
import model.models
models = model.models

"""
im0 = models.ImageD("/image/astoria_1880_0_c")

im0.__dict__.update(
    {"title":"Astoria 1880",
     "dimensions":{"x":904,"y":1519},
     "untiledDimensions": {"x":663,"y":82},
     "imFile":"/mnt/ebs0/projects/panorama/P_1880_0_C.tif",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/imagediver.com/tilings/Panorama1880_0_c/",
     "tilingUrl":"http://imagediver.com/tilings/Panorama1880_0_c/"
     })


im0.save()
"""


im0 = models.ImageD("/image/astoria_1880_0")
4422,548
im0.__dict__.update(
    {"title":"Astoria 1880",
     "dimensions":{"x":4422,"y":548}, 
     "imFile":"/mnt/ebs0/projects/panorama/P_1880_0.jpg",
     "tilingDepthBump":0,
    "untiledDimensions": {"x":663,"y":82},
     "zoomDepthBump":3,
     "tilingDir":"/var/www/imagediver.com/tilings/Panorama1880_0/",
     "tilingUrl":"http://imagediver.com/tilings/Panorama1880_0/"
     })


im0.save()
"""
album0 = models.newAlbum("/image/astoria_1880_0_c")
album0.owner = "/user/cg"
album0.caption = "Astoria 1880"
album0.save();
"""
 



