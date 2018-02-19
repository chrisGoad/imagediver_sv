#!/usr/bin/env python
import subprocess
import datetime
import time
import ops.s3log
logger = ops.s3log\

logger.logjob(15*60,100000000)
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagedivedev/py

python /mnt/ebs0/imagediverdev/py/ops/run_s3_logger.py 

cd /mnt/ebs1/imagediver/



"""
