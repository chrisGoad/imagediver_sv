#!/usr/bin/env python

"""
Run just once; to fix the excessively big snaps in The_Dutch_Proverbs


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/reduce_snap_res.py

"""

import time
import subprocess
dirs = "/mnt/ebs1/imagediver/snap/fullsize/cg/The_Dutch_Proverbs.big/"
dird = "/mnt/ebs1/imagediver/snap/fullsize/cg/The_Dutch_Proverbs/"
dirs = "/mnt/ebs1/imagediver/snap/thumb/cg/The_Dutch_Proverbs_big/"
dird = "/mnt/ebs1/imagediver/snap/thumb/cg/The_Dutch_Proverbs/"
num = 73
for n in range(0,num+1):
  
  cmd = "convert -quiet {0} -resize 50% {1}"
  cmdf = cmd.format(dirs+str(n)+".jpg",dird+str(n)+".jpg")
  print cmdf
  #cmd = ["convert","-quiet","-size",str(imwd)+"x"+str(imht),"-depth","8","-extract",str(cx)+"x"+str(cy)+"+"+str(x)+"+"+str(y)]
  cmds = cmdf.split(" ")
  subprocess.call(cmds)
   
  