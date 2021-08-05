from Vectorizers.MpNetTransformer import *
from Vectorizers.FastTextModel import *

# Dictionary to map 'type' value to particular vectorizer class
vectorizers={
    'MpNet':MpNetTransformer,
    'FastText':FastTextModel
}

# Class to build particular vectorizer based on 'type' value
class VectorizerBuilder:
    def __init__(self,type,sentences):
        self.model=vectorizers.get(type)(sentences)
    
    def encode(self):
        return self.model.encode()






