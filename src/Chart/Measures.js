import React, {useState, useEffect, useRef} from 'react';
import SingleMeasure from './SingleMeasure.js';
import './Measures.scss';
import * as d3 from 'd3';

const Measures = ({qMeasures, setNewQMeasures, colors, setColors}) => {
  const [qMeasuress, setQMeasuress] = useState([]);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    setQMeasuress(qMeasures);
  }, []);

  const handleClickR = (e, i) => {
    const copyArr = [...qMeasuress];
    copyArr.splice(i, 1);
    setQMeasuress(copyArr);
    setNewQMeasures(copyArr);
  };

  const whenSubmit = e => {
    e.preventDefault();
    setNewQMeasures(qMeasuress);
  };

  const onChangeValue = (prev, cur) => {
    let copyArr = [...qMeasuress];
    qMeasuress.find((o, i) => {
      if (o.qDef.qDef === prev) {
        copyArr[i] = {
          qDef: {
            qDef: cur
          }
        };
        return true;
      }
    });
    setQMeasuress(copyArr);
  };

  const handleNewMeasure = e => {
    let copyArr = [...qMeasuress];
    const newItem = {
      qDef: {
        qDef: inputVal
      }
    };

    copyArr.push(newItem);
    setQMeasuress(copyArr);
    setInputVal('');
  };

  const inputHandle = e => {
    setInputVal(e.target.value);
  };
  const [temp, setTemp] = useState(null);

  const handleDragStart = i => {
    setTemp(i);
  };

  const handleDrop = (e, c) => {
    let copyArr = [...qMeasuress];
    let copyColors = [...colors];

    const objectDraged = copyArr[temp];
    const objectDestination = copyArr[c];

    const newQMeasuress = copyArr.map((e, i) => {
      if (i === temp) {
        copyColors[i] = colors[c];
        return objectDestination;
      } else if (i === c) {
        copyColors[i] = colors[temp];

        return objectDraged;
      } else {
        return e;
      }
    });
    setColors(copyColors);
    setQMeasuress(newQMeasuress);
    setNewQMeasures(newQMeasuress);
  };

  return (
    <div className='Measures'>
      <div onDragOver={e => e.preventDefault()} className='Measures__bars'>
        {qMeasuress.map((e, i) => {
          return (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDrop={e => handleDrop(e, i)}
              className='Measures__bars__bar'
              style={{backgroundColor: colors[i]}}
            ></div>
          );
        })}
      </div>
      <form className='Measures__form' onSubmit={e => whenSubmit(e)}>
        <div className='Measures__form__allMeasures'>
          {qMeasuress.map((e, i) => {
            return (
              <SingleMeasure
                key={i + e}
                i={i}
                value={e.qDef.qDef}
                handleClickR={handleClickR}
                onChangeValue={onChangeValue}
              />
            );
          })}
        </div>
        <div className='Measures__form__newMeasures'>
          <p>add new measure</p>
          <input type='text' onChange={e => inputHandle(e)} value={inputVal} />
          <button onClick={handleNewMeasure}>add new measure</button>
        </div>
        <button className='Measures__form__btn-submit' type='submit'>
          confirm changes
        </button>
      </form>
    </div>
  );
};

export default Measures;
