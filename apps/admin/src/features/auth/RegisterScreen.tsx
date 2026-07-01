import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { register } from '../../shared/api/auth';

interface RegisterScreenProps {
  onAuth: (data: { token: string; user: any }) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onAuth, onSwitchToLogin }: RegisterScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('coach');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(email, password, firstName, lastName, role);
      onAuth(data);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#FBFBF9]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121212] items-center justify-center p-12">
        <div className="text-center">
          <Shield className="h-16 w-16 text-[#D43D2A] mx-auto mb-6" />
          <h1 className="text-4xl font-serif italic font-bold text-white tracking-tight">
            SSMP
          </h1>
          <p className="mt-3 text-sm text-[#8b8b85] font-sans max-w-xs mx-auto leading-relaxed">
            Create your account to access the Competition Management Portal
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-8 w-8 text-[#D43D2A]" />
            <h1 className="text-2xl font-serif italic font-bold text-[#121212]">SSMP</h1>
          </div>

          <h2 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight">
            Create account
          </h2>
          <p className="mt-1 text-xs text-[#8b8b85] font-medium">
            Fill in your details to get started
          </p>

          {error && (
            <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium rounded-none">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-hidden"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-hidden"
                  required
                />
              </div>
            </div>

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
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                Password
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
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] focus:border-[#121212] focus:outline-hidden cursor-pointer"
              >
                <option value="coach">Coach</option>
                <option value="official">Official (Referee)</option>
                <option value="media_officer">Media Officer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-widest font-bold transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8b8b85]">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-bold text-[#D43D2A] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
