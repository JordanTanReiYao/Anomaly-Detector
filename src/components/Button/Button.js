import './Button.css'

// Normal Button Component
// Props to pass in ->
// label - Label for the button
// clickFunction - Function to execute when button is clicked
function NormalButton(props){
    return (
        <button onClick={props.clickFunction} disabled={props.disabled} style={props.style}>{props.label}</button>
    )}

export default NormalButton;