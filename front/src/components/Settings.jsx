import React, { useState } from 'react';
import S from './Settings.module.css';
import { Button, Checkbox, Modal } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import { settingsFilters } from '../state/atoms.js';
import { useRecoilState } from 'recoil';

const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useRecoilState(settingsFilters);

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

  return (
    <div className={S.wrapper}>
      <Button
        type="primary"
        icon={<SettingFilled />}
        onClick={handleOpenSettings}
      />
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
