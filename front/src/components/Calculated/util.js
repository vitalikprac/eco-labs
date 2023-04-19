const CALCULATED_PARAMETERS = ['AQI PM2.5', 'IS', 'Q1'];

export const getCalculatedParam = (parameters) => {
  const calculatedParam = parameters.find((parameter) =>
    CALCULATED_PARAMETERS.includes(parameter.name),
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
