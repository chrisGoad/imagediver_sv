#!/usr/bin/env python
"""
PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py
python admin_scripts/topic_mod.py


"""


import constants
constants.dbDir = "/mnt/ebs0/imagediverdev/dbs/"

import store.dstore
dstore = store.dstore
ds=dstore.DStore(constants.descriptorStore)
cn = ds.connection
c = cn.cursor()
 
 
ns = dstore.DStore('newdescriptors')
ncn = ns.connection
nc = ncn.cursor()
 
c.execute('''select topic,type,property,tvalue,ivalue,fvalue,jvalue,created from Triple''')
rs=c.fetchall()
print(str(rs[0]))
def modTopic(tp):
  if (tp.find("/image/")==0 or tp.find("/album/")==0)  or tp.find("/snap/")==0:
    tps = tp.split("/")
    ntps = [tps[1],'cg']
    ntps.extend(tps[2:])
    print(str(ntps))
    return "/" + "/".join(ntps)
  return tp



for tr in rs:
  tp = tr[0]
  ntp = modTopic(tp)
  print(tp+" => "+ntp)
  tv = tr[3]
  if tv:
    ntv=modTopic(tv)
  else:
    ntv = None
    #vls = (topic,ttype,property,None,None,None,jvalue,tm)
  vls = (ntp,tr[1],tr[2],ntv,tr[4],tr[5],tr[6],tr[7])  
  nc.execute('insert into triple (topic,type,property,tvalue,ivalue,fvalue,jvalue,created) values (?,?,?,?,?,?,?,?)',vls)
ncn.commit()

  
    
