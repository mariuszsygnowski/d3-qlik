const dataCreateCube = {
  qDimensions: [
    {
      qDef: {
        qFieldDefs: ['YearMonth'],
        qSortCriterias: [
          {
            qSortByState: 0,
            qSortByFrequency: 0,
            qSortByNumeric: 1,
            qSortByAscii: 0,
            qSortByLoadOrder: 1,
            qSortByExpression: 0,
            qExpression: {
              qv: ''
            },
            qSortByGreyness: 0
          }
        ]
      }
    }
  ],
  qMeasures: [
    {
      qDef: {
        qDef: 'avg([Sales Amount])'
      }
    },
    {
      qDef: {
        qDef: 'max([Sales Amount])'
      }
    }
  ],
  qInitialDataFetch: [
    {
      qTop: 0,
      qLeft: 0,
      qHeight: 500,
      qWidth: 17
    }
  ]
};

const dataCreateList = {
  qDef: {
    qFieldDefs: ['YearMonth']
  },
  qInitialDataFetch: [
    {
      qTop: 0,
      qLeft: 0,
      qHeight: 2000,
      qWidth: 2
    }
  ]
};

export {dataCreateList, dataCreateCube};
