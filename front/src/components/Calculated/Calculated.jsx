import * as S from './Calculated.module.scss';
import { ClockCircleOutlined } from '@ant-design/icons';
import { dateLocalized } from '../../utils.js';

const getStatus = (value, name) => {
  if (name === 'AQI PM2.5') {
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
  }

  if (name === 'IS') {
    if (value <= 5) {
      return {
        statusClass: S.veryGood,
        statusText: 'Дуже добрий рівень',
      };
    }
    if (value > 5 && value <= 10) {
      return {
        statusClass: S.good,
        statusText: 'Добрий рівень',
      };
    }
    if (value > 10 && value <= 15) {
      return {
        statusClass: S.normal,
        statusText: 'Задовільний рівень',
      };
    }
    if (value > 15 && value <= 20) {
      return {
        statusClass: S.bad,
        statusText: 'Поганий рівень',
      };
    }
    if (value > 20) {
      return {
        statusClass: S.veryBad,
        statusText: 'Дуже поганий рівень',
      };
    }
  }

  if (name === 'Q1') {
    if (value <= 1) {
      return {
        statusClass: S.good,
        statusText: 'Добрий рівень',
      };
    }
    if (value > 1) {
      return {
        statusClass: S.bad,
        statusText: 'Поганий рівень',
      };
    }
  }

  if (name === 'γ-радіація') {
    if (value <= 200) {
      return {
        statusClass: S.good,
        statusText: 'Добрий рівень',
      };
    }
    if (value > 200 && value <= 300) {
      return {
        statusClass: S.normal,
        statusText: 'Нормальний рівень',
      };
    }
    if (value > 300 && value <= 1200) {
      return {
        statusClass: S.bad,
        statusText: 'Підвищений рівень',
      };
    }
    if (value > 1200) {
      return {
        statusClass: S.veryBad,
        statusText: 'Небезпечний рівень',
      };
    }
  }

  if (name === 'Народжуваність') {
    if (value <= 1) {
      return {
        statusClass: S.bad,
        statusText: 'Поганий рівень',
      };
    }
    if (value > 1 && value <= 1.3) {
      return {
        statusClass: S.normal,
        statusText: 'Нормальний рівень',
      };
    }
    if (value > 1.3) {
      return {
        statusClass: S.good,
        statusText: 'Добрий рівень',
      };
    }
  }
  if (name === 'ВВП') {
    if (value <= 50) {
      return {
        statusClass: S.bad,
        statusText: 'Поганий рівень',
      };
    }
    if (value > 50 && value <= 100) {
      return {
        statusClass: S.normal,
        statusText: 'Нормальний рівень',
      };
    }
    if (value > 100) {
      return {
        statusClass: S.good,
        statusText: 'Добрий рівень',
      };
    }
  }

  return {
    statusClass: S.unknown,
    statusText: 'Невідоме значення',
  };
};
const Calculated = ({ name, calculatedValue, calculatedValueDate }) => {
  const { statusClass, statusText } = getStatus(calculatedValue, name);
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
