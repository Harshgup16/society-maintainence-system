'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import NoticeCard from '@/components/notices/NoticeCard';
import Loading from '@/components/layout/Loading';

export default function ResidentNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setNotices(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header title="Notice Board" count={notices.length} />

      {loading ? (
        <Loading />
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-border">
          <p className="text-text-muted">No notices posted yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
}
