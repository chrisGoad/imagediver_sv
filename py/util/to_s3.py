#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python image_scripts/to_s3.py tilings cg astoria_2010_1
python image_scripts/to_s3.py tilings cg bellvue_towers_1
python image_scripts/to_s3.py tilings cg astoria_1923_1
python image_scripts/to_s3.py snapthumb cg astoria_1923_1
python image_scripts/to_s3.py snapthumb cg astoria_1923_1
python image_scripts/to_s3.py snap cg astoria_1923_1
python image_scripts/to_s3.py snap cg mulberry_1

python image_scripts/to_s3.py tilings cg flatiron_1
python image_scripts/to_s3.py tilings cg bathing_1
python image_scripts/to_s3.py snapthumb cg bathing_1
python image_scripts/to_s3.py snap cg bathing_1
python image_scripts/to_s3.py snap cg vintage_1
python admin_scripts/setbucket.py cg vintage_1
python image_scripts/to_s3.py tilings cg astoria_1880_0
python image_scripts/to_s3.py snapthumb cg astoria_1880_0
python image_scripts/to_s3.py snap cg astoria_1880_0

python image_scripts/to_s3.py tilings vh vintage_1
python image_scripts/to_s3.py tilings cg bathing_1
python image_scripts/to_s3.py tilings cg mulberry_1

"""

import constants
import re
import boto
import boto.s3
import os


class s3Conn:
  keyId = "04QAHN33GANWY5FNE782";
  secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";
  
  def __init__(self):
    self.conn = boto.s3.connection.S3Connection(self.keyId,self.secretKey)
  def createBucket(self,bucketName):
    bucket = self.conn.create_bucket(bucketName)
    bucket.set_acl('public-read')
    return bucket
    

  def saveFile(self,bucket,dir,s3dir,fln):
    k = boto.s3.Key(bucket)
    k.key = s3dir+"/"+fln
    k.set_contents_from_string("hello helllo") # this is needed
    k.set_contents_from_filename(dir+"/"+fln)
    k.set_acl('public-read')

  def saveDir(self,bucket,dir,s3dir):
    cn = os.listdir(dir)
    for fln in cn:
     self.saveFile(bucket,dir,s3dir,fln)
    

