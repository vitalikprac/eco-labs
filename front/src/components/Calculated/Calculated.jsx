import * as S from './Calculated.module.scss';
import { ClockCircleOutlined } from '@ant-design/icons';
import { dateLocalized } from '../../utils.js';

const getStatus = (value) => {
  if (value >= 0 && value <= 50) {
    return {
      statusClass: S.good,
      statusText: 'Добрий рівень',
    };
  }
  if (value > 50 && value <= 100) {
    return {
      statusClass: S.normal,
      statusText: 'Нормальний рівень',
    };
  }
  if (value > 100 && value <= 150) {
    return {
      statusClass: S.bad,
      statusText: 'Поганий рівень',
    };
  }
  return {};
};
const Calculated = ({ name, calculatedValue, calculatedValueDate }) => {
  const { statusClass, statusText } = getStatus(calculatedValue);
  return (
    <div className={S.wrapper}>
      <div className={S.value + ' ' + statusClass}>
        <div className={S.valueHeader}>{calculatedValue}</div>
        <div className={S.valueContent}>{name}</div>
      </div>
      <div className={S.description}>
        <div className={S.statusText}>{statusText}</div>
        <div className={S.time}>
          <ClockCircleOutlined />
          {dateLocalized(calculatedValueDate)}
        </div>
      </div>
    </div>
  );
};

export default Calculated;
