import * as S from './Recommendations.module.scss';
import { reportAtom } from '../../state/atoms.js';
import { useRecoilValue } from 'recoil';
import Calculated, { getStatus } from '../Calculated/Calculated.jsx';

const Recommendations = () => {
  const reportData = useRecoilValue(reportAtom);
  const calculated = reportData?.calculated;
  console.log(reportData);
  return (
    <div className={S.wrapper}>
      <div>
        <b>Рекомендації:</b>
      </div>
      <div>
        {calculated.map((x) => {
          const r = getStatus(x.calculatedValue, x.name);
          if (x.calculatedValue) {
            return (
              <div key={x.system.name} className={S.text}>
                {x.system.name} -{' '}
                <span className={S.statusText + ' ' + r.statusClass}>
                  {r.statusText}
                </span>
                {!r.good && (
                  <div className={S.helpText}>
                    <i>Переглянте рекомендації для покращення показника</i>
                    <br />
                    <b>{x.system.improvement_program}</b> -{' '}
                    {x.system.improvements.map((y) => y.name).join(', ')}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={x.system.name} className={S.text}>
              {x.system.name} - Немає інформації
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;
