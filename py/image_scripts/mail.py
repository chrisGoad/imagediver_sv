#!/usr/bin/env python
"""


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python image_scripts/mail.py

"""

from smtplib import *
from email.mime.text import MIMEText

ss = SMTP("smtp.gmail.com")
ss.starttls()

ss.login("cagoad@gmail.com","psan343")
msg = MIMEText("TeStInG 5 6 7")
msg['Subject'] = "TEsT SuBjEcT"
msgs = msg.as_string()
ss.sendmail("cagoad@gmail.com","cagoad@gmail.com",msgs)
