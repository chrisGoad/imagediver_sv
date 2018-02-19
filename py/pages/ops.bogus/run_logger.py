#!/usr/bin/env python
import subprocess
import datetime
import time
import ops.logs
logger = ops.logs
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python /mnt/ebs0/imagediverdev/py/ops/run_logger.py 

nohup python /mnt/ebs0/imagediverdev/py/ops/run_logger.py >> /mnt/ebs0/imagediverdev/log/logger.out &

"""
logger.logjob(30*60,100000000)
"""
def logjob(delay,iterations):
  cnt = 0
  while cnt < iterations:
    dt = datetime.datetime.utcnow()
    print dt.isoformat(),"iteration",cnt
    cnt = cnt+1
    subprocess.call(["python","/mnt/ebs0/imagediverdev/py/ops/run_logger_once.py"])
    print dt.isoformat(),"completed\n"
    time.sleep(delay)

logjob(10,5)
"""
