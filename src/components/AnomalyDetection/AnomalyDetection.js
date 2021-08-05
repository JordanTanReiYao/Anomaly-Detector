import React,{useState,useRef} from 'react';
import './AnomalyDetection.css'
import NormalButton from '../Button/Button.js'
import SingleSelection from '../Dropdown/SingleSelection/SingleSelection.js';
import MultiSelection from '../Dropdown/MultiSelection/MultiSelection.js';

// Component for choosing databases to run anomaly detection on and what method to use
// Props to pass in ->
// anomalyNum - Number of anomalies to detect
// databaseNames - List of databases names to choose from
// selectedAnomalyDatabase - List of databases the user has selected
// chooseDatabases - Function to handle change in database selection by user
// chooseMethod - Function to handle change in anomaly detection method selection
// detectAnomalies - Function to run anomaly detection
// togglePopup - Function to choose whether to display the anomaly metric distribution graph
// downloadPDF - Function to download anomaly results as a pdf
function AnomalyDetection(props){
    const [anomalyNum,setAnomalyNum]=useState(props.anomalyNum)
    const anomalyNumInput=useRef(null)
    return(
        <div className='anomalyOption'>
        <fieldset className='doubleLayerFieldset'>
        <legend align='left'>Anomaly Detection On Database</legend>

        <fieldset className='internalFieldset'>
        
        <MultiSelection
        array={props.databaseNames}
        itemName='Database'
        value={props.selectedAnomalyDatabase}
        handleChange={props.chooseDatabases}
        />
        <div style={{'display':'flex','flexDirection':'row','alignContent':'center','alignItems':'center',
        'margin':' 0.2vmin 1vmin'}}>
        <label style={{'height':'4.5vmin','padding':'0.15vmin 0.5em','textAlign':'center','display':'flex',
        'alignItems':'center','backgroundColor':'azure','borderRight':'1.8px solid #f90',
        'fontSize':'2.7vmin','border':'1px solid #f90','margin':'0px'}}>No. of Anomalies</label>

        <input
         style={{'margin':'0px'}}
         type="number"
         ref={anomalyNumInput}
         onChange={props.changeAnomalyNumInput}
         step={1}
         min={10}
         defaultValue={props.anomalyNum}
         placeholder={props.anomalyNum}
        />

        <NormalButton style={{'marginLeft':'0.8vmin','marginRight':'0px'}} label='Submit'
        clickFunction={()=>{props.changeAnomalyNum(anomalyNumInput.current.value)}}  />
        </div>

        <SingleSelection 
        array={props.anomalyMethods}
        handleChange={props.chooseMethod}
        specialValue={null}
        placeholder='Choose Method'/>
        </fieldset>

        <fieldset className='internalFieldset'>
        <NormalButton clickFunction={props.detectAnomalies} label='Run Anomaly Detection'/>
        </fieldset>

         {/* Buttons to show metric distribution graph and generate pdf file */ }
        <fieldset className='internalFieldset'>
        <NormalButton clickFunction={props.togglePopup} label='View Anomaly Metric Graph'/>
        <NormalButton clickFunction={props.downloadPDF} label='Generate Report'/>
        </fieldset>
        </fieldset>
        </div>
    )
}

export default AnomalyDetection;