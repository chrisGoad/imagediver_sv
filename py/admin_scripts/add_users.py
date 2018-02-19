#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python admin_scripts/new_store.py
python admin_scripts/add_users.py
python image_scripts/add_images.py

"""


import model.models
models = model.models



u = models.UserD("/user/cg")
u.name="Chris Goad"
u.save()

u.setPassword("psanlecu")



u = models.UserD("/user/cumtux")
u.name="Clatsop County Historical Society"
u.save()

u.setPassword("cumtux")
"""


ds.insert(
    {"name":"Clatsop County Historical Society",
     },'/user/cumtux','/type/userD');

"""