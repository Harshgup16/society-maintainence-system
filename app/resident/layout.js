import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function ResidentLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar role="resident" user={user} />
      
      {/* Main content — offset by sidebar width */}
      <main className="flex-1 lg:ml-[260px] p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
