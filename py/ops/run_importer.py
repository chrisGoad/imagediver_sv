#!/usr/bin/env python
"""




PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py


python /mnt/ebs0/imagediver/py/ops/run_importer.py

nohup python /mnt/ebs0/imagediver/py/ops/run_importer.py >> /mnt/ebs1/imagediver/log/importer.out &

cd /mnt/ebs1/imagediver/log/
tail -f importer.out

PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py


python /mnt/ebs0/imagediverdev/py/ops/run_importer.py

nohup python /mnt/ebs0/imagediverdev/py/ops/run_importer.py >> /mnt/ebs1/imagediver/log/importer.out &

category google art project wikimedia commons bassano



"""
import ops.imp
imp = ops.imp

imp.impjob(20)
