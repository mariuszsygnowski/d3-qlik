/* eslint-disable */
import React, {useState, useEffect} from 'react';
import './App.scss';
import * as d3 from 'd3';

import qlikApp from './Chart/qlikApp';
import qqlikApp from './Chart/qqlikApp';
import {dataCreateList, dataCreateCube} from './Chart/Data';
import Chart from './Chart/Chart';

//static values
import {values} from './Chart/Values';
// import List from './List';

const App = () => {
  let config = {
    host: 'localhost',
    secure: false,
    port: 4848,
    prefix: '',
    appId: 'New Foundation Data.qvf'
  };

  config = {
    host: 'sense1.calibrateconsulting.com', // server host nsmae
    secure: true,
    port: 443, // server = 443 if default qlik server
    prefix: 'web-dev',
    appId: '334037f3-c2d8-4aec-9a9c-cd9f85bd5ca0'
  };

  const [dataCube, setDataCube] = useState([]);
  const [dataNamesX, setDataNamesX] = useState([]);
  const [selectedDataNamesX, setSelectedDataNamesX] = useState([]);
  const [allSelectedColors, setAllSelectedColors] = useState([]);
  const [isCreateCubeDone, setIsCreateCubeDone] = useState(false);
  const [isCreateListDone, setIsCreateListDone] = useState(false);
  const [selectedCubeValues, setSelectedCubeValues] = useState([]);
  const [app, setApp] = useState(false);

  // useEffect(() => {
  //   qlikApp(config).then(q => {
  //     q.app.getObject('nav', 'CurrentSelections');
  //     q.app.getObject('test', 'qgVhE');
  //   });
  // });

  useEffect(() => {
    //--------------beginning: version 1 when working on real data
    qlikApp(config).then(qlikObjects => {
      setApp(qlikObjects.app);
      if (app) {
        app.createCube(dataCreateCube, reply => {
          // console.log(`reply.qHyperCube.qDataPages:`, reply);
          const newDataCube1 = reply.qHyperCube.qDataPages[0].qMatrix
            .filter(e => e[0].qNum !== 'NaN')
            .map(e => [{qText: e[0].qText, qNum: e[1].qNum, qElemNumber: e[0].qElemNumber}]);
          const newDataCube2 = reply.qHyperCube.qDataPages[0].qMatrix
            .filter(e => e[0].qNum !== 'NaN')
            .map(e => [{qText: e[0].qText, qNum: e[2].qNum, qElemNumber: e[0].qElemNumber}]);
          const newDataCube = {firstValue: newDataCube2, secondValue: newDataCube1};
          setDataCube(newDataCube);
          setIsCreateCubeDone(true);
        });
        app.createList(dataCreateList, reply => {
          const arrayWithData = [...reply.qListObject.qDataPages[0].qMatrix];

          const COLOR = d3
            .scaleSequential()
            .domain([0, arrayWithData.length])
            .interpolator(d3.interpolateSinebow);

          const dataText = arrayWithData.map((e, i) => [e[0].qText, COLOR(i)]);
          setDataNamesX(dataText);
          setIsCreateListDone(true);
        });
      }
    });
    //--------------end: version 1 when working on real data

    //--------------beginning: version 2 when working on static data
    // setDataCube(values);

    // const COLOR = d3
    //   .scaleSequential()
    //   .domain([0, values.firstValue.length])
    //   .interpolator(d3.interpolateSinebow);

    // const dataText = values.firstValue.map((e, i) => [e[0].qText, COLOR(i)]);
    // setDataNamesX(dataText);
    // setIsCreateCubeDone(true);
    // setIsCreateListDone(true);
    //--------------end: version 2 when working on static data
  }, [isCreateCubeDone, isCreateListDone, app]);

  //----------------beginning: used in Qlik
  // const sendNewSelections = values => {
  //   app.createList(dataCreateList).then(reply => {
  //     reply.enigmaModel.selectListObjectValues('/qListObjectDef', values, false);
  //   });
  // };

  // const beginSelections = () => {
  //   app.createCube(dataCreateCube).then(reply => {
  //     reply.enigmaModel.beginSelections(['/qHyperCubeDef']);
  //   });
  // };
  //----------------end: used in Qlik

  return (
    <div className='App'>
      {/* <div id='nav' /> */}

      {isCreateCubeDone && isCreateListDone ? (
        <>
          {/* <nav id='nav' /> */}
          <div>
            {/* <List
              dataCube={dataCube}
              dataNamesX={dataNamesX}
              selectedDataNamesX={selectedDataNamesX}
              allSelectedColors={allSelectedColors}
            /> */}
            <Chart
              data={dataCube}
              dataNamesX={dataNamesX}
              // sendNewSelections={sendNewSelections}
              // beginSelections={beginSelections}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default App;
