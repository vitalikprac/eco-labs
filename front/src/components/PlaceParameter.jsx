import React from 'react';
import { dateToMonthName } from '../utils.js';
import { Button, Modal } from 'antd';
import * as S from './PlaceParameter.module.scss';
import { getMarkerById, removeParameterById } from '../api.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { calculatedParamAtom, chartsAtom, markerAtom } from '../state/atoms.js';
import { useHandleEdit } from '../hooks/useHandleEdit.jsx';
import { CALCULATED_PARAMETERS, STABLE_PARAMETER } from '../data.js';
import EnergyInfo from './EnergyInfo.jsx';

const PlaceParameter = (parameter) => {
  const [marker, setMarker] = useRecoilState(markerAtom);
  const setCharts = useSetRecoilState(chartsAtom);
  const { handleEdit } = useHandleEdit();

  const currentSystem = parameter?.currentSystem;

  const handleRemove = (parameterId, markerId) => {
    Modal.confirm({
      title: 'Видалити параметр?',
      content: 'Видалення параметра не може бути скасовано',
      onOk: async () => {
        const response = await removeParameterById(parameterId);
        if (response.needAdminKey) {
          alert('Помилка - невірний ключ адміністратора');
          return;
        }

        const newMarker = await getMarkerById(markerId);
        setMarker(newMarker);
      },
    });
  };

  const handleCreateChart = (parameter) => {
    setCharts((charts) => ({ visible: true, parameter }));
  };

  const goodValue = parameter?.valueX ? S.good : '';

  const handleRemoveAdvancedParameter = (parameter) => {
    handleRemove(parameter?._id, marker?._id);
  };

  const isCalculated = CALCULATED_PARAMETERS.includes(parameter?.name);
  const isStable = STABLE_PARAMETER.includes(parameter?.name);

  const setCalculatedParam = useSetRecoilState(calculatedParamAtom);
  const handleSelectCalculated = (calculatedValue, calculatedValueDate) => {
    setCalculatedParam({
      calculatedValue,
      calculatedValueDate,
      name: parameter?.name,
    });
  };

  const handleEnergyInfo = (parameter) => {
    Modal.info({
      title: 'Значення',
      width: '80%',
      content: (
        <EnergyInfo title={marker?.name} info={parameter.rawParameters} />
      ),
      className: 'energy-info-modal',
    });
  };

  return (
    <div className={parameter?.type?.value + ' ' + S.wrapper + ' ' + goodValue}>
      <i>{parameter.name}</i>
      {parameter?.value && (
        <b dangerouslySetInnerHTML={{ __html: parameter.value }}></b>
      )}
      {parameter?.valueY >= 0 && (
        <>
          {' - '}
          <b>
            {parameter?.valueY} {parameter?.descriptionY}
          </b>
          <br />
          {dateToMonthName(parameter?.valueX)} (
          {new Date(parameter?.valueX).toTemporalInstant().toLocaleString()})
        </>
      )}
      {!isCalculated && !parameter?.xS && (
        <Button
          onClick={() => handleEdit(parameter)}
          className={S.editButton}
          type="link"
        >
          Редагувати
        </Button>
      )}
      {!isCalculated && !parameter?.xS && (
        <Button
          danger
          onClick={() => handleRemove(parameter?._id, marker?._id)}
          className={S.editButton}
          type="link"
        >
          Видалити
        </Button>
      )}
      {parameter?.xS &&
        parameter?.yS &&
        parameter?.xS.map((x, index) => {
          try {
            x.value.toTemporalInstant();
          } catch (e) {
            return <div>Помилка </div>;
          }
          return (
            <div
              style={{
                marginTop: '0.5rem',
              }}
              key={index}
            >
              <b>{parameter?.yS[index]?.value}</b> {parameter?.yS[index]?.label}
              <br />
              {dateToMonthName(x.value)} (
              {x.value.toTemporalInstant().toLocaleString()})
              {!isCalculated && (
                <>
                  <Button
                    onClick={() => handleEdit(parameter.rawParameters[index])}
                    className={S.editButton}
                    type="link"
                  >
                    Редагувати
                  </Button>
                  <Button
                    danger
                    onClick={() =>
                      handleRemoveAdvancedParameter(
                        parameter.rawParameters[index],
                      )
                    }
                    className={S.editButton}
                    type="link"
                  >
                    Видалити
                  </Button>
                </>
              )}
              {isCalculated ||
                (isStable && (
                  <Button
                    className={S.selectButton}
                    onClick={() =>
                      handleSelectCalculated(
                        parameter?.yS[index]?.value,
                        x.value,
                      )
                    }
                  >
                    Обрати
                  </Button>
                ))}
            </div>
          );
        })}
      {parameter?.xS && (
        <Button
          className={S.chartButton}
          onClick={() => handleCreateChart(parameter)}
          type="primary"
        >
          Графік
        </Button>
      )}
      {/*5 meaning for Energy*/}
      {currentSystem === 5 && (
        <Button
          type="primary"
          className={S.energyButton}
          onClick={() => handleEnergyInfo(parameter)}
        >
          Значення
        </Button>
      )}
      {!parameter?.value && !parameter.valueX && !parameter?.xS && (
        <b>немає точних значень</b>
      )}
    </div>
  );
};

export default PlaceParameter;
