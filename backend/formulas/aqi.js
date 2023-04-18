import { dbApi } from '../mongodb.js';

const airCalc = (PM25, AQIHi, AQILo, ConcHi, ConcLo) => {
  return ((AQIHi - AQILo) / (ConcHi - ConcLo)) * (PM25 - ConcLo) + AQILo;
};

export const airCalculate = (PM25) => {
  const AQIHi = {
    0: 50,
    1: 100,
    2: 150,
  };
  const AQILo = {
    0: 0,
    1: 51,
    2: 101,
  };
  const ConcHI = {
    0: 12,
    1: 35.4,
    2: 55.4,
  };
  const ConcLo = {
    0: 0,
    1: 12.1,
    2: 35.5,
  };
  let index;
  if (PM25 > ConcLo[0] && PM25 < ConcHI[0]) {
    index = 0;
  } else if (PM25 > ConcLo[1] && PM25 < ConcHI[1]) {
    index = 1;
  } else if (PM25 > ConcLo[2] && PM25 < ConcHI[2]) {
    index = 2;
  }
  const aqi = airCalc(PM25, AQIHi[index], AQILo[index], ConcHI[index], ConcLo[index]);
  return Math.round(aqi);
};

const PM25_NAME = 'PM2.5';
const AQI_PM25_NAME = 'AQI PM2.5';

export const putAQI = async (request) => {
  if (request.body.name === PM25_NAME) {
    const PM25 = parseFloat(request.body.valueY);
    const AQI = airCalculate(PM25);
    const markerId = (await dbApi.getMarkerByParameterId(request.params.id))._id;
    const marker = await dbApi.getMarkerById(markerId);
    const AQIPM25 = marker.parameters.find((x) => x.name === AQI_PM25_NAME && x.valueX === request.body.valueX);
    if (AQIPM25) {
      await dbApi.updateParameter(AQIPM25._id, { valueY: AQI });
    } else {
      const insertedIds = await dbApi.createParameters([
        {
          name: AQI_PM25_NAME,
          valueX: request.body.valueX,
          valueY: AQI,
          parameterX: null,
          descriptionY: null,
        },
      ]);
      await dbApi.addParameterToMarker(markerId, insertedIds[0]);
    }
  }
};

export const postAQI = async (request) => {
  if (request.body.parameter.name === PM25_NAME) {
    const PM25 = parseFloat(request.body.parameter.valueY);
    const AQI = airCalculate(PM25);
    const insertedIds = await dbApi.createParameters([
      {
        name: AQI_PM25_NAME,
        valueX: request.body.parameter.valueX,
        valueY: AQI,
        parameterX: null,
        descriptionY: null,
      },
    ]);
    await dbApi.addParameterToMarker(request.body.markerId, insertedIds[0]);
  }
};

export const deleteAQI = async (request) => {
  const parameter = await dbApi.getParameterById(request.params.id);
  if (parameter.name === PM25_NAME) {
    const markerId = (await dbApi.getMarkerByParameterId(request.params.id))._id;
    const marker = await dbApi.getMarkerById(markerId);
    const AQIPM25 = marker.parameters.find((x) => x.name === AQI_PM25_NAME && x.valueX === parameter.valueX);
    if (AQIPM25) {
      await dbApi.deleteParameters([AQIPM25._id]);
    }
  }
};
