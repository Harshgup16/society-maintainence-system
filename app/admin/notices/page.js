'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import NoticeForm from '@/components/notices/NoticeForm';
import NoticeCard from '@/components/notices/NoticeCard';
import Loading from '@/components/layout/Loading';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const json = await res.json();
      if (json.success) setNotices(json.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (noticeData) => {
    setPublishing(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeData),
      });
      const json = await res.json();
      if (json.success) {
        fetchNotices();
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      const res = await fetch(`/api/notices/${noticeId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setNotices((prev) => prev.filter((n) => n.id !== noticeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <Header title="Manage Notices" count={notices.length} />

      <NoticeForm onSubmit={handleCreateNotice} loading={publishing} />

      <div>
        <h3 className="input-label mb-4">Published Notices</h3>
        {loading ? (
          <Loading />
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-border">
            <p className="text-text-muted">No notices published yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                isAdmin={true}
                onDelete={handleDeleteNotice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
