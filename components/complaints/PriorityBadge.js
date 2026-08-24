import { PRIORITY_COLORS } from '@/lib/constants';
import { capitalize } from '@/lib/utils';

export default function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;

  return (
    <span className={`badge-pill ${colors.bg} ${colors.text} ${colors.border}`}>
      {capitalize(priority)}
    </span>
  );
}
