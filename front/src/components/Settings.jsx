import React, { useState } from 'react';
import S from './Settings.module.css';
import { Button, Checkbox, Modal, notification, Input } from 'antd';
import {
  SettingFilled,
  PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  adminKeyAtom,
  newMarkerAtom,
  settingsFiltersAtom,
} from '../state/atoms.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useMapEvents } from 'react-leaflet';
import Info from './Info.jsx';

const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useRecoilState(settingsFiltersAtom);
  const setMarker = useSetRecoilState(newMarkerAtom);
  const [adminKey, setAdminKey] = useRecoilState(adminKeyAtom);
  const [modal, contextHolderModal] = Modal.useModal();

  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const options = [
    { label: 'Всі', value: 'all' },
    { label: 'Лівий берег', value: 'left-side' },
    { label: 'Правий берег', value: 'right-side' },
    { label: 'Економічні показники', value: 'economic' },
    { label: 'Природні показники', value: 'natural' },
  ];

  const handleSettingsChange = (values) => {
    setSettings(values);
  };

  const [api, contextNotification] = notification.useNotification();
  const handleAddMarker = () => {
    api.info({
      message: 'Додавання маркеру',
      description: 'Натисніть куди додати маркер',
      placement: 'bottomRight',
    });
    setMarker({
      isAdding: true,
      isAdded: false,
    });
  };

  const handleInfo = () => {
    modal.info({
      title: 'Інформація про підсистеми',
      content: <Info />,
      className: 'info-modal',
    });
  };

  const [newMarker, setNewMarker] = useRecoilState(newMarkerAtom);

  useMapEvents({
    click: (e) => {
      if (newMarker.isAdding) {
        setNewMarker({
          isAdding: false,
          isAdded: true,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }
    },
  });

  const handleAdminKey = (e) => {
    const value = e.target.value;
    localStorage.setItem('adminKey', value);
    setAdminKey(value);
  };

  return (
    <div className={S.wrapper}>
      {contextNotification}
      {contextHolderModal}
      <Button
        type="primary"
        icon={<SettingFilled />}
        onClick={handleOpenSettings}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddMarker}
      />
      <Button
        type="primary"
        icon={<InfoCircleOutlined />}
        onClick={handleInfo}
      />
      <Input.Password
        className={S.adminKey}
        placeholder="Secret admin key"
        value={adminKey}
        onChange={handleAdminKey}
      ></Input.Password>
      <Modal
        title="Налаштування"
        onCancel={handleCancel}
        open={isModalOpen}
        footer={null}
        className="settings"
      >
        <div>Фільтрування</div>
        <Checkbox.Group
          options={options}
          defaultValue={settings}
          onChange={handleSettingsChange}
        />
      </Modal>
    </div>
  );
};

export default Settings;
