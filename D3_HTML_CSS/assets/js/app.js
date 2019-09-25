var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "obesity") {
    var label = "Obesity:";
  }
  else {
    var label = "Income:";
  }

  var toolTip = d3.tip()
    .attr("class","tooltip")
    .offset([80,-60])
    .html(function(d) {
      return (`Smokes: ${d.smokes}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(censusData) {
        console.log(censusData);  
        
        let stateAbbr = []
        let age = []
        let income = []
        let obesity = []

        for (i=0; i<censusData.length;i++) {
            stateAbbr.push(censusData[i]["abbr"])
            age.push(+censusData[i]["age"])//add the plus "+" turns data from string to int.
            income.push(+censusData[i]["income"])
            obesity.push(+censusData[i]["obesity"])
            //convert original data here
            censusData[i]["age"] = +censusData[i]["age"]
            censusData[i]["income"] = +censusData[i]["income"]
            censusData[i]["obesity"] = +censusData[i]["obesity"]
            censusData[i]["smokes"] = +censusData[i]["smokes"]
            
            };
// xLinearScale function above csv import
var xLinearScale = xScale(censusData, chosenXAxis);

// Create y scale function  CHANGED TO SMOKES IF BACK TO AGE, USE DOMAIN OF 25....
var yLinearScale = d3.scaleLinear()
  .domain([7, d3.max(censusData, d => d.smokes)])
  .range([height, 20]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
chartGroup.append("g")
  .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
  .data(censusData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.smokes))
  .attr("r", 20)
  .attr("fill", "blue")
  .attr("opacity", ".75");

  // append text remove comment below on final sub.
let textGroup = chartGroup.selectAll("circle text")
  .data(censusData)
  .enter()
  .append("text")
  .text(function(data){
    return data.abbr
  })
  .attr("dx", d => xLinearScale(d[chosenXAxis]))
  .attr("dy", d => yLinearScale(d.age))
  .attr("font-size" , 12)
  

// Create group for  2 x- axis labels
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var obesityVar = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "obesity") // value to grab for event listener
  .classed("active", true)
  .text("Obesity");

var I = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Income");

// append y axis
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Smokes");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(censusData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "income") {
        I
          .classed("active", true)
          .classed("inactive", false);
        obesityVar
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        I
          .classed("active", false)
          .classed("inactive", true);
        obesityVar
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
});


    


