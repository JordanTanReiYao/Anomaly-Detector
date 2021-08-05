from gensim.models import FastText  
import numpy as np

# FastText vectorizer model
class FastTextModel:
    def __init__(self,sentences):
        # Hold all the text lines
        self.sentences=sentences
        # Create model
        self.model = FastText(vector_size=768,min_count=1,alpha=0.004)   
        # Build vocabulary of model based on text lines
        self.model.build_vocab(corpus_iterable=[[i for i in text.split()] for text in self.sentences])
        # Train model
        self.model.train(corpus_iterable=[[i for i in text.split()] for text in self.sentences], total_examples=len(self.sentences),
                      epochs=20)
    
    def encode(self):
        return np.array([
            np.mean([self.model.wv[w] for w in texts.split(' ')], axis=0) for texts in self.sentences
        ])
        #representing each statement by the mean of word embeddings for the words used in the statement.
