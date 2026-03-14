import { Chip } from '@mui/material';

const STATUS_MAP = {
  // MO statuses
  DRAFT: { label: 'Draft', color: 'default' },
  PLANNED: { label: 'Planned', color: 'info' },
  RELEASED: { label: 'Released', color: 'primary' },
  IN_PROGRESS: { label: 'In Progress', color: 'warning' },
  DONE: { label: 'Done', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'error' },
  AWAITING_MATERIALS: { label: 'Awaiting Materials', color: 'warning' },
  // WO statuses
  PENDING: { label: 'Pending', color: 'default' },
  ASSIGNED: { label: 'Assigned', color: 'info' },
  STARTED: { label: 'Started', color: 'warning' },
  PAUSED: { label: 'Paused', color: 'secondary' },
  BLOCKED: { label: 'Blocked', color: 'error' },
  COMPLETED: { label: 'Completed', color: 'success' },
  // Product types
  RAW: { label: 'Raw Material', color: 'info' },
  FINISHED: { label: 'Finished Good', color: 'success' },
  // Stock ledger
  INIT: { label: 'Initial', color: 'default' },
  IN: { label: 'Stock In', color: 'success' },
  OUT: { label: 'Stock Out', color: 'error' },
  ADJ: { label: 'Adjustment', color: 'warning' },
};

export default function StatusBadge({ status, size = 'small' }) {
  const cfg = STATUS_MAP[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size={size} />;
}
