import React from 'react';
import * as S from './MyChart.module.scss';
import { useRecoilState } from 'recoil';
import { chartsAtom } from '../state/atoms.js';
import { Button, Modal } from 'antd';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { dateToMonthName } from '../utils.js';

const convertParameterToChartData = (parameter) => {
  const data = [];

  if (!parameter?.xS) return data;
  for (let i = 0; i < parameter.xS.length; i++) {
    data.push({
      name: dateToMonthName(parameter.xS[i].value),
      xValue: parameter.xS[i].value,
      yLabel: parameter.yS[i].label,
      yValue: parameter.yS[i].value,
    });
  }

  data.sort((a, b) => a.xValue - b.xValue);
  return data;
};

const MyChart = () => {
  const [charts, setCharts] = useRecoilState(chartsAtom);

  const handleCloseCharts = () => {
    setCharts((prev) => ({ ...prev, visible: false }));
  };

  const data = convertParameterToChartData(charts.parameter);

  const handleShowAuthors = () => {
    Modal.info({
      title: 'Про авторів',
      content: (
        <div>
          <div>Лабораторна робота №2</div>
          <div>
            Автори:
            <br />
            <i>Прачов Віталій ТР-21мп</i>
            <br />
            <i>Петренко Пилип ТР-23мп</i>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className={S.wrapper}>
      <div className={S.side}>
        <Button type="primary" onClick={handleShowAuthors}>
          Про авторів
        </Button>
      </div>
      {charts?.visible && (
        <div className={S.chartWrapper}>
          <div className={S.chartHeader}>
            <div>
              Графік - <b>{charts?.parameter?.name}</b>
            </div>
            <Button type="primary" onClick={handleCloseCharts}>
              X
            </Button>
          </div>
          <ResponsiveContainer className={S.chart} width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 5,
                bottom: 5,
                right: 0,
                left: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                labelFormatter={(label, data) => {
                  const date = data?.[0]?.payload?.xValue;
                  if (date) {
                    return `${label} (${date.toLocaleString()})`;
                  }
                  return `${label}`;
                }}
                formatter={(value, name, props) => {
                  return [`${value} ${props?.payload?.yLabel}`];
                }}
              />
              <Line type="monotone" dataKey="yValue" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MyChart;
