const FakeData = (numOfDim, numOfEleInEachDim, min, max) => {
  let data = [];

  const makeWord = () => {
    var possible_UC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var text = possible_UC.charAt(Math.floor(Math.random() * possible_UC.length));

    var possible_LC = 'abcdefghijklmnopqrstuvwxyz';

    for (var i = 0; i < 5; i++) text += possible_LC.charAt(Math.floor(Math.random() * possible_LC.length));
    return text;
  };
  for (let index = 0; index < numOfDim; index++) {
    let arrOfqNumsValues = [];

    for (let index = 0; index < numOfEleInEachDim; index++) {
      const qNumVal = Math.floor(Math.random() * (max - min)) + min;
      arrOfqNumsValues.push(qNumVal);
    }
    const qNumsObjects = {qNums: arrOfqNumsValues};
    const outputObj = Object.assign({}, {qElemNumber: index, qText: makeWord()}, qNumsObjects);
    data.push([outputObj]);
  }

  return data;
};

export default FakeData;
