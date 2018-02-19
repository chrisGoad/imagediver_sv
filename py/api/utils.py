#!/usr/bin/env python

"""
/etc/init.d/apache2 restart
"""
import Logr
import misc

verbose = False

def vprint(*args):
  if verbose:
    misc.printargs(args,"APIUTIL")



def parseContent(content):
  content=urllib.unquote_plus(content)
  Logr.log("api","content ["+content+"]")
  scon = content.split("=")
  jsv = scon[1]
  return json.loads(jsv)

class ParsedPath:
  def __init__(self):
    self.method="get"
    self.format="html"
    self.name=""
    self.category=""
    self.id = None
    self.owner=None
    
  def __str__(self):
    return "ParsedPath category:"+self.category+" name:"+str(self.name)+" method:"+self.method+" owner:"+str(self.owner)+" format:"+self.format+" id:"+str(self.id)

def extractSessionId(request):
  hin = request.headers_in
  if "Cookie" in hin:
    cv=hin["Cookie"]
    
  
def parsePath(path):
  """
  Form "/topic/<category>/<name>/<method>() if there is no method, get()is assumed. 
  name might have internal /'s
  eg
  /topic/album/astoria_1923_1/0
  """
  sp = path.split("/")
  ln = len(sp)
  rs = ParsedPath()
  rs.history = 0
  if ln < 4:
    rs.error = "badPath"
    return rs
  rs.category=sp[2]
  if ln <= 4:
    rs.name=[sp[3]]
  else:
    fop = sp[ln-1];
    fparens=fop.find("()")
    if fparens<0:
      pastTopicIndex = ln
      if (ln >= 7) and (sp[6]=="history"):
        rs.history = 1
    else:
      pastTopicIndex = ln-1;
      fln=len(fop)
      rs.method=fop[0:fln-2]
      rs.format = "json"
    rs.name = sp[3:pastTopicIndex]
  vprint("PARSED NonAPI PATH: "+str(sp)+" to "+str(rs.__dict__))
  return rs


def parseApiPath(path):
  """
  Form "/api/<category>/<owner>/<name> and optionally "/<id>"
  /api/album/cg/astoria_1923_1/0
  """
  sp = path.split("/")
  ln = len(sp)
  rs = ParsedPath()
  if ln < 5:
    rs.error = "badPath"
    return rs
  rs.category=sp[2]
  rs.owner = sp[3]
  rs.name = sp[4]
  if ln >= 6:
    rs.id = sp[5]
    if ln >= 7:
      rs.subid = sp[6]
  else:
    rs.id = None
  
  vprint("PARSED API PATH: "+path+" to "+str(rs.__dict__))
  return rs


  

def emitJsonProp(x,p):
  pv = x.get(p,None)
  if pv == None:
    return
  if type(pv) == dict:
    pv = json.dumps(pv)
    x[p] = pv

def emitJsonProps(x,ps):
  for p in ps:
    emitJsonProp(x,p)
  return x
  
  
  

