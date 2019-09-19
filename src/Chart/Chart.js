// import {numToWords} from './numToWords';
// import {values} from './Values';
// import CurrentSelectionTab from './CurrentSelectionTab';
// I still might want to use in the future that components

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// TABLE OF CONTENT ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//////////////// 1.    Set-up SVG and wrappers - from approximately line 104 ///////////////////
//////////////// 2.    Initiate scales - from approximately line 133 ///////////////////////////
//////////////// 3.    The main bar chart - from approximately line 250 ////////////////////////
//////////////// 4.    Drag and drop - (swapping charts) - from approximately line 339 /////////
//////////////// 4.1   Function dragstarted - from approximately line 360 //////////////////////
//////////////// 4.2   Function dragged - from approximately line 401 //////////////////////////
//////////////// 4.3   Function dragended - from approximately line 448 ////////////////////////
//////////////// 5.    All Axis - from approximately line 498 //////////////////////////////////
//////////////// 5.1   Bottom Axis - from approximately line 540 ///////////////////////////////
//////////////// 5.2   Left Axis - from approximately line 589 /////////////////////////////////
//////////////// 5.3   Right Axis - from approximately line 661 ////////////////////////////////
//////////////// 6.    Brush chart - from approximately line 730 ///////////////////////////////
//////////////// 6.1   Brush mini chart - from approximately line 739 //////////////////////////
//////////////// 6.2   Selected area on mini chart - from approximately line 825 ///////////////
//////////////// 6.2.1 Function dragstarted - from approximately line 833 //////////////////////
//////////////// 6.2.2 Function dragged - from approximately line 851 //////////////////////////
//////////////// 6.2.3 Function dragended - from approximately line 901 ////////////////////////
//////////////// 6.2.3 Function dragended - from approximately line 901 ////////////////////////
//////////////// 6.3   Brush rect - from approximately line 908 ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import * as d3 from 'd3';
import './Chart.scss';

const Chart = ({
  data,
  dataNamesX,
  sendNewSelections,
  beginSelections,
  colors,
  setColors,
  qMeasures,
  setNewQMeasures,
  isDirectionDefault,
  isVertical
}) => {
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

  const [widthWindow, setWidthWindow] = useState(window.innerWidth);
  const [heightWindow, setHeightWindow] = useState(responsiveHeight());
  const [heightBrushSvg, setHeightBrushSvg] = useState(heightWindow / 10);
  const [dataMainChart, setDataMainChart] = useState(data);
  const [differencePosBar, setDifferencePosBar] = useState(0);
  const [margin, setMargin] = useState({top: 50, right: 80, bottom: 50, left: 80, middle: 40});
  const [beggingPosXBar, setBeggingPosXBar] = useState(0);

  const t = d3
    .transition()
    .duration(550)
    .ease(d3.easeLinear);
  //this useEffect are invoke for any updates
  //as I set new width and height SVG for window resize
  useEffect(() => {
    const handleResize = () => {
      const bar = d3.select('#bar').data(['create only one element g so in this array is only one element']);

      const resHeight = responsiveHeight();
      setWidthWindow(prev => {
        if (prev !== window.innerWidth) {
          const posX = +bar.attr('x');
          const widthChart = +bar.attr('width');
          const percentageDiff = (window.innerWidth - prev) / (prev - margin.left - margin.right) + 1;
          setBeggingPosXBar(beggingPosXBar * percentageDiff);
          bar.attr('x', posX * percentageDiff);
          bar.attr('width', widthChart * percentageDiff);
        } else {
          console.log(`not`);
        }
        return window.innerWidth;
      });
      setHeightWindow(resHeight);

      //I don't want to be my height of brushSvg less than 50 px
      setHeightBrushSvg(resHeight / 10 < 50 ? 50 : resHeight / 10);
      setIsUpdated(true);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  const ref = useRef(null);
  useEffect(() => {
    /////////////////////////////////////////////////////////////
    ///////////////// 1. Set-up SVG /////////////////////////////
    /////////////////////////////////////////////////////////////

    // const margin = {top: 50, right: 80, bottom: 50, left: 80, middle: 40};
    const innerWidth = widthWindow - margin.left - margin.right;
    const innerHeight = heightWindow - margin.top - margin.bottom;

    const SVG = d3
      .select(ref.current)
      .attr('width', widthWindow)
      .attr('height', heightWindow);

    const allValuesXArray = data.map(e => e[0].qText);
    const allValuesYArray = data.map(e => e[0].qNums);
    const allValuesXArrayU = dataMainChart.map(e => e[0].qText);
    const allValuesYArrayU = dataMainChart.map(e => e[0].qNums);
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

    /////////////////////////////////////////////////////////////
    ////////////////////// 2. Initiate scales ///////////////////
    /////////////////////////////////////////////////////////////

    const xScale = d3
      .scaleBand()
      .domain(allValuesXArray)
      .range(
        isVertical
          ? isDirectionDefault
            ? [0, innerWidth]
            : [0, innerWidth]
          : isDirectionDefault
          ? [0, innerHeight]
          : [0, innerHeight]
      )
      .padding(0.1);

    const step = xScale.step();
    const xScaleU = d3
      .scaleBand()
      .domain(allValuesXArrayU)
      .range(
        isVertical
          ? isDirectionDefault
            ? [0, innerWidth]
            : [0, innerWidth]
          : isDirectionDefault
          ? [0, innerHeight]
          : [0, innerHeight]
      )
      .padding(0.1);

    // I have to create an universal solution for yScale as I change
    // to vertical/horizontal and also create a brush SVG
    const yScale = obj => {
      const allYScalesArray = allValuesYArray[0].map((e, i) =>
        d3
          .scaleLinear()
          //* 1.03 as I add a little bit more space at top on yScale
          .domain([d3.max(arrayForAllValuesFromEachDimension[i]) * 1.03, 0])
          .range(
            isVertical
              ? isDirectionDefault
                ? [obj.isV.isDD.first, obj.isV.isDD.second]
                : [obj.isV.isNotDD.first, obj.isV.isNotDD.second]
              : isDirectionDefault
              ? [obj.isNotV.isDD.first, obj.isNotV.isDD.second]
              : [obj.isNotV.isNotDD.first, obj.isNotV.isNotDD.second]
          )
      );
      return allYScalesArray;
    };

    //default view
    const yScaleObj = {
      isV: {
        isDD: {first: 0, second: innerHeight - heightBrushSvg},
        isNotDD: {first: 0, second: innerHeight}
      },
      isNotV: {
        isDD: {first: 0, second: innerWidth},
        isNotDD: {first: 0, second: innerWidth}
      }
    };

    //vertical view
    const yScaleObjV = {
      isV: {
        isDD: {first: 0, second: innerHeight - heightBrushSvg},
        isNotDD: {first: innerHeight, second: 0}
      },
      isNotV: {
        isDD: {first: 0, second: innerWidth},
        isNotDD: {first: 0, second: innerWidth}
      }
    };

    //horizontal view
    const yScaleObjH = {
      isV: {
        isDD: {first: innerWidth, second: 0},
        isNotDD: {first: 0, second: 0}
      },
      isNotV: {
        isDD: {first: innerWidth, second: 0},
        isNotDD: {first: 0, second: 0}
      }
    };

    //default view for brush SVG
    const yScaleObjBrush = {
      isV: {
        isDD: {first: 0, second: heightBrushSvg},
        isNotDD: {first: 0, second: innerHeight}
      },
      isNotV: {
        isDD: {first: 0, second: innerWidth},
        isNotDD: {first: 0, second: innerWidth}
      }
    };

    //vertical view for brush
    const yScaleObjVBrush = {
      isV: {
        isDD: {first: 0, second: heightBrushSvg},
        isNotDD: {first: innerHeight, second: 0}
      },
      isNotV: {
        isDD: {first: 0, second: innerWidth},
        isNotDD: {first: 0, second: innerWidth}
      }
    };

    /////////////////////////////////////////////////////////////
    //////////////// 3. The main bar chart //////////////////////
    /////////////////////////////////////////////////////////////

    //--------------------begin "create one single g, name: allGRects"

    //SELECT AND DATA JOIN
    const allGRects = SVG.selectAll('g.allrects').data([
      'create only one element g so in this array is only one element'
    ]);

    //ENTER
    allGRects
      .enter()
      .append('g')
      .attr('class', 'allrects')
      //UPDATE
      .merge(allGRects)
      .transition(t)
      .attr(
        'transform',
        isVertical
          ? isDirectionDefault
            ? `translate(${margin.left},${innerHeight + margin.top - heightBrushSvg})`
            : `translate(${margin.left},${margin.top})`
          : `translate(${margin.left},${margin.bottom})rotate(90)`
      );

    //EXIT
    allGRects.exit().remove();
    //--------------------end "create one single g, name: allGRects"

    //--------------------begin "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"

    //SELECT AND DATA JOIN
    const groupGWithMutlipleRects = allGRects.selectAll(`.groupRects`).data(dataMainChart);

    //ENTER
    groupGWithMutlipleRects
      .enter()
      .append('g')
      .attr('class', 'groupRects')
      .attr('id', (d, i) => i)
      //UPDATE
      .merge(groupGWithMutlipleRects)
      .transition(t)
      .attr('transform', (d, i) => `translate(${xScaleU(d[0].qText)},${0})`);

    //EXIT
    groupGWithMutlipleRects.exit().remove();
    //--------------------end "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"

    //--------------------begin "inside groupGWithMutlipleRects, create multiple rect for each measure, name:allRectsInGroupG"
    const widthOfSingleChartU = xScaleU.bandwidth() / numberOfMeasures;
    const widthOfSingleChart = xScale.bandwidth() / numberOfMeasures;

    //SELECT AND DATA JOIN
    const allRectsInGroupG = groupGWithMutlipleRects.selectAll('rect').data(dataMainChart => dataMainChart[0].qNums);

    //ENTER
    allRectsInGroupG
      .enter()
      .append('rect')
      //UPDATE
      .merge(allRectsInGroupG)
      .transition(t)
      .attr('id', (d, i) => i)
      .attr('class', 'allRectsInGroupG')
      .attr('y', (d, i) => {
        const currentYScale = yScale(yScaleObj)[i];
        return isVertical
          ? isDirectionDefault
            ? currentYScale(d) - innerHeight + heightBrushSvg
            : 1
          : isDirectionDefault
          ? currentYScale(d) - innerWidth
          : -innerWidth;
      })
      .attr('x', (d, i) => {
        return widthOfSingleChartU * i;
      })
      .attr('height', (d, i) => {
        const currentYScale = yScale(yScaleObj)[i];
        return isVertical ? innerHeight - heightBrushSvg - currentYScale(d) : innerWidth - currentYScale(d);
      })
      .attr('width', (d, i) => {
        return widthOfSingleChartU;
      })
      .attr('fill', (d, i) => {
        return colors[i];
      });

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 4. Drag and drop - (swapping charts) ////////////////
    ///////////////////////////////////////////////////////////////////////////

    let xPos = 0,
      yPos = 0,
      positionX = 0,
      positionY = 0,
      didIFound = false,
      valTransformDim = '',
      idObjectDraged,
      heightCurr,
      widthCurr,
      positionXCurr,
      strTrans,
      curr,
      desId,
      desEle;

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 4.1 Function dragstarted ////////////////////////////////////
    //function when dragging is starting - is when you click and hold//////////////////
    //I can't use arrow function as I will not have an access to this//////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    function dragstarted(d) {
      //as each measure are in his own g, I need to find position where form is starting
      strTrans = this.parentElement.getAttribute('transform');

      //extract only value from transform, example from
      //transform="translate(5.535269737243652, 0)" I get 5.535269737243652
      valTransformDim = +strTrans.substring(strTrans.lastIndexOf('(') + 1, strTrans.lastIndexOf(','));

      //xPos and yPos will be used only to track differences when user will move mouse
      xPos = +d3.event.sourceEvent.clientX;
      yPos = +d3.event.sourceEvent.clientY;

      //selecting current chart and assign to values
      curr = d3.select(this);
      idObjectDraged = +curr.attr('id');
      heightCurr = +curr.attr('height');
      widthCurr = +curr.attr('width');
      positionXCurr = +curr.attr('x');

      //I need to know where I clicked on SVG
      positionX = margin.left + valTransformDim + positionXCurr;
      positionY = innerHeight - heightCurr;

      //create mirrored selected chart (will be deleted when dragging is ended)
      SVG.append('rect')
        .attr('id', 'tempRect')
        .attr('height', heightCurr)
        .attr('width', widthCurr)
        .attr('x', positionX)
        .attr('y', positionY + margin.top - heightBrushSvg)
        .attr('fill', colors[idObjectDraged])
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('opacity', 0.3);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 4.2 Function dragged ////////////////////////////////////////
    //function when is dragged - after when you click and hold and start moving////////
    ///////////////////////////////////////////////////////////////////////////////////

    function dragged(d) {
      //selecting that dragged chart
      SVG.select('#tempRect')
        .attr('x', -(xPos - +d3.event.sourceEvent.clientX) + positionX)
        .attr('y', -(yPos - +d3.event.sourceEvent.clientY) + positionY + margin.top - heightBrushSvg);

      //selecting all elements when you dragging - I will need this to check for example
      //if destination chart is different from chart where I started dragging
      const d3Select = d3.select(
        document.elementsFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY)
      );

      //I need to find my specific element who I looking for
      d3Select.each(function(d) {
        this.some(e => {
          if (d3.select(e).attr('class') === 'allRectsInGroupG') {
            //if I will find then assign that element to desEle variable
            desEle = d3.select(e);
            desId = +desEle.attr('id');
            didIFound = true;
          } else {
            didIFound = false;
          }
          //function some will stop if I found my element and will not iterate over my array this
          return didIFound;
        });
      });

      //if I will found my element and dragged element are different from element dragged on
      if (didIFound && desId !== idObjectDraged) {
        if (curr) {
          curr.style('opacity', null);
        }
        curr = desEle;
        desEle.style('opacity', 0.4);
      } else {
        if (curr) {
          curr.style('opacity', null);
        }
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 4.3 Function dragended //////////////////////////////////////////
    //function when dragging is ended - when dragging and release hold mouse button////////
    ///////////////////////////////////////////////////////////////////////////////////////

    function dragended(d) {
      if (desEle) {
        desEle.style('opacity', null);
      }

      //remove mirrored element on the end of dragging
      SVG.select('#tempRect').remove();

      //setting new values and update SVG
      const d3Select = d3.select(document.elementFromPoint(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY));

      const idObjectDraged = +d3Select.attr('id');
      const idObjectDragedTo = +d3.select(this).attr('id');
      let copyQMeasures = [...qMeasures];
      let copyColors = [...colors];

      const objectDraged = copyQMeasures[idObjectDraged];
      const objectDestination = copyQMeasures[idObjectDragedTo];

      const newQMeasuress = copyQMeasures.map((e, i) => {
        if (i === idObjectDraged) {
          copyColors[i] = colors[idObjectDragedTo];
          return objectDestination;
        } else if (i === idObjectDragedTo) {
          copyColors[i] = colors[idObjectDraged];

          return objectDraged;
        } else {
          return e;
        }
      });
      setNewQMeasures(newQMeasuress);
    }

    groupGWithMutlipleRects.selectAll('rect').call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

    //EXIT
    allRectsInGroupG.exit().remove();
    //--------------------end: "inside groupGWithMutlipleRects, create multiple rect for each measure, name:allRectsInGroupG"

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 5. All Axis /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //--------------------begin:translateAndRotate variable to change position text of different window width
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
    //--------------------end: translateAndRotate variable to change position text of different window width

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 5.1 Bottom Axis /////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //--------------------begin: bottom axis

    //SELECT AND DATA JOIN
    const allGXaxis = SVG.selectAll('g.xaxis').data(['create only one element g so in this array is only one element']);

    //ENTER
    allGXaxis
      .enter()
      .append('g')
      .attr('class', 'xaxis')
      //UPDATE
      .merge(allGXaxis)
      .transition(t)
      .call(
        isVertical
          ? isDirectionDefault
            ? d3.axisBottom(xScaleU)
            : d3.axisTop(xScale)
          : isDirectionDefault
          ? d3.axisLeft(xScale)
          : d3.axisRight(xScale)
      )
      .attr(
        'transform',
        isVertical
          ? isDirectionDefault
            ? `translate(${margin.left},${heightWindow - margin.bottom - heightBrushSvg})`
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

    //EXIT
    allGXaxis.exit().remove();
    //--------------------end: bottom axis

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 5.2 Left Axis ///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    const yAxisTickFormat = number => {
      const formatNumber = number === 0 ? '.1s' : '.2s';
      return d3
        .format(formatNumber)(number)
        .replace('M', () => {
          if (number < 2000000) return ' Million';
          return ' Millions';
        })
        .replace('G', () => {
          if (number < 2000000000) return ' Billion';
          return ' Billions';
        });
    };

    //--------------------begin: left axis
    const measureNumberForLeftAxis = 0;
    //SELECT AND DATA JOIN
    var allGYaxisL = SVG.selectAll('g.yaxisl').data(['create only one element g so in this array is only one element']);

    //ENTER
    allGYaxisL
      .enter()
      .append('g')
      .attr('class', 'yaxisl')
      //UPDATE
      .merge(allGYaxisL)
      .transition(t)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(
        isVertical
          ? isDirectionDefault
            ? d3
                .axisLeft(yScale(yScaleObj)[measureNumberForLeftAxis])
                .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                .tickFormat(yAxisTickFormat)
            : d3
                .axisLeft(yScale(yScaleObjV)[measureNumberForLeftAxis])
                .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                .tickFormat(yAxisTickFormat)
          : isDirectionDefault
          ? d3
              .axisTop(yScale(yScaleObjH)[measureNumberForLeftAxis])
              .ticks(data.length)
              .tickFormat(yAxisTickFormat)
          : d3
              .axisTop(yScale(yScaleObjV)[measureNumberForLeftAxis])
              .ticks(data.length)
              .tickFormat(yAxisTickFormat)
      );

    allGYaxisL
      .selectAll('text')
      .attr('transform', isVertical ? null : translateAndRotateLeftAxis)
      .attr('fill', colors[measureNumberForLeftAxis])
      .style('font-size', '1.5em')
      .style('font-weight', 900);

    //As there is a bug when changing from vertical to horizontal
    //I try to adjust ticks but still other things are not on correct place
    allGYaxisL
      .selectAll('line')
      .attr('y2', isVertical ? 0 : -6)
      .attr('x2', isVertical ? -6 : 0);

    //EXIT
    allGYaxisL.exit().remove();
    //--------------------end: left axis

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 5.3 Right Axis //////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //--------------------begin: right axis

    //If I have only one measure I will not create right axis
    if (numberOfMeasures > 1) {
      const measureNumberForRightAxis = 1;

      //SELECT AND DATA JOIN
      const allGYaxisR = SVG.selectAll('g.yaxisr').data([
        'create only one element g so in this array is only one element'
      ]);

      //ENTER
      allGYaxisR
        .enter()
        .append('g')
        .attr('class', 'yaxisr')
        //UPDATE
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
                  .axisRight(yScale(yScaleObj)[measureNumberForRightAxis])
                  .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                  .tickFormat(yAxisTickFormat)
              : d3
                  .axisRight(yScale(yScaleObjV)[measureNumberForRightAxis])
                  .ticks(heightWindow < 450 ? data.length / 2 : data.length)
                  .tickFormat(yAxisTickFormat)
            : isDirectionDefault
            ? d3
                .axisBottom(yScale(yScaleObjH)[measureNumberForRightAxis])
                .ticks(data.length)
                .tickFormat(yAxisTickFormat)
            : d3
                .axisBottom(yScale(yScaleObjV)[measureNumberForRightAxis])
                .ticks(data.length)
                .tickFormat(yAxisTickFormat)
        )
        .selectAll('text')
        .attr('transform', isVertical ? null : translateAndRotateLeftAxis)
        .attr('fill', colors[measureNumberForRightAxis])
        .style('font-size', '1.5em')
        .style('font-weight', 900);

      //As there is a bug when changing from vertical to horizontal
      //I try to adjust ticks and other things but still many things are not on correct place
      isVertical ? allGYaxisR.selectAll('line').attr('y2', 0) : allGYaxisR.selectAll('line').attr('y2', 0);
      isVertical ? allGYaxisR.selectAll('text').attr('y', 0) : allGYaxisR.selectAll('text').attr('y', 0);

      //EXIT
      allGYaxisR.exit().remove();
      //--------------------end: right axis
    } else {
      //if numberOfMeasures are not "numberOfMeasures > 1"
      SVG.selectAll('g.yaxisr').remove();
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 6. Brush chart //////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //this value will be used to position bar on brush chart
    let translateFirstValue;

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 6.1 Brush mini chart ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //SELECT AND DATA JOIN
    const SVGB = SVG.selectAll('g#brush').data(['create only one element g so in this array is only one element']);

    //ENTER
    SVGB.enter()
      .append('g')
      .attr('id', 'brush')
      //UPDATE
      .merge(SVGB)
      .attr('transform', `translate(${margin.left},${innerHeight + margin.bottom + margin.middle})`);

    //EXIT
    SVGB.exit().remove();

    //--------------------begin "inside of SVGB, create g for each dimension, name: groupGWithMutlipleRectsB"

    //SELECT AND DATA JOIN
    const groupGWithMutlipleRectsB = SVGB.selectAll(`.groupRects`).data(data);

    //ENTER
    groupGWithMutlipleRectsB
      .enter()
      .append('g')
      .attr('class', 'groupRects')
      .attr('id', (d, i) => i)
      //UPDATE
      .merge(groupGWithMutlipleRectsB)
      .transition(t)
      .attr('transform', (d, i) => {
        if (i === 0) {
          //this value will be used to position bar on brush chart
          translateFirstValue = xScale(d[0].qText);
        }
        return `translate(${xScale(d[0].qText)},${0})`;
      });

    //EXIT
    groupGWithMutlipleRectsB.exit().remove();
    //--------------------end "inside of allGRects, create g for each dimension, name: groupGWithMutlipleRects"

    //--------------------begin: "inside groupGWithMutlipleRectsB, create multiple rect for each measure, name:allRectsInGroupGB"

    //SELECT AND DATA JOIN
    const allRectsInGroupGB = groupGWithMutlipleRectsB.selectAll('rect').data(data => data[0].qNums);

    //ENTER
    allRectsInGroupGB
      .enter()
      .append('rect')
      //UPDATE
      .merge(allRectsInGroupGB)
      .transition(t)
      .attr('id', (d, i) => i)
      .attr('class', 'allRectsInGroupGB')
      .attr('y', (d, i) => {
        const currentYScale = yScale(yScaleObjBrush)[i];
        return isVertical
          ? isDirectionDefault
            ? currentYScale(d) - heightBrushSvg
            : 1
          : isDirectionDefault
          ? currentYScale(d) - innerWidth
          : -innerWidth;
      })
      .attr('x', (d, i) => {
        return widthOfSingleChart * i;
      })
      .attr('height', (d, i) => {
        const currentYScale = yScale(yScaleObjBrush)[i];
        return isVertical ? heightBrushSvg - currentYScale(d) : innerWidth - currentYScale(d);
      })
      .attr('width', (d, i) => {
        return widthOfSingleChart;
      })
      .attr('fill', (d, i) => {
        return colors[i];
      });

    //EXIT
    allRectsInGroupGB.exit().remove();
    //--------------------end: "inside groupGWithMutlipleRectsB, create multiple rect for each measure, name:allRectsInGroupGB"

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////// 6.2 Selected area on mini chart /////////////////////
    ///////////////////////////////////////////////////////////////////////////

    //--------------------begin: "create bar for selected area"

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 6.2.1 Function dragstarted //////////////////////////////////
    //function when dragging is starting - is when you click and hold//////////////////
    //I can't use arrow function as I will not have an access to this//////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    let beggingPosXBarTemp = beggingPosXBar,
      tempDifferencePosBar;

    function dragstartedBar(d) {
      beggingPosXBarTemp = +d3.event.sourceEvent.clientX - differencePosBar;
      setBeggingPosXBar(beggingPosXBarTemp);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 6.2.2 Function dragged //////////////////////////////////////
    //function when is dragged - after when you click and hold and start moving////////
    ///////////////////////////////////////////////////////////////////////////////////

    const widthBrush = 130;
    function draggedBar(d) {
      const allRectsFromMiniChart = SVGB.selectAll(`.groupRects`);
      const bar = SVGB.select('#bar');
      const currPosX = +bar.attr('x');
      let firstTansValue;
      let startArr = [],
        endArr = [],
        startNum = 0,
        endNum = 1;

      allRectsFromMiniChart.each(function(d, i) {
        const strTrans = d3.select(this).attr('transform');
        if (i === 0) {
          firstTansValue = +strTrans.substring(strTrans.lastIndexOf('(') + 1, strTrans.lastIndexOf(','));
        }
        const valTransformDim = +strTrans.substring(strTrans.lastIndexOf('(') + 1, strTrans.lastIndexOf(','));
        if (i === data.length - 1) {
          endArr.push(this);
        } else {
          if (valTransformDim - firstTansValue - widthBrush >= currPosX) {
            endArr.push(this);
          }
        }

        //this "if" telling if beginning position is on the chart then start adding add to array
        //so then I know that first value is my starting point: startNum value
        // console.log(`valTransformDim:`, valTransformDim);
        if (valTransformDim - firstTansValue - firstTansValue + step >= currPosX) {
          startArr.push(this);
        }
      });
      startNum = +d3.select(startArr[0]).attr('id');
      endNum = +d3.select(endArr[0]).attr('id');

      let copyData = [...data];
      const filteredDataMainChart = copyData.splice(startNum, endNum - startNum);
      setDataMainChart(filteredDataMainChart);
      tempDifferencePosBar = +d3.event.sourceEvent.clientX - beggingPosXBarTemp;
      setDifferencePosBar(tempDifferencePosBar);
      bar.attr('x', tempDifferencePosBar);
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 6.2.3 Function dragended ////////////////////////////////////////
    //function when dragging is ended - when dragging and release hold mouse button////////
    ///////////////////////////////////////////////////////////////////////////////////////

    function dragendedBar(d) {}

    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////// 6.3 Brush rect //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    //SELECT AND DATA JOIN
    const bar = SVGB.selectAll('#bar').data(['create only one element g so in this array is only one element']);

    //ENTER
    bar
      .enter()
      .append('rect')
      .attr('id', 'bar')
      .attr('cursor', 'move')
      //UPDATE
      .merge(bar)
      .attr('width', widthBrush)
      .attr('height', heightBrushSvg)
      .attr('transform', `translate(${translateFirstValue},${-heightBrushSvg})`)
      .attr('opacity', 0.2);

    bar.call(
      d3
        .drag()
        .on('start', dragstartedBar)
        .on('drag', draggedBar)
        .on('end', dragendedBar)
    );

    //EXIT
    bar.exit().remove();

    //--------------------end: "create bar for selected area"

    //elements in array saying when to re-run function useEffect so for every new values in that array
    //everything's what is inside function useEffect will be run once again
  }, [
    data,
    widthWindow,
    heightWindow,
    isUpdated,
    selectedValuesArray,
    isVertical,
    isDirectionDefault,
    dataMainChart,
    differencePosBar
  ]);

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
