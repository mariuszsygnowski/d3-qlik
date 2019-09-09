/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';

const SingleMeasure = ({value, handleClickR, onChangeValue, i}) => {
  const [val, setVal] = useState('');

  useEffect(() => {
    setVal(value);
    /* eslint-disable */
  });

  const handleClickRemove = () => {
    handleClickR(value, i);
  };

  const onChange = e => {
    onChangeValue(value, e.target.value);
    setVal(e.target.value);
  };

  return (
    <div>
      <input value={val} onChange={e => onChange(e)} />
      <button onClick={handleClickRemove}>remove measure</button>
    </div>
  );
};

export default SingleMeasure;
