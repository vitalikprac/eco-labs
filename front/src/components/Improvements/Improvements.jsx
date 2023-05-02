import * as S from './Improvements.module.scss';
import {
  reportAtom,
  table1DataAtom,
  table1StructureAtom,
} from '../..//state/atoms.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Form, Input, Popconfirm, Table } from 'antd';
import React, { useRef } from 'react';
import { EditableContext } from '../../state/context.js';
import EditableProgramCell from './EditableProgramCell.jsx';
import EditableImprovementCell from './EditableImprovementCell.jsx';
import EditableYearCell from './EditableYearCell.jsx';

const convertDataToSum = (data, structure) => {
  const columns = structure.map((x) => x.key);

  const sums = columns.map((year) => {
    return data.reduce((acc, curr) => {
      if (curr[year]) {
        return acc + Number(curr[year]) ?? 0;
      }
      return acc;
    }, 0);
  });
  return {
    count: columns.length,
    sums,
  };
};

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useRecoilState(table1DataAtom);
  const tableStructure = useRecoilValue(table1StructureAtom);
  const { count, sums } = convertDataToSum(dataSource, tableStructure);

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        {props['data-row-key'] === 'last' ? (
          <tr>
            <td></td>
            <td>
              <b>Всього</b>
            </td>
            {sums.map((x, i) => (
              <td key={i}>
                <b>{x}</b>
              </td>
            ))}
            <td></td>
          </tr>
        ) : (
          <tr {...props} />
        )}
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = (props) => {
  if (props.dataIndex === 'program') {
    return <EditableProgramCell {...props} />;
  }
  if (props.dataIndex === 'name') {
    return <EditableImprovementCell {...props} />;
  }

  if (props.dataIndex?.startsWith('money')) {
    return <EditableYearCell {...props} />;
  }
  return <td>{props.children}</td>;
};

const Improvements = () => {
  const reportData = useRecoilValue(reportAtom);
  const [dataSource, setDataSource] = useRecoilState(table1DataAtom);
  const [tableStructure, setTableStructure] =
    useRecoilState(table1StructureAtom);
  // const [count] = useState(
  //   parseInt(dataSource[dataSource.length - 1]?.key, 10) ?? 0,
  // );
  const yearRef = useRef(null);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleDeleteYear = (year) => {
    const newStructure = tableStructure.filter((item) => item.title !== year);
    const newData = dataSource.map((item) => {
      const { [`money${year}`]: _, ...rest } = item;
      return rest;
    });
    console.log(newData);
    if (newStructure.length === 0) {
      //alert('Не можна видалити останній рік');
      //return;
    }
    setTableStructure(newStructure);
    setDataSource(newData);
  };

  const tableStructureForRender = tableStructure.map((x) => ({
    ...x,
    title: () => {
      return (
        <div className={S.yearWrapper}>
          {x.title}
          <Popconfirm
            title="Справді видалити рік?"
            onConfirm={() => handleDeleteYear(x.title)}
            okText="Так"
            cancelText="Ні"
          >
            <a>X</a>
          </Popconfirm>
        </div>
      );
    },
  }));

  const defaultColumns = [
    {
      title: 'Оперативні цілі, завдання та заходи стратегії',
      key: 'name',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: 'Захід що відповідає заходу Стратегії',
      key: 'program',
      dataIndex: 'program',
      editable: true,
    },
    {
      title: 'Обсяги, фінансування, тис. грн.',
      children: tableStructureForRender,
    },
    {
      title: 'Операції',
      key: 'operation',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Справді видалити рядок?"
            onConfirm={() => handleDelete(record.key)}
            okText="Так"
            cancelText="Ні"
          >
            <a>Видалити</a>
          </Popconfirm>
        ) : null,
    },
  ];
  const handleAdd = () => {
    const largestKey = dataSource
      .filter((x) => x.key !== 'last')
      .reduce((acc, curr) => {
        return curr.key > acc ? curr.key : acc;
      }, 0);
    const newData = {
      key: largestKey + 1,
      name: null,
      program: null,
    };
    setDataSource([...dataSource, newData]);
  };
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (col.children) {
      return {
        ...col,
        children: col.children.map((child) => {
          if (!child.editable) {
            return child;
          }
          return {
            ...child,
            onCell: (record) => ({
              record,
              editable: child.editable,
              dataIndex: child.dataIndex,
              title: child.title,
              handleSave,
            }),
          };
        }),
      };
    }
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const handleAddYear = (year) => {
    const isExist = tableStructure.find((x) => x.title === year);
    if (isExist) return;

    setTableStructure((prev) => [
      ...prev,
      {
        title: year,
        dataIndex: `money${year}`,
        key: `money${year}`,
        editable: true,
      },
    ]);
  };

  const newDataSource = [
    ...dataSource,
    {
      key: 'last',
      name: null,
      program: null,
    },
  ];

  return (
    <div className={S.wrapper}>
      <div>{JSON.stringify(dataSource, null, 2)}</div>
      <Table
        className={S.table}
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={newDataSource}
        columns={columns}
        pagination={false}
      />
      <div className={S.buttonsWrapper}>
        <Button onClick={handleAdd} type="primary">
          Добавити рядок
        </Button>
        <Popconfirm
          title={
            <div>
              <div>Введіть рік (роки)</div>
              <Input ref={yearRef} placeholder="Введіть рік" />
            </div>
          }
          onConfirm={() => {
            const year = yearRef?.current?.input?.value?.trim?.() ?? '';
            if (!year) return;
            handleAddYear(year);
          }}
          okText="Добавити"
          cancelText="Відміна"
        >
          <Button type="primary">Добавити рік</Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default Improvements;
