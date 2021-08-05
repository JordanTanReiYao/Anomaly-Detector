import tensorflow as tf
import torch
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, Dense, Dropout, LSTM
from tensorflow.keras.callbacks import ModelCheckpoint, TensorBoard
from tensorflow.keras import regularizers
from tensorflow.keras.layers import Input, Dropout, Dense, LSTM, TimeDistributed, RepeatVector, Bidirectional
import numpy as np
import pandas as pd
import math
from scipy.spatial.distance import cosine


class AutoEncoder:
    def __init__(self,docVectors,dataset,numOfAnomalies):
        # Hold the dataset
        self.dataset=dataset
        # Hold the sentence vectors
        self.docVectors=docVectors[np.where([any([x!=0 for x in y]) for y in docVectors])[0]]
        # Get the vectors which have null encodings (all 0s)
        self.NullVectors=np.where([all([x==0 for x in y]) for y in docVectors])
        # Get the number of anomalies to be detected
        self.numOfAnomalies=numOfAnomalies
        # Create AutoEncoder Neural Network Architecture

        #Input Layer
        input_layer = tf.keras.layers.Input(shape=(docVectors.shape[1],))

        #Encoder
        encoder = tf.keras.layers.Dense(100, activation="tanh",activity_regularizer=tf.keras.regularizers.l1(1e-3))(input_layer)
        encoder=tf.keras.layers.Dropout(0.9)(encoder)
        encoder = tf.keras.layers.Dense(50, activation='relu')(encoder)    
        encoder=tf.keras.layers.Dropout(0.9)(encoder)

        # Bottleneck
        encoder = tf.keras.layers.Dense(25, activation=tf.nn.leaky_relu)(encoder)

        # Decoder
        decoder = tf.keras.layers.Dense(50, activation='relu')(encoder)
        decoder = tf.keras.layers.Dropout(0.9)(decoder)
        decoder = tf.keras.layers.Dense(100, activation='relu',activity_regularizer=tf.keras.regularizers.l1(1e-3))(decoder)
        decoder = tf.keras.layers.Dropout(0.9)(decoder)
        decoder = tf.keras.layers.Dense(docVectors.shape[1], activation='tanh')(decoder)

        #Autoencoder
        self.autoencoder = tf.keras.Model(inputs=input_layer, outputs=decoder)

        self.autoencoder.compile(optimizer='adam', loss=tf.keras.losses.cosine_similarity,
                    metrics=[tf.keras.metrics.CosineSimilarity()])
                    

    def getPrediction(self):
        nb_epochs = 35
        batch_size = self.docVectors.shape[0]//3
        # Train autoencoder
        history = self.autoencoder.fit(self.docVectors, self.docVectors, epochs=nb_epochs, batch_size=batch_size,
                        validation_data=(self.docVectors, self.docVectors)).history
        # Get predicted vector values
        predicted=self.autoencoder.predict(self.docVectors)
        return predicted

    # Compute cosine similarities between original and predicted vectors
    # Return list of cosine similarities for all text lines
    def getComputedSimilarities(self,reverse=False):
        # Get predicted vectors
        predicted_vectors=self.getPrediction()
        cosineSimilarities = []
        for i in range(len(self.docVectors)):
            # Compute cosine similarit between original and predicted vectors
            cosine_sim_val = (1 - cosine(self.docVectors[i], predicted_vectors[i]))
            # Append to list with more details abt text - which file it is from, which line, etc.
            cosineSimilarities.append({'Database':self.dataset.iloc[i]['database'],'Filename':self.dataset.iloc[i]['filename'],
            'Line':str(self.dataset.iloc[i]['line']),'Text data':self.dataset.iloc[i]['text'],
            'Cosine Similarity':str(round(cosine_sim_val,3))})

        return sorted(cosineSimilarities, key=lambda x:float(x['Cosine Similarity']), reverse=reverse)

    # Get the top anomalies based on the lowest cosine similarities
    def getTopAnomalies(self):
        # Get list of all cosine similarities
        self.MainAnomalies=list(filter(lambda x:x['Cosine Similarity']!='nan',self.getComputedSimilarities()))

        cosine_vals=[float(i['Cosine Similarity']) for i in self.MainAnomalies]

        # Get all the cosine similarity values
        self.MetricRange=[str(i) if not math.isnan(i) else None for i in cosine_vals]
        
        # Get average cosine similarity value
        self.MeanMetric=np.nanmean(cosine_vals)

        # Format null vectors data into appropraite format for frontend to understand
        NullAnomalies=[{'Database':self.dataset.iloc[int(x)]['database'],'Filename':self.dataset.iloc[int(x)]['filename'],'Line':str(self.dataset.iloc[int(x)]['line']),
        'Text data':self.dataset.iloc[int(x)]['text'],'Cosine Similarity':'NA'} for x in self.NullVectors[0]]
        
        TotalAnomalies=[dict([('Rank',index+1)]+list(data.items())) for index,data in enumerate(NullAnomalies+self.MainAnomalies)][:self.numOfAnomalies] 
        
        return TotalAnomalies
    
   
    
    