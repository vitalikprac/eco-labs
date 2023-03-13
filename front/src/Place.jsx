import React, { useEffect, useState } from 'react';
import { getMarkerById } from './api.js';

export const Place = (params) => {
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    getMarkerById(params._id).then((marker) => {
      setMarker(marker);
    });
  }, []);

  return (
    <div>
      {!marker && <div>Loading...</div>}
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
            <span className="param-title">Параметри</span>:
          </div>
          <div>
            {marker.parameters.map((parameter) => (
              <div className={parameter?.type?.value} key={parameter._id}>
                <i>{parameter.name}</i> -{' '}
                {parameter?.value ? (
                  <b dangerouslySetInnerHTML={{ __html: parameter.value }}></b>
                ) : (
                  <b>немає точних значень</b>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
