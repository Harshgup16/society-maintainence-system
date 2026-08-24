'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import StatusChart from '@/components/dashboard/StatusChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import Loading from '@/components/layout/Loading';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8">
      <Header title="Admin Dashboard">
        <Link href="/admin/complaints" className="btn-primary text-sm">
          View All Complaints
        </Link>
      </Header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={metrics.total} />
        <StatCard label="Open" value={metrics.open} color="text-status-open" />
        <StatCard label="In Progress" value={metrics.in_progress} color="text-status-progress" />
        <StatCard label="Resolved" value={metrics.resolved} color="text-status-resolved" />
        <StatCard label="Overdue" value={metrics.overdue} color="text-status-overdue" highlight={metrics.overdue > 0} />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-border">
          <h3 className="input-label mb-4">Status Breakdown</h3>
          <StatusChart data={data?.statusChartData} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border">
          <h3 className="input-label mb-4">Category Distribution</h3>
          <CategoryChart data={data?.categoryChartData} />
        </div>
      </div>
    </div>
  );
}
