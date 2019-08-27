import React, {useState, useEffect, useRef} from 'react';
import SingleMeasure from './SingleMeasure.js';
import './Measures.scss';

const Measures = ({qMeasures, setNewQMeasures}) => {
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
  return (
    <div className='Measures'>
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
          <button onClick={handleNewMeasure}>click to add new measure</button>
        </div>
        <button type='submit'>confirm changes</button>
      </form>
    </div>
  );
};

export default Measures;
