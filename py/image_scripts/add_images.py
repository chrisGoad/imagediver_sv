#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py
python image_scripts/add_images.py
OBSOLETE use add_image_to_db.py

"""
import model.models
models = model.models

im0 = models.ImageD("/image/astoria_1923_0")
"""
im0.__dict__.update(
    {"title":"Astoria 1923",
     "dimensions":{"x":25330,"y":4115},
     "imFile":"/mnt/ebs0/projects/panorama/P1923_3.TIF",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/neo.com/tilings/Panorama1923_3/",
     "tilingUrl":"http://s3.amazonaws.com/tilings/Panorama1923_3/"
     })


im0.save()
"""


im0 = models.ImageD("/image/astoria_1923_1")
im0.__dict__.update(
    {"title":"Astoria 1923",
     "dimensions":{"x":25330,"y":4115},
     "imFile":"/mnt/ebs0/projects/panorama/P1923_3.TIF",
      "untiledDimensions":{"x":760,"y":123},
     "imUrl":"http://imagediver.com/nottiled/astoria_1923_1.jpg",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "tilingDir":"/var/www/imagediver.com/tilings/Panorama1923_3/",
     "tilingUrl":"http://imagediver.com/tilings/Panorama1923_3/"
     })

im0.save()



im0 = models.ImageD("/image/astoria_2010_1")
im0.__dict__.update(
    {"title":"Astoria 2010",
     "dimensions":{"x":25330,"y":4115},
     "imFile":"/mnt/ebs0/projects/panorama/P2010_3.TIF",
     "untiledDimensions":{"x":760,"y":123},
     "imUrl":"http://imagediver.com/nottiled/astoria_2010_1.jpg",
     "tilingDepthBump":0,
     "zoomDepthBump":3,
     "owner":"/user/cg",
     "tilingDir":"/var/www/imagediver.com/tilings/Panorama2010_3/",
     "tilingUrl":"http://imagediver.com/tilings/Panorama2010_3/"
     })

im0.save()

album0 = models.newAlbum("/image/astoria_1923_1")
album0.owner = "/user/cg"
album0.caption = "Astoria 1923"
album0.save();


"""
album1 = models.newAlbum("/image/astoria_1923_1")
album1.owner = "/user/cumtux"
album1.caption = "TEST ALBUM OWNED BY CUMTUX"
album1.save();
"""

album = models.newAlbum("/image/astoria_2010_1")
album.owner = "/user/cg"
album.caption = "Astoria in 2010"
album.save();


imPair0 = models.ImagePairD("/imagepair/astoria_1923_2010_1")
imPair0.image0 = "/image/astoria_1923_1";
imPair0.image1 = "/image/astoria_2010_1";
imPair0.save();



"""
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
"""

 



