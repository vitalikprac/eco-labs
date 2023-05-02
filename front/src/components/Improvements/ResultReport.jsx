import React from 'react';
import { Table, Input } from 'antd';
import * as S from './ResultReport.module.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import { reportAtom, table1DataAtom } from '../../state/atoms.js';

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
        return `${el.slice(5)} - <b>${x[el]}</b> тис грн.`;
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
  return (
    <>
      <div>{JSON.stringify(dataSource, null, 2)}</div>
      <Table
        className={S.table}
        bordered
        dataSource={preparedDataSource}
        columns={columns}
        pagination={false}
      />
    </>
  );
};

export default ResultReport;
