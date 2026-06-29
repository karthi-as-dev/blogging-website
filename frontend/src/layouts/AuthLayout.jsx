import { Outlet, Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <PenLine size={16} className="text-white" />
          </div>
          Inkwell
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
