'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Loading from '@/components/layout/Loading';

export default function AdminSettingsPage() {
  const [thresholdDays, setThresholdDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.overdue_threshold_days) {
          setThresholdDays(json.data.overdue_threshold_days);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdue_threshold_days: thresholdDays }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage('Settings saved successfully and overdue status updated.');
      } else {
        setMessage(json.error || 'Failed to save settings');
      }
    } catch (err) {
      setMessage('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Header title="Settings" />

      <div className="bg-white rounded-2xl p-8 border border-border max-w-2xl space-y-6">
        <h3 className="text-xl font-medium text-text-primary">SLA & Overdue Configuration</h3>

        {message && (
          <div className={`p-4 rounded-xl text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="input-label" htmlFor="threshold-days">Overdue Threshold (Days)</label>
            <input
              id="threshold-days"
              type="number"
              min="1"
              max="90"
              value={thresholdDays}
              onChange={(e) => setThresholdDays(parseInt(e.target.value, 10) || 7)}
              className="input-editorial max-w-xs"
              required
            />
            <p className="text-xs text-text-muted mt-2">
              Complaints open for longer than this number of days will be flagged as <strong>OVERDUE</strong> on the admin and resident dashboards.
            </p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
