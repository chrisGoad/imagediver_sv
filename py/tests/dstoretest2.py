#!/usr/bin/env python
# python /var/www/neo.com/script_tests/dstoretest2.py
import sys
sys.path.append("/var/www/neo.com/store")
print "HOHOH"
import dstore
reload(dstore)

print str(dstore)
ds = dstore
t  = ds.DStore('descriptors0')
twv = t.topicsWithPropertyValue("snapD","image","/image/astoria_1923_0")
print "snaps:"+str(twv)


 



