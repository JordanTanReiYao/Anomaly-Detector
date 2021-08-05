from sklearn.neighbors import NearestNeighbors
import numpy as np
from sklearn.preprocessing import normalize

# Class to create K Nearest Neighbors Anomaly detection model
class KNearestNeighbors:
    def __init__(self,docVectors,dataset,numOfAnomalies):
        # Hold sentence vectors
        self.docVectors= normalize(docVectors[np.where([any([x!=0 for x in y]) for y in docVectors])[0]], axis=1, norm='l1')
        # Get the vectors which have null encodings (all 0s)
        self.NullVectors=np.where([all([x==0 for x in y]) for y in docVectors])
        # Hold the dataset (dataframe)
        self.dataset=dataset
        # Get the number of anomalies to detect
        self.numOfAnomalies=numOfAnomalies
        # Create the KNN model
        self.knn = NearestNeighbors(n_neighbors = int(0.5*docVectors.shape[0]))
        # Train the model
        self.knn.fit(self.docVectors)
   
    # Get the top anomalies where their average neighbor distance is more than the mean distance
    def getTopAnomalies(self):
        # Get the distances of each vector to the nearest neighbors
        distances, indexes = self.knn.kneighbors(self.docVectors)

        # Get the mean distance
        self.MeanMetric=np.mean(distances)

        # Get the full distance distribution
        self.MetricRange=list(np.mean(distances,axis=1).astype(str))

        # Get the indexes of the text data with their distances sorted
        DistanceIndexSorted=sorted([(index,distance) for index,distance in enumerate(distances.mean(axis=1))],key=lambda x:x[1],reverse=True)[:self.numOfAnomalies]

        # Format main anomaly data into appropriate format for frontend to understand
        MainAnomalies=[{'Database':self.dataset.iloc[int(x)]['database'],'Filename':self.dataset.iloc[int(x)]['filename'],'Line':str(self.dataset.iloc[int(x)]['line']),
        'Text data':self.dataset.iloc[int(x)]['text'],'Neighbor Distance':str(round(y,3))} for x,y in DistanceIndexSorted]

        NullAnomalies=[{'Database':self.dataset.iloc[int(x)]['database'],'Filename':self.dataset.iloc[int(x)]['filename'],'Line':str(self.dataset.iloc[int(x)]['line']),
        'Text data':self.dataset.iloc[int(x)]['text'],'Neighbor Distance':'NA'} for x in self.NullVectors[0]]

        TotalAnomalies=[dict([('Rank',index+1)]+list(data.items())) for index,data in enumerate(NullAnomalies+MainAnomalies)][:self.numOfAnomalies]
        
        return TotalAnomalies

    