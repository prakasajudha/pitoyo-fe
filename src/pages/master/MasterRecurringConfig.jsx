import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../../api/client';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { RecurringConfigForm } from '../../components/RecurringConfigForm';

const DAY_LABELS = { '1': 'Senin', '2': 'Selasa', '3': 'Rabu', '4': 'Kamis', '5': 'Jumat', '6': 'Sabtu', '7': 'Minggu' };

const formatDays = (daysStr) => {
  if (!daysStr) return '-';
  return daysStr
    .split(',')
    .map((d) => DAY_LABELS[d.trim()] || d)
    .join(', ');
};

export const MasterRecurringConfig = () => {
  const { user } = useAuth();
  const isAssetOnly = user?.role === 'ASSET';
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/api/task-configs');
      if (res.success) setConfigs(res.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchConfigs().finally(() => setLoading(false));
  }, []);

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditing(null);
    fetchConfigs();
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm('Hapus konfigurasi ini?')) return;
    try {
      await api.delete(`/api/task-configs/${id}`);
      toast.success('Konfigurasi dihapus');
      fetchConfigs();
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    }
  };

  const handleToggleActive = async (config) => {
    try {
      await api.patch(`/api/task-configs/${config.id}/status`, { isActive: !config.isActive });
      toast.success(config.isActive ? 'Konfigurasi dinonaktifkan' : 'Konfigurasi diaktifkan');
      fetchConfigs();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRunToday = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/api/recurring-tasks/run-today');
      if (res.success) {
        toast.success(`${res.data?.count ?? 0} task berhasil digenerate untuk hari ini`);
        fetchConfigs();
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:calendar-refresh-outline" className="h-5 w-5 text-slate-600" aria-hidden />
            Master Data - Recurring Task
          </CardTitle>
          {!isAssetOnly && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRunToday}
                disabled={generating}
                aria-label="Generate task hari ini"
              >
                <Icon icon="mdi:calendar-today" className="h-5 w-5" aria-hidden />
                {generating ? 'Memproses...' : 'Generate Hari Ini'}
              </Button>
              <Button onClick={() => { setEditing(null); setOpenForm(true); }} aria-label="Tambah konfigurasi">
                <Icon icon="mdi:plus" className="h-5 w-5" aria-hidden />
                Tambah
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <p className="py-8 text-center text-gray-500">Memuat...</p>
          ) : (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Hari</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{formatDays(c.days)}</TableCell>
                    <TableCell>{c.timeOfDay || '-'}</TableCell>
                    <TableCell>{[c.location, c.subLocation].filter(Boolean).join(' / ') || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {c.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!isAssetOnly && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleActive(c)} aria-label={c.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                            <Icon icon={c.isActive ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} className="h-4 w-4" aria-hidden />
                            {c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setOpenForm(true); }} aria-label="Edit konfigurasi">
                            <Icon icon="mdi:pencil" className="h-4 w-4" aria-hidden />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfig(c.id)} className="ml-2" aria-label="Hapus konfigurasi">
                            <Icon icon="mdi:delete-outline" className="h-4 w-4" aria-hidden />
                            Hapus
                          </Button>
                        </>
                      )}
                      {isAssetOnly && <span className="text-gray-400 text-sm">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {configs.length === 0 && !loading && (
            <p className="py-6 text-center text-gray-500">Belum ada konfigurasi recurring.</p>
          )}
        </CardContent>
      </Card>
      {openForm && !isAssetOnly && (
        <RecurringConfigForm
          edit={editing}
          onClose={handleCloseForm}
          onSuccess={() => toast.success(editing ? 'Konfigurasi diupdate' : 'Konfigurasi ditambah')}
        />
      )}
    </Layout>
  );
};
