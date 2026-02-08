import LogisticsTable from '@/components/LogisticsTable';
import { Package, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { signOut } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null; // Middleware will redirect to login
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Container Data Entry
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Welcome, {session.user?.name || session.user?.email}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
          <p className="text-gray-600 mt-2">
            Enter missing Container_Id for logistics records
          </p>
        </div>

        {/* Main Content */}
        <LogisticsTable />
      </div>
    </main>
  );
}
