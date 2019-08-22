/* eslint-disable */
import React, {useState, useEffect} from 'react';
import './App.scss';
import * as d3 from 'd3';

import qlikApp from './Chart/qlikApp';
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
  const [obj, setObj] = useState(false);

  // useEffect(() => {
  //   qlikApp(config).then(q => {
  //     q.app.getObject('nav', 'CurrentSelections');
  //     q.app.getObject('test', 'qgVhE');
  //   });
  // });

  let qMeasures = [
    {
      qDef: {
        qDef: 'max([Sales Amount])'
      }
    },
    {
      qDef: {
        qDef: 'count(distinct Customer)'
      }
    },
    {
      qDef: {
        qDef: 'avg([Sales Amount])'
      }
    }
  ];

  const change = () => {
    qMeasures = [
      {
        qDef: {
          qDef: 'count(distinct Customer)'
        }
      },
      {
        qDef: {
          qDef: 'avg([Sales Amount])'
        }
      }
    ];
    createQlik();
  };

  const change1 = () => {
    qMeasures = [
      {
        qDef: {
          qDef: 'max([Sales Amount])'
        }
      },
      {
        qDef: {
          qDef: 'count(distinct Customer)'
        }
      },
      {
        qDef: {
          qDef: 'avg([Sales Amount])'
        }
      }
    ];
    createQlik();
  };
  const change2 = () => {
    qMeasures = [
      {
        qDef: {
          qDef: 'count(distinct Customer)'
        }
      }
    ];
    createQlik();
  };
  useEffect(() => {
    createQlik();
  }, [isCreateCubeDone, isCreateListDone, app]);

  const createQlik = () => {
    //--------------beginning: version 1 when working on real data

    const objCreateCube = Object.assign({}, obj, {qMeasures});

    setObj(objCreateCube);
    qlikApp(config).then(qlikObjects => {
      setApp(qlikObjects.app);
      if (app && obj) {
        app.createCube(dataCreateCube(objCreateCube), reply => {
          const dataFromReply = reply.qHyperCube.qDataPages[0].qMatrix;

          //check if I get any data
          if (dataFromReply[0]) {
            const newData = dataFromReply

              //remove empty values with 'NaN'
              .filter(e => e[0].qNum !== 'NaN')
              .map(e => {
                let arrOfqNumsValues = [];

                //at index = 0 is dimension and from index 1 I can find measures
                for (let index = 1; index < e.length; index++) {
                  const qNumVal = e[index].qNum;
                  arrOfqNumsValues.push(qNumVal);
                }
                const qNumsObjects = {qNums: arrOfqNumsValues};
                const outputObj = Object.assign({}, {qElemNumber: e[0].qElemNumber, qText: e[0].qText}, qNumsObjects);
                return [outputObj];

                //example of outputObj:
                // {
                //   qElemNumber: 13,
                //   qText: 'Jan-2013',
                //   qNums: (2)[(939.5828045388848, 539200)]
                // }
              });

            setDataCube(newData);
            setIsCreateCubeDone(true);
          }
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
  };

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
      <button onClick={change}>click</button>
      <button onClick={change1}>click1</button>
      <button onClick={change2}>click2</button>
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
