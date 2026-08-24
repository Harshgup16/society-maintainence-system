// Complaint categories
export const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'structural', label: 'Structural' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'parking', label: 'Parking' },
  { value: 'security', label: 'Security' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
];

// Complaint statuses
export const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

// Complaint priorities
export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Valid status transitions
export const VALID_TRANSITIONS = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
  resolved: [], // Cannot transition from resolved
};

// Status colors (Tailwind classes)
export const STATUS_COLORS = {
  open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
};

// Priority colors
export const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  high: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
};

// Category icons (emoji for simplicity — can replace with SVGs)
export const CATEGORY_ICONS = {
  plumbing: '🔧',
  electrical: '⚡',
  structural: '🏗️',
  pest_control: '🐛',
  elevator: '🛗',
  parking: '🅿️',
  security: '🔒',
  cleaning: '🧹',
  other: '📋',
};

// Photo upload limits
export const PHOTO_LIMITS = {
  maxFiles: 3,
  maxSizeMB: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};
