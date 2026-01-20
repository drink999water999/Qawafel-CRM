import { Suspense } from 'react';
import { initializeData } from '@/lib/actions';
import { getSignupRequests, getUsers } from '@/lib/adminActions';
import { requireAuth, getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CRMDashboard from '@/components/CRMDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Require authentication - will redirect to /login if not authenticated
  await requireAuth();
  
  const session = await getSession();
  const data = await initializeData();

  // Load signup requests and users for admins
  let signupRequests: Awaited<ReturnType<typeof getSignupRequests>> = [];
  let users: Awaited<ReturnType<typeof getUsers>> = [];
  
  // Get provider info
  let userProvider = 'credentials';
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { provider: true },
    });
    userProvider = user?.provider || 'credentials';
  }
  
  if (session?.role === 'admin') {
    try {
      signupRequests = await getSignupRequests();
      users = await getUsers();
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }

  const fullData = {
    ...data,
    signupRequests,
    users,
    userRole: session?.role,
    userName: session?.name,
    userEmail: session?.email,
    userImage: session?.image,
    userProvider,
  };

  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <CRMDashboard initialData={fullData} />
      </Suspense>
    </main>
  );
}
