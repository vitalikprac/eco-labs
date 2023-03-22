import React, { useEffect, useState } from 'react';
import { Divider } from 'antd';
import { getSystems } from '../api.js';

const Info = () => {
  const [systems, setSystems] = useState([]);

  useEffect(() => {
    getSystems().then((res) => {
      setSystems(res);
    });
  }, []);

  return (
    <div>
      {systems.map((system) => {
        return (
          <>
            <Divider>{system.name}</Divider>
            <p>{system.values.join(', ')}</p>
          </>
        );
      })}
    </div>
  );
};

export default Info;
