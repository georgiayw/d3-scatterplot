import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

import './App.css';

function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();

        console.log(jsonData);

        setData(jsonData);

        //extracting "times" and "years"
        const seconds = jsonData.data.map(d => d.Seconds);
        const years = jsonData.data.map(d => d.Year);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {

    if (data && data.length > 0) {

      // years
      const parseYear = d3.timeParse("%Y");
      const years = data.map(d => parseYear(d.Year));

      //seconds into min:sec
      const formatTime = d3.timeFormat("%M:%S");
      const timeInMinutesAndSeconds = 
      data.map(d => formatTime(new Date(d.Seconds * 1000)));

      // set dimensions and margins
      const margin = {top: 10, right: 30, bottom: 30, left: 60};
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`); 

      // define scales
      const xScale = d3.scaleTime()
        .domain([
          d3.min(years).setFullYear(d3.min(years).getFullYear() - 1),
          d3.max(years)
        ])
        .range([0, width]);

      const yScale = d3.scalePoint()
        .domain(timeInMinutesAndSeconds)
        .range([height, 0]);
        

      // x axis
      svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("font-size", "12px");

      // add y axis
      svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale));

      var Tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "bluegray")
        .style("border-radius", "10px")
        .style("padding", "5px")
        
      var mouseover = function(d) {
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "white")
        .style("opacity", 1)
      }

      var mousemove = function(event, d) {
        var Tooltip = d3.select("#tooltip");

        Tooltip
          .html(d.Name + ": " + d.Nationality +
          "<br>Year: " + d.Year + ", Time: " + d.Time +
          "<br>" + d.Doping)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .style("opacity", 0.9)
          .attr("data-year", d3.select(this).attr("data-xvalue"));
      }

      var mouseleave = function(d) {
        Tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("storke", "none")
        .style("opacity", 0.8)
      }

      //legend - colors
      const dopingColor = "steelblue";
      const nonDopingColor = "orange";

      //add legend
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("id", "legend")
        .attr("transform", `translate(${width - 100}, ${height - 150})`);

      //legend - items
      const legendRectSize = 18;
      const legendSpacing = 4;
      const legendSpacingNon = 9;

      legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", dopingColor);
      legend.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendSpacingNon)
        .text("Riders with doping allegations")
        .style("font-size", "7px")
        .attr("alignment-baseline", "middle");

      legend.append("rect")
        .attr("x", 0)
        .attr("y", legendRectSize + legendSpacing)
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", nonDopingColor);
      legend.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize + legendSpacingNon + legendSpacing)
        .text("No doping allegations")
        .style("font-size", "7px")
        .attr("alignment-baseline", "middle");


      // add dots
      svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(parseYear(d.Year)))
        .attr("cy", d => yScale(formatTime(new Date(d.Seconds * 1000))))
        .attr("r", 3)
        .style("fill", d => d.Doping === "" ? nonDopingColor : dopingColor)
        .attr("data-xvalue", d => parseYear(d.Year))
        .attr("data-yvalue", d => new Date(d.Seconds * 1000))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    }
  }, [data]);


  return (
    <div className="App">
      <div id="title">
        <strong>Doping in Professional Bicycle Racing</strong>
        <p>35 Fastest times up Alpe d'Huez</p>
      </div>
      <svg width="800" height="500"></svg>
    </div>
  );
}

export default App;
