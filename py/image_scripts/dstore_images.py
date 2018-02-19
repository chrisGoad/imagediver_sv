#!/usr/bin/env python
# python /mnt/ebs0/image_scripts/dstore_images.py
# http://neochronography.com/topic/image/astoria_1923_0
"""
OBSOLETE used add_image_to_db

cd /mnt/ebs0/imagediver/py
python image_scripts/dstore_images.py

cd /mnt/ebs
"""
import store.dstore
dstore = store.dstore


t  = dstore.DStore('descriptors0')

t.insert(
    {"title":"Astoria 1923",
     "dimensions":{"x":25330,"y":4115},
     "imFile":"/mnt/ebs0/projects/panorama/P1923_3.TIF",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/neo.com/tilings/Panorama1923_3/",
     "tilingUrl":"http://s3.amazonaws.com/tilings/Panorama1923_3/"
     },'/image/astoria_1923_0','/type/imageD');


t.insert(
    {"title":"Astoria 1923",
     "dimensions":{"x":25330,"y":4115},
     "imFile":"/mnt/ebs0/projects/panorama/P1923_3.TIF",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/imagediver.com/tilings/Panorama1923_3/",
     "tilingUrl":"http://imagediver.com/tilings/Panorama1923_3/"
     },'/image/astoria_1923_1','/type/imageD');

t.insert(
    {"title":"Astoria 2010",
     "dimensions":{"x":25330,"y":4115},
     "imFile":"/mnt/ebs0/projects/panorama/P2010_3.TIF",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/neo.com/tilings/Panorama2010_3/",
     "tilingUrl":"http://s3.amazonaws.com/tilings/Panorama2010_3/"
     },'/image/astoria_2010_0','/type/imageD');    


t.insert(
    {"title":"Astoria 1880 Right Panel",
     "dimensions":{"x":7484,"y":4493},
     "imFile":"/mnt/ebs0/projects/panorama/P_1880_0_R.tif",
     "tilingDepthBump":1,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/neo.com/tilings/P_1880_0_R/",
     "tilingUrl":"http://neochronography.com/tilings/P_1880_0_R/"
     },'/image/1880_0_R','/type/imageD');    



t.insert(
    {"title":"Liberty Theater",
     "dimensions":{"x":16392,"y":10162},
     "imFile":"/mnt/ebs0/projects/liberty/liberty_1.TIF",
     "tilingDepthBump":-1,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/neo.com/tilings/liberty_1/",
     "tilingUrl":"http://neochronography.com/tilings/liberty_1/"
     },'/image/liberty_0','/type/imageD');        
    
#      lib.image = new imlib.Image(new geom.Point(16392,10162),"/mnt/ebs0/projects/liberty/liberty_1.TIF");
#    lib.tiling = new imlib.Tiling(lib.image,256,0.5,"/var/www/neo.com/tilings/liberty_1/","http://neochronography.com/tilings/liberty_1/",-1);

    
#     lib.presentIm = new imlib.Image(new geom.Point(25330,4115),"/mnt/ebs0/projects/panorama/P2010_3.TIF");
#   lib.presentTiling = new imlib.Tiling(lib.presentIm,256,0.5,"/var/www/neo.com/tilings/Panorama2010_3/","http://s3.amazonaws.com/tilings/Panorama2010_3/",0);
 
    
    
    
dd = t.descriptor('/image/astoria_2010_0','/type/imageD')
print str(dd)
#dds = t.descriptors('/a/b')
#print str(dds)


 



