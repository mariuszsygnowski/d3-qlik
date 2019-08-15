/* eslint-disable */
import React from 'react';
import './list.scss';

const List = ({dataNamesX, selectedDataNamesX, allSelectedColors, dataCube}) => {
  const allValuesYArray = dataCube.map(e => e[1]);
  const allValuesXArray = dataCube.map(e => e[0]);

  return (
    <div id={'list'}>
      {dataNamesX.map((e, i) => {
        let fontWeight = 'normal';
        let fontSize = '1rem';
        let border = '1px solid blue';
        let bgc = 'white';
        // if (dataNamesX.length !== allValuesXArray.length)
        if (allValuesXArray.includes(e[0]) && dataNamesX.length !== allValuesXArray.length) {
          bgc = 'red';
          // colorIfMatched = allSelectedColors[counter];
          // fontWeight = 'bold';
          // fontSize = '1.3rem';
          // border = `5px solid ${e[1]}`;
          // counter++;
        } else if (allValuesXArray.includes(e[0]) && dataNamesX.length === allValuesXArray.length) {
          bgc = 'white';
        } else {
          bgc = 'green';
        }
        return (
          <div
            className={'list--li'}
            key={i + e}
            style={{
              color: 'black',
              fontWeight: fontWeight,
              fontSize: fontSize,
              border: border,
              backgroundColor: bgc
            }}
          >
            {e[0]}
          </div>
        );
      })}
    </div>
  );
};

export default List;
