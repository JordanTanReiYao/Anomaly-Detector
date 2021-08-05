import MultiSelect from "react-multi-select-component";
import './MultiSelection.css'
import ClearIcon from "./ClearIcon.js";
import Arrow from '../SingleSelection/Arrow.js'

// Component for multi selection drop down list
// Props to pass in ->
// itemName - General name of item which user is choosing (e.g. Database or Method)
// array - List of items which user can choose from
// value - List of items the user has selected
// handleChange - Function to handle change in item selection by user
function MultiSelection(props){

    // Custom display to show when options are selected
    const customValueRenderer = (selected, _options) => {
        return selected.length
        ? `${selected.length} ${props.itemName.toLowerCase()}${selected.length>1?'s':''} selected`: `Choose ${props.itemName}`;};

    const filterOptions=(options, filter)=> {
        if (!filter) {
            return options;
        }
        const re = new RegExp(`^${filter}.*`, "i");
        return options.filter(({ value }) => value && value.match(re));
        }

    return (
        <MultiSelect
        className='rmsc'
            hasSelectAll={true}
            ArrowRenderer={()=>
                <div style={{'display':'flex','justifyContent':'center',
            'marginRight':'2%',
            'marginLeft':'2%'}}><Arrow/></div>}
            ClearSelectedIcon={<ClearIcon/>}
            valueRenderer={customValueRenderer}
            options={props.array.map(i=>({'label':i,'value':i}))}
            filterOptions={filterOptions}
            value={props.value}
            onChange={props.handleChange}
            labelledBy="Select"/>
    )
}

export default MultiSelection