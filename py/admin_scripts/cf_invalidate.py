#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py/boto"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/cf_invalidate.py


"""
from boto.cloudfront import CloudFrontConnection

files = ["/cjs/common.js","/js/excanvas.compiled.js"]
keyId = "04QAHN33GANWY5FNE782";
secretKey = "44XTcOW90TtVMplQn5WMg4Y0/yFwD341a2UlVcyv";

conn = CloudFrontConnection(keyId,secretKey)
distributionId = "E1002VBT5IUJQJ"
print conn.create_invalidation_request(distributionId, files)


