
"""
http://dev.imagediver.com/topic/album/cg/astoria_1923_1/1
"""

import constants
execfile(constants.pyDir+"common_includes.py")




def emitPage(webin):
  rs = gen.genStdPage(webin,'users')
  return rs
  sess = webin.session;
  if sess==None:
    user = "";
  else:
    user = sess.user; 
  
  pg0= gen.pageHeader(webin,"the depths of high resolution images, annotated",facebook=False) + "<body>"
  pageName = 'users'
  if constants.compressJs:
    pg0 += commonCjsIncludes() +  cjsForPage(pageName)
  else:
    pg0 +=  commonJsIncludes() + jsForPage(pageName)

  pg1 = """

  page.initialize();

</script>
""" + constants.noScript + """
</body>
</html>
"""
  otxt = pg0 + \
    "<script>" + \
     "var loggedInUser='"+str(user)+"';\n" 
  otxt += constants.emitConstants()
  otxt += pg1

  return htmlResponse(otxt)
 
  
  
  

