import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { TaskForm } from '../components/TaskForm';
import { TaskStatusModal } from '../components/TaskStatusModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { ExportExcelModal } from '../components/ExportExcelModal';

const STATUS_LABELS = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
const TYPE_LABELS = { 1: 'Incidental', 2: 'Recurring' };

export const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [statusTask, setStatusTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isVendor = user?.role === 'VENDOR';
  const isAsset = user?.role === 'ASSET';

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      if (res.success) setTasks(res.data || []);
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchTasks().finally(() => setLoading(false));
  }, []);


  const handleDelete = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Hapus task ini?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      toast.success('Task dihapus');
      fetchTasks();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleOpenStatus = (t, e) => {
    e?.stopPropagation?.();
    setStatusTask(t);
  };

  const showCreateButton = isAsset || isSuperAdmin;
  const canUpdateStatus = isVendor || isSuperAdmin;
  const showExportButton = isSuperAdmin || isAsset;

  return (
    <Layout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clipboard-list-outline" className="h-5 w-5 text-slate-600" aria-hidden />
            Daftar Task
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {showExportButton && (
              <Button
                variant="success"
                onClick={() => setShowExportModal(true)}
                aria-label="Export Excel"
              >
                <Icon icon="mdi:file-excel" className="h-5 w-5" aria-hidden />
                Export Excel
              </Button>
            )}
            {showCreateButton && (
              <Button onClick={() => setShowCreate(true)} aria-label="Buat Task">
                <Icon icon="mdi:plus" className="h-5 w-5" aria-hidden />
                Create Task
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700 flex items-center gap-2" role="alert">
              <Icon icon="mdi:alert-circle" className="h-5 w-5 shrink-0" aria-hidden />
              {error}
            </div>
          )}
          {loading ? (
            <p className="py-8 text-center text-gray-500">Memuat...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  {(canUpdateStatus || isSuperAdmin) && <TableHead>Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => setDetailTask(t)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDetailTask(t);
                      }
                    }}
                    role="button"
                    aria-label={`Lihat detail task ${t.title}`}
                  >
                    <TableCell>
                      <div className="font-medium">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {t.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${t.type === 2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                        {TYPE_LABELS[t.type] ?? 'Incidental'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {[t.location, t.subLocation].filter(Boolean).join(' / ') || '-'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === 3
                            ? 'bg-green-100 text-green-800'
                            : t.status === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    {(canUpdateStatus || isSuperAdmin) && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {t.status !== 3 && canUpdateStatus && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(ev) => handleOpenStatus(t, ev)}
                            aria-label="Update status"
                          >
                            <Icon icon="mdi:pencil" className="h-4 w-4" aria-hidden />
                            Update Status
                          </Button>
                        )}
                        {t.status !== 3 && isSuperAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(ev) => handleDelete(t.id, ev)}
                            aria-label="Hapus task"
                            className="ml-2"
                          >
                            <Icon icon="mdi:delete-outline" className="h-4 w-4" aria-hidden />
                            Hapus
                          </Button>
                        )}
                        {t.status === 3 && <span className="text-gray-400 text-sm">—</span>}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {tasks.length === 0 && !loading && (
            <p className="py-8 text-center text-gray-500">Belum ada task.</p>
          )}
        </CardContent>
      </Card>
      {showCreate && (
        <TaskForm
          onSuccess={() => {
            fetchTasks();
            toast.success('Task berhasil dibuat');
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
      {statusTask && (
        <TaskStatusModal
          task={statusTask}
          onClose={() => setStatusTask(null)}
          onSuccess={() => {
            fetchTasks();
            setStatusTask(null);
            toast.success('Status berhasil diupdate');
          }}
        />
      )}
      <TaskDetailModal
        task={detailTask}
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
      />
      <ExportExcelModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </Layout>
  );
};
