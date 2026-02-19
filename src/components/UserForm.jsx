import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'ASSET', label: 'Asset' },
];

export const UserForm = ({ edit, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('ASSET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (edit) {
      setEmail(edit.email);
      setName(edit.name);
      setRole(edit.role);
    }
  }, [edit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { email, name, role };
      if (password.trim()) payload.password = password;
      if (edit) {
        await api.put(`/api/users/${edit.id}`, payload);
      } else {
        if (!password.trim()) {
          setError('Password wajib untuk user baru');
          setLoading(false);
          return;
        }
        await api.post('/api/auth/register', { ...payload, password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{edit ? 'Edit User' : 'Tambah User'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!edit}
              aria-label="Email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">Password {edit && '(kosongkan jika tidak diubah)'}</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!edit}
              aria-label="Password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-name">Nama</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Nama"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-label="Role"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
