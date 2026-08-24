import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';

export async function DELETE(request, { params }) {
  const { id } = await params;
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

  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id);

  if (error) return apiError(error.message, 500);

  return apiResponse({ message: 'Notice deleted successfully' });
}
