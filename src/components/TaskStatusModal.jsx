import { useState, useEffect } from 'react';
import { api, uploadEvidence } from '../api/client';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Label } from './ui/Label';

const STATUS_OPTIONS = [
  { value: 1, label: 'To Do' },
  { value: 2, label: 'In Progress' },
  { value: 3, label: 'Done' },
];

export const TaskStatusModal = ({ task, onClose, onSuccess }) => {
  const [status, setStatus] = useState(task?.status ?? 1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (Number(status) === 3 && !task.evidenceUrl && !file) {
      setError('Upload bukti gambar wajib untuk status Done');
      return;
    }
    setLoading(true);
    try {
      if (file && Number(status) === 3) {
        await uploadEvidence(task.id, file);
      }
      await api.patch(`/api/tasks/${task.id}/status`, { status: Number(status) });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal update status');
    } finally {
      setLoading(false);
    }
  };

  const needEvidence = Number(status) === 3 && !task?.evidenceUrl;

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
      aria-labelledby="status-modal-title"
    >
      <div
        id="status-modal-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Update Status Task</h2>
        <p className="mt-1 text-sm text-gray-500">{task?.title}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="status-select">Status</Label>
            <Select
              id="status-select"
              value={String(status)}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          {task?.evidenceUrl && (
            <div className="text-sm text-gray-600">
              Bukti: <a href={task.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a>
            </div>
          )}
          {needEvidence && (
            <div className="space-y-2">
              <Label htmlFor="evidence-file">Upload bukti (gambar) *</Label>
              <input
                id="evidence-file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
                aria-label="Pilih file bukti"
              />
            </div>
          )}
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
