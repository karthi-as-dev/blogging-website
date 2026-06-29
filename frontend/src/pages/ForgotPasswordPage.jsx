import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Loader, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      // In dev mode the backend returns the reset URL directly
      if (res.data.resetUrl) setResetUrl(res.data.resetUrl);
      toast.success('Reset link generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password – Inkwell</title></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8 shadow-xl">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors">
            <ArrowLeft size={15} /> Back to sign in
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot your password?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
                ✅ A password reset link has been generated.
              </div>
              {resetUrl && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Development mode — use this link to reset your password:
                  </p>
                  <a href={resetUrl}
                    className="text-xs text-primary-600 dark:text-primary-400 break-all hover:underline">
                    {resetUrl}
                  </a>
                </div>
              )}
              <Link to="/login" className="btn-primary w-full justify-center block text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input-field pl-9" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <><Loader size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </>
  );
}
