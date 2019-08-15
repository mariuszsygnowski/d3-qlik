import React from 'react';
import Button from './Button';
import cross from './assets/cross.jpg';
import tick from './assets/tick.jpg';

const CurrentSelectionTab = ({
  selectedValuesArray,
  dataProp,
  confirmSelectionHandleClick,
  cancelSelectionHandleClick,
  dataNamesX
}) => {
  if (selectedValuesArray.length === 1) {
    return (
      <>
        <p>{selectedValuesArray[0].qText}</p>
        <Button image={tick} click={confirmSelectionHandleClick} />
        <Button image={cross} click={cancelSelectionHandleClick} />
      </>
    );
  } else if (selectedValuesArray.length > 1) {
    return (
      <>
        <p>
          {selectedValuesArray.length} of {dataNamesX.length}
        </p>
        <Button image={tick} click={confirmSelectionHandleClick} />
        <Button image={cross} click={cancelSelectionHandleClick} />
      </>
    );
  } else {
    return (
      <>
        <p>No selections applied</p>
      </>
    );
  }
};

export default CurrentSelectionTab;
