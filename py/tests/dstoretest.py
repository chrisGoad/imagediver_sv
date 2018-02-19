#!/usr/bin/env python
#
"""
python /var/www/imagediver.com/script_tests/dstoretest.py
"""
import sys
sys.path.append("/var/www/imagediver.com")
print "HOHOH"
import store.dstore
dstore = store.dstore

ds = dstore.DStore('descriptors0')


rs = ds.counterValue("snapp");

print "rs "+str(rs)

rs = ds.incrementCounter("snapp")

print "rrs "+str(rs)