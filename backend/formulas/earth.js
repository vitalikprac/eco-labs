import { dbApi } from '../mongodb.js';

const earthNames = ['Бор', 'Цинк', 'Мідь', 'Кобальт', 'Молібден'];

const mpks = [
  {
    name: 'Бор',
    mpk: 60,
    k: 2,
  },
  {
    name: 'Цинк',
    mpk: 115,
    k: 3,
  },
  {
    name: 'Мідь',
    mpk: 55,
    k: 2,
  },
  {
    name: 'Кобальт',
    mpk: 50,
    k: 2,
  },
  {
    name: 'Молібден',
    mpk: 0.25,
    k: 2,
  },
];

const IS_NAME = 'IS';

const earthCalc = (parameters) => {
  const value = parameters.reduce((acc, x) => {
    const mpk = mpks.find((y) => y.name === x.name);
    return acc + (x.valueY / mpk.mpk) * mpk.k;
  }, 0);

  return parseFloat(value.toFixed(1));
};

export const putEarth = async (request) => {
  if (earthNames.includes(request.body.name)) {
    const earthName = request.body.name;
    const earthValue = parseFloat(request.body.valueY);

    const markerId = (await dbApi.getMarkerByParameterId(request.params.id))._id;
    const marker = await dbApi.getMarkerById(markerId);
    const parameters = marker.parameters.filter((x) => earthNames.includes(x.name) && x.valueX === request.body.valueX);
    parameters.find((x) => x.name === earthName).valueY = earthValue;
    const IS_VALUE = earthCalc(parameters);
    const IS = marker.parameters.find((x) => x.name === IS_NAME && x.valueX === request.body.valueX);
    if (IS) {
      await dbApi.updateParameter(IS._id, { valueY: IS_VALUE });
    } else {
      const insertedIds = await dbApi.createParameters([
        {
          name: IS_NAME,
          valueX: request.body.valueX,
          valueY: IS_VALUE,
          parameterX: null,
          descriptionY: null,
        },
      ]);
      await dbApi.addParameterToMarker(markerId, insertedIds[0]);
    }
  }
};

export const postEarth = async (request) => {
  if (earthNames.includes(request.body.parameter.name)) {
    const markerId = request.body.markerId;
    const marker = await dbApi.getMarkerById(markerId);
    const parameters = marker.parameters.filter((x) => earthNames.includes(x.name) && x.valueX === request.body.parameter.valueX);
    parameters.push(request.body.parameter);
    const IS_VALUE = earthCalc(parameters);
    const IS = marker.parameters.find((x) => x.name === IS_NAME && x.valueX === request.body.parameter.valueX);
    if (IS) {
      await dbApi.updateParameter(IS._id, { valueY: IS_VALUE });
    } else {
      const insertedIds = await dbApi.createParameters([
        {
          name: IS_NAME,
          valueX: request.body.parameter.valueX,
          valueY: IS_VALUE,
          parameterX: null,
          descriptionY: null,
        },
      ]);
      await dbApi.addParameterToMarker(markerId, insertedIds[0]);
    }
  }
};

export const deleteEarth = async (request) => {
  const parameter = await dbApi.getParameterById(request.params.id);
  if (earthNames.includes(parameter.name)) {
    const markerId = (await dbApi.getMarkerByParameterId(request.params.id))._id;
    const marker = await dbApi.getMarkerById(markerId);

    const IS = marker.parameters.find((x) => x.name === IS_NAME && x.valueX === parameter.valueX);
    const parameters = marker.parameters.filter((x) => earthNames.includes(x.name) && x.valueX === parameter.valueX).filter((x) => x._id.toString() !== parameter._id.toString());
    if (IS) {
      if (parameters.length === 0) {
        await dbApi.deleteParameters([IS._id]);
      } else {
        const IS_VALUE = earthCalc(parameters);
        await dbApi.updateParameter(IS._id, { valueY: IS_VALUE });
      }
    }
  }
};
