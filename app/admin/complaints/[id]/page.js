'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/complaints/StatusBadge';
import PriorityBadge from '@/components/complaints/PriorityBadge';
import StatusTimeline from '@/components/complaints/StatusTimeline';
import PhotoGallery from '@/components/complaints/PhotoGallery';
import Loading from '@/components/layout/Loading';
import { formatDateTime, capitalize } from '@/lib/utils';
import { STATUSES, PRIORITIES, VALID_TRANSITIONS } from '@/lib/constants';

export default function AdminComplaintDetailPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/complaints/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setStatus(json.data.complaint.status);
        setPriority(json.data.complaint.priority);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setUpdatingStatus(true);

    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status');

      setNote('');
      fetchComplaint();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setUpdatingPriority(true);

    try {
      const res = await fetch(`/api/admin/complaints/${id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority, note }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update priority');

      setNote('');
      fetchComplaint();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingPriority(false);
    }
  };

  if (loading) return <Loading />;
  if (!data || !data.complaint) return <div className="py-20 text-center text-text-muted">Complaint not found.</div>;

  const { complaint, history } = data;
  const currentStatus = complaint.status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

  return (
    <div>
      <Header title={`Complaint #${complaint.id.slice(0, 8)}`}>
        <div className="flex items-center gap-2">
          {complaint.is_overdue && complaint.status !== 'resolved' && (
            <span className="bg-status-overdue text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Overdue
            </span>
          )}
          <StatusBadge status={complaint.status} />
        </div>
      </Header>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Admin Workflow Control Panel */}
          <div className="bg-white rounded-2xl p-8 border border-border space-y-6">
            <h3 className="text-xl font-medium text-text-primary">Admin Control Panel</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="input-label" htmlFor="admin-status-select">Update Status</label>
                  <select
                    id="admin-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={currentStatus === 'resolved'}
                    className="input-editorial cursor-pointer"
                  >
                    <option value={currentStatus}>{capitalize(currentStatus.replace('_', ' '))} (Current)</option>
                    {allowedTransitions.map((s) => (
                      <option key={s} value={s}>{capitalize(s.replace('_', ' '))}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus || status === currentStatus || currentStatus === 'resolved'}
                  className="btn-primary text-xs py-2 px-6"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </form>

              {/* Priority Update Form */}
              <form onSubmit={handlePriorityUpdate} className="space-y-4">
                <div>
                  <label className="input-label" htmlFor="admin-priority-select">Set Priority</label>
                  <select
                    id="admin-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input-editorial cursor-pointer"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updatingPriority || priority === complaint.priority}
                  className="btn-secondary text-xs py-2 px-6"
                >
                  {updatingPriority ? 'Updating...' : 'Save Priority'}
                </button>
              </form>
            </div>

            {/* Note input for audit */}
            <div>
              <label className="input-label" htmlFor="admin-note-input">Audit Note (Optional)</label>
              <input
                id="admin-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-editorial"
                placeholder="Reason for change or update sent to resident..."
              />
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-2xl p-8 border border-border space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="input-label">Resident Name</span>
                <p className="text-base font-medium text-text-primary">{complaint.profiles?.full_name}</p>
              </div>
              <div>
                <span className="input-label">Apartment No.</span>
                <p className="text-base font-medium text-text-primary">Apt {complaint.profiles?.apartment_no}</p>
              </div>
            </div>

            <div>
              <span className="input-label">Category</span>
              <p className="text-lg font-medium text-text-primary capitalize">{complaint.category?.replace('_', ' ')}</p>
            </div>

            <div>
              <span className="input-label">Description</span>
              <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white rounded-2xl p-8 border border-border">
            <h3 className="text-lg font-medium text-text-primary mb-4">Attached Photos</h3>
            <PhotoGallery complaintId={complaint.id} />
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="bg-white rounded-2xl p-8 border border-border h-fit">
          <h3 className="text-lg font-medium text-text-primary mb-6">Status Audit History</h3>
          <StatusTimeline history={history} />
        </div>
      </div>
    </div>
  );
}
