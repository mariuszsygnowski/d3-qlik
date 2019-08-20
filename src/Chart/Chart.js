import {} from './CurrentSelectionTab';
/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import * as d3 from 'd3';
import './Chart.scss';
import {numToWords} from './numToWords';
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
    .duration(250)
    .ease(d3.easeLinear);

  useEffect(() => {
    const margin = {top: 10, right: 80, bottom: 50, left: 80};
    const innerWidth = widthWindow - margin.left - margin.right;
    const innerHeight = heightWindow - margin.top - margin.bottom;

    const SVG = d3
      .select(ref.current)
      .attr('width', widthWindow)
      .attr('height', heightWindow);

    const createChart = () => {
      const allValuesXArray = data.map(e => e[0].qText);
      const allValuesYArray = data.map(e => e[0].qNums);
      let arrayForAllValuesFromEachDimension = [];

      const numberOfMeasures = allValuesYArray[0].length;
      for (let index = 0; index < numberOfMeasures; index++) {
        const valuesFromSingleDimension = allValuesYArray.map(e => e[index]);
        arrayForAllValuesFromEachDimension.push(valuesFromSingleDimension);
      }

      let maxValueFromArray = 0;
      arrayForAllValuesFromEachDimension.forEach(e => {
        let maxVal = d3.max(e);
        if (maxVal > maxValueFromArray) {
          maxValueFromArray = maxVal;
        }
      });

      const COLOR = d3
        .scaleSequential()
        .domain([0, dataNamesX.length])
        .interpolator(d3.interpolateSinebow);

      const xScale = d3
        .scaleBand()
        .domain(allValuesXArray) // input
        .range([0, innerWidth])
        .padding(0.1); // output

      let yScale = d3
        .scaleLinear()
        .domain([d3.max(arrayForAllValuesFromEachDimension[0]) * 1.03, 0]) // input
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
      allGRects.exit().remove();

      const colors = ['red', 'LIME', 'blue', 'DARKSALMON'];
      const groupGWithMutlipleRects = rectGroup.selectAll(`g.groupRects`).data(data);
      groupGWithMutlipleRects
        .enter()
        .append('g')
        .attr('class', (d, i) => {
          return `groupRects`;
        })
        .merge(groupGWithMutlipleRects)
        .transition(t)
        .attr('transform', d => `translate(${xScale(d[0].qText)},${0})`);
      groupGWithMutlipleRects.exit().remove();

      const widthOfSingleChart = xScale.bandwidth() / numberOfMeasures;
      const allRectsInGroupG = rectGroup
        .selectAll(`g.groupRects`)
        .selectAll('rect')
        .data(data => data[0].qNums);
      allRectsInGroupG
        .enter()
        .append('rect')
        .merge(allRectsInGroupG)
        .attr('y', (d, i) => {
          yScale = d3
            .scaleLinear()
            .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0]) // input
            .range([0, innerHeight]);
          return yScale(d) - innerHeight;
        })
        .attr('x', (d, i) => {
          return widthOfSingleChart * i;
        })
        .attr('height', function(d, i) {
          yScale = d3
            .scaleLinear()
            .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0]) // input
            .range([0, innerHeight]);
          return innerHeight - yScale(d);
        })
        .attr('width', (d, i) => {
          return widthOfSingleChart;
        })
        .attr('fill', (d, i) => {
          return colors[i];
        });
      allRectsInGroupG.exit().remove();

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

      //--------------------begin: left axis
      const measureNumberForLeftAxis = 0;
      var allGYaxisL = SVG.selectAll('g.yaxisl').data([
        'create only one element g so in this array is only one element'
      ]);

      yScale = d3
        .scaleLinear()
        .domain([d3.max(arrayForAllValuesFromEachDimension[measureNumberForLeftAxis]) * 1.03, 0]) // input
        .range([0, innerHeight]);

      allGYaxisL
        .enter()
        .append('g')
        .attr('class', 'yaxisl')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .merge(allGYaxisL)
        .transition(t)
        .call(
          d3
            .axisLeft(yScale)
            .ticks(heightWindow < 400 ? data.length / 3 : data.length)
            .tickFormat(yAxisTickFormat)
        );

      allGYaxisL
        .enter()
        .selectAll('g.yaxisl')
        .selectAll('text')
        .attr('fill', colors[measureNumberForLeftAxis])
        .style('font-size', '1.5em')
        .style('font-weight', 900);

      allGYaxisL.exit().remove();
      //--------------------end: left axis

      //--------------------begin: right axis
      if (numberOfMeasures > 1) {
        const measureNumberForRightAxis = 1;

        var allGYaxisR = SVG.selectAll('g.yaxisr').data([
          'create only one element g so in this array is only one element'
        ]);

        yScale = d3
          .scaleLinear()
          .domain([d3.max(arrayForAllValuesFromEachDimension[measureNumberForRightAxis]) * 1.03, 0]) // input
          .range([0, innerHeight]);

        allGYaxisR
          .enter()
          .append('g')
          .attr('class', 'yaxisr')
          .merge(allGYaxisR)
          .transition(t)
          .attr('transform', `translate(${innerWidth + margin.left},${margin.top})`)
          .call(
            d3
              .axisRight(yScale)
              .ticks(heightWindow < 400 ? data.length / 3 : data.length)
              .tickFormat(yAxisTickFormat)
          );

        allGYaxisR
          .enter()
          .selectAll('g.yaxisr')
          .selectAll('text')
          .attr('fill', colors[measureNumberForRightAxis])
          .style('font-size', '1.5em')
          .style('font-weight', 900);

        allGYaxisR.exit().remove();
        //--------------------end: right axis
      }
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
