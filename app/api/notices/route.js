import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';
import { createNoticeSchema } from '@/lib/validations';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notices')
    .select('*, profiles(full_name)')
    .order('is_important', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return apiError(error.message, 500);

  return apiResponse(data);
}

export async function POST(request) {
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
    const validated = createNoticeSchema.parse(body);

    const { data: notice, error: createError } = await supabase
      .from('notices')
      .insert({
        author_id: user.id,
        title: validated.title,
        content: validated.content,
        is_important: validated.is_important,
      })
      .select('*, profiles(full_name)')
      .single();

    if (createError) return apiError(createError.message, 500);

    return apiResponse(notice, 201);
  } catch (err) {
    return apiError(err.errors ? err.errors[0].message : err.message, 400);
  }
}
