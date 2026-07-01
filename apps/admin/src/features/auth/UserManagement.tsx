import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import { listUsers, updateUser, deactivateUser, UserData } from '../../shared/api/userApi';

const ROLES = [
  { value: 'system_admin', label: 'System Admin' },
  { value: 'comp_admin', label: 'Competition Admin' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'ref_coordinator', label: 'Referee Coordinator' },
  { value: 'media_officer', label: 'Media Officer' },
  { value: 'official', label: 'Official' },
  { value: 'coach', label: 'Coach' },
];

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers({ search: search || undefined, role: roleFilter || undefined });
      setUsers(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMsg('');
    setError('');
    try {
      await updateUser(userId, { role: newRole });
      setMsg('Role updated successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setMsg('');
    setError('');
    try {
      await updateUser(userId, { isActive });
      setMsg(isActive ? 'User activated' : 'User deactivated');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E5E1] pb-6">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-[#D43D2A]" />
            User Management
          </h1>
          <p className="text-xs text-[#8b8b85] mt-1 font-medium">
            Manage user accounts, roles, and access
          </p>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-xs font-medium flex items-center gap-2 rounded-none">
          <CheckCircle className="h-4 w-4" /> {msg}
          <button onClick={() => setMsg('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium flex items-center gap-2 rounded-none">
          <AlertCircle className="h-4 w-4" /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="border border-[#E5E5E1] bg-[#FBFBF9] p-5 rounded-none space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8b85]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-none border border-[#E5E5E1] bg-white pl-10 pr-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#8b8b85]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-none border border-[#E5E5E1] bg-white p-2.5 text-xs focus:border-[#121212] focus:outline-hidden cursor-pointer"
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="border border-[#E5E5E1] bg-white rounded-none overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#E5E5E1] bg-[#FBFBF9]">
              <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-[#8b8b85]">User</th>
              <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-[#8b8b85]">Role</th>
              <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-[#8b8b85]">Status</th>
              <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-[#8b8b85]">Last Login</th>
              <th className="text-right px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-[#8b8b85]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E1]">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FBFBF9] transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-[#121212]">{u.first_name} {u.last_name}</p>
                      <p className="text-[10px] text-[#8b8b85] font-mono">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="rounded-none border border-[#E5E5E1] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider focus:border-[#121212] focus:outline-hidden cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                      u.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-[#8b8b85] font-mono">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id, !u.is_active)}
                      className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold border transition cursor-pointer ${
                        u.is_active
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
