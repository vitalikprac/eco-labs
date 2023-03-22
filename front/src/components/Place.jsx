import React, { useEffect, useRef, useState } from 'react';
import { Button, Segmented, notification } from 'antd';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import S from './Place.module.scss';
import { getMarkerById, getMarkers, removeMarkerById } from '../api.js';
import { markersAtom, settingsFiltersAtom } from '../state/atoms.js';

export const Place = (params) => {
  const [marker, setMarker] = useState(null);

  const [currentSystem, setCurrentSystem] = useState(0);
  const parametersRef = useRef(null);
  const filters = useRecoilValue(settingsFiltersAtom);
  const setMarkers = useSetRecoilState(markersAtom);

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
              {parameters.map((parameter) => (
                <div className={parameter?.type?.value} key={parameter._id}>
                  <i>{parameter.name}</i> -{' '}
                  {parameter?.value ? (
                    <b
                      dangerouslySetInnerHTML={{ __html: parameter.value }}
                    ></b>
                  ) : (
                    <b>немає точних значень</b>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Button
            className={S.removeButton}
            type="primary"
            danger
            onClick={handleRemove}
          >
            Видалити
          </Button>
        </>
      )}
    </div>
  );
};
