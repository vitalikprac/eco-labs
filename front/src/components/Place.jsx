import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Button, Modal, Segmented } from 'antd';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import S from './Place.module.scss';
import { getMarkers, removeMarkerById } from '../api.js';
import {
  calculatedParamAtom,
  markerAtom,
  markersAtom,
  settingsFiltersAtom,
} from '../state/atoms.js';
import PlaceParameter from './PlaceParameter.jsx';
import { useHandleEdit } from '../hooks/useHandleEdit.jsx';
import Calculated from './Calculated/Calculated.jsx';
import { getCalculatedParam } from './Calculated/util.js';

const unpackMongoDecimal = (value) => {
  if (value?.$numberDecimal) {
    return parseFloat(value.$numberDecimal);
  }
  return value;
};

export const groupByChart = (parametersNotSorted) => {
  if (!parametersNotSorted) return [];
  const parameters = parametersNotSorted.sort((a, b) => {
    return a.valueX - b.valueX;
  });
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
          rawParameters: [
            {
              ...parameter,
              valueX: new Date(parameter.valueX),
              valueY: unpackMongoDecimal(parameter.valueY),
            },
          ],
          xS: [
            {
              label: '', //parameter.parameterX,
              value: new Date(
                parseInt(unpackMongoDecimal(parameter.valueX), 10),
              ),
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
          label: '', //parameter.parameterX,
          value: new Date(parseInt(unpackMongoDecimal(parameter.valueX), 10)),
        });
        newParameters[parameterIndex].yS.push({
          label: parameter.descriptionY,
          value: unpackMongoDecimal(parameter.valueY),
        });
        newParameters[parameterIndex].rawParameters.push({
          ...parameter,
          valueX: new Date(parameter.valueX),
          valueY: unpackMongoDecimal(parameter.valueY),
        });
      }
    }
  }
  return newParameters;
};

export const Place = (params) => {
  const [marker] = useRecoilState(markerAtom);

  const [currentSystem, setCurrentSystem] = useState(0);
  const parametersRef = useRef(null);
  const filters = useRecoilValue(settingsFiltersAtom);
  const setMarkers = useSetRecoilState(markersAtom);

  const [calculatedParam, setCalculatedParam] =
    useRecoilState(calculatedParamAtom);

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
    if (system?._id === 0) return true;
    return system?.values?.some((value) =>
      parameter?.name.toLowerCase().includes(value?.toLowerCase()),
    );
  });

  const advancedParameters = groupByChart(parameters);

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
    const remove = async () => {
      const response = await removeMarkerById(params._id);
      if (response.needAdminKey) {
        alert('Помилка - невірний ключ адміністратора');
      }

      const markers = await getMarkers(filters);
      setMarkers(markers);
    };

    Modal.confirm({
      title: 'Видалити місце?',
      content: 'Ви впевнені, що хочете видалити місце?',
      okText: 'Так',
      cancelText: 'Ні',
      onOk: () => {
        remove();
      },
    });
  };

  const { handleEdit } = useHandleEdit();

  const handleAddParameter = () => {
    handleEdit({}, true);
  };

  const calculated = useMemo(
    () => getCalculatedParam(advancedParameters),
    [currentSystem, marker],
  );

  useEffect(() => {
    if (currentSystem === 0) {
      setCalculatedParam(null);
      return;
    }
    setCalculatedParam(getCalculatedParam(advancedParameters));
  }, [calculated]);

  return (
    <div data-marker-id={params?._id}>
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
            <Segmented
              defaultValue={currentSystem}
              onChange={handleSystemChange}
              options={systemsOptions}
            />
            {calculatedParam && <Calculated {...calculatedParam} />}
            <div ref={parametersRef} className={S.content}>
              {advancedParameters.map((parameter) => (
                <PlaceParameter
                  key={parameter._id}
                  currentSystem={currentSystem}
                  {...parameter}
                ></PlaceParameter>
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
            <Button type="primary" onClick={handleAddParameter}>
              Додати параметр
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
