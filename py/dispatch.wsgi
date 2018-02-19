#!/usr/bin/env python

"""
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap
/etc/init.d/apache2 restart

"""
import sys
pydir = "/mnt/ebs0/imagediver/py";
sys.path.append(pydir)
theHost = "imagediver.com"
execfile(pydir + "/" + "dispatch.py")

