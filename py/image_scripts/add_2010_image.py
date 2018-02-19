#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python image_scripts/add_2010_image.py

"""
import model.models
models = model.models


album = models.newAlbum("/image/astoria_2010_1")
album.owner = "/user/cg"
album.caption = "Astoria in 2010"
album.save();




