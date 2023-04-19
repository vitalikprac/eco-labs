import { dbApi } from '../mongodb.js';

const waterNames = ['Каламутність', 'Забарвленість', 'Запах', 'Смак та присмак', 'Сухий залишок', 'Перманганатна окиснюваність'];

const mpks = [
  {
    name: 'Каламутність',
    mpk: 1.5,
  },
  {
    name: 'Забарвленість',
    mpk: 20,
  },
  {
    name: 'Запах',
    mpk: 2,
  },
  {
    name: 'Смак та присмак',
    mpk: 2,
  },
  {
    name: 'Сухий залишок',
    mpk: 1000,
  },
  {
    name: 'Перманганатна окиснюваність',
    mpk: 5,
  },
];

const Q1_NAME = 'Q1';

const waterCalc = (parameters) => {
  const value = parameters.reduce((acc, x) => {
    const mpk = mpks.find((y) => y.name === x.name);
    return acc + x.valueY / mpk.mpk;
  }, 0);

  return parseFloat(value.toFixed(3));
};

export const putWater = async (request) => {
  if (waterNames.includes(request.body.name)) {
    const waterName = request.body.name;
    const waterValue = parseFloat(request.body.valueY);

    const markerId = (await dbApi.getMarkerByParameterId(request.params.id))._id;
    const marker = await dbApi.getMarkerById(markerId);
    const parameters = marker.parameters.filter((x) => waterNames.includes(x.name) && x.valueX === request.body.valueX);
    parameters.find((x) => x.name === waterName).valueY = waterValue;
    const Q1_VALUE = waterCalc(parameters);
    const Q1 = marker.parameters.find((x) => x.name === Q1_NAME && x.valueX === request.body.valueX);
    if (Q1) {
      await dbApi.updateParameter(Q1._id, { valueY: Q1_VALUE });
    } else {
      const insertedIds = await dbApi.createParameters([
        {
          name: Q1_NAME,
          valueX: request.body.valueX,
          valueY: Q1_VALUE,
          parameterX: null,
          descriptionY: null,
        },
      ]);
      await dbApi.addParameterToMarker(markerId, insertedIds[0]);
    }
  }
};

export const postWater = async (request) => {
  if (waterNames.includes(request.body.parameter.name)) {
    const markerId = request.body.markerId;
    const marker = await dbApi.getMarkerById(markerId);
    const parameters = marker.parameters.filter((x) => waterNames.includes(x.name) && x.valueX === request.body.parameter.valueX);
    parameters.push(request.body.parameter);
    const Q1_VALUE = waterCalc(parameters);
    const Q1 = marker.parameters.find((x) => x.name === Q1_NAME && x.valueX === request.body.parameter.valueX);
    if (Q1) {
      await dbApi.updateParameter(Q1._id, { valueY: Q1_VALUE });
    } else {
      const insertedIds = await dbApi.createParameters([
        {
          name: Q1_NAME,
          valueX: request.body.parameter.valueX,
          valueY: Q1_VALUE,
          parameterX: null,
          descriptionY: null,
        },
      ]);
      await dbApi.addParameterToMarker(markerId, insertedIds[0]);
    }
  }
};

export const deleteWater = async (request) => {
  const parameter = await dbApi.getParameterById(request.params.id);
  if (waterNames.includes(parameter.name)) {
    const markerId = (await dbApi.getMarkerByParameterId(request.params.id))._id;
    const marker = await dbApi.getMarkerById(markerId);

    const Q1 = marker.parameters.find((x) => x.name === Q1_NAME && x.valueX === parameter.valueX);
    const parameters = marker.parameters.filter((x) => waterNames.includes(x.name) && x.valueX === parameter.valueX).filter((x) => x._id.toString() !== parameter._id.toString());
    if (Q1) {
      if (parameters.length === 0) {
        await dbApi.deleteParameters([Q1._id]);
      } else {
        const Q1_VALUE = waterCalc(parameters);
        await dbApi.updateParameter(Q1._id, { valueY: Q1_VALUE });
      }
    }
  }
};
