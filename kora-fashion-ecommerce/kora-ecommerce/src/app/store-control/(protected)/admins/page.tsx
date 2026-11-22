'use client';

import { useEffect, useState } from 'react';
import type { AdminRole, AdminUser } from '@/types/database';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('manager');
  const [notice, setNotice] = useState('');

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmail('');
      setFullName('');
      setPassword('');
      setNotice('Administrator created.');
      loadUsers();
    } else {
      setNotice(data.error || 'Error creating admin');
    }
  };

  const toggleActive = async (u: AdminUser) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, is_active: !u.is_active, role: u.role }),
    });
    loadUsers();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-editorial text-taupe">Access Control</p>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">Admin Users</h1>
      </div>

      {notice && <div className="p-3 bg-stone border border-hairline text-xs">{notice}</div>}

      <form onSubmit={handleCreate} className="bg-alabaster border border-hairline p-6 space-y-4 text-xs">
        <h2 className="uppercase tracking-editorial font-medium">Add Administrator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="border border-hairline px-3 py-2.5"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="border border-hairline px-3 py-2.5"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary Password (min 8 chars)"
            className="border border-hairline px-3 py-2.5"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="border border-hairline px-3 py-2.5 bg-alabaster"
          >
            <option value="manager">Manager</option>
            <option value="editor">Editor</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <button type="submit" className="px-6 py-2.5 bg-charcoal text-alabaster uppercase tracking-editorial">
          Create Admin Account
        </button>
      </form>

      <div className="bg-alabaster border border-hairline divide-y divide-hairline text-xs">
        {users.map((u) => (
          <div key={u.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{u.full_name}</p>
              <p className="text-taupe">{u.email} · {u.role}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(u)}
              className={`px-3 py-1.5 border uppercase tracking-wider text-[10px] ${
                u.is_active ? 'border-emerald-600 text-emerald-700' : 'border-crimson text-crimson'
              }`}
            >
              {u.is_active ? 'Active' : 'Suspended'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
