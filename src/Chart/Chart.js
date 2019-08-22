import {} from './CurrentSelectionTab';
/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import * as d3 from 'd3';
import './Chart.scss';
import {numToWords} from './numToWords';
import {values} from './Values';

// import CurrentSelectionTab from './CurrentSelectionTab';

const Chart = ({data, dataNamesX, sendNewSelections, beginSelections}) => {
  const [isHorizontal, setisHorizontal] = useState(true);

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
    const margin = {top: 50, right: 80, bottom: 50, left: 80};
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

      const COLOR = d3
        .scaleSequential()
        .domain([0, dataNamesX.length])
        .interpolator(d3.interpolateSinebow);

      const xScale = d3
        .scaleBand()
        .domain(allValuesXArray) // input
        .range(isHorizontal ? [0, innerWidth] : [0, innerHeight])
        .padding(0.1); // output

      const allYScalesArray = allValuesYArray[0].map((e, i) =>
        d3
          .scaleLinear()
          .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0]) // input
          .range(isHorizontal ? [0, innerHeight] : [0, innerWidth])
      );

      //--------------------begin "create one single g, name: allGRects"
      const allGRects = SVG.selectAll('g.allrects').data([
        'create only one element g so in this array is only one element'
      ]);
      allGRects
        .enter()
        .append('g')
        .attr('class', 'allrects')
        .merge(allGRects)
        .transition(t)
        .attr(
          'transform',
          isHorizontal
            ? `translate(${margin.left},${heightWindow - margin.bottom})`
            : `translate(${margin.left},${margin.bottom})rotate(90)`
        );
      allGRects.exit().remove();
      //--------------------end "create one single g, name: allGRects"

      //--------------------begin "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"
      const colors = ['red', 'LIME', 'blue', 'DARKSALMON'];
      const groupGWithMutlipleRects = allGRects.selectAll(`.groupRects`).data(data);
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
      //--------------------end "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"

      //--------------------begin "inside groupGWithMutlipleRects, create multiple rect for each measure, name:allRectsInGroupG"
      const widthOfSingleChart = xScale.bandwidth() / numberOfMeasures;

      console.log(`data:`, data);

      const allRectsInGroupG = groupGWithMutlipleRects.selectAll('rect').data(data => data[0].qNums);
      allRectsInGroupG
        .enter()
        .append('rect')
        .merge(allRectsInGroupG)
        .transition(t)
        .attr('y', (d, i) => {
          const currentYScale = allYScalesArray[i];
          return isHorizontal ? currentYScale(d) - innerHeight : currentYScale(d) - innerWidth;
          // return currentYScale(d) - heightWindow;
        })
        .attr('x', (d, i) => {
          const currentYScale = allYScalesArray[i];
          // return isHorizontal ? widthOfSingleChart * i : currentYScale(d);
          return widthOfSingleChart * i;
        })
        .attr('height', function(d, i) {
          const currentYScale = allYScalesArray[i];
          return isHorizontal ? innerHeight - currentYScale(d) : innerWidth - currentYScale(d);
          // return heightWindow - currentYScale(d);
        })
        .attr('width', (d, i) => {
          return widthOfSingleChart;
        })
        .attr('fill', (d, i) => {
          return colors[i];
        });
      allRectsInGroupG.exit().remove();
      //--------------------end "inside groupGWithMutlipleRects, create multiple rect for each measure, name:allRectsInGroupG"

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

      let translateAndRotateLeftAxis = 'translate(-15,0) rotate(80)';
      if (widthWindow > 600) {
        translateAndRotateLeftAxis = 'translate(-15,0) rotate(60)';
      }
      if (widthWindow > 800) {
        translateAndRotateLeftAxis = 'translate(-15,0) rotate(40)';
      }
      if (widthWindow > 1200) {
        translateAndRotateLeftAxis = 'translate(0,0) rotate(0)';
      }

      //--------------------begin: bottom axis
      var allGXaxis = SVG.selectAll('g.xaxis').data(['create only one element g so in this array is only one element']);

      allGXaxis
        .enter()
        .append('g')
        .attr('class', 'xaxis')
        .merge(allGXaxis)
        .transition(t)
        .call(isHorizontal ? d3.axisBottom(xScale) : d3.axisLeft(xScale))
        .attr(
          'transform',
          isHorizontal
            ? `translate(${margin.left},${heightWindow - margin.bottom})`
            : `translate(${margin.left},${margin.top})`
        )
        .selectAll('text')
        .attr('transform', isHorizontal ? translateAndRotate : 'translate(-25,0) rotate(0)');

      allGXaxis.exit().remove();
      //--------------------end: bottom axis

      function yAxisTickFormat(number) {
        const formatNumber = number === 0 ? '.1s' : '.2s';
        return d3
          .format(formatNumber)(number)
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

      allGYaxisL
        .enter()
        .append('g')
        .attr('class', 'yaxisl')
        .merge(allGYaxisL)
        .transition(t)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(
          isHorizontal
            ? d3
                .axisLeft(allYScalesArray[measureNumberForLeftAxis])
                .ticks(heightWindow < 400 ? data.length / 3 : data.length)
                .tickFormat(yAxisTickFormat)
            : d3
                .axisTop(allYScalesArray[measureNumberForLeftAxis])
                .ticks(heightWindow < 400 ? data.length / 3 : data.length)
                .tickFormat(yAxisTickFormat)
        )
        // .transition(t)
        .selectAll('text')
        .attr('transform', isHorizontal ? null : translateAndRotateLeftAxis)
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

        allGYaxisR
          .enter()
          .append('g')
          .attr('class', 'yaxisr')
          .merge(allGYaxisR)
          .transition(t)
          .attr(
            'transform',
            isHorizontal
              ? `translate(${innerWidth + margin.left},${margin.top})`
              : `translate(${margin.left},${heightWindow - margin.bottom})`
          )
          .call(
            isHorizontal
              ? d3
                  .axisRight(allYScalesArray[measureNumberForRightAxis])
                  .ticks(heightWindow < 400 ? data.length / 3 : data.length)
                  .tickFormat(yAxisTickFormat)
              : d3
                  .axisBottom(allYScalesArray[measureNumberForRightAxis])
                  .ticks(heightWindow < 400 ? data.length / 3 : data.length)
                  .tickFormat(yAxisTickFormat)
          )
          .selectAll('text')
          .transition(t)
          .attr('fill', colors[measureNumberForRightAxis])
          .style('font-size', '1.5em')
          .style('font-weight', 900);

        allGYaxisR.exit().remove();
        //--------------------end: right axis
      } else {
        SVG.selectAll('g.yaxisr').remove();
      }
      console.log(`isHorizontal:`, isHorizontal);
    };
    createChart();
  }, [data, widthWindow, heightWindow, isUpdated, selectedValuesArray, isHorizontal]);

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

  const changeLandscape = e => {
    isHorizontal ? (e.target.innerHTML = 'click for vertical') : (e.target.innerHTML = 'click for horizontal');
    setisHorizontal(!isHorizontal);
  };
  return (
    <div className='chart3'>
      <button onClick={e => changeLandscape(e)}>click for horizontal</button>
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
