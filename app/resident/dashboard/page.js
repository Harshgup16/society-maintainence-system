'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import ComplaintFilters from '@/components/complaints/ComplaintFilters';
import Loading from '@/components/layout/Loading';
import Link from 'next/link';

export default function ResidentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: 'newest' });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      const json = await res.json();
      if (json.success) {
        setComplaints(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints
    .filter((c) => {
      if (filters.category && c.category !== filters.category) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.priority && c.priority !== filters.priority) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div>
      <Header title="My Complaints" count={filteredComplaints.length}>
        <Link href="/resident/complaints/new" className="btn-primary text-sm">
          + New Complaint
        </Link>
      </Header>

      <ComplaintFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <Loading />
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-border mt-6">
          <p className="text-text-muted text-base mb-4">
            No complaints found.
          </p>
          <Link href="/resident/complaints/new" className="btn-primary">
            Raise First Complaint
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} basePath="/resident/complaints" />
          ))}
        </div>
      )}
    </div>
  );
}
