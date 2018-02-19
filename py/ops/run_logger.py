#!/usr/bin/env python
import subprocess
import datetime
import time
import ops.logs
logger = ops.logs
"""



hb,

i thought i would simply try to write down our situation, as concisely as possible but without major ommissions. i have great instability of mind, so things seem different to me at different
times, but that is part of what i should record.

i'll start with the extremely irritating old ground of my nature.  forgive me, yet again,, for a moment.


i feel quite viscerally, so much of the time, the solitude, the gap. it is not a matter of the presence or absence of the objective capability to communicate. it is the feeling of communication, the feeling of contact, that is important.  in any case, i have lost the knack of the feeling of communication with respect to my general thoughts.   the huge exceptions are the kind of coziness of talking with you, or with our friends, about a wide but not complete range of subjects: the snood, politics, the dawn. so i feel there is a cozy world, within which the feeling of communication is very much present. this is a realm which i love intensely, and to which i am intensely attached,
then there is the airy realm of the rest of my head.

i had the idea that talking to liz was a strange breach in the solitude of this other realm, or part of it anyway. i realize it was a feeling and a feeling only.
i feel the insanity of it, but have had a terrible time casting it away. in a way my life has always been split to some degree in the
manner described in the last paragraph, but the liz phenomenon was, as kreisel used to say, "the outward and visible sign of an inward
and invisible disgrace" (an inversion of the common book of prayer's definition of a sacrament).

some of me fits into our common world, but some does not. of course, i realize that this is the universal situation - your situation too.  that is why
i loved the idea of the non-self, of self with sim card, where the idea of a unified personhood could be left aside without regret.

the above points might just be a little summary of the human condition - joe the shrink thought so. but here are some real problems:

first, there has been the feeling of an impossible situation, which had to be resolved - a feeling which came from both of us. neither of us accepted the liz phenomenon as a facet of the human condition, of the divided self, but rather thought of it as intolerable. of course you thought this, with never a doubt in your mind, but
i couldn't reconcile  the various aspects of my perceptions either - my love for you and our astoria life, and the percieved or imagined breach in my isolation by talking to a young woman. i also imagined that a choice must be made. not between you and liz, but  between a) settling back into our common life, and casting aside the idea that  anything resembling the liz phenomenon could ever happen again, and b) an escape into the lawless void, where divided selves are no problem, but where  zero selves might the actual outcome.



second, of course i have been a terrible partner during this whole period: cold and bumly.

the third problem might be the hardest, because it is not entangled in the liz issue, which is in the process of being resolved in the way you had wished. for me, liz or no liz, the world is divided.






i flip between three states: contentment, restlessness, and something for which loneliness is an inadequate word - a quite intense feeling of void which applies to all matters. nothing will mean anything again sort of thing (oh poor me i know). 






dear liz,

how are you? as howard brodkey might ask, how are the moments?

i am out wandering by myself yet again, not far from astoria so far - in seattle. I was at the seattle art museum yesterday, which is hosting a show of
australian aboriginal art. the paintings seem fully abstract, swarms of dots travleling, but most depict particular situations, or
so say the little
placards next to them. the story associated with one painting involved the punishment of a greedy boy, a boy whose
greed was shown for  example by an incident in  which he cut out the heart of an emu
and took it away to eat by himself. as punisment he was turned into the wind. i liked this as an image of non-self - seeing but not seen, without place,
empty and clear.
an apt punishment for  greed, for lack of contentment.

hmmm. every image and thought has a flaw, for example a worm of sentimentality.

i search for thoughts which will open a breach in the paper bag. for moments i feel i have found something, but the feeling has not persisted, at least so far.



i have a question. would it make a difference to you to see me? is there any possibility i might help you? i know i don't have to ask you not to be polite.


-chris
walton ford nela
hb,

my mind is unstable as you know so well. the instability affects my judgement - the whole world, its meaning, and the significance of what i do, all flip over
into new states, and actions that seemed right come to seem terribly wrong. 


you would do me a favor in your directness.

am i mostly tedious - i can certainly see where i might be.


i can see things from the outside if i try,
i mostly find this "outside" mythical, but can adopt its point of view on a temporary basis.  anyway, from this point of view, i might  can accept this if is true. i know i don't have to ask that you reply

locationless, voiceless.




PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediver/py"
export PYTHONPATH
cd /mnt/ebs0/imagediver/py

python /mnt/ebs0/imagediver/py/ops/run_logger.py 

nohup python /mnt/ebs0/imagediver/py/ops/run_logger.py >> /mnt/ebs1/imagediver/log/logger.out &


PYTHONPATH=$PYTHONPATH:"/mnt/ebs0/imagediverdev/py"
export PYTHONPATH
cd /mnt/ebs0/imagediverdev/py

python /mnt/ebs0/imagediverdev/py/ops/run_logger.py 

nohup python /mnt/ebs0/imagediverdev/py/ops/run_logger.py >> /mnt/ebs1/imagediver/log/logger.out &

011741000344107
"""
logger.logjob(30*60,100000000)
"""

i am sorry for your loss - i wish i could improve on this conventional phrase.

forgive further thoughts, both for their commonplace nature, and perhaps their inappropriateness.

have you been in an earthquake? i've never been in one of substantial magnitude, but several in the 5 range - once above the 10th floor of a tokyo hotel. there is a feeling of the world becoming visible or tangible in its actuality for a moment. the episode of my father's death - after a week of reactive unconsciouness in the ICU, held that feeling in place for a while. strange. not as purely terrible as i would have expected. 

my thoughts are with you and megan. i think of your parents too - the absence of one and the terrible loss of the other. my memory of them is distant, but has a distinct feeling of happiness, warmth and generosity, mixed in my memory with the scent of El Rito wood smoke.

--chris



a good death is a gift, of course, one we'd all like to receive, but not as much as more life.

i hope my thoughts here are not jarring.  when my dad died, after a week of unconsiousness (but not absence of reaction) in the ICU, 
def logjob(delay,iterations):
  cnt = 0
  while cnt < iterations:
    dt = datetime.datetime.utcnow()
    print dt.isoformat(),"iteration",cnt
    cnt = cnt+1
    subprocess.call(["python","/mnt/ebs0/imagediverdev/py/ops/run_logger_once.py"])
    print dt.isoformat(),"completed\n"
    time.sleep(delay)

logjob(10,5)
"""
