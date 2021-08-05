import React,{Component} from 'react';
import * as d3 from "d3";
import './Histogram.css';
import {drawGraph,downloadGraph} from '../../functions/drawGraph.js';
import downloadIcon from '../../assets/downloadIcon.png';

// Component to display anomaly metric distribution graph on screen
// Props to pass in ->
// id - id of html element to draw graph in
// data - Data to be used to draw the graph
// metricName - Name of anomaly metric 
// showHistogram - Function to choose whether to display anomaly metric distribution graph
class Histogram extends Component {
    componentDidMount() {
      this.draw();
    }

    state={
      svg:null,
      showComponents:true
    }
      
    draw() {
      this.setState(
        {svg:drawGraph(this.props.id,this.props.data,this.props.metricName,this.state.svg)})
    }

    componentWillUnmount(){
      d3.select(`#${this.props.id}`).selectAll("svg").remove()
    }

    download=()=>{
      downloadGraph({id:this.props.id,saveSolo:true})
      }
      
    handleKeyDown=e=>{
      if (e.keyCode==27){
        this.props.showHistogram(false)
      }        
    }

    componentWillMount(){
      document.addEventListener("keydown", this.handleKeyDown);
    }
          
    render(){
      return <div className='histogram'>
        <span className="close-icon" onClick={this.props.showHistogram}
        >x</span>       
        {this.state.showComponents&&       
         <div style={{'display':'flex','flexDirection':'column','justifyContent':'space-around',
        'textAlign':'center','overflow':'visible','padding':'30px','position':'relative'}}>
          <img src={downloadIcon} className='downloadButton' title='Download Chart'
         onClick={this.download}></img>
        <div style={{'width':'auto'}} id={this.props.id} >
        </div>
        </div>}
        </div>}}
      
  export default Histogram;