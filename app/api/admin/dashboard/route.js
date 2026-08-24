import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError, capitalize } from '@/lib/utils';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return apiError('Unauthorized', 401);

  // Check admin
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleData?.role !== 'admin') return apiError('Forbidden', 403);

  // Overdue update
  await supabase.rpc('check_overdue_complaints');

  const { data: complaints, error } = await supabase
    .from('complaints')
    .select('id, status, category, priority, is_overdue, created_at, resolved_at');

  if (error) return apiError(error.message, 500);

  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const overdueCount = complaints.filter((c) => c.is_overdue && c.status !== 'resolved').length;

  // Status breakdown chart data
  const statusChartData = [
    { name: 'Open', count: openCount },
    { name: 'In Progress', count: inProgressCount },
    { name: 'Resolved', count: resolvedCount },
  ];

  // Category breakdown chart data
  const categoryMap = {};
  complaints.forEach((c) => {
    const catLabel = capitalize(c.category?.replace('_', ' '));
    categoryMap[catLabel] = (categoryMap[catLabel] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return apiResponse({
    metrics: {
      total,
      open: openCount,
      in_progress: inProgressCount,
      resolved: resolvedCount,
      overdue: overdueCount,
    },
    statusChartData,
    categoryChartData,
  });
}
