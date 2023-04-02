import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { Form, Button, Input, Space, Select, notification } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import S from './NewPlace.module.scss';
import {
  markersAtom,
  newMarkerAtom,
  settingsFiltersAtom,
} from '../state/atoms.js';
import { getMarkers, saveMarker } from '../api.js';

const NewPlace = () => {
  const [form] = Form.useForm();
  const filters = useRecoilValue(settingsFiltersAtom);
  const setMarkers = useSetRecoilState(markersAtom);
  const [newMarker, setNewMarker] = useRecoilState(newMarkerAtom);

  const handleFinish = async (values) => {
    const response = await saveMarker(values);
    if (response.needAdminKey) {
      alert('Помилка - невірний ключ адміністратора');
    }

    const markers = await getMarkers(filters);
    setMarkers(markers);
    setNewMarker({ isAdding: false, isAdded: false });
  };

  const handleRemove = async () => {
    setNewMarker({ isAdding: false, isAdded: false });
  };

  useEffect(() => {
    form.setFieldValue('coordinates', [newMarker.lat, newMarker.lng]);
  }, [newMarker.lat, newMarker.lng]);

  return (
    <div className={S.wrapper}>
      <Form
        layout="horizontal"
        form={form}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item label="Координати" name="coordinates">
          <Input disabled values={123} />
        </Form.Item>
        <Form.Item
          label="Назва"
          name="name"
          rules={[{ required: true, message: 'Введіть назву!' }]}
        >
          <Input required placeholder="Введіть назву" />
        </Form.Item>
        <Form.Item
          label="Адреса"
          name="address"
          rules={[{ required: true, message: 'Введіть адресу!' }]}
        >
          <Input required placeholder="Введіть адресу" />
        </Form.Item>
        <Form.Item
          label="Тип"
          name="identification"
          rules={[{ required: true, message: 'Введіть тип!' }]}
        >
          <Input required placeholder="Введіть адресу" />
        </Form.Item>
        <Form.List name="parameters">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: 'flex', marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item {...restField} name={[name, 'name']}>
                    <Input required placeholder="* Назва" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'value']}>
                    <Input required placeholder="* Значення" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'type']}>
                    <Select allowClear placeholder={'Тип значення'}>
                      <Select.Option value="1">Добре</Select.Option>
                      <Select.Option value="2">Нормальне</Select.Option>
                      <Select.Option value="3">Погане</Select.Option>
                    </Select>
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(name);
                    }}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Додати параметр
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Зберегти
          </Button>
          <Button
            className={S.removeButton}
            type="dashed"
            danger
            onClick={handleRemove}
          >
            Видалити
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewPlace;
