import React,{Component,useMemo,useEffect,useState} from 'react';
import {useTable,useGroupBy,useFilters,useSortBy,useExpanded,usePagination} from 'react-table'
import NormalDropdown from '../Dropdown/NormalDropdown/NormalDropdown.js';
import NormalButton from '../Button/Button.js';
import Pagination from './pagination/pagination.js';
import './resultTable.css';

// Component to display anomaly results in a table form
// Props to pass in ->
// rootDataDirectory - value of root database directory
// resultDivID - ID of div element which holds the anomaly results table
// resultTableID - ID of table which shows the anomaly results
// dataReceived - Anomaly results data
// metricName - Name of anomaly metric
function ResultTable (props){

    // Function to view line in text file when user clicks on it
    const viewTextFile=async (lineNumber,fileName,database)=>{
        console.log(props.rootDataDirectory)
        await fetch(`http://localhost:5000/get_textfile_view?lineNumber=${lineNumber}&fileName=${fileName}&database=${database}&root=${props.rootDataDirectory}`)
        .then(response=>response.json())
        .then(data=>{})
    }

    const [pageSizeChoice,setPageSizeChoice]=useState(null)

    const columns= React.useMemo(
        () => [
          {
            Header: `${props.datareceived.Anomalies.length} Anomalies Detected`,
            columns: [
              {
                Header: 'Rank',
                accessor: 'Rank',
              },
              {
                Header: 'Database',
                accessor: 'Database',
              },
              {
                Header: 'Filename',
                accessor: 'Filename',
              },
              {
                Header: 'Line',
                accessor: 'Line',
              },
            ],
          },
          {
            Header: `${props.datareceived.TotalLines} Total Lines of Text`,
            columns: [
              {
                Header: 'Text data',
                accessor: 'Text data',
              },
             
            ],
          },
          {
            Header: `${Number(props.datareceived.MeanMetric).toFixed(3)} Average Metric`,
            columns: [
              {
                Header: `${props.metricName}`,
                accessor:  `${props.metricName}`
              },
            ],
          },
        ],
        []
      )

    const data=React.useMemo(()=>props.datareceived.Anomalies,[])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page, 
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
      } = useTable(
        {
        columns,
          data,
          initialState: { pageIndex: 0,pageSize:50 },
        },
        usePagination
      )

        // Generates table displaying the top text anomalies and info (file, line, etc.) about it
    
        return (
        <div id={props.resultDivID} className='anomalytable' data-html2canvas-ignore="true">
        <Pagination 
        displayPageNum={false} pageCount={pageCount} pageSizeChoice={pageSizeChoice}
        setPageSize={setPageSize} setPageSizeChoice={setPageSizeChoice}
        pageIndex={pageIndex} pageOptions={pageOptions}
        gotoPage={gotoPage} previousPage={previousPage} nextPage={nextPage}
        canPreviousPage={canPreviousPage} canNextPage={canNextPage}
        />

        <table id={props.resultTableID} className='results'>
        <col width="8%" />
        <col width="12%"/>
        <col width='12%'/>
        <col width="9%" />
        <col/>
        <col width="12%" />
        <thead className='topheader' {...getTableProps()}>
        {headerGroups.map((headerGroup,index) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
        {headerGroup.headers.map(column => (
          index==0?
          <th className='topheader' {...column.getHeaderProps()}><span className='header'>{column.render('Header').split(" ")[0]}</span>
          <br></br> {column.render('Header').split(" ").slice(1).join(" ")}
          </th>
          :<th className='lowerheader' {...column.getHeaderProps()}>{column.render('Header')}</th>
          ))}
        </tr>
        ))}
        </thead>

        <tbody class='tablebody' {...getTableBodyProps()}>
          
        {page.map((row, i) => {
            prepareRow(row)
            return (
            <tr {...row.getRowProps()}>
            {row.cells.map((cell,index) => {
            return index==4?<td {...cell.getCellProps()}>
            <span className='textLine' style={{'backgroundColor':'transparent','borderWidth':'0px'}}
            onClick={()=>{
            console.log(row.cells[3].value,row.cells[2].value,
              row.cells[1].value)
            viewTextFile(row.cells[3].value.toString(),row.cells[2].value,row.cells[1].value)}}
            >{cell.render('Cell')}</span></td>:
            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>)})}
        </tbody>
        </table>
        
        <Pagination 
        displayPageNum={true} pageCount={pageCount} pageSizeChoice={pageSizeChoice}
        setPageSize={setPageSize} setPageSizeChoice={setPageSizeChoice}
        pageIndex={pageIndex} pageOptions={pageOptions}
        gotoPage={gotoPage} previousPage={previousPage} nextPage={nextPage}
        canPreviousPage={canPreviousPage} canNextPage={canNextPage} 
        />

        </div>)
          
    
}


export default ResultTable;