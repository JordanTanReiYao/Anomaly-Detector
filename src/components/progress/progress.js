import React,{Component} from 'react';
import './progress.css';
import { CircularProgress } from '@material-ui/core';

// Component to display progress
// Props to pass in ->
// message - Message to display when still in progress
class Progress extends Component{

    render(){
        return <div className='progressBackground'> 
        <div className='progressIndicator'>
        <CircularProgress size='28vmin' classes='MuiCircularProgress-colorPrimary'/>
        <p>{this.props.message}</p>
        </div>
        </div>
    }
}

export default Progress;