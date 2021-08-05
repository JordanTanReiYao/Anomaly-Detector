from flask import Flask, make_response, request,jsonify,json
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from pymongo import ReturnDocument
from Vectorizers.VectorizerBuilder import *
from AnomalyModels.ModelBuilder import *
from itertools import permutations,combinations
import pandas as pd
import subprocess
import re
import sys

print(sys.version)

client = MongoClient()

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)

# Return root database directory
@app.route('/get_root_directory',methods=['GET'])
def get_root_directory():
    # Get database which holds root directory data
    MainDB=client['GeneralData']
    # Get collection which holds root directory value
    collection=MainDB['GeneralData']
    root=collection.find_one({"name":"rootDirectory"})
    print(root)
    #print(list(root))
    if root:
        # If not empty, return directory value
        return jsonify(directory=root['directory'])
    else:
        # If empty, means no value has been specified for root directory
        return jsonify(directory=None)
    

# Update root database directory
@app.route('/input_root_directory',methods=['POST'])
def input_root_directory():
    # Get value of new directory user input (wants to change to)
    directory=str(request.get_json()['directory'])
    # Get database which holds root directory data
    MainDB=client['GeneralData']
    # Get collection which holds root directory value
    collection=MainDB['GeneralData']

    print(collection.update_one({"name":"rootDirectory"}, {"$set":{'directory':directory}}, upsert=True))
    
    return jsonify(message='done',directory=directory)


@app.route('/get_anomaly_num',methods=['GET'])
def get_anomaly_num():
    # Get database which holds root directory data
    MainDB=client['GeneralData']
    # Get collection which holds root directory value
    collection=MainDB['GeneralData']
    anomalyNum=collection.find_one({"name":"anomalyNum"})
    print(anomalyNum)
    #print(list(root))
    if anomalyNum:
        # If not empty, return directory value
        return jsonify(number=anomalyNum['NumberOfAnomalies'])
    else:
        # If empty, means no value has been specified for root directory
        return jsonify(number=200)


# Update root database directory
@app.route('/input_anomaly_num',methods=['POST'])
def input_anomaly_num():
    # Get value of new directory user input (wants to change to)
    anomalyNum=request.get_json()['anomalyNum']
    # Get database which holds root directory data
    MainDB=client['GeneralData']
    # Get collection which holds root directory value
    collection=MainDB['GeneralData']
    result=collection.update_one({"name":"anomalyNum"}, {"$set":{'NumberOfAnomalies':anomalyNum}}, upsert=True)
    if not result.modified_count and result.matched_count:
        return jsonify(message='Please enter a different number')
    else:
        return jsonify(message='done',anomalyNum=anomalyNum)


@app.route('/get_anomaly_methods',methods=['GET'])
def get_anomaly_methods():
    methods=[]
    for vectorizer in vectorizers:
        for model in models:
            methods.append("{} {}".format(vectorizer,model))

    return jsonify(methods=methods)
    


# Open particular line of text in file in Notepad++
@app.route('/get_textfile_view',methods=['GET'])
def get_textfile_view():
    # Get line number the text is written on
    lineNumber=request.args.get('lineNumber',type=str)
    # Get name of file
    fileName=request.args.get('fileName',type=str)
    # Get name of database (folder) the file is in
    database=request.args.get('database',type=str)
    # Get root directory which holds all the folders
    root=request.args.get('root',type=str)
    # Run command line command to open file at a particular line in Notepad++
    subprocess.run(['notepad++.exe','-multiInst', r"{}\{}\{}".format(root,database,fileName), "-n{}".format(lineNumber)],shell=True)
    return jsonify(message='text file opened')


# Upload files to existing database or create new one with uploaded file
@app.route('/upload_multiple_files',methods=['POST'])
def upload_multiple_files():
    # Get name of database from request argument
    dbname=request.args.get('dbname',type=str)  
    # Get user's choice to upload to existing database or create new one from request argument
    choice=request.args.get('choice',type=str)  
    # Get main database which stores all the different text databases (collections)    
    MainDB=client['TextData']

    # Check if name of new database to create already exists
    if choice=='create' and dbname in MainDB.list_collection_names():
        return jsonify({'message':'Database already exists!'})
    
    # Get particular text database to upload files to
    collection=MainDB[dbname]
    # Get files to be uploaded 
    uploaded_files = request.files.getlist("files[]")

    # Upload text data in each file to database
    for f in uploaded_files:
        finalised=[{'filename':f.filename,'text':re.match('^(.*?)(\r{0,1})(\n{0,1})$',line.decode()).group(1),'line':i+1,'database':collection.name} for i,line in enumerate([line for line in f])]
        collection.insert_many(finalised)
     
    return jsonify({'message':'Database created successfully!'}) if choice=='create' \
    else jsonify({'message':'File{} uploaded successfully'.format("s" if len(uploaded_files)>1 else '')})
    

# Get names of existing databases
@app.route('/get_database_names',methods=['GET'])
def get_database_names():
    # Get main database which stores all the different text databases (collections)    
    MainDB=client['TextData']

    # Get names of all the text database names in it
    databaseNames=MainDB.list_collection_names()
    return jsonify(DbNames=databaseNames)


# Delete existing database
@app.route('/delete_database',methods=['DELETE'])
def delete_database():
    # Get names of databases to delete
    dbnames=request.args.get('name',type=str).split(',')
    # Get main database which stores all the different text databases (collections)
    MainDB=client['TextData']
    # Delete databases 
    for db in dbnames:
        # If particular database not found, return error message
        if db not in MainDB.list_collection_names():
            return jsonify({'message':'Database not found'})
        else:
            collection=MainDB[db]
            collection.drop()
    return jsonify({'message':'Databases deleted successfully'}) if len(dbnames)>1  \
        else jsonify({'message':'Database deleted successfully'})


# Perform anomaly detection
@app.route('/anomalyDetection',methods=['GET'])
def anomalyDetection():
    # Get list of database names to run anomaly detection on
    dbnames=request.args.get('dbname',type=str).split(',')

    # Get main database which stores all the different text databases (collections)
    MainDB=client['TextData']
    
    # Create consolidated dataframe which stores the text data across the different databases
    # Use the attributes of each text data document as the dataframe column names
    colNames=list(pd.DataFrame(MainDB[dbnames[0]].find()).columns)

    # Create initial empty dataframe with the specified columns
    collatedDF=pd.DataFrame(columns=colNames)

    # Append the data in each text database to the dataframe
    for name in dbnames:
        collatedDF=collatedDF.append(pd.DataFrame(MainDB[name].find()),ignore_index=True)

    # If resultant dataframe is empty, return error message
    if len(collatedDF)==0:
        return jsonify({'e_message':"Looks like the database is empty"})

    # Get encoder (vectorizer) and anomaly detection method types from request arguments
    encoder,method=request.args.get('method',type=str).split(' ')

    numOfAnomalies=request.args.get('anomalyNum',type=int)

    # Create specific vectorizer based on encoder string value
    Vectorizer=VectorizerBuilder(encoder,[line for line in collatedDF.text])

    # Convert text lines into numerical vectors
    docVectors=Vectorizer.encode()

    # Create specific anomaly model based on method string
    # Get top anomalies, metric distribution and mean metric
    AnomalyModel=ModelBuilder(docVectors,method,collatedDF,numOfAnomalies)
    MainAnomalies=AnomalyModel.getOutliers()
    FullMetricRange=AnomalyModel.getMetricRange()
    MeanMetric=AnomalyModel.getMeanMetric()
    
    return jsonify(TotalLines=str(len(collatedDF)),MeanMetric=str(MeanMetric),MetricRange=FullMetricRange,Anomalies=MainAnomalies)
        

if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)