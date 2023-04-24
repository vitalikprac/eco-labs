import { useState } from 'react';
import { Table, Select } from 'antd';
import * as S from './EnergyInfo.module.scss';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function getWorkDaysInMonth(month) {
  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();

  let workDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(new Date().getFullYear(), month - 1, day);

    const dayOfWeek = new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
    }).format(date);

    if (dayOfWeek !== 'Saturday' && dayOfWeek !== 'Sunday') {
      workDays++;
    }
  }

  return workDays;
}

const applyRealValues = (monthColumns, values, year) => {
  monthColumns.forEach((monthColumn) => {
    const value = values
      .filter((value) => value.valueX.getFullYear() === year)
      .find((value) => {
        const date = value.valueX;
        const monthName = Intl.DateTimeFormat('uk-UA', {
          month: 'long',
        }).format(date);
        return monthName === monthColumn.title;
      });

    //const value = values.find((value) => value.month === monthColumn.title);
    if (value) {
      monthColumn.value = value.valueY;
      monthColumn.averageDay = value.valueY / monthColumn.workDays;
    }
  });
};

const EnergyInfo = ({ info, title }) => {
  const availableYears = [
    ...new Set(info.map((value) => value.valueX.getFullYear())),
  ];

  const [selectedYear, setSelectedYear] = useState(
    availableYears[availableYears.length - 1],
  );
  const months = Array.from({ length: 12 }, (v, k) => k + 1);
  const monthColumns = months.map((month) => ({
    title: Intl.DateTimeFormat('uk-UA', { month: 'long' }).format(
      new Date(2021, month - 1, 1),
    ),
    workDays: getWorkDaysInMonth(month),
    value: null,
  }));

  applyRealValues(monthColumns, info, selectedYear);

  const columns = [
    {
      title: title,
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Значення',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Робочі дні',
      dataIndex: 'workDays',
      key: 'workDays',
    },
    {
      title: 'Середньодобове',
      dataIndex: 'averageDay',
      key: 'averageDay',
    },
  ];

  const dataSource = monthColumns.map((monthColumn) => ({
    key: monthColumn.title,
    month: capitalizeFirstLetter(monthColumn.title),
    value: monthColumn.value,
    workDays: monthColumn.workDays,
    averageDay: monthColumn.averageDay,
  }));

  const monthColumnsExist = monthColumns.filter(
    (month) => month.value !== null,
  );
  const averageForYear =
    monthColumnsExist.reduce((acc, month) => {
      return acc + month.averageDay;
    }, 0) / monthColumnsExist.length;

  const findMin = (monthColumns) => {
    let min = monthColumns[0].averageDay || Infinity;
    let month = 1;
    monthColumns.forEach((m, index) => {
      if (m.averageDay < min) {
        min = mm.averageDay;
        month = index + 1;
      }
    });
    return {
      min,
      month,
    };
  };

  const findMax = (monthColumns) => {
    let max = monthColumns[0].averageDay || -Infinity;
    let month = 1;
    monthColumns.forEach((m, index) => {
      if (m.averageDay > max) {
        max = m.averageDay;
        month = index + 1;
      }
    });
    return {
      max,
      month,
    };
  };

  const min = {
    value: findMin(monthColumns).min,
    month: findMin(monthColumns).month,
  };

  const max = {
    value: findMax(monthColumns).max,
    month: findMax(monthColumns).month,
  };

  return (
    <div>
      Рік
      <Select
        className={S.yearSelect}
        defaultValue={selectedYear}
        options={[
          ...availableYears.map((year) => ({ value: year, label: year })),
        ]}
        onChange={(value) => setSelectedYear(value)}
      />
      <Table
        pagination={false}
        size="small"
        dataSource={dataSource}
        columns={columns}
      />
      <div className={S.values}>
        Середнє за рік - <b>{averageForYear?.toFixed(4)}</b>
        <br />
        Мінімальне значення - <b>{min.value?.toFixed(4)}</b> в{' '}
        <b>{min.month}</b> місяці
        <br />
        Максимальне значення - <b>{max.value?.toFixed(4)}</b> в{' '}
        <b>{max.month}</b> місяці
        <br />
        Коефіцієнт нерівномірності -{' '}
        <b>{(max.value / min.value)?.toFixed(4)}</b>
        <br />
      </div>
    </div>
  );
};

export default EnergyInfo;
