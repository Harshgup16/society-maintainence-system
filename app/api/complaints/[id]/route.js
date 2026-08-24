import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return apiError('Unauthorized', 401);

  // Fetch complaint with profile
  const { data: complaint, error } = await supabase
    .from('complaints')
    .select('*, profiles(full_name, apartment_no, phone)')
    .eq('id', id)
    .single();

  if (error || !complaint) return apiError('Complaint not found', 404);

  // Fetch history with profiles
  const { data: history } = await supabase
    .from('complaint_history')
    .select('*, changed_by_profile:profiles(full_name)')
    .eq('complaint_id', id)
    .order('created_at', { ascending: true });

  // Fetch photos & generate signed URLs
  const { data: photos } = await supabase
    .from('complaint_photos')
    .select('*')
    .eq('complaint_id', id);

  let signedPhotos = [];
  if (photos && photos.length > 0) {
    signedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const { data } = await supabase.storage
          .from('complaint-photos')
          .createSignedUrl(photo.storage_path, 3600);
        return { ...photo, signedUrl: data?.signedUrl };
      })
    );
  }

  return apiResponse({
    complaint,
    history: history || [],
    photos: signedPhotos.filter((p) => p.signedUrl),
  });
}
