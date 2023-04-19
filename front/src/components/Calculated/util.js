import { ALL_CALCULATED_PARAMETERS } from '../../data.js';

export const getCalculatedParam = (parameters) => {
  const calculatedParam = parameters.find((parameter) =>
    ALL_CALCULATED_PARAMETERS.includes(parameter.name),
  );
  if (!calculatedParam) return null;

  const calculatedValue = calculatedParam?.rawParameters
    ? calculatedParam?.rawParameters[calculatedParam?.rawParameters.length - 1]
        ?.valueY
    : calculatedParam?.valueY;

  const calculatedValueDate = calculatedParam?.rawParameters
    ? calculatedParam?.rawParameters[
        calculatedParam?.rawParameters.length - 1
      ]?.valueX.getTime()
    : calculatedParam?.valueX;

  return { calculatedValue, calculatedValueDate, name: calculatedParam.name };
};
