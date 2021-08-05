import Select,{ components }  from 'react-select'
import { useState,useEffect } from 'react'
import {vmin} from '../../../functions/calcVmin.js'
import Arrow from './Arrow.js'

function SingleSelection(props){

    const [dimension,setDimensions]=useState({
      height:vmin(5.15),
      width:vmin(35)
    })

    useEffect(() => {
      function handleResize() {
        setDimensions({
          height: vmin(5.15),
          width: vmin(35)
        })}
      window.addEventListener('resize', handleResize)
      return _ => {
        window.removeEventListener('resize', handleResize) 
        }})

      const customStyles = {
      
        control: (base, state,) => ({
          ...base,
          fontFamily: 'sans-serif',
          fontSize: 'inherit',
          border: state.isFocused? '1px solid black':'1px solid #f90',
          boxShadow: state.isFocused? '1px solid black':0,
          '&:hover': {
            border: '1px solid #f90',
          },
          cursor: 'pointer',
          borderRadius: 0,
          padding:'0px',
          textAlign:'center',
          width: dimension.width,
          minWidth:dimension.width,
          height:dimension.height,
          minHeight:dimension.height,
          margin:`${vmin(0.2)}px ${vmin(1)}px`,
          backgroundColor:'azure',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          alignContent:'center'
        }),   
      
        option: (styles, { isFocused ,value}) => {
          return {
            ...styles,
            cursor: 'pointer',
            backgroundColor: isFocused ? 'lightGrey' :  'azure',
            color: isFocused ? 'blue':(value==props.specialValue?'red':'black'),
            lineHeight: vmin(0.1),
            textOverflow:'hidden',
            fontSize:'inherit',
            whiteSpace:'nowrap',
            textAlign:'start',
          }
        },
      
        input: styles => ({
          ...styles,
          color: 'black',
          fontFamily: 'Times New Roman, Times, Serif',
          fontSize:'inherit',
          textAlign:'start',
        }),
        
        menuList:styles=>({
            ...styles,
            paddingTop:0,
            paddingBottom:3,
            paddingLeft:0,
            paddingRight:0,
            textOverflow:'hidden',
            backgroundColor:'azure',
        }),
      
        menu: styles => ({
          ...styles,
          boxShadow: 'none',
          borderRadius: 1,
          border:'1px solid grey',
          width:  dimension.width,
          marginTop:0,
          marginLeft:`${vmin(1)}px`,
          marginRight:`${vmin(1)}px`,
        }),

        valueContainer:styles=>({
          ...styles,
          textAlign:'center',
          textOverflow:'ellipsis',
          whiteSpace: "nowrap",
          overflow: "hidden",
          height:'100%',
          display:'flex',
          alignItems:'center',
          alignContent:'center',
          justifyContent:'center',          
        }),

        dropdownIndicator:styles=>({
          ...styles,
          margin:'0px',
          padding:'0px',
          color:'black',
        }),

        indicatorsContainer:styles=>({
          ...styles,
          margin:'0px 5% 0px 0px',
          height:'100%',
          display:'flex',
          borderWidth:'0px',
          outline:'none',
          flexDirection:'column',
          alignContent:'center',
          alignItems:'center',
          justifyContent:'center',
          }),

        placeholder:styles=>({
          ...styles,      
          color:'black',
          fontSize:'inherit',
          overflow:'hidden',
          whiteSpace:'nowrap',
          textOverflow:'ellipsis',
          overflow:'hidden'
        }),

        indicatorSeparator:styles=>({
          ...styles,
          display:'none'
       }),

        singleValue: (styles,{data}) => ({
          ...styles,
          color: '#000051',
          textAlign:'center',
          color:data.value==props.specialValue?'red':'#000082',
          fontSize:'inherit',
          whiteSpace:'nowrap',
          margin:'auto',
          textOverflow:'ellipsis',
          overflow:'hidden'
        }),
      }

      const filterOption = (candidate, input) => {
        if (!input) {
          return candidate;
        }
        const re = new RegExp(`^${input}.*`, "i");
        return candidate.value.match(re);
        };

        const DropdownIndicator = props => {
          return (
            <components.DropdownIndicator {...props}>
              <Arrow />
            </components.DropdownIndicator>
          );
        };
      
        return (
            <Select 
            placeholder={props.placeholder}
            filterOption={filterOption}
            components={{DropdownIndicator}}
            styles={customStyles}
            value={props.value}
            onChange={props.handleChange}
            options={props.array.map(val=>({value:val,label:val,data:val}))}/>
        )
}

export default SingleSelection