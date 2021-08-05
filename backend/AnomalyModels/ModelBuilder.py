from AnomalyModels.AutoEncoder import *
from AnomalyModels.KNearestNeighbors import *

# Dictionary to map 'type' value to particular anomaly detection model class
models={
        'Autoencoder': AutoEncoder,
        'KNN': KNearestNeighbors
        }

# Create particular anomaly detection model based on 'type' value
class ModelBuilder:
    def __init__(self,docVectors,type,dataset,numOfAnomalies):
        self.method=type
        self.AnomalyModel=models.get(type)(docVectors,dataset,numOfAnomalies)

    def getOutliers(self):
        self.outliers=self.AnomalyModel.getTopAnomalies()
        return self.outliers
    
    def getMetricRange(self):
        self.MetricRange=self.AnomalyModel.MetricRange
        return self.MetricRange
    
    def getMeanMetric(self):
        self.MeanMetric=self.AnomalyModel.MeanMetric
        return self.MeanMetric

