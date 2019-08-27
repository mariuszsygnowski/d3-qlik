import React, {useState, useEffect, useRef} from 'react';

const SingleMeasure = ({value, handleClickR, newValue, onChangeValue, i}) => {
  const [val, setVal] = useState('');
  useEffect(() => {
    setVal(value);
  }, [value]);
  const handleClickRemove = () => {
    handleClickR(value, i);
  };
  const onChange = (e, i) => {
    onChangeValue(value, e.target.value);
    setVal(e.target.value);
  };

  return (
    <div>
      <input value={val} onChange={e => onChange(e, i)} />
      <button onClick={handleClickRemove}>click to remove</button>
    </div>
  );
};

export default SingleMeasure;
