import React,{useState,useRef, isValidElement} from 'react';
import NormalButton from '../Button/Button.js';
import SingleSelection from '../Dropdown/SingleSelection/SingleSelection.js';
import './FileUpload.css'


// Component to allow user to create new database or upload files to existing database
// Props to pass in ->
// uploadMultipleFiles - Function to upload files to existing database or create new one
// uploadDatabaseChange - Function to handle change in database selection by user
// deletedBefore - Boolean value to indicate whether a database has been deleted before 
// UploadDBName - Name of current database selected by user
// databaseNames - List of database names to show in drop down list
// toCreate - Boolean value that indicates whether user wants to create a new database
function FileUpload(props){
    const hiddenFileInput = useRef(null);
    const [inputVal,setInput]=useState(null)
    const [filesToUpload,setFiles]=useState(null)
    const [selectedFiles,selectFiles]=useState(null)

    const options = [
      { label: "Grapes 🍇", value: "grapes" },
      { label: "Mango 🥭", value: "mango" },
      { label: "Strawberry 🍓", value: "strawberry", disabled: true },
      { label: "Watermelon 🍉", value: "watermelon" },
      { label: "Pear 🍐", value: "pear" },
      { label: "Apple 🍎", value: "apple" },
      { label: "Tangerine 🍊", value: "tangerine" },
      { label: "Pineapple 🍍", value: "pineapple" },
      { label: "Peach 🍑", value: "peach" },
    ];
  
    const [selected, setSelected] = useState([]);

    const changeinput=(e)=>{
        setInput(e.target.value)
    }

    const submit=()=>{
        props.uploadMultipleFiles(inputVal,filesToUpload)
        setInput('')
    }

    const handleChange = event => {
        let result=Object.keys(event.target.files).map((key)=>event.target.files[key])
        setFiles(event.target.files)
        selectFiles(result) 
      };

      const handleClick = event => {
        hiddenFileInput.current.click();
      };

    


    return (
    <div className='fileUpload'>

    <fieldset className='doubleLayerFieldset'>

      <legend align='left'>Upload File To Database</legend>

      <fieldset className='internalFieldset'> 

      {/* Dropdown list showing the list of existing databases as well as option to create new one */}
       <SingleSelection
       array={props.databaseNames}
       value={props.deletedBefore==true?'Choose Database':props.UploadDBName}
       handleChange={props.uploadDatabaseChange}
       specialValue='Create New Database'
       placeholder='Choose Database'
       />

    
      {/* Display input for new database name if user chooses the 'Create New Database' option */}
      {props.toCreate==true &&
      <input className='newDBInput' 
      value={inputVal}
      onChange={changeinput}
      type="text"
      placeholder="New database name" 
      autoComplete="off"></input>}


      {/* Allow user to upload files from computer */}
      <input
      id='file-upload'
      type="file"
      name="file"
      ref={hiddenFileInput}
      placeholder={null}
      onChange={handleChange}
      multiple
      />
      <NormalButton clickFunction={handleClick} label='Choose files'/>

      </fieldset>
      {/* Display the names of files the user has chosen to be uploaded */}
      {selectedFiles!=null && 
        <fieldset className='fileFeedback'>
        <p className='NumFilesSelectedHeader'><span style={{'color':'red','fontWeight':'bold'}}>{selectedFiles.length}</span> Files selected</p>
        <ul className='filesSelected'>{selectedFiles.slice(0,Math.min(3,selectedFiles.length)).map((d)=>{
        return (
        <li>{d.name}</li>)})}
        </ul>
      {selectedFiles.length>3&&<p style={{'marginBottom':'0.2vmin','paddingBottom':'0px','marginTop':'0px'}}>+<span style={{'fontWeight':'bold','marginBottom':'0px'}}>{selectedFiles.length-3}</span> more</p>}
      </fieldset>}

      <fieldset className='internalFieldset'>

      {/* Button to  activate function to upload file(s) to database (or create new one) */}
      <NormalButton clickFunction={submit} label='Upload Now!'/>
      </fieldset>

      </fieldset>
      </div>);
      }
    
export default FileUpload