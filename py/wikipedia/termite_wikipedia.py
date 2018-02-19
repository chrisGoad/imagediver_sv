"""
cd /mnt/ebs0/termite/py/data
python wikipedia.py
sudo apt-get install python-setuptools

easy_install parsedatetime-0.8.7-py2.5.egg

easy_install http://code.google.com/p/parsedatetime/downloads/detail?name=parsedatetime-0.8.7-py2.5.egg

easy_install http://code.google.com/p/parsedatetime/downloads/detail?name=parsedatetime-0.8.7-py2.5.egg&can=2&q=

"""

import parsedatetime.parsedatetime as pdt
import parsedatetime.parsedatetime_consts as pdc
import urllib
import urllib2
import re
import datetime
date = datetime.date
"""
p = pdt.Calendar()
r = p.parseDate("5 september 1999")
"""

pdCal = pdt.Calendar()

def safeInt(x):
  try:
    rs = int(x)
  except ValueError:
    return None
  return rs

def templateText(x):
  m = re.search("{{(.*)}}",x)
  if m==None:
    return None
  return m.group(1)
  
def parseWikiDate(txt):
  " see http://en.wikipedia.org/wiki/Template:Start_date"
  "{{Start date|year|month|day}}"
  ttxt = templateText(txt)
  sp = ttxt.rsplit("|");
  print sp
  if sp[0]=="nowrap":
    return dateToISO8601(sp[1])
  
  ints = []
  for s in sp:
    i = safeInt(s)
    if i != None:
      ints.append(i)
  print ints
  dt = date(ints[0],ints[1],ints[2])
  return dt


 
def dateToISO8601(txt):
  print "DATE "+txt
  txt = txt.strip()
  iswikit = txt[0:2]=="{{"
  print iswikit
  if iswikit:
    dt = parseWikiDate(txt)
  else:
    st = pdCal.parse(txt)
    d0 = st[0]
    dt = date(d0[0],d0[1],d0[2])
  if type(dt)==str:
    iso = dt
  else:
    iso = dt.isoformat()
  print txt,iso
  return iso
 

  
  #iso = dt.isoformat()
  print dt#,iso
  
  
  
class StringWC:
  def __init__(self,data,cursor=0):
    self.data = data
    self.cursor = cursor
    
  def nextTable(self):
    st = self.data
    tb = st.find("{| ",self.cursor)
    if tb < 0:
      return False
    self.cursor = tb
    return True
  
  def firstRow(self):
    self.cursor = self.data.find("|-",self.cursor)
  
  def pastLF(self):
    lf = self.data.find("\n",self.cursor)
    self.cursor = lf+1
    
  def grabRow(self):
    """ assumes the cursor is pointing at the beginning of a row """
    st = self.data
    pc = self.cursor+1
    rwe = st.find("|-",pc)
    tbe = st.find("|}",pc)
    mn = min(rwe,tbe)    
    self.pastLF()
    row = st[self.cursor:mn]
    self.cursor = mn
    return row.rsplit("\n|")
  
  def here(self,chars):
    lb = self.cursor
    ub = lb+chars
    return self.data[lb:ub]
  
  def show(self,chars=2):
    print "["+self.here(chars)+"]"
  
  def atTableEnd(self):
    cr = self.cursor
    return self.here(2) == "|}"
  
  def grabRows(self):
    self.firstRow()
    rs = []
    while True:
      rs.append(self.grabRow())
      if self.atTableEnd():
        return rs

  
  
  
  def nextWikiLink(self):
    st = self.data
    tb = st.find("[[",self.cursor)
    if tb < 0:
      return False
    self.cursor = tb
    return True
  
  def grabWikiLink(self):
    st = self.data
    ep = st.find("]]",self.cursor)
    rs =  st[self.cursor:ep+2]
    self.cursor = ep+2
    return rs
  
  def grabNextWikiLink(self):
    self.nextWikiLink()
    return self.grabWikiLink()
    
  
  def nextInfoBox(self):
    st = self.data
    tb = st.find("{{Infobox ",self.cursor)
    if tb < 0:
      return False
    self.cursor = tb
    return True
  
  def InfoBoxType(self):
    """ assumes at infobox """
    cr = self.cursor
    st = self.data
    eol = st.find("\n",cr)
    rs = st[cr+10:eol]
    self.cursor = eol+1
    return rs.split()

  def grabInfoBoxLine(self,rs):
    if self.here(2) == "}}":
      return False
    cr = self.cursor
    st = self.data
    eol = st.find("\n",cr)
    ln = st[cr+1:eol]
    pr = ln.partition("=")
    prp = pr[0].strip()
    vl = pr[2].strip()
    rs[prp] = vl
    self.cursor = eol+1
    return True
    
  def grabInfoBox(self):
    tp = self.InfoBoxType()
    rs = {}
    rs["__type__"] = tp
    while True:
      if not self.grabInfoBoxLine(rs):
        return rs
    



def AAselect(aa,n):
  """AA = array of arrays """
  rs = []
  for e in aa:
    if len(e)>n:
      rs.append(e[n])
  return rs  

def printWithLFs(a):
  for e in a:
    print str(e)+"\n"

wikiTimeout = 2

def grabPage(url):
  #qurl = "http://"+urllib.quote_plus(url)
 #print qurl
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

    
    
    
    
    
    