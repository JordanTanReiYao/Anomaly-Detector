import React from 'react';
import './RootDataDirectory.css'

// Component to display and allow input for root data directory
// Props to pass in ->
// handleChange - Function to handle change in user input for root database directory
// rootDataDirectoryInput - Current value of user input for root directory
// changeDirecotry - Function to change root directory
// rootDataDirectoryChange - Boolean value to indicate whether the user input value is different from (continued below)
// current root directory or is not null
function RootDataDirectory(props){

    return (
        <fieldset className='dbRoot'>
        <label className='dbRoot'>Root Data Directory</label>
        <input className='dbRoot' onChange={props.handleChange}
        type='text' 
        value={props.rootDataDirectoryInput!=null && props.rootDataDirectoryInput.value!=''?props.rootDataDirectoryInput:null}
        placeholder={'No directory specified'}/>
      <input onClick={props.changeDirectory} className='dbRoot' type='submit' disabled={!props.rootDataDirectoryChange}/>
      </fieldset>
    )
}

export default RootDataDirectory;