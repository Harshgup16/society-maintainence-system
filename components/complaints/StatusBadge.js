import { STATUS_COLORS } from '@/lib/constants';
import { formatStatus } from '@/lib/utils';

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.open;

  return (
    <span className={`badge-pill ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
      {formatStatus(status)}
    </span>
  );
}
