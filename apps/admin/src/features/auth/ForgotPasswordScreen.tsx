import React, { useState } from 'react';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../../shared/api/auth';

interface ForgotPasswordScreenProps {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordScreen({ onSwitchToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      setSuccess(true);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#FBFBF9] items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-[#D43D2A]" />
          <h1 className="text-2xl font-serif italic font-bold text-[#121212]">SSMP</h1>
        </div>

        {success ? (
          <>
            <CheckCircle className="h-10 w-10 text-green-600 mb-4" />
            <h2 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight">
              Check your email
            </h2>
            <p className="mt-2 text-xs text-[#8b8b85] font-medium leading-relaxed">
              If an account exists with <strong>{email}</strong>, a password reset link has been sent.
            </p>
            {resetToken && (
              <div className="mt-4 bg-amber-50 border border-amber-200 p-3 text-xs">
                <p className="font-bold text-amber-700 mb-1">Dev Mode — Reset Token:</p>
                <code className="text-amber-800 break-all">{resetToken}</code>
                <p className="text-amber-600 mt-1">Use this token in the reset password form.</p>
              </div>
            )}
            <button
              onClick={onSwitchToLogin}
              className="mt-6 flex items-center gap-2 text-xs font-bold text-[#D43D2A] hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight">
              Forgot password?
            </h2>
            <p className="mt-1 text-xs text-[#8b8b85] font-medium">
              Enter your email and we'll send you a reset link
            </p>

            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium rounded-none">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-hidden"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-widest font-bold transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <button
              onClick={onSwitchToLogin}
              className="mt-6 flex items-center gap-2 text-xs font-bold text-[#D43D2A] hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
