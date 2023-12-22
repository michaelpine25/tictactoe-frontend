import React, { useEffect } from 'react';
import * as d3 from 'd3';

const Stats = (props) => {
  const pieStats = [
    { name: 'Number of wins', value: props.currentUser.wins },
    { name: 'Number of losses', value: props.currentUser.losses },
    { name: 'Number of ties', value: props.currentUser.ties },
  ];

  const pieWidth = 350;
  const pieHeight = 350;

  useEffect(() => {
    const pieRadius = Math.min(pieWidth, pieHeight) / 2;

    const colorScale = d3.scaleOrdinal().range(['#00FF00', '#FF0000', '#FFCE56']);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3.arc().outerRadius(pieRadius - 10).innerRadius(0);

    const pieSvg = d3.select('#pie-chart-container');

    const pieG = pieSvg
      .append('g')
      .attr('transform', `translate(${pieWidth / 2},${pieHeight / 2})`);

    const pieArcs = pieG.selectAll('.arc').data(pie(pieStats)).enter().append('g');

    pieArcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => colorScale(d.data.name))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    const barStatsText = d3.select('#bar-stats-text-container');

    // Remove existing content before appending new data
    barStatsText.selectAll('*').remove();

    barStatsText
      .selectAll('.bar-text')
      .data(pieStats)
      .enter()
      .append('p')
      .text((d) => `${d.name}: ${d.value}`)
      .style('color', (d) => colorScale(d.name))
      .style('font-size', '16px');
  }, [pieStats, pieWidth, pieHeight]);

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <div id="bar-stats-text-container"></div>
          </div>
          <div className="col-span-2 flex">
            <svg id="pie-chart-container" width={pieWidth} height={pieHeight} />
          </div>
        </div>
      </div>
    </div>
  ); 
};

export default Stats;
