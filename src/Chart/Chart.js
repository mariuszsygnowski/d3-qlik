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
      return 500 - 275;
    } else if (window.innerHeight > 1000) {
      return 1000 - 275;
    } else {
      return window.innerHeight - 275;
    }
  };

  const [inSelectionMode, setInSelectionMode] = useState(true);
  const [selectedValuesArray, setSelectedValuesArray] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isVertical, setIsVertical] = useState(true);
  const [isDirectionDefault, setIsDirectionDefault] = useState(true);

  const [widthWindow, setWidthWindow] = useState(window.innerWidth);
  const [heightWindow, setHeightWindow] = useState(responsiveHeight());

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
        .range(
          isVertical
            ? isDirectionDefault
              ? [0, innerWidth]
              : [0, innerWidth]
            : isDirectionDefault
            ? [0, innerHeight]
            : [0, innerHeight]
        )
        .padding(0.1); // output

      const allYScalesArray = allValuesYArray[0].map((e, i) =>
        d3
          .scaleLinear()
          .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0]) // input
          .range(
            isVertical
              ? isDirectionDefault
                ? [0, innerHeight]
                : [0, innerHeight]
              : isDirectionDefault
              ? [0, innerWidth]
              : [0, innerWidth]
          )
      );
      const allYScalesArrayVertical = allValuesYArray[0].map((e, i) =>
        d3
          .scaleLinear()
          .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0]) // input
          .range(
            isVertical
              ? isDirectionDefault
                ? [0, innerHeight]
                : [innerHeight, 0]
              : isDirectionDefault
              ? [0, innerWidth]
              : [0, innerWidth]
          )
      );
      const allYScalesArrayHorizontal = allValuesYArray[0].map((e, i) =>
        d3
          .scaleLinear()
          .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0]) // input
          .range(isVertical ? [innerWidth, 0] : [innerWidth, 0])
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
          isVertical
            ? isDirectionDefault
              ? `translate(${margin.left},${heightWindow - margin.bottom})`
              : `translate(${margin.left},${margin.top})`
            : `translate(${margin.left},${margin.bottom})rotate(90)`
        );
      allGRects.exit().remove();
      //--------------------end "create one single g, name: allGRects"

      //--------------------begin "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"
      const colors = ['red', 'LIME', 'blue', 'DARKSALMON', 'Silver', 'FUCHSIA'];
      const groupGWithMutlipleRects = allGRects.selectAll(`.groupRects`).data(data);
      groupGWithMutlipleRects
        .enter()
        .append('g')
        .attr('class', 'groupRects')
        .merge(groupGWithMutlipleRects)
        .transition(t)
        .attr('transform', d => `translate(${xScale(d[0].qText)},${0})`);
      groupGWithMutlipleRects.exit().remove();
      //--------------------end "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"

      //--------------------begin "inside groupGWithMutlipleRects, create multiple rect for each measure, name:allRectsInGroupG"
      const widthOfSingleChart = xScale.bandwidth() / numberOfMeasures;
      const allRectsInGroupG = groupGWithMutlipleRects.selectAll('rect').data(data => data[0].qNums);
      allRectsInGroupG
        .enter()
        .append('rect')
        .merge(allRectsInGroupG)
        .transition(t)
        .attr('y', (d, i) => {
          const currentYScale = allYScalesArray[i];
          return isVertical
            ? isDirectionDefault
              ? currentYScale(d) - innerHeight
              : 1
            : isDirectionDefault
            ? currentYScale(d) - innerWidth
            : -innerWidth;
        })
        .attr('x', (d, i) => {
          return widthOfSingleChart * i;
        })
        .attr('height', function(d, i) {
          const currentYScale = allYScalesArray[i];
          return isVertical ? innerHeight - currentYScale(d) : innerWidth - currentYScale(d);
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
        translateAndRotate = 'translate(20,8) rotate(20)';
      }
      if (widthWindow > 1200) {
        translateAndRotate = 'translate(0,0) rotate(0)';
      }

      let translateAndRotateTop = 'translate(12,-25) rotate(-60)';
      if (widthWindow > 600) {
        translateAndRotateTop = 'translate(16,-23) rotate(-40)';
      }
      if (widthWindow > 800) {
        translateAndRotateTop = 'translate(20,-15) rotate(-20)';
      }
      if (widthWindow > 1200) {
        translateAndRotateTop = 'translate(0,-8) rotate(0)';
      }

      let translateAndRotateLeftAxis = 'translate(-15,0) rotate(80)';
      if (widthWindow > 600) {
        translateAndRotateLeftAxis = 'translate(-15,0) rotate(60)';
      }
      if (widthWindow > 800) {
        translateAndRotateLeftAxis = 'translate(-15,0) rotate(40)';
      }
      if (widthWindow > 1200) {
        translateAndRotateLeftAxis = 'translate(15,0) rotate(0)';
      }

      //--------------------begin: bottom axis
      var allGXaxis = SVG.selectAll('g.xaxis').data(['create only one element g so in this array is only one element']);

      allGXaxis
        .enter()
        .append('g')
        .attr('class', 'xaxis')
        .merge(allGXaxis)
        .transition(t)
        .call(
          isVertical
            ? isDirectionDefault
              ? d3.axisBottom(xScale)
              : d3.axisTop(xScale)
            : isDirectionDefault
            ? d3.axisLeft(xScale)
            : d3.axisRight(xScale)
        )
        .attr(
          'transform',
          isVertical
            ? isDirectionDefault
              ? `translate(${margin.left},${heightWindow - margin.bottom})`
              : `translate(${margin.left},${margin.bottom})`
            : isDirectionDefault
            ? `translate(${margin.left},${margin.top})`
            : `translate(${margin.left + innerWidth},${margin.top})`
        )
        .selectAll('text')
        .attr(
          'transform',
          isVertical
            ? isDirectionDefault
              ? translateAndRotate
              : translateAndRotateTop
            : isDirectionDefault
            ? 'translate(-22,-5)'
            : 'translate(20,-5)'
        );

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
          isVertical
            ? isDirectionDefault
              ? d3
                  .axisLeft(allYScalesArray[measureNumberForLeftAxis])
                  .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                  .tickFormat(yAxisTickFormat)
              : d3
                  .axisLeft(allYScalesArrayVertical[measureNumberForLeftAxis])
                  .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                  .tickFormat(yAxisTickFormat)
            : isDirectionDefault
            ? d3
                .axisTop(allYScalesArrayHorizontal[measureNumberForLeftAxis])
                .ticks(data.length)
                .tickFormat(yAxisTickFormat)
            : d3
                .axisTop(allYScalesArrayVertical[measureNumberForLeftAxis])
                .ticks(data.length)
                .tickFormat(yAxisTickFormat)
        );
      allGYaxisL
        .selectAll('text')
        .attr('transform', isVertical ? null : translateAndRotateLeftAxis)
        .attr('fill', colors[measureNumberForLeftAxis])
        .style('font-size', '1.5em')
        .style('font-weight', 900);

      allGYaxisL
        .selectAll('line')
        .attr('y2', isVertical ? 0 : -6)
        .attr('x2', isVertical ? -6 : 0);

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
            isVertical
              ? `translate(${innerWidth + margin.left},${margin.top})`
              : `translate(${margin.left},${heightWindow - margin.bottom})`
          )
          .call(
            isVertical
              ? isDirectionDefault
                ? d3
                    .axisRight(allYScalesArray[measureNumberForRightAxis])
                    .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                    .tickFormat(yAxisTickFormat)
                : d3
                    .axisRight(allYScalesArrayVertical[measureNumberForRightAxis])
                    .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                    .tickFormat(yAxisTickFormat)
              : isDirectionDefault
              ? d3
                  .axisBottom(allYScalesArrayHorizontal[measureNumberForRightAxis])
                  .ticks(data.length)
                  .tickFormat(yAxisTickFormat)
              : d3
                  .axisBottom(allYScalesArrayVertical[measureNumberForRightAxis])
                  .ticks(data.length)
                  .tickFormat(yAxisTickFormat)
          )
          .selectAll('text')
          .attr('transform', isVertical ? null : translateAndRotateLeftAxis)
          .attr('fill', colors[measureNumberForRightAxis])
          .style('font-size', '1.5em')
          .style('font-weight', 900);

        isVertical ? allGYaxisR.selectAll('line').attr('y2', 0) : allGYaxisR.selectAll('line').attr('y2', 0);
        isVertical ? allGYaxisR.selectAll('text').attr('y', 0) : allGYaxisR.selectAll('text').attr('y', 0);
        allGYaxisR.exit().remove();
        //--------------------end: right axis
      } else {
        SVG.selectAll('g.yaxisr').remove();
      }
    };
    createChart();
  }, [data, widthWindow, heightWindow, isUpdated, selectedValuesArray, isVertical, isDirectionDefault]);

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
    isVertical ? (e.target.innerHTML = 'click for horizontal') : (e.target.innerHTML = 'click for vertical');
    setIsVertical(!isVertical);
  };

  const changeDirection = () => {
    setIsDirectionDefault(!isDirectionDefault);
  };
  return (
    <div className='chart3'>
      <button onClick={e => changeLandscape(e)}>click for vertical</button>
      <button onClick={e => changeDirection(e)}>click for change direction of chart</button>
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
