import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React,{Component} from 'react';
import {toast} from 'react-toastify';
import Histogram from './components/Histogram/Histogram.js';
import ResultTable from './components/resultTable/resultTable.js';
import Progress from './components/progress/progress.js';
import FileUpload from './components/FileUpload/FileUpload.js';
import DeleteDatabase from './components/DeleteDatabase/DeleteDatabase.js';
import AnomalyDetection from './components/AnomalyDetection/AnomalyDetection.js';
import RootDataDirectory from './components/RootDataDirectory/RootDataDirectory.js';
import Success from './components/Success/Success.js';
import {drawGraph,downloadGraph} from './functions/drawGraph.js';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

class App extends Component {
  constructor(){
    toast.configure({className: 'toastBackground',
    bodyClassName:'toastBody',
    position:toast.POSITION.TOP_CENTER,
  })
    super()
    this.state = {
      rootDataDirectory:'Not Received', // Root database directory value
      rootDataDirectoryInput:null, // Current user input for root database directory value
      rootDataDirectoryChange:false, //Whether there is a change in input for root database directory
      anomalyMethods:null, // Anomaly detection methods 
      databaseNames:null, // List of existing database names
      numOfAnomalies:null, //Number of anomalies to detect (user adjustable)
      uploadDBName:null, // Name of databse currently selected to upload new files to
      toCreate:false, // Whether user wants to create a new database
      filesUploading:false, // Whether the files are still in process of being uploaded to database
      selectedDeleteDatabase:[],  // List of databases currently selected to be deleted
      deletedBefore:false, // Whether user has deleted a database before (in current session)
      selectedAnomalyDatabase:[], // List of databases currently selected to run anomaly detection on
      detectionMethod:null, // Anomaly detection method
      detectionActivated:false, // Whether user has activated process to detect anomalies in databases(s)
      resultsLoaded:false, // Whether the anomaly results have been generated
      anomalyResults:null, // Anomaly results received from backend
      metricName:null, // Anomaly metric name
      resultDivID:'resultDiv', // ID of div element which holds anomaly result table
      resultTableID:'resultTable',// ID of table which displays anomaly results
      showHistogram:false, // Whether to show anomaly metric distribution graph or not
      histogramID: 'Histogram', // ID of component which shows anomaly metric distribution graph
      svg:null // svg element that holds the anomaly metric distribution graph
      };
    }


    // Function to change root database directory
    changeDirectory = async() => { 
      // Pass in the new value that user input for root database directory
      let data={'directory':this.state.rootDataDirectoryInput}
      await fetch('http://localhost:5000/input_root_directory',{
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/json'},
        body:JSON.stringify(data),
        method:'POST'
      }).then(response=>response.json())
      .then(data=>{
      if (data.message=='done'){
        this.setState({
          // Change (store) root database directory on display if successful
          rootDataDirectory:data.directory,
          rootDataDirectoryChange:false
        })
        toast('Root data directory changed successfully!')
      }})}

      // Function to change root database directory
    changeAnomalyNum = async(anomalyNumInput) => { 
      console.log(Number(anomalyNumInput))
      if (!Number(anomalyNumInput)){
        toast('Please enter a number!')
        return
      }
      // Pass in the new value that user input for root database directory
      let anomalyNum={'anomalyNum':Number(anomalyNumInput)}
      await fetch('http://localhost:5000/input_anomaly_num',{
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/json'},
        body:JSON.stringify(anomalyNum),
        method:'POST'
      }).then(response=>response.json())
      .then(data=>{
      if (data.message=='done'){
        console.log(typeof(data.anomalyNum))
        this.setState({
          // Change (store) root database directory on display if successful
          numOfAnomalies:data.anomalyNum
        })
        toast('Number of anomalies to detect changed!')
      }
      else{
        throw new Error(data.message)
      }
    }).catch(e=>{
      toast(e.toString())
    })}


      // Function to take not of whether user wants to create new database or not
      uploadDatabaseChange=(e)=>{
        // If value is 'Create New Database', means user wants to create new database, change state to take note
        e.value=='Create New Database'?
          this.setState({
            toCreate:true
          })
        :this.setState({
          toCreate:false
        })
        this.setState({deletedBefore:false,
        uploadDBName:e.value,
      })
      }


      // Function to upload files to database or create new one
      uploadMultipleFiles=async(inputVal,filesToUpload)=>{
      // If no database chosen, tell user to choose first
      if (this.state.uploadDBName==null){
        toast('Please choose a database to upload file to!')
        return
      } 

      // If user chooses to create new database but no new name given
      if (this.state.uploadDBName=='Create New Database'
          && (inputVal==null ||inputVal=='')){
          toast('Please enter a database name!')
          return
        }
        
      // If no files selected for upload
      if (filesToUpload==null){
        toast('Please choose a file to upload!')
        return
      }
      
      // Input database name is either existing database selected or new database name input by user
      const dbname=this.state.uploadDBName=='Create New Database'?inputVal:this.state.uploadDBName;
      const choice=this.state.uploadDBName=='Create New Database'?'create':'existing'

      // Append files to be uploaded to FormData
      const formData = new FormData();
      const files =filesToUpload;
    
      for (let i = 0; i < files.length; i++) {
      formData.append('files[]',files[i])
        }

      this.setState({
        filesUploading:true
      })

      await fetch(`http://localhost:5000/upload_multiple_files?dbname=${dbname}&choice=${choice}`,{
        body:formData,
        method:'POST'
      }).then(
        response=>response.json()
      ).then(data=>{
        this.setState({
          filesUploading:false
        })
        if (choice=='create' && data.message=="Database created successfully!"){
          this.setState({
          // Include new database name in list of database names and sort them
          databaseNames:this.state.databaseNames.concat([inputVal]).sort(function(a,b){
          return a.toLowerCase().localeCompare(b.toLowerCase(),undefined, {
            numeric: true,
            sensitivity: 'base'
          })})
        })}
        else if (choice=='create'){
          throw new Error(data.message)
        }
        toast(data.message, 
          {position: toast.POSITION.TOP_CENTER})})
        .catch(e=>{
          this.setState({filesUploading:false})
          toast(e.toString())})}


    // Function to delete database
    deleteDatabase=async(e)=> {
    e.preventDefault();

    // If no databases selected for delete, inform user
    if (this.state.selectedDeleteDatabase.length==0){
      toast('Please select a database to delete!')
      return
    }
    
    // Concatenate all the database names selected into one whole string
    let dbnames=this.state.selectedDeleteDatabase.map(i=>i.value).join(',')

    await fetch(`http://localhost:5000/delete_database?name=${dbnames}`,{
        headers: 
        {'Accept': 'application/json',
          'Content-Type': 'application/json'},
        method:'DELETE'})
      .then(response=>response.json())
      .then(data=> {
        if (data.message=="Database deleted successfully" || data.message=="Databases deleted successfully"){
          this.setState({
          databaseNames:this.state.databaseNames.filter(i=>!this.state.selectedDeleteDatabase.map(i=>i.value).includes(i)),
          deletedBefore:true,
          toCreate:false,
          selectedAnomalyDatabase:[]
        }) 
        toast(data.message,)}})
        setTimeout(this.setState({
          selectedDeleteDatabase:[]
        }),100)}


      // Function to detect anomalies in database
      detectAnomalies=async() =>{
      // If no databases selected, inform user
      if (this.state.selectedAnomalyDatabase.length==0){
        toast('Please choose a database to run anomaly detection on!')
        return
      }

      // If no anomaly detectionmethod selected, inform user
      if (this.state.detectionMethod==null){
        toast('Please choose an anomaly detection method!')
        return
      }

      // Put UI in the loading state
      this.setState({
      detectionActivated:true,
      resultsLoaded:false,
      metricName:new RegExp('Autoencoder').test(this.state.detectionMethod)?'Cosine Similarity':'Neighbor Distance'
      })

      // Concat all the database names into one whole string
      let dbnames=this.state.selectedAnomalyDatabase.map(i=>i.value).join(',')
    
      await fetch(`http://localhost:5000/anomalyDetection?method=${this.state.detectionMethod}&dbname=${dbnames}&anomalyNum=${this.state.numOfAnomalies}`,{
        headers: {
          'Accept': 'application/json',
        },
        method: 'GET',})
      .then(response=>response.json())
      .then(data=> {
        if ('e_message' in data){
          throw new Error(data['e_message'])}  
          console.log(data.Anomalies)
        this.setState({
          anomalyResults:data,
          metricData:data.MetricRange.filter(i=>{return i!=null}).map(i=>Number(i))
        })
      setTimeout(()=>{
        this.setState({
        resultsLoaded:true})
      // Scroll to the anomaly results table once loaded
      this.fieldRef.scrollIntoView({ behavior: "smooth",  })},1000)})
      .catch(e=>{
      toast(e.toString())
      this.setState({
        detectionActivated:false,
        resultsLoaded:false,})
      })
      }


    // Function to display anomaly metric graph
    togglePopup=(close=true)=> {
      if (this.state.anomalyResults==null){
        toast('No anomaly results generated yet!')
        return
      }
      this.setState({
        showHistogram:close? !this.state.showHistogram:false
      });
    }


    // Function to download anomaly results as PDF
    downloadPDF=async()=> {
    if (this.state.anomalyResults==null){
      toast('No anomaly results generated yet!')
      return
    }
    // Get table headers
    var tableHeaderText = [...document.querySelectorAll(`#${this.state.resultTableID} thead tr th`)].map(thElement => ({ text: thElement.textContent,noWrap:false}));
    // Get table data (anomalies)
    var tableRowCells = this.state.anomalyResults.Anomalies.map((tdElement,index) =>{ 
      var elems=[]
      Object.keys(tdElement).forEach(function(key){
        elems.push({ text: tdElement[key],
          noWrap:false,
          alignment:'center'
        })
      })
      return elems
     }).flat();
     
    // Format anomaly data into proper rows
    var tableDataAsRows = tableRowCells.reduce((rows, cellData, index) => {
      if (index % 6 === 0) {
        rows.push([]);
      }
      rows[rows.length - 1].push(cellData);
      return rows;
    }, []);
    tableDataAsRows=tableDataAsRows.slice(0,Math.min(tableDataAsRows.length,12000)) //6000
    
    // Insert file link for each line of text to open file the text is in on click
    tableDataAsRows=tableDataAsRows.map((i,index1)=>i.map((elem,index2)=>({ text: elem,noWrap:false,link:index2%4==0 && index2!=0?
      `file:///${this.state.rootDataDirectory.replaceAll(/\\/g,'/')}/${this.state.anomalyResults.Anomalies[index1].Database}/${this.state.anomalyResults.Anomalies[index1].Filename}`:null
    })))

    // Generate anomaly metric distribution graph
    this.setState({svg:drawGraph('anomalyGraph',this.state.metricData,this.state.metricName,this.state.svg)})

    // Save graph as png image
    var graphImage
    await downloadGraph({id:'anomalyGraph',saveSolo:false}).then(result=>{graphImage=result})
    
    // Create content for pdf file
    var docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      header: { text: 'Anomaly Results', alignment: 'center',style:'title' },
      footer: function(currentPage, pageCount) {
         return ({ text: `Page ${currentPage} of ${pageCount}`, 
      alignment: 'center' ,style:'footer'}); },
      content: [{
          table: {
          headerRows: 2,
          body: [
          [{text: tableHeaderText[0], colSpan: 4,color:'white',bold:true,alignment:'center'},{},{},{},
          {text:tableHeaderText[1]['text'],color:'white',bold:true,alignment:'center'},
          {text:tableHeaderText[2]['text'],color:'white',bold:true,alignment:'center'}],
          tableHeaderText.slice(3).map(i=>({text:i,style:'header'})),
          ...tableDataAsRows,
          ],
          widths: ['8%', '12%', '12%', '7%', '47.5%', '13.5%']
          },
          layout: {
          fillColor: function(rowIndex) {
          if (rowIndex === 0) {
            return '#0f4871';
          }
          return (rowIndex % 2 === 0) ? '#f2f2f2' : null;
          }
          },
        },
        {image:graphImage,
          fit: [500, 500],
          style:'image',
          pageBreak:'before',}],
      styles: {
        title:{
          bold:true,
          marginTop:10
        },
        image:{
          alignment:'center',
          marginTop:50
        },
        footer:{
          marginTop:10
        },
        header: {
          color: 'blue',
          alignment:'center',
        }
      },
    };
    pdfMake.createPdf(docDefinition).open()
  }


  // Get database names and root database directory when component is mounted
  componentWillMount(){
    Promise.all([
    fetch('http://localhost:5000/get_database_names').then(
      response=>response.json()
    ),fetch('http://localhost:5000/get_root_directory').then(
      response=>response.json()
    ),fetch('http://localhost:5000/get_anomaly_num').then(
      response=>response.json()
    ),fetch('http://localhost:5000/get_anomaly_methods').then(
      response=>response.json()
    )
  ]).then(([database,root,anomaly,methods])=>{
      this.setState({
      databaseNames:database.DbNames.sort(function(a,b){
      return a.toLowerCase().localeCompare(b.toLowerCase(),undefined, {
      numeric: true,
      sensitivity: 'base'})}),
      numOfAnomalies:anomaly.number,
      rootDataDirectory:root.directory,
      rootDataDirectoryInput:root.directory,
      anomalyMethods:methods.methods
      })})}
    
    render() {
      return (
        <div className='top' onKeyDown={this.handleKeyDown}>
        {!(this.state.databaseNames && this.state.numOfAnomalies &&this.state.anomalyMethods
         && this.state.rootDataDirectory!='Not Received')?
        <Progress message='Initializing'/>:

        <div className='App'>
        <div className='App-header'>
        <h2 className='appTitle'>Anomaly Detector</h2>

        {/* Component to display and allow input for root database directory */}
        <RootDataDirectory
        rootDataDirectory={this.state.rootDataDirectory}
        rootDataDirectoryInput={this.state.rootDataDirectoryInput}
        rootDataDirectoryChange={this.state.rootDataDirectoryChange}
        changeDirectory={this.changeDirectory}
        handleChange={(event)=>{
        this.setState({
        rootDataDirectoryChange:event.target.value!=this.state.rootDataDirectory,
        rootDataDirectoryInput:event.target.value})
        if (event.target.value=='' || event.target.value=='No directory specified'){
        this.setState({
        rootDataDirectoryChange:false})}}}/>

        </div>

        <div className='mainBody'>

        {/* Component for uploading files to existing database or create new one*/}
        <FileUpload 
        databaseNames={['Create New Database'].concat(this.state.databaseNames)}
        deletedBefore={this.state.deletedBefore}
        uploadDBName={this.state.uploadDBName}
        toCreate={this.state.toCreate}
        uploadDatabaseChange={this.uploadDatabaseChange}
        uploadMultipleFiles={this.uploadMultipleFiles}/>

        {/* Component for deleting database*/}
        <DeleteDatabase 
        databaseNames={this.state.databaseNames}
        selectedDeleteDatabase={this.state.selectedDeleteDatabase}
        changeDelete={(event) => {
          this.setState({selectedDeleteDatabase:event})}}
          deleteDatabase={this.deleteDatabase}/>

        {/* Component for running anomaly detection*/}
        <AnomalyDetection 
        databaseNames={this.state.databaseNames}
        selectedAnomalyDatabase={this.state.selectedAnomalyDatabase}
        chooseDatabases={(event) => {
          this.setState({selectedAnomalyDatabase:event})}}
        detectAnomalies={this.detectAnomalies}
        chooseMethod={(e)=> {
          this.setState({detectionMethod: e.value});}}
        anomalyNum={this.state.numOfAnomalies}
        anomalyMethods={this.state.anomalyMethods}
        changeAnomalyNum={this.changeAnomalyNum}
        togglePopup={this.togglePopup}
        downloadPDF={this.downloadPDF}/>
         
        {/* Below is for showing anomaly detection results */}
        <div ref={ el=> this.fieldRef=el } className='anomalyResults'>
        {!this.state.detectionActivated?<div className='noData'>No anomaly results yet</div>:(this.state.resultsLoaded?
        // Component for displaying anomaly results
        <ResultTable datareceived={this.state.anomalyResults} metricName={this.state.metricName}
        rootDataDirectory={this.state.rootDataDirectory} resultDivID={this.state.resultDivID}
        resultTableID={this.state.resultTableID}/>
        :       
        // Component for showing progress message when still in process of detecting anomalies
        <Progress message='Detecting Anomalies'/>)}

        </div>
        </div>

        {/* Success message to display when anomaly results are generated */}
        {this.state.resultsLoaded&&<Success message="Processing Complete!"/>}
        
        {/* Message to display when in process of uploading files*/}
        {this.state.filesUploading&&<Progress message='Uploading Files'/>}

        </div>
        }
     
        {/*Component that displays metric distribution graph*/ }
        {this.state.showHistogram&&<div style={{'backgroundColor': '#00000050',
        'width': '100vw','height': '100vh','top': '0','position':'fixed','zIndex':1,
        'left': '0'}}>
        
        {/* Component to display anomaly metric graph on screen */}
        <Histogram data={this.state.metricData} metricName={this.state.metricName}
        id={this.state.histogramID} showHistogram={this.togglePopup}/></div>}

        {/* Div element to hold anomaly metric graph for download in pdf file */}
        <div id='anomalyGraph' style={{'display':'none'}}></div>
        </div>

      );
    }
  }
 
  export default App;
  
