'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    apartment_no: '',
    phone: '',
    admin_code: '',
  });
  const [showAdminField, setShowAdminField] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // 1. Register via server-side endpoint (uses Admin API, bypassing rate limits)
      let isRegistered = false;
      let targetRole = 'resident';

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const text = await res.text();
        let json = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch (_) {}

        if (res.ok && json && json.success) {
          isRegistered = true;
          targetRole = json.data?.role || 'resident';
        } else if (json && json.error) {
          throw new Error(json.error);
        }
      } catch (apiErr) {
        if (apiErr.message && !apiErr.message.includes('JSON')) {
          throw apiErr;
        }
      }

      // 2. Fallback client-side registration if server route was unavailable
      if (!isRegistered) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              apartment_no: formData.apartment_no,
              phone: formData.phone,
            },
          },
        });

        if (authError) throw authError;

        if (authData?.user?.identities?.length === 0) {
          throw new Error('An account with this email already exists');
        }
      }

      // 3. Automatically sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      setSuccess(true);

      const targetPath = targetRole === 'admin' ? '/admin/dashboard' : '/resident/dashboard';

      setTimeout(() => {
        router.push(targetPath);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md page-enter relative z-10 text-center">
          <div className="glass-card p-10 border border-white/80 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">
              Account Created!
            </h2>
            <p className="text-text-muted text-sm">Logging you in automatically...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md page-enter relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Society Portal
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-2">
            Create account
          </h1>
          <p className="text-text-muted text-sm">
            Register to raise complaints or manage society maintenance
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 border border-white/80 shadow-xl">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="input-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="input-editorial"
                placeholder="Harsh Gupta"
                required
              />
            </div>

            <div>
              <label className="input-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-editorial"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input-editorial"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label" htmlFor="reg-apartment">Apartment No.</label>
                <input
                  id="reg-apartment"
                  name="apartment_no"
                  type="text"
                  value={formData.apartment_no}
                  onChange={handleChange}
                  className="input-editorial"
                  placeholder="A-204"
                  required
                />
              </div>
              <div>
                <label className="input-label" htmlFor="reg-phone">Phone</label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-editorial"
                  placeholder="98xxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Optional Admin Code Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdminField(!showAdminField)}
                className="text-xs text-text-muted hover:text-text-primary underline cursor-pointer block font-medium"
              >
                {showAdminField ? '- Hide Admin Passcode' : '+ Register as Admin?'}
              </button>

              {showAdminField && (
                <div className="mt-3">
                  <label className="input-label" htmlFor="reg-admincode">Admin Secret Code</label>
                  <input
                    id="reg-admincode"
                    name="admin_code"
                    type="password"
                    value={formData.admin_code}
                    onChange={handleChange}
                    className="input-editorial bg-amber-50/40"
                    placeholder="Enter ADMIN123"
                  />
                  <p className="text-[11px] text-text-muted mt-1">Use <code>ADMIN123</code> to grant admin privileges.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-border-light">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link href="/login" className="text-text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-8 font-medium tracking-wide">
          SOCIETY MAINTENANCE TRACKER • PRODUCTION READY
        </p>
      </div>
    </div>
  );
}
