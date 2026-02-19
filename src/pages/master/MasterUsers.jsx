import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../../api/client';
import { toast } from 'sonner';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { UserForm } from '../../components/UserForm';

export const MasterUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      if (res.success) setUsers(res.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditing(null);
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Hapus user ini?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('User dihapus');
      fetchUsers();
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    }
  };

  return (
    <Layout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:account-group-outline" className="h-5 w-5 text-slate-600" aria-hidden />
            Master Data - Users
          </CardTitle>
          <Button onClick={() => { setEditing(null); setOpenForm(true); }} aria-label="Tambah user">
            <Icon icon="mdi:plus" className="h-5 w-5" aria-hidden />
            Tambah
          </Button>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(u); setOpenForm(true); }} aria-label="Edit user">
                        <Icon icon="mdi:pencil" className="h-4 w-4" aria-hidden />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)} className="ml-2" aria-label="Hapus user">
                        <Icon icon="mdi:delete-outline" className="h-4 w-4" aria-hidden />
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {users.length === 0 && !loading && (
            <p className="py-6 text-center text-gray-500">Belum ada user.</p>
          )}
        </CardContent>
      </Card>
      {openForm && (
        <UserForm edit={editing} onClose={handleCloseForm} />
      )}
    </Layout>
  );
};
