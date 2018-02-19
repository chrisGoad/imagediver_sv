
execfile("ops/execthis.py")
import re
import datetime
thePageStore = {"iam":"apache_logStore"}
apacheLog = "/var/log/apache2/other_vhosts_access.log"


verbose = True


def vprint(*args):
  if verbose:
    misc.printargs(args,"APACHELOGS")

"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python
execfile("ops/apache_log.py")

readLogs()


"%v:%p %h%l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\""

aa ='imagediver.org:80 211.28.42.189 - - [26/Aug/2012:08:53:04 +0000] "GET /login HTTP/1.1" 200 1022 "http://imagediver.org/tos" "Mozilla/5.0 (Windows NT 5.1; rv:14.0) Gecko/20100101 Firefox/14.0.1"'

readLog({},aa+"\n")

mapbureau.com:80 199.21.99.76 - - [26/Aug/2012:06:28:35 +0000] "GET /rdfmapper/ HTTP/1.1" 200 7804 "-" "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)"



site
client ip
skip
skip
datetime
request
skip
skip
referrer
agent




rep = '(?P<site>[^\ ]*)\ (?P<client_ip>[^\ ]*)\ (?:[^\ ]*)\ (?:[^\ ]*)\ \[(?P<date>[^\:]*)\:(?P<time>[^\]]*)\]\ \"(?P<request>[^\"]*)\"\ '+\
'(?:[^\ ]*)\ (?:[^\ ]*)\ \"(?P<referrer>[^\"]*)\"\ \"(?P<user_agent>[^\"]*)\"'



m = re.search(rep,aa)
m.groups()

m.group('date')
m.group('time')
m.group('requestor')

m.group('request_id')

"""



rep = '(?P<site>[^\ ]*)\ (?P<client_ip>[^\ ]*)\ (?:[^\ ]*)\ (?:[^\ ]*)\ \[(?P<date>[^\:]*)\:(?P<time>[^\]]*)\]\ \"(?P<request>[^\"]*)\"\ '+\
'(?:[^\ ]*)\ (?:[^\ ]*)\ \"(?P<referrer>[^\"]*)\"\ \"(?P<agent>[^\"]*)\"'


def readLog(byentry,cn):
  global logcnt,cf_logDir
  vcnt = 0
  cns = cn.split("\n")
  fns = []
  cnsln = len(cns)
  #print "LINES ",cnsln
  for ln in cns:
    #print "LINE",ln
    dm = re.search(rep,ln)
    if dm:
      site = dm.group('site')
      if site != "imagediver.org:80": continue
      dt = dm.group('date')
      rq = dm.group('request')
      rfr = dm.group('referrer')
      agnt = dm.group('agent')
      #grps = dm.groups()
      #dt = grps[0]+"-"+grps[1]+"-"+grps[2]
      pdt =  datetime.datetime.strptime(dt,"%d/%b/%Y")
      fim = rfr.find("imagediver.org") >= 0
      dto = pdt.toordinal()
      bots = ['bingbot','Googlebot']
      isBot = False
      for bot in bots:
        if agnt.find(bot) >= 0:
          isBot = True
          continue
      if isBot:  continue
      isgetTopic = rq.find("GET /topic/") >= 0
      if not isgetTopic: continue
      isDollar = rq.find("dollar") >= 0
      print dt,"REQ",rq,"REF",rfr,"AG[",agnt,"]",fim,isgetTopic,isBot
      continue
      #if (isgetTopic or isDollar) and not fim:
      print "date ",dt,dto
      if isDollar:
        print "date [",dt,"] dto ",dto," request [",rq,"]referrer[",rfr,"]"
     
    else:
      #print "NO MATCH [",ln,"]"
      continue
      #print "DATE",dt,"ORDINAL",dto
      if dto < 734716:
        print "DELETE"
        k.delete()
        return
      m=re.search('\"GET ([^"]*)\"',ln)
      if m:
        pass
        #print m.groups()

      m=re.search('\"GET \/topic\/album\/(\w*)\/(\w*)\/(\d*)\/index.html',ln)
      if m:
        grps = m.groups()
        if len(grps)==3:
          owner=grps[0]
          im = grps[1]
          albumIdx = grps[2]
         
          dm = re.search('\[(\d*)\/(\w*)\/(\d*)',ln)
          if not dm:
            raise Exception("MISSING DATE")
          grps = dm.groups()
          dt = grps[0]+"-"+grps[1]+"-"+grps[2]
          enkey = dt+"."+owner+"."+im+"."+albumIdx
          cv = byentry.get(enkey,None)
          if cv==None:
            byentry[enkey] = 1
          else:
            byentry[enkey] = cv + 1
          vcnt = vcnt + 1
          print vcnt
        #print byentry
        vprint("VISIT DATE",dt,"OWNER",owner,"image",im,"albumIdx",albumIdx)

 
def readLogs():
  print "ZUB"
  global logcnt
  logcnt = 0
  fl = open(apacheLog,"r")
  flc = fl.read()
  byent = {}
  readLog({},flc)
  return byent
       