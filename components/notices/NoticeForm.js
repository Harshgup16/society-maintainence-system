'use client';

import { useState } from 'react';

export default function NoticeForm({ onSubmit, loading = false }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setError('');
    onSubmit({ title, content, is_important: isImportant });
    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-border space-y-6">
      <h3 className="text-xl font-medium text-text-primary">Publish New Notice</h3>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="input-label" htmlFor="notice-title">Notice Title *</label>
        <input
          id="notice-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-editorial"
          placeholder="e.g. Scheduled Water Maintenance on Sunday"
          required
        />
      </div>

      <div>
        <label className="input-label" htmlFor="notice-content">Notice Content *</label>
        <textarea
          id="notice-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-editorial min-h-[140px] resize-y"
          placeholder="Provide complete information for residents..."
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is-important"
          type="checkbox"
          checked={isImportant}
          onChange={(e) => setIsImportant(e.target.checked)}
          className="w-4 h-4 text-text-primary border-border rounded cursor-pointer"
        />
        <label htmlFor="is-important" className="text-sm font-medium text-text-primary cursor-pointer">
          Mark as Important (Sends email notification to residents)
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Publishing...' : 'Publish Notice'}
      </button>
    </form>
  );
}
