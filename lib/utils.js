/**
 * Format a date string to a human-readable format
 * @param {string} dateStr - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format status string for display (e.g., "in_progress" → "In Progress")
 */
export function formatStatus(status) {
  if (!status) return '';
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Create a consistent API response
 */
export function apiResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

/**
 * Create a consistent API error response
 */
export function apiError(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Get the user role from Supabase session
 */
export function getUserRole(session) {
  return session?.user?.app_metadata?.user_role || 
         session?.user?.user_metadata?.user_role || 
         'resident';
}

/**
 * Truncate text to a max length
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
