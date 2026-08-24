'use client';

import { formatDateTime } from '@/lib/utils';

export default function NoticeCard({ notice, isAdmin = false, onDelete }) {
  return (
    <div className={`bg-white rounded-xl p-6 border transition-all ${notice.is_important ? 'border-status-overdue shadow-sm' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          {notice.is_important && (
            <span className="bg-status-overdue text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Important
            </span>
          )}
          <h3 className="text-xl font-medium text-text-primary">
            {notice.title}
          </h3>
        </div>

        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(notice.id)}
            className="text-text-muted hover:text-status-overdue text-xs transition-colors p-1"
            title="Delete Notice"
          >
            Delete
          </button>
        )}
      </div>

      <p className="text-text-secondary text-sm whitespace-pre-wrap leading-relaxed mb-4">
        {notice.content}
      </p>

      <div className="flex items-center justify-between text-xs text-text-muted border-t border-border-light pt-3">
        <span>
          Posted by {notice.profiles?.full_name || 'Society Admin'}
        </span>
        <span>{formatDateTime(notice.created_at)}</span>
      </div>
    </div>
  );
}
