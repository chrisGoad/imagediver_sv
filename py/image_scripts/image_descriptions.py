#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/image_descriptions.py

"""

import constants
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"
constants.logDir = "/mnt/ebs0/imagediverdev/log/"
import Logr

import model.models
models = model.models

Logr.log("dstore","HERE")
im0 = models.ImageD("/image/cg/astoria_2010_1")
im0.setProperty("description",'This image was made by <a target="idvWindow" href="http://michaelmathers.com">Michael Mathers</a> '+
'utilizing <a target="idvWindow" href="http://gigapan.org">GigaPan</a> technology to achieve '+
'approximately the same resolution  as the 1923 Cirkut image.');


