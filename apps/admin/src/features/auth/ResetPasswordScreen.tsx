import React, { useState } from 'react';
import { Shield, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../shared/api/auth';

interface ResetPasswordScreenProps {
  onSwitchToLogin: () => void;
}

export default function ResetPasswordScreen({ onSwitchToLogin }: ResetPasswordScreenProps) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
              Password reset
            </h2>
            <p className="mt-2 text-xs text-[#8b8b85] font-medium leading-relaxed">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="mt-6 w-full py-3 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-widest font-bold transition cursor-pointer"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight">
              Reset password
            </h2>
            <p className="mt-1 text-xs text-[#8b8b85] font-medium">
              Enter your reset token and new password
            </p>

            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium rounded-none">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token"
                  className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-hidden font-mono"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 pr-10 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-hidden"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#121212] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-hidden"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-widest font-bold transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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
