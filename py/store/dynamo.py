#!/usr/bin/env python
# python /var/www/neo.com/store/createdb.py fub
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
"""

"""
versions:
all data is versioned, so that a complete history of all edits is present
each item has a create_time, which is milliseconds since the unix epoch
this is -1 for the current item, which stores create_time in current_item_create_time

empty strings:  dynamo does not allow empty strings, so i encode them with "__empty_string__"
"""
#sys.path.append("/var/www/imagediver.com")
import boto
import time
import traceback
import misc
import constants
import ops.keys as keys

def time_msec():
  return int(time.time()*1000)
  
#import boto.dynamodb

keyId = keys.keyId
secretKey = keys.secretKey
 
dconn = None



verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"DYNAMO")

    
tverbose  = False # transaction print
def tprint(*args):
  if tverbose:
    misc.printargs(args,"TDYNAMO")
  
  
def connect():
  global dconn
  if dconn==None:
    dconn = boto.connect_dynamodb(aws_access_key_id=keyId,aws_secret_access_key=secretKey) 

connect()

import json

prefix="";

theTables = {}


tableProps = {}

tableIncludesRange = {}


def getTable(tnm):
  rs = theTables.get(tnm,None)
  if rs:
    return rs
  rs = dconn.get_table(prefix+tnm)
  theTables[tnm] = rs
  return rs


schemaWithoutRange = dconn.create_schema(
    hash_key_name='topic',
    hash_key_proto_value='S'
  )
 
schemaWithRange = dconn.create_schema(
    hash_key_name='topic',
    hash_key_proto_value='S',
    range_key_name='create_time',
    range_key_proto_value=0
  )
 


def createTable(tnm):

  props = tableProps[tnm]
  inr = tableIncludesRange[tnm]
  if inr:
    schema = schemaWithRange
  else:
    schema = schemaWithoutRange
  dconn.create_table(
    name=prefix+tnm,
    schema = schema,
    read_units=10,
    write_units=5
  )  
  



def dynamoify(vl):
  if vl == "":
    return "__empty_string__"
  return vl

def my_put_attribute(item,p,vl):
  item.put_attribute(p,dynamoify(vl))
  



tableIncludesRange["User"] = True
tableIncludesRange["Session"] = False
tableIncludesRange["Image"] = True
tableIncludesRange["Album"] = True
tableIncludesRange["Snap"] = True
tableIncludesRange["Post"] = True
tableIncludesRange["TumblrToUser"] = False


# special case
  
  

  
def createImageToAlbumsTable():
 
  schema = dconn.create_schema(
    hash_key_name='image',
    hash_key_proto_value='S',
    range_key_name='album',
    range_key_proto_value='S'
  )

  dconn.create_table(
    name=prefix+"ImageToAlbums",
    schema = schema,
    read_units=5,
    write_units=5
  )


def createAlbumToSnapsTable():
 
  schema = dconn.create_schema(
    hash_key_name='album',
    hash_key_proto_value='S',
    range_key_name='snap',
    range_key_proto_value='S'
  )

  dconn.create_table(
    name=prefix+"AlbumToSnaps",
    schema = schema,
    read_units=5,
    write_units=5
  )


  
def createEmailToUserTable():
 
  schema = dconn.create_schema(
    hash_key_name='email',
    hash_key_proto_value='S'
  )

  dconn.create_table(
    name=prefix+"EmailToUser",
    schema = schema,
    read_units=5,
    write_units=5
  )

def setUserForEmail(email,user):
  tab = getTable("EmailToUser")
  itm = tab.new_item(
    hash_key = email,
  )
  itm["user"] = user
  tprint("setUserForEmail")
  itm.put()

tableProps["Count"] = ["count"]

tableIncludesRange["Count"] = False
tableIncludesRange["Upload"] = False

  
  
def deleteTable(tnm):
  tab = getTable(tnm)
  dconn.delete_table(tab)

  
def deleteItems(tnm):
  tab = getTable(tnm)
  g = tab.scan()
  for i in g:
    i.delete()

"""
def convertProps(x,props):
  "this is for converting x into a form suitable for dynamo storage"
  tp = x["topic"]
  rs = {"topic":tp}
  for p in props:
    pv = x.get(p,None)
    if pv == None:
      #print "missing property of ",tp," :",p
    elif pv=="":
      pv = "__empty_string__"
    else:
      if type(pv)==dict:
        pv = json.dumps(pv)
      rs[p]=pv
  return rs
"""

def convertProps(x,props):
  "this is for converting x into a form suitable for dynamo storage. Works by side-effect. Returns undos "
  undos = {}
  for p in props:
    pv = x.get(p,None)
    if pv == None:
      continue
    if pv=="":
      undos[p]=pv
      x[p] = "__empty_string__"
    else:
      if type(pv)==dict:
        undos[p] = pv
        x[p] = json.dumps(pv)
  return undos

    
  

def extractProps(x,props):
  "x has come from dynamo; this converts it for external use"
  tp = x["topic"]
  rs = {"topic":tp}
  ctm = x.get("create_time")
  if ctm:
    rs["create_time"] = ctm
  for p in props:
    pv = x.get(p,None)
    if pv==None: continue
    if pv == "__empty_string__":
      pv = ""
    rs[p]=pv
  return rs





def xferTable(typ,tnm,topicMap=None):
  tab = getTable(tnm)
  props = tableProps[tnm]
  inr = tableIncludesRange[tnm]
  oitems = theStore.descriptorsWithType(typ)
  items = []
  tm = time_msec()
  
  for i in  oitems:
    if topicMap:
      tp = topicMap(i)
    else:
      tp = i["topic"]
    vprint("transfering ",tp)
    if inr:
      itm = tab.new_item(
        hash_key=tp,
        range_key = -1,
        attrs = convertProps(i,props)
        )
      itm["current_item_create_time"] = tm
    else:
      itm = tab.new_item(
        hash_key=tp,
        attrs = convertProps(i,props)
        )
      itm["create_time"] = tm

    items.append(itm)
    itm.put()
  return items


def fixJsonProp(x,p):
  
  pv = x.get(p,None)
  if pv == None:
    return
  if pv == "":
    x[p] = None
    return
  pv = json.loads(pv)
  x[p] = pv

def fixJsonProps(x,ps):
  if x:
    for p in ps:
      fixJsonProp(x,p)
  return x




def xferUsers():
  xferTable("/type/userD","User")
  

def getItem(tnm,topic):
  tab = getTable(tnm)
  inr = tableIncludesRange[tnm]
  tprint("getItem",tnm,topic)
  try:
    if inr:
      itm = tab.get_item(hash_key=topic,range_key=-1)
    else:
      itm = tab.get_item(hash_key=topic)
      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return itm

""" Watch out: may not return all. See getTopics for batched version (getItems should be excised)"""
def getItems(tnm,topics):
  tprint("getItems",tnm,topics)
  if len(topics)==0: return []
  tab = getTable(tnm)
  inr = tableIncludesRange[tnm]
  try:
    if inr:
      """ the topic might have the form actualTopic|rangeKey (when we're getting versions) """
      keys = []
      for tp in topics:
        stp = tp.split("|")
        if len(stp)==2:
          keys.append((stp[0],int(stp[1])))
        else:
          keys = [(tp,-1) for tp in topics]
    else:
      keys = topics
    tprint("KEYS in getItems",keys)
    batchList = boto.dynamodb.batch.BatchList(dconn)
    batchList.add_batch(tab,keys)
    items = dconn.batch_get_item(batchList)      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return items["Responses"][tnm]["Items"]
 
def deleteItem(tnm,topic):
  tprint("deleteItem",tnm,topic)
  tab = getTable(tnm)
  itm = boto.dynamodb.item.Item(tab)
  inr = tableIncludesRange[tnm]
  if inr:
    itm = boto.dynamodb.item.Item(tab,hash_key=topic,range_key=-1)
  else:
    itm = boto.dynamodb.item.Item(tab,hash_key=topic)
  itm.delete()
  
def pseudoDeleteItem(tnm,topic):
  tprint("pseudoDeleteItem",tnm,topic)
  tab = getTable(tnm)
  itm = boto.dynamodb.item.Item(tab)
  inr = tableIncludesRange[tnm]
  if inr:
    try:
      itm = tab.get_item(hash_key=topic,range_key=-1)
    except Exception:
      print "PSEUDO DELETE FAILED FOR ",topic
      return
    """
    nitm =tab.new_item(
      hash_key =topic,
      range_key =  itm["current_item_create_time"]
    )
    nitm.update(itm)
    vprint("NITM ",nitm
    nitm["deleted"] = 1
    del nitm["current_item_create_time"]
    nitm.put()
    """
    itm["create_time"] = itm["current_item_create_time"]
    itm["deleted"] = 1
    del itm["current_item_create_time"]
    itm.put()
    itm = tab.get_item(hash_key=topic,range_key=-1)
    itm.delete()

  else:
    itm = boto.dynamodb.item.Item(tab,hash_key=topic)
  #itm.delete()



# only when range included
def pseudoDeletedItem(tnm,topic):
  tprint("getPseudoDeletedItem",tnm,topic)
  tab = getTable(tnm)
  itm = boto.dynamodb.item.Item(tab)
  inr = tableIncludesRange[tnm]
  if inr:
    qrs = tab.query(hash_key=topic)
    for qr in qrs:
      if qr.get("deleted",None):
        return qr
   
  
   
def unDeleteItem(tnm,topic):
  tprint("unDeleteItem",tnm,topic)
  itm = pseudoDeletedItem(tnm,topic)
  if itm==None:
    return None
    
  itm["current_item_create_time"] = itm["create_time"] 
  itm["deleted"] = 0
  itm["create_time"] = -1
  itm.put()
  itm = pseudoDeletedItem(tnm,topic)
  if itm:
    print "NEEDED 2ND DELETE"
    itm.delete()





def getDict(tnm,topic,returnItemToo=False):
  itm = getItem(tnm,topic)
  props = tableProps[tnm]
  if itm:
    ep =  extractProps(itm,props)
    if returnItemToo:
      return (ep,itm)
    else:
      return ep
  else:
    return None
  
  
def getDicts(tnm,topics):
  items = getTopics(tnm,topics)
  vprint("ITEMS",items)
  props = tableProps[tnm]
  if items != None:
    return [extractProps(itm,props) for itm in items]
  else:
    return None

# if there is current version of this item, stash it as a non-current version; assumed to be a table with range

def stashObject(tnm,value):
  topic = value.topic
  tab = getTable(tnm)
  itm = tab.get_item(hash_key=topic,range_key=-1) # ,attributes_to_get=["current_item_create_time"])
  if not itm:
    return False
  ctm = itm["current_item_create_time"]
  itm["topic"] = topic
  saveDict(tnm,itm,True,ctm)
  if tnm == "Snap":
    tab = getTable("AlbumToSnaps")
    " update this index table "
    rk = topic+"|"+str(ctm)
    tprint("updateAlbumToSnaps",rk)
    alb = value.album
    ii = tab.new_item(
      hash_key=alb,
      range_key = rk
    )
    ii.put()
  return itm
  


  
def saveDict(tnm,value,isNew=True,rkey=-1):
  vprint("NEW ",tnm," USING DYNAMODB FOR ",value)
  tprint("saveObject",tnm,value["topic"],isNew,rkey)
  tp = value["topic"]
  tprint("saveDict",tnm,tp,isNew,rkey)
  tab = getTable(tnm)
  props = tableProps[tnm]
  vprint("NEW PROPS ",props)
  hasRange = tableIncludesRange[tnm]
  if hasRange:
    itm = tab.new_item(
      hash_key =tp,
      range_key = rkey
    )
  else:
    itm = tab.new_item(
      hash_key =tp
    )
    
  if isNew:
    for p in props:
       if (rkey > 0) and (p == "current_item_create_time"):
        continue
       vl = value.get(p,None)
       if vl!=None:
         itm[p] = dynamoify(vl)
    tm = int(time.time()*1000)
    if rkey==-1:
      if hasRange and (rkey==-1):
        itm["current_item_create_time"] = tm
      else:
        itm["create_time"] = tm
    
    vprint("NEW ITEM ",itm)
    #traceback.print_stack()
    itm.put()
  else:
    for p in props:
      vl = value.get(p,None)
      if vl!=None:
        vprint("PUT THE ATTRIBUTE ",p,vl)
        my_put_attribute(itm,p,vl)
    vprint("UPDATE OF ",itm)
    itm.save()
  return itm
  

def saveObject(tnm,value,isNew=True,rkey=-1):
  if constants.wikiMode and tnm=="Snap" and (not isNew): 
    stashObject(tnm,value)
  return saveDict(tnm,value.__dict__,isNew,rkey)
  
""" 
def saveObject(tnm,value,isNew=True,rkey=-1):
  vprint("NEW ",tnm," USING DYNAMODB FOR ",value.__dict__)
  tprint("saveObject",tnm,value.topic,isNew)
  tp = value.topic
  tab = getTable(tnm)
  props = tableProps[tnm]
  vprint("NEW PROPS ",props)
  hasRange = tableIncludesRange[tnm]
  if hasRange:
    itm = tab.new_item(
      hash_key =tp,
      range_key = rkey
    )
  else:
    itm = tab.new_item(
      hash_key =tp
    )
    
  if isNew:
    for p in props:
       vl = getattr(value,p,None)
       if vl!=None:
         itm[p] = dynamoify(vl)
    tm = int(time.time()*1000)
    if hasRange and (rkey==-1):
      itm["current_item_create_time"] = tm
    else:
      itm["create_time"] = tm
    
    vprint("NEW ITEM ",itm)
    #traceback.print_stack()
    itm.put()
  else:
    for p in props:
      vl = getattr(value,p,None)
      if vl!=None:
        vprint("PUT THE ATTRIBUTE ",p,vl)
        my_put_attribute(itm,p,vl)
    vprint("UPDATE OF ",itm)
    itm.save()
  return itm
"""


def putAttribute(tnm,topic,attr,value):
  tprint("putAttribute",tnm,attr,value)
  tab = getTable(tnm)
  hasRange = tableIncludesRange[tnm]
  if hasRange:
    itm = boto.dynamodb.item.Item(tab,topic,-1)
  else:
    itm = boto.dynamodb.item.Item(tab,topic)
  itm.put_attribute(attr,dynamoify(value))
  itm.save()

  
  

tableProps["User"] = ["name","hashed_password","current_item_create_time","email","deleted","validation_code","validated","storage_allocation","bandwidth_allocation","bandwidth_exceeded","bandwidth_warning_sent","tumblr_token","tumblr_name","twitter_token","twitter_name","accepted_terms"]


tableProps["Snap"]  = ["current_item_create_time","album","caption","owner","cropid","description","shares_coverage","coverage","published","ordinal","talk","replicates","is_current_version","in_snaps"]

tableProps["Post"] = ["user","text","deleted"]

 
tableProps["Session"]  = ["user","start_time","last_access_time","active","timed_out"]


def genId():
  import hashlib
  tm = time.time()
  tm = str(tm)+"n98235J"
  sid = hashlib.sha224(tm).hexdigest()
  return sid


def getSession(topic):
  def fprint(*a):
    if 0: misc.printargs(a,"getSession")
  rs = getDict("Session",topic,returnItemToo=True)
  if rs:
    rsd = rs[0]
    rsi = rs[1]
   
    ctm = time.time()   
    lacc = rsd.get("last_access_time",ctm)
    fprint("session",rsd["topic"]," since last access ",ctm-lacc)
    # only bother writing access time every 10 minutes
    etm = ctm - lacc
    if (etm > constants.sessionTimeout):
      rsi.put_attribute("timed_out",1)
      tprint("sessionSave",topic)
      rsi.save()
      fprint("session timed out",rsd["topic"])
      rsd["timed_out"] = 1
      return rsd
    if rsd.get("timed_out",0) == 0: rsd["timed_out"] = 0
    if etm > 600:
      # rsi.put_attribute("last_access_time",ctm)
      # save the write: only write last access time every 10 minutes
      tprint("sessionSave",topic)
      rsi.put_attribute("last_access_time",ctm)
      rsi.save()
    return rsd
    
  
  

def deactivateSession(topic):
    vprint("DEACTIVATING SESSION FROM DYNAMODB")
    itm = getItem("Session",topic)
    if itm==None:
      return None
    itm.put_attribute("active",0)
    tprint("deactivateSession",topic)
    itm.save()
 
 

def newSession(user):
  def fprint(*a):
    if 1: misc.printargs(a)
  id = genId()
  stopic = "/session/"+id
  fprint("NEW SESSION USING DYNAMODB FOR ",user,"=",stopic)
  tprint("newSession",stopic)
  tab = getTable("Session")
  itm = tab.new_item(
    hash_key = stopic,
  )
  itm["user"] = user
  tm = int(time.time())
  itm["start_time"] = tm
  itm["last_access_time"] = tm
  itm["active"] = 1
  itm.put()
  return itm

def timeOutAllSessions():
  sess = allItems("Session")
  for ses in sess:
    ses.put_attribute("timed_out",1)
    ses.save()

  
""" shared means the image has albums by multiple authors """

tableProps["Image"] = ["externalLink","dimensions","untiledDimensions","author","title","owner","extension","tags",
              "tilingDepthBump","description","name","zoomDepthBump","year","tilingDepth","license","shared",
              "beenTiled","atS3","current_item_create_time","source","isPublic","deleted","localStorage","s3Storage"]

def xferImages():
  xferTable("/type/imageD","Image")



def getImage(topic):
  vprint("GETTING IMAGE "+str(topic))
  rs = getDict("Image",topic)
  if rs == None: return None
  rs = fixJsonProps(rs,["dimensions","untiledDimensions"])
  vprint("GETIMAGE",rs)
  return rs



def getImages(topics):
  rs = getDicts("Image",topics)
  vprint("RS",rs)
  frs = [fixJsonProps(im,["dimensions","untiledDimensions","tags"]) for im in rs]
  return frs

def saveImage(imageD,isNew=True):
  imp = tableProps["Image"]
  undos = convertProps(imageD.__dict__,imp)
  rs = saveObject("Image",imageD,isNew)
  imageD.__dict__.update(undos)

def deleteImage(topic):
  pseudoDeleteItem("Image",topic)





def deleteUser(topic):
  usr = getUser(topic)
  if usr:
    tumblr = usr.get("tumblr_name",None)
    if tumblr:
      itm = tumblrToUserItem(tumblr)
      if itm:
        u = itm["user"]
        if u==topic:
          itm.delete()
          return
    twitter = usr.get("twitter_name",None)
    if twitter:
      itm = twitterToUserItem(twitter)
      if itm:
        u = itm["user"]
        if u==topic:
          itm.delete()
          return
       
    email = usr.get("email",None)
    if email:
      itm = emailToUserItem(email)
      if itm:
        u = itm["user"]
        if u==topic:
          itm.delete()
 
    pseudoDeleteItem("User",topic)
 



def allItems(tnm):
  tprint("allItems",tnm)
  tab = getTable(tnm)
  sc = tab.scan()
  return [itm for itm in sc]


""" @todo put the condition in the scan """

def allImages():
  rs = []
  itms = allItems("Image")
  for itm in itms:
    if itm["create_time"] == -1:
      rs.append(fixJsonProps(extractProps(itm,tableProps["Image"]),["dimensions","untiledDimensions"]))
  return rs




# notNew means that a snap has been added; maybe it was deleted.
tableProps["Album"] = ["caption","owner","description","image","externalLink","current_item_create_time","published","deleted","featured","notNew"]

def xferAlbums():
  xferTable("/type/albumD","Album")
 




def getAlbum(topic):
  return getDict("Album",topic)

def getImageToAlbumsItem(albumD):
  tab = getTable("ImageToAlbums")
  ii = tab.get_item(
    hash_key=albumD.image,
    range_key = albumD.topic
  )
  return ii


def getSnapsAlbumTopic(imTopic,owner):
  tab = getTable("ImageToAlbums")  
  qrs = tab.query(hash_key=imTopic)
  for q in qrs:
    sn = q.get("snaps",None) # is this the ".snaps." album?
    o = q.get("owner",None)
    if o == owner and sn:
      return q["album"]

def countSnapsInAlbum(albTopic):
  tab = getTable("AlbumToSnaps")  
  qrs = tab.query(hash_key=albTopic)
  cnt = 0
  for q in qrs:
    cnt = cnt + 1
  return cnt
  


#TO HERE
def saveAlbum(albumD):
  tp = getattr(albumD,"topic",None)
  if tp:
    return saveObject("Album",albumD,False)
  else:
    im = albumD.image
    owner = albumD.owner
    oname = pathLast(owner)
    ims = im.split("/")
    imname = ims[3]
    imowner = ims[2]
    atp0  = "/album/"+imowner+"/"+imname+"/"
    acnti = atp0 +"count"
    idx = bumpCount(acnti)
    tp = atp0 + str(idx)
    albumD.topic = tp
    cap = getattr(albumD,"caption",None)    
    vprint("NEW ALBUM TOPIC ",tp,owner)
    tab = getTable("ImageToAlbums")
    tprint("updateImageToAlbums",tp)
    " update this index table "
    ii = tab.new_item(
      hash_key=im,
      range_key = tp
    )
    ii["owner"] = owner
    ii.put()
    return saveObject("Album",albumD,True)
 

# needed only temporarily; for fixing up the imagetoalbums table to include user

def setI2Aowner(albumD):
  tab = getTable("ImageToAlbums")
  ii = getImageToAlbumsItem(albumD)
  ii["owner"] = albumD.owner
  ii.put()
  


def assertPublished(albumD,force=False):
  published = getattr(albumD,"published",False)
  if published and not force:
    return
  albumD.published = 1
  saveAlbum(albumD)
  im = albumD.image
  ii = getImageToAlbumsItem(albumD)
  tab = getTable("ImageToAlbums")
  tprint("assertPublished",albumD.topic)
  ii["published"] = 1
  ii.put()


  
  
def deleteAlbum(albumD):
  vprint("dyn deleting album ",albumD.topic)
  pseudoDeleteItem("Album",albumD.topic)
  " update the index table "
  itm = getImageToAlbumsItem(albumD)
  itm.delete()
  

def allAlbums():
  sc = allItems("Album")
  " turn iterator into list"
  rs = []
  for album in sc:
    if album["create_time"] == -1:
      rs.append(extractProps(album,tableProps["Album"]))
  return rs
  


def getAlbumToSnapsItem(snapD):
  tab = getTable("AlbumToSnaps")
  ii = tab.get_item(
    hash_key=snapD.album,
    range_key = snapD.topic
  )
  return ii


def getSnap(topic):
  rs = getDict("Snap",topic)
  return fixJsonProps(rs,["coverage"]) 

def addSnapToAlbumsToSnaps(snap):
  tab = getTable("AlbumToSnaps")
  tprint("updateAlbumToSnaps",snap.topic)
  " update this index table "
  ii = tab.new_item(
    hash_key=snap.album,
    range_key = snap.topic
  )
  ii.put()
  
def saveSnap(snap,forXfer=False):
  tp = getattr(snap,"topic",None)
  if tp and (not forXfer):      
    return saveObject("Snap",snap,False)
  else:
    alb = snap.album
    if forXfer:
      tp = snap.topic
    else:
      albs = alb.split("/")
      scnti = alb +"/snapcount"
      idx = bumpCount(scnti)
      tp = "/snap/"+albs[2]+"/"+albs[3]+"/"+albs[4]+"/"+str(idx)
      snap.topic = tp
    addSnapToAlbumsToSnaps(snap)
    return saveObject("Snap",snap,True)
    


  
def deleteSnap(snapD):
  pseudoDeleteItem("Snap",snapD.topic)
  " update the index table "
  itm = getAlbumToSnapsItem(snapD)
  itm.delete()
  
def snapTopicsForAlbum(album,getAllVersions=False):
  tab = getTable("AlbumToSnaps")
  qrs = tab.query(hash_key=album)
  rs = []
  for qr in qrs:
    vprint(qr)
    sn = qr["snap"]
    if not getAllVersions:
      sns = sn.split("|")
      if len(sns)==2:
        continue
    rs.append(qr["snap"])
  return rs


def getSnaps(topics):
  #print "TOPICS ",topics
  rs = getDicts("Snap",topics)
  vprint("RS",rs)
  frs = [fixJsonProps(im,["coverage"]) for im in rs]
  return frs

def getUser(topic):
  return getDict("User",topic)
  

def emailToUserItem(email):
  tab = getTable("EmailToUser")
  tprint("emailToUserItem",email)
  try:
    itm = tab.get_item(hash_key=email)
      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return itm

def deleteEmailToUserEntry(email):
  itm = emailToUserItem(email)
  if itm:
    itm.delete()
    
def emailToUser(email):
  itm = emailToUserItem(email)
  if itm:
    return itm["user"]



def tumblrToUserItem(tumblrName):
  tab = getTable("TumblrToUser")
  tprint("tumblrToUser",tumblrName)
  try:
    itm = tab.get_item(hash_key=tumblrName)
      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return itm


def tumblrIsUser(tumblrName):
  tab = getTable("TumblrToUser")
  return tab.has_item(hash_key=tumblrName)

def tumblrToUser(tumblrName):
  itm = tumblrToUserItem(tumblrName)
  if itm:
    return itm["user"]


def setUserForTumblr(tumblrName,user):
  tab = getTable("TumblrToUser")
  itm = tab.new_item(
    hash_key = tumblrName,
  )
  itm["user"] = user
  tprint("setUserForTumblr")
  itm.put()
  

"""
rather than add a table for twitter users, the key for twitter users is twitter:twitterScreenName
"""


def twitterToUserItem(twitterName):
  tab = getTable("TumblrToUser")
  tprint("twitterToUser",twitterName)
  try:
    itm = tab.get_item(hash_key="twitter:"+twitterName)
      
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
    return None
  return itm


def twitterIsUser(twitterName):
  tab = getTable("TumblrToUser")
  return tab.has_item(hash_key="twitter:"+twitterName)

def twitterToUser(twitterName):
  itm = twitterToUserItem(twitterName)
  if itm:
    return itm["user"]


def setUserForTwitter(twitterName,user):
  tab = getTable("TumblrToUser")
  itm = tab.new_item(
    hash_key = "twitter:"+twitterName,
  )
  itm["user"] = user
  tprint("setUserForTwitter")
  itm.put()
  
  




  
def saveUser(userD,newUser=True):
  vprint("NEW USER USING DYNAMODB FOR ",userD.__dict__)
  tp = userD.topic
  tumblr = getattr(userD,'tumblr_name',None)
  twitter = getattr(userD,'twitter_name',None)
  if tumblr:
    setUserForTumblr(tumblr,tp)
  elif twitter:
    setUserForTwitter(twitter,tp)
  else:
    email = getattr(userD,"email",None)
    if email:
      setUserForEmail(email,tp)
  return saveObject("User",userD,newUser)
 
def genNewUserId():
  while 1:
    lid = genId()
    id = lid[0:7]
    rs = "/user/"+id
    itm = getItem("User",rs)
    if itm == None:
      return id
    vprint("TRYING AGAIN genNewUserId ",rs)
    
    


def allUsers():
  sc = allItems("User")
  rs = []
  for u in sc:
    if u["create_time"] == -1:
      rs.append(u)
  return rs

  

  
  
uploadProps = ["name","user","size","uploaded","cancelRequest","exists","start_time","status"]

tableProps["Upload"] = uploadProps
tableIncludesRange["Upload"] = False


def getUpload(topic):
  return getDict("Upload",topic)

def saveUpload(uploadD,newUpload=True):
  vprint("NEW UPLOAD USING DYNAMODB FOR ",uploadD.__dict__)
  return saveObject("Upload",uploadD,newUpload)
  
#snapProps = ["created","current_item_create_time","caption","owner","cropid","description","shares_coverage","coverage","published","ordinal"]

snapProps = ["caption","owner","cropid","description","album","coverage","shares_coverage","published","ordinal","current_item_create_time"]


def pathLast(s):
  rf = s.rfind("/")
  return s[rf+1:]
  
#NOT CURRENTLY IN USE, BUT TESTED
def getTopics2(tab,kys):
  tprint("getTopics",tab,kys)
  btl = boto.dynamodb.batch.BatchList(dconn)
  btl.add_batch(tab,kys)
  return btl.submit()
 
  
def getTopics1(dest,tabname,tps,lb,ub):
  vprint("GRABBING ",lb," TO ",ub)
  tab = getTable(tabname)
  kys = []
  for i in range(lb,ub):
    #print "I ",i
    tp = tps[i]
    kys.append((tp,-1))
  #crs = getTopics2(tab,kys)
  #upk = crs.get("UnprocessedKeys",None)
  ftn = prefix+tabname
  while kys:
    crs = getTopics2(tab,kys)
    its = crs["Responses"][ftn]["Items"]
    dest.extend(its)
    upk = crs.get("UnprocessedKeys",None)
    if upk:
      ukys = upk[ftn]['Keys']
      vprint("UNPROCESSED KEYS",len(ukys))
      kys = [(uky["HashKeyElement"],-1) for uky in ukys]
      vprint(kys)
    else:
      kys = None
 
batchSize = 50 # with batch size 50, not all values were returned!

def getTopics(tabname,itps):
  rs = []
  tps = []
  " itps might be a generator"
  for tp in itps:
    tps.append(tp)
  ln = len(tps)
  for lb in range(0,ln,batchSize):
    getTopics1(rs,tabname,tps,lb,min(ln,lb+batchSize))
  return rs




def getAlbums(topics):
  return getDicts('Album',topics)
 
""" 
def addCropids():
  snaps = snapTable().scan()
  for snap in snaps:
    tp = snap["topic"]
    print "addingn crop id to ",tp
    idx = int(pathLast(tp))
    snap["cropid"] = idx
    snap.put()
"""    
  

def buildImageToAlbums():
  itms = getTable("Album").scan()
  tab = getTable("ImageToAlbums")
  for i in itms:
    vprint("imageToAlbum",i["image"],i["topic"])
    ii = tab.new_item(
      hash_key=i["image"],
      range_key = i["topic"]
      )
    ii.put()
  

def albumTopicsForImage(image,owner=None):
  tprint("albumTopicsForImage",image)
  tab = getTable("ImageToAlbums")
  qrs = tab.query(hash_key=image)
  rs = []
  for qr in qrs:
    if (not owner) or (owner == qr.get("owner",None)):
      rs.append(qr["album"])
  return rs

def getCountItem(cntkey):
  tprint("getCountItem",cntkey)
  tab = getTable("Count")
  try:
    itm = tab.get_item(hash_key=cntkey)
  except boto.dynamodb.exceptions.DynamoDBKeyNotFoundError:
      return None
  return itm

def getCount(cntkey):
  itm = getCountItem(cntkey)
  if itm==None:
    return None
  return itm["count"]
  
def bumpCount(cntkey):
  tprint("bumpCount",cntkey)
  itm = getCountItem(cntkey)
  tab = getTable("Count")
  if itm==None: # @todo to avoid race conditions, create this entry in the count able when underlying object (image or album) is created
    itm =  tab.new_item(
      hash_key=cntkey
      )
    itm["count"] = 1
    itm.put()
    return 1
  else:
    #ccnt = itm["count"]
    itm.add_attribute("count",1)
    itm.save()
    return getCount(cntkey)
    
    
  
def setCount(cntkey,value):
  itm = getCountItem(cntkey)
  tprint("setCount",cntkey)
  tab = getTable("Count")
  if itm==None: # @todo to avoid race conditions, create this entry in the count able when underlying object (image or album) is created
    itm =  tab.new_item(
      hash_key=cntkey
      )
    itm["count"] = value
    itm.put()
    return None
  else:
    #ccnt = itm["count"]
    rs = itm["count"]
    itm.put_attribute("count",value)
    itm.save()
    return rs
""" for testing capacity limit violations """



def savePost(postD,isNew=True):
  return saveObject("Post",postD,isNew,int(time.time()*1000)
);

"""
def createTables():
dyn.createTable("Count")
dyn.createTable("Image")
dyn.createTable("Album")
dyn.createImageToAlbumsTable()
dynamo.createAlbumToSnapsTable()

dyn.createTable("Session")
dyn.createTable("User")
dyn.createTable("Snap")
dyn.createTable("Upload")
dyn.xferTable("/type/userD","User")
dyn.xferTable("/type/imageD","Image")
dyn.xferTable("/type/albumD","Album")
dyn.buildImageToAlbums()snaps.xferSnaps("/album/cg/The_Ambassadors/1")
import store.dynamo
dynamo = store.dynamo



def deleteItems(tnm):


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

  

python
execfile("ops/execthis.py")

uu = dynamo.allUsers()
byt = {}
for u in uu:
  byt[u["topic"]] = u

byt["/user/e244d69"]


dynamo.deleteItems("Post")
dir(boto.exception)

boto.dynamodb.exceptions.ProvisionedThroughputExceededException
tp = "/snap/4294b0e/one_dollar_bill_obverse/1/2"
snp = dynamo.getItem("Snap",tp)
btp = "/snap/4294b0e/one_dollar_bill_obverse/1/2444"
snp = dynamo.getItem("Snap",btp)
tab = dynamo.getTable("Snap")
try:
  itm = tab.get_item(hash_key=btp,range_key=-1)
except boto.exception as exx:
  print "HOO"


try:
  itm = tab.get_item(hash_key=btp,range_key=-1)
except Exception as exx:
  print "HOO"


snps = dynamo.getItems("Snap",[tp],True)

tm = snp["current_item_create_time"]


foo = dynamo.stashObject("Snap",tp)


import time

dynamo.timeOutAllSessions()

dynamo.deleteItems("Session")



import time
dyn = dynamo

dyn.getItem("Image",tp)

def repeatGetItem(tnm,topic,count,interval):
  stm = time.time()
  itms = []
  for i in range(0,count):
    print i
    itm = dynamo.getItem(tnm,topic)
    itms.append(itm)
    time.sleep(interval)
  return (time.time()-stm) - interval*count


utp = "/user/047f8da"
dynamo.getItem("User",tp)
itp = "/image/4294b0e/garden_of_earthly_delights"

repeatGetItem("User",utp,1000,0.05) # result 289 seconds
repeatGetItem("Image",itp,1000,0.05) # result 11 secs


tp = "/session/f2c0a987415af8526552889cf51137ab9b173e69a278fc0279bc55ce"

dyn.getItem("Session",tp)



def repeatPutItem(tnm,topic,prop,count,interval):
  stm = time.time()
  itms = []
  itm = dynamo.getItem(tnm,topic)
  for i in range(0,count):
    itm.put_attribute(prop,i)
    itm.save()
    time.sleep(interval)
  return (time.time()-stm) - interval*count



repeatPutItem("Session",tp,"start_time",400,0.01)

repeatGetItem("Session",tp,400,0.01)

"""
  #furb()