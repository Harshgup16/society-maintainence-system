'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { timeAgo, truncate, capitalize } from '@/lib/utils';

export default function ComplaintCard({ complaint, basePath = '/resident/complaints' }) {
  const isOverdue = complaint.is_overdue && complaint.status !== 'resolved';
  const categoryLabel = capitalize(complaint.category?.replace('_', ' '));

  return (
    <Link href={`${basePath}/${complaint.id}`} className="block">
      <div className={`akaru-row group ${isOverdue ? 'border-l-4 border-l-status-overdue' : ''}`}>
        {/* Hover background */}
        <div 
          className="akaru-row-bg" 
          style={{ backgroundColor: isOverdue ? 'var(--color-status-overdue)' : 'var(--color-accent)' }} 
        />

        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          {/* Main info */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 md:mb-0">
              <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted group-hover:text-white/80">
                {categoryLabel}
              </span>
              {isOverdue && (
                <span className="text-[10px] font-bold tracking-widest uppercase text-status-overdue bg-red-50 px-1.5 py-0.5 rounded group-hover:bg-white/20 group-hover:text-white">
                  OVERDUE
                </span>
              )}
              {complaint.created_at && (
                <span className="text-xs text-text-muted group-hover:text-white/70 ml-auto md:ml-0 md:hidden">
                  {timeAgo(complaint.created_at)}
                </span>
              )}
            </div>

            <h3 className="text-base md:text-xl font-medium truncate text-text-primary group-hover:text-white">
              {truncate(complaint.description, 55)}
            </h3>

            {complaint.profiles?.apartment_no && (
              <p className="text-xs text-text-muted group-hover:text-white/70 mt-0.5 md:hidden">
                Apt {complaint.profiles.apartment_no} • {complaint.profiles.full_name}
              </p>
            )}
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 mt-1 md:mt-0 pt-2 md:pt-0 border-t border-border-light/60 md:border-none">
            <div className="flex items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <div className="akaru-arrow !opacity-100 md:!opacity-0 md:group-hover:!opacity-100">
              <svg width="12" height="12" viewBox="0 0 19 19" fill="currentColor">
                <path d="M0.292893 17.2929C-0.0976311 17.6834 -0.0976311 18.3166 0.292893 18.7071C0.683418 19.0976 1.31658 19.0976 1.70711 18.7071L0.292893 17.2929ZM18.9706 1.02944C18.9706 0.477153 18.5228 0.0294373 17.9706 0.029437L8.97056 0.0294378C8.41828 0.0294375 7.97056 0.477153 7.97056 1.02944C7.97056 1.58172 8.41828 2.02944 8.97056 2.02944L16.9706 2.02944L16.9706 10.0294C16.9706 10.5817 17.4183 11.0294 17.9706 11.0294C18.5228 11.0294 18.9706 10.5817 18.9706 10.0294L18.9706 1.02944ZM1.70711 18.7071L18.6777 1.73654L17.2635 0.322331L0.292893 17.2929L1.70711 18.7071Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
