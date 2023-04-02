import dayjs from 'dayjs';
import { Form, Modal } from 'antd';
import React from 'react';
import EditFormContent from '../components/EditFormContent.jsx';
import { createParameter, getMarkerById, updateParameterById } from '../api.js';
import { useRecoilState } from 'recoil';
import { markerAtom } from '../state/atoms.js';

export const useHandleEdit = () => {
  const [form] = Form.useForm();
  const editRef = React.useRef(null);

  const [marker, setMarker] = useRecoilState(markerAtom);

  const handleFinish = async (values, parameter, createNew) => {
    const paramsData = {
      ...values,
      valueX: values.valueX.unix() * 1000,
      valueY: parseFloat(values.valueY),
    };

    let response;
    if (createNew) {
      response = await createParameter(paramsData, marker._id);
    } else {
      response = await updateParameterById(parameter._id, paramsData);
    }
    if (response.needAdminKey) {
      alert('Помилка - невірний ключ адміністратора');
      return;
    }

    const newMarker = await getMarkerById(marker._id);
    setMarker(newMarker);
    editRef.current.destroy();
  };

  const handleEdit = (parameter, createNew = false) => {
    // console.log({
    //   name: parameter?.name,
    //   valueX: dayjs(parameter?.valueX),
    //   valueY: parameter?.valueY,
    //   descriptionY: parameter?.descriptionY,
    // });
    editRef.current = Modal.confirm({
      title: createNew ? 'Створити новий параметр' : 'Редагувати параметр',
      onOk: (close) => {
        form.submit();
      },
      afterClose: () => {
        form.resetFields();
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
        <EditFormContent
          parameter={parameter}
          handleFinish={(data, createNew) =>
            handleFinish(data, parameter, createNew)
          }
          createNew={createNew}
          form={form}
        />
      ),
    });
  };

  return {
    handleEdit,
  };
};
