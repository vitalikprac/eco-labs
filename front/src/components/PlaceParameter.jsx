import React from 'react';
import { dateToMonthName } from '../utils.js';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
} from 'antd';
import * as S from './PlaceParameter.module.scss';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getMarkerById, updateParameterById } from '../api.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { chartsAtom, markerAtom } from '../state/atoms.js';

const PlaceParameter = (parameter) => {
  const [marker, setMarker] = useRecoilState(markerAtom);
  const setCharts = useSetRecoilState(chartsAtom);

  const editRef = React.useRef(null);
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    const response = await updateParameterById(parameter._id, {
      ...values,
      valueX: parseFloat(values.valueX),
      valueY: values.valueY.unix() * 1000,
    });
    if (!response.success) {
      alert('Помилка - невірний ключ адміністратора');
      return;
    }

    const newMarker = await getMarkerById(marker._id);
    setMarker(newMarker);
    editRef.current.destroy();
  };

  const handleEdit = () => {
    editRef.current = Modal.confirm({
      title: 'Інформація про підсистеми',
      onOk: (close) => {
        form.submit();
      },
      onCancel: (close) => {
        const isFormTouch = form.isFieldsTouched();
        if (isFormTouch) {
          Modal.confirm({
            title: 'Ви впевнені, що хочете закрити вікно?',
            content: 'Всі незбережені зміни будуть втрачені',
            onOk: () => {
              form.resetFields();
              close();
            },
          });
        } else {
          close();
        }
      },

      content: (
        <div>
          <div>
            Старе значення: <br /> <i>{parameter.name}</i> -{' '}
            {parameter?.value && (
              <b dangerouslySetInnerHTML={{ __html: parameter.value }}></b>
            )}
          </div>
          <div>Нове значення:</div>
          <Form
            layout="horizontal"
            form={form}
            onFinish={handleFinish}
            initialValues={{
              name: parameter.name,
              valueX: parameter.value,
            }}
            autoComplete="off"
          >
            <Form.Item rules={[{ required: true }]} name={['name']}>
              <Input required placeholder="* Назва" />
            </Form.Item>
            <Form.Item rules={[{ required: true }]} name={['valueX']}>
              <InputNumber
                style={{ width: '100%' }}
                required
                placeholder="* Значення"
              />
            </Form.Item>
            <Form.Item name={['parameterX']}>
              <Input placeholder="Одиниці вимірювання" />
            </Form.Item>
            <Form.Item rules={[{ required: true }]} name={['valueY']}>
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
      ),
    });
  };

  const handleCreateChart = (parameter) => {
    setCharts((charts) => ({ visible: true, parameter }));
  };

  const goodValue = parameter?.valueX ? S.good : '';
  console.log(goodValue, parameter);

  return (
    <div className={parameter?.type?.value + ' ' + S.wrapper + ' ' + goodValue}>
      <i>{parameter.name}</i> -{' '}
      {parameter?.value && (
        <b dangerouslySetInnerHTML={{ __html: parameter.value }}></b>
      )}
      {parameter?.valueX && (
        <b>
          {parameter?.valueX} {parameter?.parameterX} <br />
          {new Date(parameter?.valueY).toTemporalInstant().toLocaleString()}
        </b>
      )}
      {!parameter?.xS && (
        <Button onClick={handleEdit} className={S.editButton} type="link">
          Редагувати
        </Button>
      )}
      {parameter?.xS &&
        parameter?.yS &&
        parameter?.xS.map((x, index) => (
          <div key={index}>
            <b>{dateToMonthName(x.value)}</b> (
            {x.value.toTemporalInstant().toLocaleString()}){' '}
            <b>{parameter?.yS[index]?.value}</b> {parameter?.yS[index]?.label}
          </div>
        ))}
      {parameter?.xS && (
        <Button onClick={() => handleCreateChart(parameter)} type="primary">
          Графік
        </Button>
      )}
      {!parameter?.value && !parameter.valueX && !parameter?.xS && (
        <b>немає точних значень</b>
      )}
    </div>
  );
};

export default PlaceParameter;
