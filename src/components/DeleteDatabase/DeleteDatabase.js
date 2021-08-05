import React from 'react';
import './DeleteDatabase.css' 
import NormalButton from '../Button/Button.js'
import MultiSelection from '../Dropdown/MultiSelection/MultiSelection.js';

// Component for deleting databases
// Props to pass in ->
// databaseNames - List of databases the user can choose from
// selectedDeleteDatabase - List of databases the user has selected so far to delete
// changeDelete - Function to handle change in database selection
// deleteDatabase - Function to delete database
function DeleteDatabase(props){

    return (
        <div className='deletion'>

        <fieldset className='singleLayerFieldset'>

        <legend align='left'>Delete Database</legend>

        {/* Component to allow selection of multiple databases to delete */}
        <MultiSelection 
        array={props.databaseNames}
        itemName='Database'
        value={props.selectedDeleteDatabase}
        handleChange={props.changeDelete}/>
        
        {/* Button to activate function to delete database */}
        <NormalButton clickFunction={props.deleteDatabase} label='Delete Database'/>

        </fieldset>
        </div>
    )
}

export default DeleteDatabase;