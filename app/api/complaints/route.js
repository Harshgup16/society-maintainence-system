import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';
import { createComplaintSchema } from '@/lib/validations';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return apiError('Unauthorized', 401);

  const { data, error } = await supabase
    .from('complaints')
    .select('*, profiles(full_name, apartment_no)')
    .eq('resident_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return apiError(error.message, 500);

  return apiResponse(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return apiError('Unauthorized', 401);

  try {
    const body = await request.json();
    const validated = createComplaintSchema.parse(body);

    const { data: complaint, error: createError } = await supabase
      .from('complaints')
      .insert({
        resident_id: user.id,
        category: validated.category,
        description: validated.description,
        status: 'open',
        priority: 'medium',
      })
      .select()
      .single();

    if (createError) return apiError(createError.message, 500);

    // Initial audit log
    await supabase.from('complaint_history').insert({
      complaint_id: complaint.id,
      changed_by: user.id,
      new_status: 'open',
      new_priority: 'medium',
      note: 'Complaint submitted by resident',
    });

    return apiResponse(complaint, 201);
  } catch (err) {
    return apiError(err.errors ? err.errors[0].message : err.message, 400);
  }
}
