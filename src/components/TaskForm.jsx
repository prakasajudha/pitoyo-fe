import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export const TaskForm = ({ onSuccess, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [location, setLocation] = useState('');
  const [subLocation, setSubLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/tasks', {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
        location: location || undefined,
        subLocation: subLocation || undefined,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Gagal membuat task');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div
        id="task-form-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">Buat Task</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="task-title">Judul</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-label="Judul task"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Deskripsi</Label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              aria-label="Deskripsi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-due">Due Date</Label>
            <Input
              id="task-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-location">Lokasi</Label>
            <Input
              id="task-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tulis lokasi"
              aria-label="Lokasi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-subloc">Sub Lokasi</Label>
            <Input
              id="task-subloc"
              value={subLocation}
              onChange={(e) => setSubLocation(e.target.value)}
              placeholder="Tulis sub lokasi"
              aria-label="Sub lokasi"
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
