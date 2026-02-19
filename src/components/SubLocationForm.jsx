import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';

export const SubLocationForm = ({ edit, locations, selectedLocationId, onClose }) => {
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState(selectedLocationId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocationId(selectedLocationId || (edit?.locationId ?? ''));
    if (edit) setName(edit.name);
  }, [edit, selectedLocationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!locationId) {
      setError('Lokasi wajib dipilih');
      return;
    }
    setLoading(true);
    try {
      if (edit) {
        await api.put(`/api/sublocations/${edit.id}`, { name, locationId });
      } else {
        await api.post('/api/sublocations', { name, locationId });
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
        <h2 className="text-lg font-semibold">{edit ? 'Edit Sub Lokasi' : 'Tambah Sub Lokasi'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="sub-loc-name">Nama</Label>
            <Input
              id="sub-loc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Nama sub lokasi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-loc-parent">Lokasi</Label>
            <Select
              id="sub-loc-parent"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
              aria-label="Lokasi"
            >
              <option value="">Pilih lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
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
