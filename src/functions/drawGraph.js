import * as d3 from "d3";
import {vmin} from './calcVmin.js';
const saveSvgAsPng = require('save-svg-as-png');

// Function for drawing anomaly metric distribution histogram
// Parameters to pass in ->
// id - ID of html element to draw graph in
// data - Data used to create the graph
// metricName - Name of anomaly metric
// svgElement - svg element which holds the graph
function drawGraph(id,data,metricName,svgElement=null){ 
    // Erase old graph if previously drawn already
    if (svgElement){
        d3.select(`#${id}`).selectAll("svg").remove();}

    // Set margins for graph
    var margin = { top: vmin(17)/*120*/, right:vmin(6) /*20*/, bottom:vmin(13) /*80*/, left:vmin(16) /*100*/ },
    width = vmin(110) - margin.left - margin.right,//700 - margin.left - margin.right,
    height = vmin(75) - margin.top - margin.bottom;//500 - margin.top - margin.bottom;

    // Set bins for histogram
    var binner=d3.bin()
    var bins = binner(data);
    console.log(bins[0].x1)
    console.log(bins)
    
    // Set domain for x axis
    let domain = [bins[0].x0,bins.slice(-1)[0].x1];

    var x = d3
      .scaleLinear()
      .domain(domain)
      .range([0, width]);
      
    var x_axis=d3.axisBottom().scale(x)

    // Create svg element to hold graph
    svgElement = d3.select(`#${id}`)
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Append x axis
    svgElement.append("g")
              .style("font-size", `${vmin(2.1)}px`)
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));
        
    // Append x axis label
    svgElement.append("text")
              .style("text-anchor", "middle")
              .attr("transform",
                    "translate(" + (width/2) + " ," + 
                    (height +vmin(10)) + ")")
              .text(`${metricName}`)
              .style("text-anchor", "middle")
              .style("font-size",`${vmin(4.9)}px`)
              .style('font-weight','bold');             

    // Create y axis 
    var y = d3
    .scaleLinear()
    .rangeRound([0, 1])
    .range([height, 0])
    .domain([0,d3.max(bins, function(d) {
        return d.length+1})
    ]);

    const yAxisTicks = y.ticks().filter(tick => Number.isInteger(tick));

    // Append y axis
    svgElement.append("g")
              .style("font-size", `${vmin(2.1)}px`)
              .call(d3.axisLeft(y)
              .tickValues(yAxisTicks)
              .tickFormat(d3.format('d')));

    // Append y axis label
    svgElement.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - vmin(13.5))//86)
              .attr("x",0 - (height / 2))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text("Frequency")
              .style("font-size",`${vmin(4.9)}px`)//30px
              .style('font-weight','bold'); 

    // Append graph title
    svgElement.append("text")
              .attr("x", (width / 2))             
              .attr("y", 0 - (margin.top / 1.8))
              .attr("text-anchor", "middle")  
              .style("font-size", `${vmin(5.1)}px`)//"34px") 
              .style("text-decoration", "underline")  
              .style('font-weight','bold')
              .text("Distribution of Anomaly Metric");

    // Append histogram bins
    svgElement.selectAll("rect")
              .data(bins)
              .enter()
              .append("rect")
              .attr("x", 1)
              .attr("transform", function(d) {
                  return "translate(" + x(d.x0) + "," + y(d.length) + ")";
              })
              .attr("width", function(d) {
                  return 0.97*(x(d.x1)-x(d.x0))
              })
              .attr("height", function(d) {
                  return height - y(d.length);
              })
              .style("fill", "#69b3a2").call(x_axis)

    const tooltip = d3
    .select(`#${id}`)
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background",'#000000AF')
    .style("color","white")
    .style("font-size",`${vmin(1.8)}`)
    .style("padding",`${vmin(0.8)}px ${vmin(1)}px ${vmin(1)}px ${vmin(1)}px`);

    
    svgElement.selectAll("rect")
    .on("mouseover", function(event,d) {
      // change the selection style
      d3.select(this)
        .style("fill","red")
        .attr('stroke-width', '2')
        .attr("stroke", "black");
      // make the tooltip visible and update its text
      tooltip
        .style("visibility", "visible")
        .html(`count: ${d.length}`+"<br/>"+`x0: ${d.x0}`+"<br/>"+`x1: ${d.x1}`)
        //.text(`count: ${d.length}\nx0: ${d.x0}\nx1: ${d.x1}`);
    })
    .on("mousemove", function(event,d) {
      tooltip
        .style("display", "inline-block")
        .style("top",event.offsetY-60 + "px")
        .style("left",event.offsetX-5 + "px");
    })
    .on("mouseout", function(event,d) {
      // change the selection style
      d3.select(this)
      .attr('stroke-width', '0')
      .style('fill',"#69b3a2");
      tooltip.style("visibility", "hidden");
    });
              

    return svgElement}

// Function to download chart as image
// Parameters to pass in ->
// id - ID of html element which holds the chart
// saveSolo - Boolean value which indicates whether the image is to be downloaded on its own (continued below)
// or together with another document
function downloadGraph({id,saveSolo}){
        return new Promise(function(resolve, reject){
        saveSvgAsPng.svgAsPngUri(document.querySelector(`#${id} svg`)).then(uri => {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        let image = new Image();
        image.src = uri;
        
        setTimeout(()=>{
        canvas.width = image.width;
        canvas.height = image.height;
        
        context.drawImage(image,0,0);
        
        // if saveSolo true means user wants to download only image 
        if (saveSolo){
            canvas.toBlob(blob=>{  
                window.open(URL.createObjectURL(blob))
                }, 'image/png')
            }
        // if saveSolo false means user wants to download image together with anomaly table
        else{
            var img=canvas.toDataURL('image/png')
            resolve(img)
        }},10)})})}

export {drawGraph,downloadGraph}