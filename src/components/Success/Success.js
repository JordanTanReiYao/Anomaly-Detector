import './Success.css'
import {Checkmark} from 'react-checkmark';

// Component to display success message
// Props to pass in ->
// message - Success message to display
function Success(props){
    
    const {message}=props

    return (
        <div className='success'>
        <Checkmark size='23vmin'/>
        <p>{message}</p></div>
    )
}

export default Success