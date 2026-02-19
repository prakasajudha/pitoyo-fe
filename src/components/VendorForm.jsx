import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export const VendorForm = ({ edit, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (edit) setName(edit.name);
  }, [edit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (edit) {
        await api.put(`/api/vendors/${edit.id}`, { name });
      } else {
        await api.post('/api/vendors', { name });
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
        <h2 className="text-lg font-semibold">{edit ? 'Edit Vendor' : 'Tambah Vendor'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Nama</Label>
            <Input
              id="vendor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Nama vendor"
            />
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
