import { formatDateTime, formatStatus, capitalize } from '@/lib/utils';

export default function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        No history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, index) => {
        const dotColor = getDotColor(entry.new_status);

        return (
          <div key={entry.id} className="timeline-item" style={{ animationDelay: `${index * 50}ms` }}>
            <div className={`timeline-dot ${dotColor}`} />
            
            <div>
              <p className="text-xs text-text-muted mb-1">
                {formatDateTime(entry.created_at)}
              </p>

              {/* Status change */}
              {entry.old_status !== entry.new_status && entry.new_status && (
                <p className="text-sm font-medium text-text-primary">
                  {entry.old_status ? (
                    <>
                      {formatStatus(entry.old_status)} → {formatStatus(entry.new_status)}
                    </>
                  ) : (
                    <>Complaint created — {formatStatus(entry.new_status)}</>
                  )}
                </p>
              )}

              {/* Priority change */}
              {entry.old_priority !== entry.new_priority && entry.new_priority && (
                <p className="text-sm text-text-secondary">
                  Priority: {entry.old_priority ? (
                    <>{capitalize(entry.old_priority)} → {capitalize(entry.new_priority)}</>
                  ) : (
                    <>Set to {capitalize(entry.new_priority)}</>
                  )}
                </p>
              )}

              {/* Note */}
              {entry.note && (
                <p className="text-sm text-text-secondary mt-1 italic">
                  "{entry.note}"
                </p>
              )}

              {/* Changed by */}
              {entry.changed_by_profile && (
                <p className="text-xs text-text-muted mt-1">
                  by {entry.changed_by_profile.full_name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getDotColor(status) {
  switch (status) {
    case 'open': return 'bg-status-open';
    case 'in_progress': return 'bg-status-progress';
    case 'resolved': return 'bg-status-resolved';
    default: return 'bg-text-muted';
  }
}
