/* eslint-disable */
import React, {useState, useEffect, useRef} from 'react';
import './Button.scss';

const Button = ({image, click}) => {
  return (
    <div className='button' onClick={click}>
      <img src={image} alt='img' />
    </div>
  );
};

export default Button;
