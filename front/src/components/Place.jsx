import React, { useEffect, useRef, useState } from 'react';
import { Button, Segmented, notification } from 'antd';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import S from './Place.module.scss';
import { getMarkerById, getMarkers, removeMarkerById } from '../api.js';
import {
  chartsAtom,
  markersAtom,
  settingsFiltersAtom,
} from '../state/atoms.js';

const unpackMongoDecimal = (value) => {
  if (value?.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  return value;
};

export const groupByChart = (parameters) => {
  if (!parameters) return [];
  const newParameters = [];

  for (const parameter of parameters) {
    const parameterNameCount = parameters.filter(
      (p) => p.name === parameter.name,
    ).length;
    if (parameterNameCount === 1) {
      newParameters.push(parameter);
    } else {
      const parameterIndex = newParameters.findIndex(
        (p) => p.name === parameter.name,
      );
      if (parameterIndex === -1) {
        newParameters.push({
          _id: parameter._id,
          name: parameter.name,
          xS: [
            {
              label: parameter.parameterX,
              value: unpackMongoDecimal(parameter.valueX),
            },
          ],
          yS: [
            {
              label: parameter.descriptionY,
              value: unpackMongoDecimal(parameter.valueY),
            },
          ],
        });
      } else {
        newParameters[parameterIndex].xS.push({
          label: parameter.parameterX,
          value: unpackMongoDecimal(parameter.valueX),
        });
        newParameters[parameterIndex].yS.push({
          label: parameter.descriptionY,
          value: unpackMongoDecimal(parameter.valueY),
        });
      }
    }
  }
  return newParameters;
};

export const Place = (params) => {
  const [marker, setMarker] = useState(null);

  const [currentSystem, setCurrentSystem] = useState(0);
  const parametersRef = useRef(null);
  const filters = useRecoilValue(settingsFiltersAtom);
  const setMarkers = useSetRecoilState(markersAtom);

  const setCharts = useSetRecoilState(chartsAtom);

  const systems = [
    {
      _id: 0,
      name: 'Всі',
      values: [],
    },
    ...(marker?.systems ?? []),
  ];
  const system = systems?.find((system) => system._id === currentSystem);

  const systemsOptions = systems.map((system) => ({
    label: system.name,
    value: system._id,
  }));

  const parameters = marker?.parameters.filter((parameter) => {
    if (system._id === 0) return true;
    return system.values.some((value) =>
      parameter?.name.toLowerCase().includes(value?.toLowerCase()),
    );
  });

  const advancedParameters = groupByChart(parameters);

  console.log(advancedParameters);
  useEffect(() => {
    getMarkerById(params._id).then((marker) => {
      setMarker(marker);
    });
  }, []);

  useEffect(() => {
    if (!parametersRef.current) return;
    if (parametersRef.current.scrollHeight > 300) {
      parametersRef.current.style.height = '300px';
      parametersRef.current.style.overflowY = 'scroll';
    }
  }, [parametersRef.current]);

  const handleSystemChange = (value) => {
    setCurrentSystem(value);
  };

  const handleRemove = async () => {
    const response = await removeMarkerById(params._id);
    if (!response.success) {
      alert('Помилка - невірний ключ адміністратора');
    }

    const markers = await getMarkers(filters);
    setMarkers(markers);
  };

  const handleCreateChart = (parameter) => {
    setCharts((charts) => ({ visible: true, parameter }));
  };

  return (
    <div>
      {!marker && <div>Завантаження...</div>}
      {marker && (
        <>
          <div>
            <span className="param-title">Назва</span>: <b>{marker?.name}</b>
          </div>
          <hr />
          <div>
            <span className="param-title">Адрес</span>: <b>{marker?.address}</b>
          </div>
          <hr />
          <div>
            <span className="param-title">Тип</span>:{' '}
            <b
              dangerouslySetInnerHTML={{ __html: marker?.identification?.name }}
            ></b>
          </div>
          <hr />
          <div>
            <span className="param-title">Підсистеми</span>:
          </div>
          <div className={S.wrapper}>
            <Segmented onChange={handleSystemChange} options={systemsOptions} />
            <div ref={parametersRef} className={S.content}>
              {advancedParameters.map((parameter) => (
                <div className={parameter?.type?.value} key={parameter._id}>
                  <i>{parameter.name}</i> -{' '}
                  {parameter?.value && (
                    <b
                      dangerouslySetInnerHTML={{ __html: parameter.value }}
                    ></b>
                  )}
                  {parameter?.xS && (
                    <Button
                      onClick={() => handleCreateChart(parameter)}
                      type="primary"
                    >
                      Графік
                    </Button>
                  )}
                  {!parameter?.value && !parameter?.xS && (
                    <b>немає точних значень</b>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={S.buttonWrapper}>
            <Button
              className={S.removeButton}
              type="primary"
              danger
              onClick={handleRemove}
            >
              Видалити
            </Button>
            {/*<Button type="primary" onClick={handleCreateChart}>*/}
            {/*  Створити графік*/}
            {/*</Button>*/}
          </div>
        </>
      )}
    </div>
  );
};