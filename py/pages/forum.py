


import constants
execfile(constants.pyDir+"common_includes.py")



def emitPage(webin):
  return gen.genStdPage(webin,'forum','forum',staticSize=True)
  
