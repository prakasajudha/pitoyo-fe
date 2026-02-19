import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';

const DAYS_OPTIONS = [
  { value: '1', label: 'Senin' },
  { value: '2', label: 'Selasa' },
  { value: '3', label: 'Rabu' },
  { value: '4', label: 'Kamis' },
  { value: '5', label: 'Jumat' },
  { value: '6', label: 'Sabtu' },
  { value: '7', label: 'Minggu' },
];

export const RecurringConfigForm = ({ edit, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [subLocation, setSubLocation] = useState('');
  const [days, setDays] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (edit) {
      setTitle(edit.title || '');
      setDescription(edit.description || '');
      setLocation(edit.location || '');
      setSubLocation(edit.subLocation || '');
      setDays((edit.days || '').split(',').map((d) => d.trim()).filter(Boolean));
      setTimeOfDay(edit.timeOfDay || '09:00');
      setIsActive(edit.isActive !== false);
    }
  }, [edit]);

  const handleDayToggle = (value) => {
    setDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Judul wajib');
      return;
    }
    if (days.length === 0) {
      setError('Pilih minimal satu hari');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        subLocation: subLocation.trim() || undefined,
        days: days.join(','),
        timeOfDay: timeOfDay || undefined,
        isActive,
      };
      if (edit) {
        await api.put(`/api/task-configs/${edit.id}`, payload);
      } else {
        await api.post('/api/task-configs', payload);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {edit ? 'Edit Konfigurasi Recurring' : 'Tambah Konfigurasi Recurring'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="rc-title">Judul</Label>
            <Input
              id="rc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Judul task"
              aria-label="Judul"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rc-desc">Deskripsi</Label>
            <textarea
              id="rc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              placeholder="Deskripsi (opsional)"
              aria-label="Deskripsi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rc-location">Lokasi</Label>
            <Input
              id="rc-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lokasi (opsional)"
              aria-label="Lokasi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rc-subloc">Sub Lokasi</Label>
            <Input
              id="rc-subloc"
              value={subLocation}
              onChange={(e) => setSubLocation(e.target.value)}
              placeholder="Sub lokasi (opsional)"
              aria-label="Sub lokasi"
            />
          </div>
          <div className="space-y-2">
            <Label>Hari berulang</Label>
            <div className="flex flex-wrap gap-3">
              {DAYS_OPTIONS.map((d) => (
                <label key={d.value} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={days.includes(d.value)}
                    onCheckedChange={() => handleDayToggle(d.value)}
                    aria-label={d.label}
                  />
                  <span className="text-sm">{d.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rc-time">Jam due (hari itu)</Label>
            <Input
              id="rc-time"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              aria-label="Jam"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="rc-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Aktif"
            />
            <Label htmlFor="rc-active" className="cursor-pointer">Aktif (task akan digenerate di hari yang dipilih)</Label>
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
