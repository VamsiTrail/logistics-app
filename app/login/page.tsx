import LoginForm from '@/components/LoginForm';
import { Package, CheckCircle2 } from 'lucide-react';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { registered?: string };
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Container Data Entry
              </h1>
            </div>
            <p className="text-gray-600">
              Sign in to access the logistics system
            </p>
          </div>

          {/* Success message if redirected from registration */}
          {searchParams?.registered === 'true' && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Account created successfully! Please sign in.</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

