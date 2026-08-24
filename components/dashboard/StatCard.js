export default function StatCard({ label, value, subtext, highlight = false, color }) {
  return (
    <div className={`stat-card ${highlight ? 'border-status-overdue bg-red-50/20' : ''}`}>
      <span className="input-label mb-2 block">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-semibold tracking-tight ${color || 'text-text-primary'}`}>
          {value ?? 0}
        </span>
      </div>
      {subtext && (
        <p className="text-xs text-text-muted mt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
