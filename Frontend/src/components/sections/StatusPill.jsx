import { statusVariant } from '../../utils/dashboardData';

/** Small status pill that maps an appointment/invoice status to a badge tone. */
const StatusPill = ({ status }) => {
  const safeStatus = typeof status === 'string' ? status.trim() : '';
  const variant = safeStatus ? statusVariant[safeStatus] || 'gray' : 'gray';

  return <span className={`badge badge-${variant}`}>{safeStatus || 'Unknown'}</span>;
};

export default StatusPill;