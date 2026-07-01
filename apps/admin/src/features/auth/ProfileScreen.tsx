import React, { useState, useEffect } from 'react';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMe, updateProfile, changePassword, AuthUser } from '../../shared/api/auth';

interface ProfileScreenProps {
  currentUser: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
}

export default function ProfileScreen({ currentUser, onUserUpdated }: ProfileScreenProps) {
  const [firstName, setFirstName] = useState(currentUser.firstName || '');
  const [lastName, setLastName] = useState(currentUser.lastName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileLoading(true);
    try {
      const result = await updateProfile(firstName, lastName);
      onUserUpdated({ ...currentUser, firstName: result.user.firstName, lastName: result.user.lastName });
      setProfileMsg('Profile updated successfully');
    } catch (err: any) {
      setProfileErr(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordMsg('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordErr(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight flex items-center gap-2">
          <User className="h-5 w-5 text-[#D43D2A]" />
          My Profile
        </h1>
        <p className="text-xs text-[#8b8b85] mt-1 font-medium">
          Manage your account settings
        </p>
      </div>

      {/* Account Info */}
      <div className="border border-[#E5E5E1] bg-white p-6 rounded-none">
        <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-3 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold">Email</span>
            <p className="mt-1 font-medium text-[#121212]">{currentUser.email}</p>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold">Role</span>
            <p className="mt-1 font-medium text-[#121212] capitalize">{currentUser.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="border border-[#E5E5E1] bg-white p-6 rounded-none">
        <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-3 mb-4">
          Edit Profile
        </h3>

        {profileMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-xs font-medium flex items-center gap-2 rounded-none">
            <CheckCircle className="h-4 w-4" /> {profileMsg}
          </div>
        )}
        {profileErr && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium flex items-center gap-2 rounded-none">
            <AlertCircle className="h-4 w-4" /> {profileErr}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] focus:border-[#121212] focus:outline-hidden"
                required
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
                className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] focus:border-[#121212] focus:outline-hidden"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-widest font-bold transition cursor-pointer disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="border border-[#E5E5E1] bg-white p-6 rounded-none">
        <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-3 mb-4 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" /> Change Password
        </h3>

        {passwordMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-xs font-medium flex items-center gap-2 rounded-none">
            <CheckCircle className="h-4 w-4" /> {passwordMsg}
          </div>
        )}
        {passwordErr && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium flex items-center gap-2 rounded-none">
            <AlertCircle className="h-4 w-4" /> {passwordErr}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] focus:border-[#121212] focus:outline-hidden"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] focus:border-[#121212] focus:outline-hidden"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-none border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs text-[#121212] focus:border-[#121212] focus:outline-hidden"
                required
                minLength={8}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-widest font-bold transition cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
