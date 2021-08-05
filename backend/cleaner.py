from gensim import utils
import gensim.parsing.preprocessing as gsp
from scipy.spatial.distance import cosine
import numpy as np

def clean_text(s):
    filters = [
           #gsp.strip_tags, 
           #gsp.strip_punctuation,
           gsp.strip_multiple_whitespaces,
           #gsp.strip_numeric,
           #gsp.remove_stopwords, 
           #gsp.strip_short, 
           #gsp.stem_text
          ]
    s = s.lower()
    s = utils.to_unicode(s)
    for f in filters:
        s = f(s)
    
    s=s.strip()
    return s


