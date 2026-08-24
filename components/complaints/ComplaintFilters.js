'use client';

import { CATEGORIES, STATUSES, PRIORITIES } from '@/lib/constants';

export default function ComplaintFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Category filter */}
      <select
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
        className="px-4 py-2 rounded-full border border-border bg-white text-sm text-text-primary cursor-pointer hover:border-text-muted transition-colors"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        className="px-4 py-2 rounded-full border border-border bg-white text-sm text-text-primary cursor-pointer hover:border-text-muted transition-colors"
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
        className="px-4 py-2 rounded-full border border-border bg-white text-sm text-text-primary cursor-pointer hover:border-text-muted transition-colors"
      >
        <option value="">All Priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort || 'newest'}
        onChange={(e) => handleChange('sort', e.target.value)}
        className="px-4 py-2 rounded-full border border-border bg-white text-sm text-text-primary cursor-pointer hover:border-text-muted transition-colors"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="overdue">Overdue First</option>
        <option value="priority">High Priority First</option>
      </select>

      {/* Clear filters */}
      {(filters.category || filters.status || filters.priority) && (
        <button
          onClick={() => onChange({ sort: filters.sort })}
          className="px-4 py-2 rounded-full text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
