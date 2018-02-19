"""
cd /mnt/ebs0/termite/py/data
python wikipedia.py
sudo apt-get install python-setuptools

easy_install parsedatetime-0.8.7-py2.5.egg

easy_install http://code.google.com/p/parsedatetime/downloads/detail?name=parsedatetime-0.8.7-py2.5.egg

easy_install http://code.google.com/p/parsedatetime/downloads/detail?name=parsedatetime-0.8.7-py2.5.egg&can=2&q=

"""
import urllib
import urllib2
import json

wikiTimeout = 2
#http://en.wikipedia.org/w/api.php?action=login&lgname=ChrisGoad&lgpassword=psanlecu
url = "http://en.wikipedia.org/w/api.php"
data = {"format":"json","action":"login","lgname":"ChrisGoad","lgpassword":"psanlecu"}
datas = urllib.urlencode(data)
rq = urllib2.Request(url)
rr = urllib2.urlopen(rq,datas,wikiTimeout)
rs0 = rr.read()
rso = json(rs0)



urllib2.OpenerDirector.open(rq,None,wikiTimeout)

  rq = urllib2.urlopen(url,None,wikiTimeout)
  rs = rq.read()
  return rs
  
def grabWikipediaPage(name):
  url = "http://en.wikipedia.org/w/index.php?title="+name+"&action=raw"
  print "GRABBING "+url
  rs = grabPage(url)
  return StringWC(rs)
  
class WikiLink:
  def __init__(self,pname,dtext):
    self.pageName = pname
    self.displayText = dtext
  
  def __str__(self):
    return "[["+self.pageName+"|"+self.displayText+"]]"
  

def getWLink(s):
  m = re.search('\[\[(.*)\]\]',s)
  if m:
    g0 = m.group(0)
    ltxt = g0[2:len(g0)-2]
    sp = ltxt.rsplit("|")
    if len(sp)==1:
      txt = ltxt
    else:
      txt = sp[1]
    return WikiLink(sp[0],txt)
    
  return None    

def WLPageName(s):
  s.rsplit("|")[0]

def WLDisplayText(s):
  sp = s.rsplit("|")
  if len(sp)==1:
    return s
  return s[1]
  
def filterProperties(d,filter):
  rs = {}
  for k,v in d.iteritems():
    flt = filter.get(k,None)
    if flt:
      rs[flt] = v
  return rs



def albumTriples(artist,albumname,imsize):
  rst = grabWikipediaPage(albumname)
  rst.nextInfoBox()
  ibx = rst.grabInfoBox()
  flt = filterProperties(ibx,{"Released":"releaseDate","Cover":"cover","Name":"title"})
  trps = []
  trps.append([albumname,"__type__",["type/Album"]])
  tr0 = [albumname,"artist",[artist]] 
  trps.append(tr0)
  for k,v in flt.iteritems():
    if k == "releaseDate":
      v = dateToISO8601(v)
    if k == "cover":
      ov = v
      v = getImageUrl(v,imsize)
    trp = [albumname,k,v]
    trps.append(trp)
  return trps

def getImageUrl(nm,size):
  qnm = urllib.quote_plus(nm)
  print "QNM "+qnm
  qurl = "http://en.wikipedia.org/w/api.php?action=parse&text=[[File:"+qnm+"|"+str(size)+"px]]&format=json"
  print "GETTING IMAGE "+qurl
  txt = grabPage(qurl)
  txt = txt.replace("\\","")
  m = re.search('src="([^"]*)"',txt)
  if m:
    rs = "http:"+m.group(1)
    print "GOT "+rs
    return rs

  
    
"""

trps = albumTriples("The_Rolling_Stones","The_Rolling_Stones_(album)")
print trps


exit()
rst = grabPage("The_Rolling_Stones_(album)")
rst.nextInfoBox()
ibx = rst.grabInfoBox()
print ibx
#print rst.InfoBoxType()
exit()
              
rst = grabPage("The_Rolling_Stones_discography")
rst.nextTable()
rs = rst.grabRows()
printWithLFs([getWLink(x) for x in AAselect(rs,1)])
rst.firstRow()
rst.grabRow()

print rst.grabRow()
rst.show()

http://api.billboard.com/apisvc/chart/v1/list?sdate=2003-10-10&edate=2008-08-08&api_key=bvk4re5h37dzvx87h7rf5dqz

http://en.wikipedia.org/w/api.php?action=expandtemplates&text=%7B%7BProject:Sandbox%7D%7D

http://en.wikipedia.org/w/api.php?action=parse&text=[[File:TattooYou81.jpg|50px]]&format=json

http://upload.wikimedia.org/wikipedia/en/thumb/1/16/TattooYou81.jpg/50px-TattooYou81.jpg


https://www.googleapis.com/freebase/v1/search?query=Rolling+Stones&indent=true&type=/music/artist&mql_output={"id":null}

  

https://www.googleapis.com/freebase/v1/mqlread?query=[{"type":"/music/album","name":null,"artist":{"id":"/en/the_beatles"},"release_date":null,"limit":30,"/common/topic/image":[{"id":null}]}]&cursor

https://www.googleapis.com/freebase/v1/text/en/mona_lisa

https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/en/the_garden_of_earthly_delights","*":null}]
https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/en/the_garden_of_earthly_delights","type":"/visual_art/artwork","*":null}]
https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/en/the_garden_of_earthly_delights","type":"/common/topic","*":null}]
https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/en/the_garden_of_earthly_delights","type":"/book/book_subject","*":null}]

https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/en/mona_lisa","type":"/visual_art/artwork","*":null}]

https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/en/mona_lisa","*":null}]

https://www.googleapis.com/freebase/v1/mqlread?query=[{"type":"/music/album","name":null,"artist":{"id":"/en/the_rolling_stones"},"release_date":null,"limit":3,"/common/topic/image":[{"id":null}]}]&cursor
https://www.googleapis.com/freebase/v1/mqlread?query=[{"id":"/wikipedia/images/en_id/2623274","*":null}]
 https://usercontent.googleapis.com/freebase/v1/image/wikipedia/images/en_id/2623274?maxwidth=400&maxheight=400&mode=fill&pad=false

"""

    
    
    
    
    
    