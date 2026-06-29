import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 – Page Not Found – Inkwell</title></Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-9xl font-black text-gray-100 dark:text-gray-800 select-none">404</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white -mt-4 mb-3">Page not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => window.history.back()} className="btn-outline flex items-center gap-2">
              <ArrowLeft size={16} /> Go Back
            </button>
            <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
              <Home size={16} /> Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
