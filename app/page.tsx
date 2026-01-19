import { Suspense } from 'react';
import { initializeData } from '@/lib/actions';
import { requireAuth } from '@/lib/auth';
import CRMDashboard from '@/components/CRMDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Require authentication - will redirect to /login if not authenticated
  await requireAuth();
  
  const data = await initializeData();

  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <CRMDashboard initialData={data} />
      </Suspense>
    </main>
  );
}
