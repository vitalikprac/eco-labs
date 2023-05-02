import React, { useState, useContext } from 'react';
import { Select, Form, Input, Popconfirm, Table } from 'antd';
import * as S from './Improvements.module.scss';
import { EditableContext } from '../../state/context.js';

const EditableYearCell = (props) => {
  const {
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  } = props;
  const [editing, setEditing] = useState(false);
  const form = useContext(EditableContext);
  const isEmpty = children.every((x) => !x);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  childNode = editing ? (
    <Form.Item
      style={{
        margin: 0,
      }}
      name={dataIndex}
    >
      <Input placeholder="Введіть кошти" onPressEnter={save} onBlur={save} />
    </Form.Item>
  ) : (
    <div
      className="editable-cell-value-wrap"
      style={{ paddingRight: 24 }}
      onClick={toggleEdit}
    >
      {isEmpty ? <div className={S.editText}>0</div> : children}
    </div>
  );
  return <td {...restProps}>{childNode}</td>;
};

export default EditableYearCell;
