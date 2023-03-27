import React, { Fragment, useEffect, useState } from 'react';
import { Divider } from 'antd';
import { useRecoilValue } from 'recoil';
import { getSystems } from '../api.js';
import { systemsAtom } from '../state/atoms.js';

const Info = () => {
  const systems = useRecoilValue(systemsAtom);

  return (
    <div>
      {systems.map((system) => {
        return (
          <Fragment key={system.name}>
            <Divider>{system.name}</Divider>
            <p>{system.values.join(', ')}</p>
          </Fragment>
        );
      })}
    </div>
  );
};

export default Info;
