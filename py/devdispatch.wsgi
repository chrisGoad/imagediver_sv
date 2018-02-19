#!/usr/bin/env python

"""
http://neochronography.com/topic/image/astoria_1923_0

http://neochronography.com/snap
/etc/init.d/apache2 restart

"""
import sys
pydir = "/mnt/ebs0/imagediverdev/py";
sys.path.append(pydir)

theHost = "dev.imagediver.org"
execfile(pydir + "/" + "dispatch.py")

