import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.success && res.data) {
        login(res.data);
        navigate('/', { replace: true });
      } else {
        setError(res.message || 'Login gagal');
      }
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden shadow-lg">
          <div className="bg-slate-800 px-6 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-md">
              <Icon icon="mdi:ticket-confirmation-outline" className="h-9 w-9 text-white" aria-hidden />
            </div>
            <CardTitle className="mt-4 text-xl text-white">Ticketing System</CardTitle>
            <p className="mt-1 text-sm text-slate-300">Masuk ke dashboard</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700" role="alert">
                  <Icon icon="mdi:alert-circle" className="h-5 w-5 shrink-0" aria-hidden />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  autoComplete="email"
                  className="rounded-lg border-slate-300 focus:ring-emerald-500"
                  aria-label="Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-lg border-slate-300 focus:ring-emerald-500"
                  aria-label="Password"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-800 hover:bg-slate-700">
                {loading ? (
                  <>
                    <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" aria-hidden />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:login" className="h-5 w-5" aria-hidden />
                    Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
