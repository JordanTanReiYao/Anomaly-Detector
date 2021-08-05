import {useState} from 'react'
import './pagination.css'
import NormalDropdown from '../../Dropdown/NormalDropdown/NormalDropdown.js';
import NormalButton from '../../Button/Button.js';

function Pagination(props){

    const {pageCount,displayPageNum,pageSizeChoice,setPageSize,setPageSizeChoice,
    pageIndex,pageOptions,gotoPage,previousPage,nextPage,canPreviousPage,canNextPage}=props

    return (
        <div className='paginationButtons'>
        <div style={{'margin':'0px','padding':'0px'}}>
        <NormalDropdown 
        value={pageSizeChoice}
        title='Rows per page'
        handleChange={e => {
          setPageSizeChoice(Number(e.target.value))
        setPageSize(Number(e.target.value))}}
        array={[50, 100, 200, 500, 1000]}
        /></div>

        {displayPageNum&&<div style={{'margin':'0px','fontSize': '3.5vmin','padding':'0px'}}>
        <span>Page{' '}<strong style={{'color':'red'}}>{pageIndex + 1}</strong>
        <strong> of {pageOptions.length}</strong>
        </span>
        </div>}

        <div style={{'margin':'0px','padding':'0px','fontSize':'2.6vmin'}}> 
        <NormalButton clickFunction={() => gotoPage(0)} disabled={!canPreviousPage} label={'<<'}/>
        {' '}
        <NormalButton clickFunction={() => previousPage()} disabled={!canPreviousPage} label={'<'}/>
        {' '}
        <NormalButton clickFunction={() => nextPage()} disabled={!canNextPage} label={'>'}/>        
        {' '}
        <NormalButton clickFunction={() => gotoPage(pageCount - 1)} disabled={!canNextPage} label={'>>'}/>                
        </div>

        </div>
    )
}

export default Pagination