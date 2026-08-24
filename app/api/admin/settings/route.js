import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('key', 'overdue_threshold_days')
    .single();

  if (error && error.code !== 'PGRST116') return apiError(error.message, 500);

  return apiResponse({
    overdue_threshold_days: data ? parseInt(data.value, 10) : 7,
  });
}

export async function PATCH(request) {
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

  try {
    const { overdue_threshold_days } = await request.json();
    const numDays = parseInt(overdue_threshold_days, 10);

    if (isNaN(numDays) || numDays < 1 || numDays > 90) {
      return apiError('Overdue threshold must be between 1 and 90 days', 400);
    }

    const { data, error } = await supabase
      .from('app_settings')
      .upsert({ key: 'overdue_threshold_days', value: numDays.toString() })
      .select()
      .single();

    if (error) return apiError(error.message, 500);

    // Recalculate overdue status immediately
    await supabase.rpc('check_overdue_complaints');

    return apiResponse({ overdue_threshold_days: numDays });
  } catch (err) {
    return apiError(err.message, 400);
  }
}
