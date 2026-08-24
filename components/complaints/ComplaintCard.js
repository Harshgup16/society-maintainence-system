'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { CATEGORY_ICONS } from '@/lib/constants';
import { timeAgo, truncate, formatStatus, capitalize } from '@/lib/utils';

export default function ComplaintCard({ complaint, basePath = '/resident/complaints' }) {
  const isOverdue = complaint.is_overdue && complaint.status !== 'resolved';
  const categoryLabel = capitalize(complaint.category?.replace('_', ' '));

  return (
    <Link href={`${basePath}/${complaint.id}`}>
      <div className={`akaru-row group ${isOverdue ? 'border-l-2 border-l-status-overdue' : ''}`}>
        {/* Hover background */}
        <div 
          className="akaru-row-bg" 
          style={{ backgroundColor: isOverdue ? 'var(--color-status-overdue)' : 'var(--color-accent)' }} 
        />

        {/* Title (30%) */}
        <div className="w-full md:w-[30%] min-w-0 pr-4">
          <h3 className="text-lg md:text-xl font-medium truncate">
            {truncate(complaint.description, 40)}
          </h3>
        </div>

        {/* Description (30%) */}
        <div className="hidden md:block w-[25%] min-w-0 pr-4">
          <p className="text-sm text-text-secondary group-hover:text-white/80 truncate">
            {complaint.profiles?.apartment_no && `Apt ${complaint.profiles.apartment_no} · `}
            {truncate(complaint.description, 50)}
          </p>
        </div>

        {/* Category & Status (25%) */}
        <div className="hidden md:flex w-[25%] items-center gap-3">
          <span className="text-[11px] font-medium tracking-widest uppercase text-text-muted group-hover:text-white/70">
            {categoryLabel}
          </span>
          {isOverdue && (
            <span className="text-[11px] font-medium tracking-widest uppercase text-status-overdue group-hover:text-white">
              / Overdue
            </span>
          )}
        </div>

        {/* Status + Priority badges (20%) */}
        <div className="flex items-center gap-2 ml-auto">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>

        {/* Arrow button */}
        <div className="akaru-arrow">
          <svg width="14" height="14" viewBox="0 0 19 19" fill="currentColor">
            <path d="M0.292893 17.2929C-0.0976311 17.6834 -0.0976311 18.3166 0.292893 18.7071C0.683418 19.0976 1.31658 19.0976 1.70711 18.7071L0.292893 17.2929ZM18.9706 1.02944C18.9706 0.477153 18.5228 0.0294373 17.9706 0.029437L8.97056 0.0294378C8.41828 0.0294375 7.97056 0.477153 7.97056 1.02944C7.97056 1.58172 8.41828 2.02944 8.97056 2.02944L16.9706 2.02944L16.9706 10.0294C16.9706 10.5817 17.4183 11.0294 17.9706 11.0294C18.5228 11.0294 18.9706 10.5817 18.9706 10.0294L18.9706 1.02944ZM1.70711 18.7071L18.6777 1.73654L17.2635 0.322331L0.292893 17.2929L1.70711 18.7071Z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
