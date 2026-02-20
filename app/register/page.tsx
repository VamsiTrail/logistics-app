import RegisterForm from '@/components/RegisterForm';
import { Package } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const logoUrl = "https://www.vermeiren.com/web/web.nsf/VERMEIREN%20LOGO%202022%20RGB.png";
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {/*<Package className="w-10 h-10 text-blue-600" />*/}
              {/* Company Logo */}
              <img
                src={logoUrl}
                alt="Vermeiren Logo"
                className="h-16 w-auto object-contain"
              />
              <h1 className="text-3xl font-bold text-gray-900">
                Create Account
              </h1>
            </div>
            <p className="text-gray-600 ml-12">
              Vermeiren User Registration
            </p>
          </div>

          {/* Registration Form */}
          <RegisterForm />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}







