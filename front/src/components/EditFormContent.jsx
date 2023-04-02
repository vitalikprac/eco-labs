import React, { useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';

const EditFormContent = ({ parameter, handleFinish, createNew, form }) => {
  useEffect(() => {
    form.resetFields();
    return () => {
      form.resetFields();
    };
  }, []);
  return (
    <div>
      {!createNew && (
        <div>
          Старе значення: <br /> <i>{parameter?.name}</i> -{' '}
          {parameter?.value && (
            <b dangerouslySetInnerHTML={{ __html: parameter.value }}></b>
          )}
        </div>
      )}
      <div>{createNew ? 'Додати значення' : 'Нове значення:'}</div>
      <Form
        layout="horizontal"
        form={form}
        onFinish={(data) => handleFinish(data, createNew)}
        initialValues={{
          name: parameter?.name,
          valueX: dayjs(parameter?.valueX),
          valueY: parameter?.valueY,
          descriptionY: parameter?.descriptionY,
        }}
        autoComplete="off"
      >
        <Form.Item rules={[{ required: true }]} name={['name']}>
          <Input required placeholder="* Назва" />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} name={['valueY']}>
          <InputNumber
            style={{ width: '100%' }}
            required
            placeholder="* Значення"
          />
        </Form.Item>
        <Form.Item name={['descriptionY']}>
          <Input placeholder="Одиниці вимірювання" />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} name={['valueX']}>
          <DatePicker
            style={{
              width: '100%',
            }}
            required
            showTime
            placeholder="* Дата"
          />
        </Form.Item>
        <Form.Item name={['type']}>
          <Select allowClear placeholder={'Тип значення'}>
            <Select.Option value="1">Добре</Select.Option>
            <Select.Option value="2">Нормальне</Select.Option>
            <Select.Option value="3">Погане</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};
export default EditFormContent;
