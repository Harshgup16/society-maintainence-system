import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';
import { VALID_TRANSITIONS } from '@/lib/constants';
import { updateStatusSchema } from '@/lib/validations';
import { sendComplaintStatusEmail } from '@/lib/email';

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
    const { status: newStatus, note } = updateStatusSchema.parse(body);

    // Fetch existing complaint
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('*, profiles(full_name, id)')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) return apiError('Complaint not found', 404);

    const oldStatus = complaint.status;

    // Hard-enforced status transition check
    const allowed = VALID_TRANSITIONS[oldStatus] || [];
    if (!allowed.includes(newStatus)) {
      return apiError(`Invalid status transition from '${oldStatus}' to '${newStatus}'. Resolved complaints cannot be reopened.`, 400);
    }

    // Update complaint
    const updatePayload = { status: newStatus };
    if (newStatus === 'resolved') {
      updatePayload.resolved_at = new Date().toISOString();
      updatePayload.is_overdue = false;
    }

    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) return apiError(updateError.message, 500);

    // Audit log
    await supabase.from('complaint_history').insert({
      complaint_id: id,
      changed_by: user.id,
      old_status: oldStatus,
      new_status: newStatus,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
    });

    // Fetch resident user email from auth.users via admin client or auth user meta
    const { data: residentUserData } = await supabase.auth.admin?.getUserById?.(complaint.resident_id) || {};
    const residentEmail = residentUserData?.user?.email;

    if (residentEmail) {
      sendComplaintStatusEmail({
        residentEmail,
        residentName: complaint.profiles?.full_name || 'Resident',
        complaintId: id,
        category: complaint.category,
        oldStatus,
        newStatus,
        note,
      });
    }

    return apiResponse(updatedComplaint);
  } catch (err) {
    return apiError(err.errors ? err.errors[0].message : err.message, 400);
  }
}
