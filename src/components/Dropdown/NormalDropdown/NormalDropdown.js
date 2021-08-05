import './NormalDropdown.css'

// Component for normal dropdown list (No multi-selection function)
// Props to pass in ->
// handleChange - Function to handle change in item selection by user
// value - Value of item selected by user
// title - General name of item type shown by list (e.g. database)
// specialOption - Boolean value that indicates whether the item list contains a special option (value)
// specialOptionValue -Value of option that is special (will be formatted differently from rest)
// array - List of items to display in drop down list
function NormalDropdown(props){
    return (
    <select
      onChange={props.handleChange}
      value={props.value}>
      <option style={{'color':'black'}} value={`${props.title}`} selected disabled hidden>{props.title}</option>
      {/* Allow special option - option which is different from others - to have different formatting*/}
      {props.specialOption?
       props.array.map(choice=>{
       return( 
       // Format differently if it is the special option value (e.g. New Database)
       choice==props.specialOptionValue?<option style={{'color':'red'}} value={choice}>{choice}</option>:
       <option value={choice}>{choice}</option>)
       }):props.array.map(choice=>{
       return(<option value={choice}>{choice}</option>)})}        
       </select>
    )
}

export default NormalDropdown