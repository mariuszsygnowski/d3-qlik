import {} from './CurrentSelectionTab';
/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import * as d3 from 'd3';
import './Chart.scss';
import {values} from './Values';
// import CurrentSelectionTab from './CurrentSelectionTab';

const Chart = ({data, dataNamesX, sendNewSelections, beginSelections}) => {
  const responsiveHeight = () => {
    if (window.innerHeight < 500) {
      return 500 - 75;
    } else if (window.innerHeight > 1000) {
      return 1000 - 75;
    } else {
      return window.innerHeight - 75;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWidthWindow(window.innerWidth);
      setHeightWindow(responsiveHeight());
      setIsUpdated(true);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  const [inSelectionMode, setInSelectionMode] = useState(true);
  const [selectedValuesArray, setSelectedValuesArray] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  const [widthWindow, setWidthWindow] = useState(window.innerWidth);
  const [heightWindow, setHeightWindow] = useState(responsiveHeight());

  const ref = useRef(null);
  const t = d3
    .transition()
    .duration(350)
    .ease(d3.easeLinear);

  useEffect(() => {
    const margin = {top: 10, right: 30, bottom: 50, left: 80};
    const innerWidth = widthWindow - margin.left - margin.right;
    const innerHeight = heightWindow - margin.top - margin.bottom;

    const SVG = d3
      .select(ref.current)
      .attr('width', widthWindow)
      .attr('height', heightWindow);

    const createChart = () => {
      // console.log(`values:`, values);
      console.log(`data:`, data);
      const allValuesYArray = data.map(e => e[0].qNums);
      console.log(`allValuesYArray:`, allValuesYArray);
      // const allValuesXArray = data.firstValue.map(e => e[0].qText);

      const COLOR = d3
        .scaleSequential()
        .domain([0, dataNamesX.length])
        .interpolator(d3.interpolateSinebow);

      const xScale = d3
        .scaleBand()
        .domain(allValuesXArray) // input
        .range([0, innerWidth])
        .padding(0.1); // output

      const yScale = d3
        .scaleLinear()
        .domain([d3.max(allValuesYArray) * 1.05, 0]) // input
        .range([0, innerHeight]); // output

      const allGRects = SVG.selectAll('g.allrects').data([
        'create only one element g so in this array is only one element'
      ]);

      const rectGroup = allGRects
        .enter()
        .append('g')
        .attr('class', 'allrects')
        .merge(allGRects)
        .attr('transform', `translate(${margin.left},${heightWindow - margin.bottom})`);

      const numberOfDimensions = 3;
      const colors = ['red', 'blue', 'green'];

      Object.entries(data).forEach(([key, val], index) => {
        // console.log(`key:`, key);
        // console.log(`val:`, val);
        // console.log(`index:`, index);

        const allRectsInCurrentIteration = rectGroup.selectAll(`rect.${key}`).data(val);

        allRectsInCurrentIteration
          .enter()
          .append('rect')
          .attr('class', `${key}`)
          .merge(allRectsInCurrentIteration)
          .attr('transform', `translate(${0},${-heightWindow + margin.bottom - 1})`)
          .transition(t)
          .attr('y', d => margin.top + yScale(d[0].qNum))
          .attr('x', (d, i) => {
            return xScale(d[0].qText);
          })
          .attr('width', (d, i) => {
            return xScale.bandwidth();
          })
          .attr('height', function(d) {
            return innerHeight - yScale(d[0].qNum);
          })
          .attr('fill', (d, i) => {
            return colors[index];
          });

        allRectsInCurrentIteration.exit().remove();
      });
      // const allRectsF = rectGroup.selectAll('rect.firstValue').data(data.firstValue);

      // allRectsF
      //   .enter()
      //   .append('rect')
      //   .attr('class', 'firstValue')
      //   .merge(allRectsF)
      //   .attr('transform', `translate(${0},${-heightWindow + margin.bottom - 1})`)
      //   .transition(t)
      //   .attr('y', d => margin.top + yScale(d[0].qNum))
      //   .attr('x', (d, i) => {
      //     return xScale(d[0].qText);
      //   })
      //   .attr('width', (d, i) => {
      //     return xScale.bandwidth();
      //   })
      //   .attr('height', function(d) {
      //     return innerHeight - yScale(d[0].qNum);
      //   })
      //   .attr('fill', (d, i) => {
      //     return COLOR(i);
      //   });

      // const allRectsS = rectGroup.selectAll('rect.secondValue').data(data.secondValue);

      // allRectsS
      //   .enter()
      //   .append('rect')
      //   .attr('class', 'secondValue')
      //   .merge(allRectsS)
      //   .attr('transform', `translate(${0},${-heightWindow + margin.bottom - 1})`)
      //   .transition(t)
      //   .attr('y', d => margin.top + yScale(d[0].qNum))
      //   .attr('x', (d, i) => {
      //     return xScale(d[0].qText);
      //   })
      //   .attr('width', (d, i) => {
      //     return xScale.bandwidth();
      //   })
      //   .attr('height', function(d) {
      //     return innerHeight - yScale(d[0].qNum);
      //   })
      //   .attr('fill', (d, i) => {
      //     return 'black';
      //   });

      //--------------------beginning: many dimensions
      // allRects
      //   .enter()
      //   .append('rect')
      //   .merge(allRects)
      //   .attr('transform', `translate(${0},${-heightWindow + margin.bottom - 1})`)
      //   .transition(t)
      //   .attr('y', d => margin.top + yScale(d[0].qNum))
      //   .attr('x', (d, i) => {
      //     console.log(`xScale(d[0].qText):`, xScale(d[0].qText));
      //     console.log(`xScale.bandwidth():`, xScale.bandwidth());
      //     return xScale(d[0].qText) + xScale.bandwidth() / numberOfDimensions;
      //   })
      //   .attr('width', (d, i) => {
      //     return xScale.bandwidth() / numberOfDimensions;
      //   })
      //   .attr('height', function(d) {
      //     return innerHeight - yScale(d[0].qNum);
      //   })
      //   .attr('fill', (d, i) => {
      //     return isUpdated ? COLOR(i) : COLOR(i);
      //   });

      // const allRects = rectGroup.selectAll('rect').data(data.firstValue);
      // console.log(`allRects:`, allRects);
      // allGRects
      //   .enter()
      //   .append('rect')
      //   .merge(allRects);
      // .transition(t)
      // .attr('y', d => margin.top + yScale(d[0].qNum))
      // .attr('x', (d, i) => {
      //   return xScale(d[0].qText);
      // })
      // .attr('width', (d, i) => {
      //   return xScale.bandwidth();
      // })
      // .attr('height', function(d) {
      //   return innerHeight - yScale(d[0].qNum);
      // })
      // .attr('transform', `translate(${margin.left},${-1})`)
      // .attr('fill', (d, i) => {
      //   return isUpdated ? COLOR(i) : COLOR(i);
      // });
      //--------------------end: many dimensions

      //--------------------begin "on click"
      // const opacityValue = 0.5;
      // const addingToArraySelectedValues = val => {
      //   let clonedArray = [...selectedValuesArray];

      //   //on first click just added first item to selectedValuesArray
      //   if (clonedArray.length === 0) {
      //     clonedArray.push(val);
      //     return clonedArray;
      //   } else {
      //     //this function return true or false. True if use an array of objects with:
      //     //arrayOfObjects.some(checkQElemNumber)
      //     const checkQElemNumber = obj => obj.qElemNumber === val.qElemNumber;

      //     //if found in clonedArray then remove from that array...
      //     if (clonedArray.some(checkQElemNumber)) {
      //       const filteredClonedArray = clonedArray.filter(obj => obj.qElemNumber !== val.qElemNumber);
      //       return filteredClonedArray;
      //     } else {
      //       //if not found add to that array
      //       clonedArray.push(val);
      //       return clonedArray;
      //     }
      //   }
      // };

      // const allRectsGroup = SVG.selectAll('rect');

      // allRectsGroup.on('click', currentElementClicked => {
      //   beginSelections(data.firstValue);
      //   const currentSelectedValuesArray = addingToArraySelectedValues(currentElementClicked[0]);
      //   setSelectedValuesArray(currentSelectedValuesArray);

      //   const allQNumbersFromSelectedValues = currentSelectedValuesArray.map(e => e.qElemNumber);
      //   const merge = () => {
      //     allRectsGroup.attr('stroke', d =>
      //       allQNumbersFromSelectedValues.includes(d[0].qElemNumber) ? 'black' : null
      //     );
      //     allRectsGroup.attr('stroke-width', d => {
      //       return allQNumbersFromSelectedValues.includes(d[0].qElemNumber) ? 2 : null;
      //     });
      //     allRectsGroup.attr('opacity', d =>
      //       allQNumbersFromSelectedValues.includes(d[0].qElemNumber) ? 1 : opacityValue
      //     );
      //   };

      //   if (inSelectionMode) {
      //     allRectsGroup
      //       .attr('opacity', opacityValue)
      //       .attr('stroke', null)
      //       .attr('stroke-width', null)
      //       .attr('opacity', null);
      //     setInSelectionMode(false);
      //     merge();
      //   } else {
      //     merge();
      //   }
      // });
      //--------------------end "on click"

      let translateAndRotate = 'translate(20,20) rotate(60)';
      if (widthWindow > 600) {
        translateAndRotate = 'translate(20,15) rotate(40)';
      }
      if (widthWindow > 800) {
        translateAndRotate = 'translate(20,10) rotate(20)';
      }
      if (widthWindow > 1200) {
        translateAndRotate = 'translate(0,0) rotate(0)';
      }
      var allGXaxis = SVG.selectAll('g.xaxis').data(['create only one element g so in this array is only one element']);

      allGXaxis
        .enter()
        .append('g')
        .attr('class', 'xaxis')
        .merge(allGXaxis)
        .transition(t)
        .attr('transform', `translate(${margin.left},${heightWindow - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', translateAndRotate);

      allGXaxis.exit().remove();

      var allGYaxis = SVG.selectAll('g.yaxis').data(['create only one element g so in this array is only one element']);

      function yAxisTickFormat(number) {
        return d3
          .format('.2s')(number)
          .replace('M', function() {
            if (number < 2000000) return ' Million';
            return ' Millions';
          })
          .replace('G', function() {
            if (number < 2000000000) return ' Billion';
            return ' Billions';
          });
      }

      allGYaxis
        .enter()
        .append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .merge(allGYaxis)
        .transition(t)
        .call(
          d3
            .axisLeft(yScale)
            .ticks(heightWindow < 400 ? data.length / 3 : data.length)
            .tickFormat(yAxisTickFormat)
        );

      allGYaxis.exit().remove();
    };
    createChart();
  }, [data.firstValue, widthWindow, heightWindow, isUpdated, selectedValuesArray]);

  //--------------------beginning: stuff when working on real data
  // const confirmSelectionHandleClick = () => {
  //   const allQNumbersFromSelectedValues = selectedValuesArray.map(e => e.qElemNumber);
  //   d3.select(ref.current)
  //     .selectAll('rect')
  //     .attr('stroke', null)
  //     .attr('stroke-width', null)
  //     .attr('opacity', null);

  //   sendNewSelections(allQNumbersFromSelectedValues);
  //   setSelectedValuesArray([]);
  //   setInSelectionMode(true);
  // };

  // const cancelSelectionHandleClick = () => {
  //   console.log('canceled');
  //   const allRects = ref.current.getElementsByTagName('rect');
  //   for (let index = 0; index < allRects.length; index++) {
  //     allRects[index].classList.remove('addStroke');
  //     allRects[index].classList.remove('addOpacity');
  //   }
  //   setInSelectionMode(true);
  // };
  //--------------------end: stuff when working on real data

  return (
    <div className='chart3'>
      {/* <div className='navBar'>
        <CurrentSelectionTab
          data.firstValue={data.firstValue}
          dataNamesX={dataNamesX}
          selectedValuesArray={selectedValuesArray}
          confirmSelectionHandleClick={confirmSelectionHandleClick}
          cancelSelectionHandleClick={cancelSelectionHandleClick}
        />
      </div> */}
      <div>
        <svg ref={ref} className='chart3Svg' />
      </div>
    </div>
  );
};

export default Chart;
