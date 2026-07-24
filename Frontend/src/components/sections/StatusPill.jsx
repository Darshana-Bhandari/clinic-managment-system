import React from 'react';
import { statusVariant } from '../../utils/dashboardData';

/** Small status pill that maps an appointment/invoice status to a badge tone. */
const StatusPill = ({ status }) => (
  <span className={`badge badge-${statusVariant[status] || 'gray'}`}>{status}</span>
);

export default StatusPill;