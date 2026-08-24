import { createAdminClient } from '@/lib/supabase/admin';
import { apiResponse, apiError } from '@/lib/utils';
import { registerSchema } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return apiError('Server configuration missing: SUPABASE_SERVICE_ROLE_KEY is not set.', 500);
    }

    const supabaseAdmin = createAdminClient();

    // Create user via Admin API with email_confirm: true (auto-confirmed)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: validated.full_name,
        apartment_no: validated.apartment_no,
        phone: validated.phone,
      },
    });

    if (createError) {
      return apiError(createError.message, 400);
    }

    // Check if registering as admin with secret code ADMIN123
    const isTargetAdmin = body.admin_code === 'ADMIN123';
    if (isTargetAdmin) {
      await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: userData.user.id, role: 'admin' });
    }

    // Await custom welcome email via Resend to guarantee delivery
    await sendWelcomeEmail({
      residentEmail: validated.email,
      residentName: validated.full_name,
      apartmentNo: validated.apartment_no,
    });

    return apiResponse({
      user: userData.user,
      role: isTargetAdmin ? 'admin' : 'resident',
      message: 'Account created and welcome email sent successfully!',
    }, 201);
  } catch (err) {
    return apiError(err.errors ? err.errors[0].message : err.message, 400);
  }
}
