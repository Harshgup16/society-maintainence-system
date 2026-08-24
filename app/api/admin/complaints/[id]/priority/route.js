import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';
import { updatePrioritySchema } from '@/lib/validations';

export async function PATCH(request, { params }) {
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

  try {
    const body = await request.json();
    const { priority: newPriority, note } = updatePrioritySchema.parse(body);

    const { data: complaint } = await supabase
      .from('complaints')
      .select('priority')
      .eq('id', id)
      .single();

    const oldPriority = complaint?.priority;

    const { data: updated, error } = await supabase
      .from('complaints')
      .update({ priority: newPriority })
      .eq('id', id)
      .select()
      .single();

    if (error) return apiError(error.message, 500);

    // Audit log
    await supabase.from('complaint_history').insert({
      complaint_id: id,
      changed_by: user.id,
      old_priority: oldPriority,
      new_priority: newPriority,
      note: note || `Priority changed to ${newPriority}`,
    });

    return apiResponse(updated);
  } catch (err) {
    return apiError(err.errors ? err.errors[0].message : err.message, 400);
  }
}
