#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/test_boto.py

"""

import constants
import re
import boto
import boto.s3
import os
keyId = "04QAHN33GANWY5FNE782";
secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";

conn = boto.s3.connection.S3Connection(keyId,secretKey)

print conn
rs = conn.create_bucket('tilings')
print rs
tls = rs.list()
itr = tls.__iter__()
print itr.next()

dir = "/mnt/ebs1/imagediver/tilings/cg/mulberry_1"
cn = os.listdir(dir)
print cn

#def storeFile(fl):
  