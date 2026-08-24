'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/complaints/StatusBadge';
import PriorityBadge from '@/components/complaints/PriorityBadge';
import StatusTimeline from '@/components/complaints/StatusTimeline';
import PhotoGallery from '@/components/complaints/PhotoGallery';
import Loading from '@/components/layout/Loading';
import { formatDateTime, capitalize } from '@/lib/utils';

export default function ResidentComplaintDetailPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/complaints/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!data || !data.complaint) {
    return (
      <div className="py-20 text-center text-text-muted">
        Complaint not found.
      </div>
    );
  }

  const { complaint, history } = data;

  return (
    <div>
      <Header title={`Complaint #${complaint.id.slice(0, 8)}`}>
        <StatusBadge status={complaint.status} />
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main detail column (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-8 border border-border space-y-6">
            <div>
              <span className="input-label">Category</span>
              <p className="text-xl font-medium text-text-primary capitalize">
                {complaint.category?.replace('_', ' ')}
              </p>
            </div>

            <div>
              <span className="input-label">Description</span>
              <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
              <div>
                <span className="input-label">Priority</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <div>
                <span className="input-label">Submitted On</span>
                <p className="text-sm text-text-secondary">
                  {formatDateTime(complaint.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Photos section */}
          <div className="bg-white rounded-2xl p-8 border border-border">
            <h3 className="text-lg font-medium text-text-primary mb-4">Attached Photos</h3>
            <PhotoGallery complaintId={complaint.id} />
          </div>
        </div>

        {/* Audit history column (1 col) */}
        <div className="bg-white rounded-2xl p-8 border border-border h-fit">
          <h3 className="text-lg font-medium text-text-primary mb-6">Status Timeline</h3>
          <StatusTimeline history={history} />
        </div>
      </div>
    </div>
  );
}
