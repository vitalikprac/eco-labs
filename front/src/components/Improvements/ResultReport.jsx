import React from 'react';
import { Table, Input, Button } from 'antd';
import * as S from './ResultReport.module.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import { reportAtom, table1DataAtom } from '../../state/atoms.js';
import { writeFileXLSX, utils } from 'xlsx';
const { TextArea } = Input;

const ResultReport = () => {
  const reportData = useRecoilValue(reportAtom);
  const [dataSource, setDataSource] = useRecoilState(table1DataAtom);

  const preparedDataSource = dataSource.map((x, i) => {
    const system = reportData.systems.find((y) => y._id === x.program);
    const improvement = system?.improvements?.find((y) => y.id === x.name);
    const moneyKeys = Object.keys(x).filter((y) => y.includes('money'));
    const financing = moneyKeys
      .map((el) => {
        if (parseFloat(x[el]) === 0) return null;
        return `${el.slice(5)} - ${x[el]} тис грн.`;
      })
      .filter(Boolean)
      .join('<br/>');

    const term = moneyKeys
      .map((el) => {
        if (parseFloat(x[el]) === 0) return null;
        return `${el.slice(5)}`;
      })
      .filter(Boolean)
      .join(', ');

    return {
      ...x,
      program: system?.improvement_program,
      name: improvement?.name,
      result: improvement?.result,
      financing,
      term,
    };
  });

  const handleChangeExecutor = (text, record, index) => {
    setDataSource((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      newData[index].executor = text;
      return newData;
    });
  };

  const handleChangeSourceMoney = (text, record, index) => {
    setDataSource((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      newData[index].sourceMoney = text;
      return newData;
    });
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => {
        return index + 1;
      },
    },
    {
      title: 'Назва напрямку діяльності',
      dataIndex: 'program',
      key: 'program',
    },
    {
      title: 'Перелік заходів програми',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Строк виконання',
      dataIndex: 'term',
      key: 'term',
    },
    {
      title: 'Виконавці',
      dataIndex: 'executor',
      key: 'executor',
      render: (text, record, index) => {
        return (
          <TextArea
            onChange={(e) =>
              handleChangeExecutor(e.target.value, record, index)
            }
            rows={2}
            value={text}
            placeholder="Виконавці"
          />
        );
      },
    },
    {
      title: 'Джерела фінансування',
      dataIndex: 'sourceMoney',
      key: 'sourceMoney',
      render: (text, record, index) => {
        return (
          <TextArea
            onChange={(e) =>
              handleChangeSourceMoney(e.target.value, record, index)
            }
            rows={2}
            value={text}
            placeholder="Джерела фінансування"
          />
        );
      },
    },
    {
      title:
        'Орієнтовні обсяги фінансування (вартість), тис.грн, у т.ч. за роками:',
      dataIndex: 'financing',
      key: 'financing',
      render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
    },
    {
      title: 'Очікувані результати',
      dataIndex: 'result',
    },
  ];
  console.log(dataSource);

  const generateRow = (index) => {
    const d = preparedDataSource[index];
    const moneyKeys = Object.keys(d).filter((y) => y.includes('money'));
    const values = moneyKeys.map((el) => d[el]);
    return [d['name'], d['program'], ...values];
  };

  const generateRow2 = (index) => {
    const d = preparedDataSource[index];
    return [
      index + 1,
      d['program'],
      d['name'],
      d['term'],
      d['executor'],
      d['sourceMoney'],
      d['financing'].replaceAll('<br/>', ' '),
      d['result'],
    ];
  };

  const handleGenerateXlsx = () => {
    const workbook = utils.book_new();

    const moneyKeys = Object.keys(preparedDataSource[0])
      .filter((y) => y.includes('money'))
      .map((el) => el.slice(5));
    const worksheet = utils.aoa_to_sheet([
      [
        'Оперативні цілі, завдання та заходи стратегії',
        'Захід, що відповідає заходу стратегії',
        'Обсяги, фінансування, тис. грн',
      ],
      ['', '', ...moneyKeys],
      ...preparedDataSource.map((x, i) => generateRow(i)),
      [
        '',
        'Всього',
        ...moneyKeys.map((el) =>
          preparedDataSource.reduce(
            (acc, curr) => acc + parseFloat(curr[`money${el}`]),
            0,
          ),
        ),
      ],
    ]);

    utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const worksheet2 = utils.aoa_to_sheet([
      [
        '№',
        'Назва напрямку діяльності',
        'Перелік заходів програми',
        'Строк виконання',
        'Виконавці',
        'Джерела фінансування',
        'Орієнтовні обсяги фінансування (вартість), тис.грн, у т.ч. за роками:',
        'Очікувані результати',
      ],
      ...preparedDataSource.map((x, i) => generateRow2(i)),
    ]);

    utils.book_append_sheet(workbook, worksheet2, 'Sheet2');
    const time = new Date().toLocaleString().replaceAll(':', '-');
    writeFileXLSX(workbook, `Report-${time}.xlsx`);
  };
  return (
    <>
      <Table
        className={S.table}
        bordered
        dataSource={preparedDataSource}
        columns={columns}
        pagination={false}
      />
      <Button
        className={S.reportButton}
        type="primary"
        onClick={handleGenerateXlsx}
      >
        Згенерувати документ
      </Button>
    </>
  );
};

export default ResultReport;
