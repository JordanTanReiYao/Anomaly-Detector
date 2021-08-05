# Holds all the methods which will return a value in the future
from sentence_transformers import SentenceTransformer

def getMpNet():
    return SentenceTransformer('encode_packages/stsb-mpnet-base-v2')