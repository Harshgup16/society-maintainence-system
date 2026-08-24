import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return apiError('Unauthorized', 401);

  // Check admin role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleData?.role !== 'admin') return apiError('Forbidden', 403);

  // Trigger background overdue check
  await supabase.rpc('check_overdue_complaints');

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const sort = searchParams.get('sort') || 'newest';

  let query = supabase
    .from('complaints')
    .select('*, profiles(full_name, apartment_no, phone)');

  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);

  if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sort === 'overdue') {
    query = query.order('is_overdue', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'priority') {
    // Note: Priority enum ordering
    query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) return apiError(error.message, 500);

  return apiResponse(data);
}
