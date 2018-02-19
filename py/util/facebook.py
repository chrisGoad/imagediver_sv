
def facebookMetaTags(url,title,image):
  return """
<meta property="fb:app_id" content="252341458175463"/>
<link rel="canonical" href="{0}">
<meta property="og:title" content="{1}"/>
<meta property="og:type" content="website" />
<meta property="og:url" content="{0}" />
<meta property="og:image" content="{2}" />
<meta property="og:site_name" content="ImageDiver" />
<meta property="fb:admins" content="614841860" />
""".format(url,title,image)

