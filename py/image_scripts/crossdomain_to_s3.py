#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/crossdomain_to_s3.py

"""

import constants
import re
import boto
import boto.s3
import os
import sys

args = sys.argv
keyId = "04QAHN33GANWY5FNE782";
secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";

conn = boto.s3.connection.S3Connection(keyId,secretKey)

bk = conn.create_bucket("imagediver")
print bk

k = boto.s3.Key(bk)
k.key = "crossdomain.xml"
k.set_contents_from_string("hello helllo")
k.set_contents_from_filename("/mnt/ebs0/imagediverdev/py/crossdomain.xml")
k.set_acl('public-read')
bk.set_acl('public-read')
print "saved "

  