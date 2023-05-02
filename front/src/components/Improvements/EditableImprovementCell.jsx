import React, { useState, useEffect, useContext } from 'react';
import { Select, Form, Input, Popconfirm, Table } from 'antd';
import { reportAtom } from '../../state/atoms.js';
import * as S from './Improvements.module.scss';
import { useRecoilValue } from 'recoil';
import { EditableContext } from '../../state/context.js';

const EditableImprovementCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const reportData = useRecoilValue(reportAtom);

  const currentProgram = record?.program;
  const improvements = reportData?.systems
    ?.find((x) => x._id === currentProgram)
    ?.improvements?.map((x) => ({
      value: x.id,
      label: x.name,
    }));

  const [editing, setEditing] = useState(false);
  const form = useContext(EditableContext);
  const isEmpty = children.every((x) => !x);

  const fieldValue = improvements?.find(
    (x) => x.value === children?.[1],
  )?.label;
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
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
      >
        <Select
          placeholder="Виберіть опцію"
          options={improvements}
          onChange={save}
        ></Select>
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {(isEmpty || (!fieldValue && !isEmpty)) && (
          <div className={S.editText}>Натисніть для редагування</div>
        )}
        {fieldValue}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

export default EditableImprovementCell;
