'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import ComplaintFilters from '@/components/complaints/ComplaintFilters';
import Loading from '@/components/layout/Loading';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: 'newest' });

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.priority) queryParams.set('priority', filters.priority);
      if (filters.sort) queryParams.set('sort', filters.sort);

      const res = await fetch(`/api/admin/complaints?${queryParams.toString()}`);
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

  return (
    <div>
      <Header title="All Complaints" count={complaints.length} />

      <ComplaintFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <Loading />
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-border">
          <p className="text-text-muted">No complaints match the selected criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} basePath="/admin/complaints" />
          ))}
        </div>
      )}
    </div>
  );
}
