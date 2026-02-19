import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Icon } from '@iconify/react';
import { api } from '../api/client';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const STATUS_LABELS = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };

const getStartOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const getEndOfDay = (dateStr) => {
  const x = new Date(dateStr + 'T23:59:59.999');
  return x.getTime();
};

const isInDueDateRange = (task, dateFrom, dateTo) => {
  const due = task.dueDate ? getStartOfDay(task.dueDate) : null;
  if (!due) return true;
  if (dateFrom && due < getStartOfDay(dateFrom)) return false;
  if (dateTo && due > getEndOfDay(dateTo)) return false;
  return true;
};

export const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      if (res.success) setTasks(res.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchTasks().finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    if (!dateFrom && !dateTo) return tasks;
    return tasks.filter((t) => isInDueDateRange(t, dateFrom, dateTo));
  }, [tasks, dateFrom, dateTo]);

  const now = getStartOfDay(new Date());
  const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;

  const approachingDue = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (t.status === 3) return false;
      const due = t.dueDate ? getStartOfDay(t.dueDate) : null;
      if (!due) return false;
      return due >= now && due <= threeDaysFromNow;
    });
  }, [filteredTasks, now, threeDaysFromNow]);

  const overdue = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (t.status === 3) return false;
      const due = t.dueDate ? getStartOfDay(t.dueDate) : null;
      if (!due) return false;
      return due < now;
    });
  }, [filteredTasks, now]);

  const countByStatus = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0 };
    filteredTasks.forEach((t) => {
      if (t.status in c) c[t.status]++;
    });
    return c;
  }, [filteredTasks]);

  const chartBarData = {
    labels: [STATUS_LABELS[1], STATUS_LABELS[2], STATUS_LABELS[3]],
    datasets: [
      {
        label: 'Jumlah Tiket',
        data: [countByStatus[1], countByStatus[2], countByStatus[3]],
        backgroundColor: ['rgb(107 114 128)', 'rgb(245 158 11)', 'rgb(34 197 94)'],
      },
    ],
  };

  const chartDoughnutData = {
    labels: [STATUS_LABELS[1], STATUS_LABELS[2], STATUS_LABELS[3]],
    datasets: [
      {
        data: [countByStatus[1], countByStatus[2], countByStatus[3]],
        backgroundColor: ['rgb(107 114 128)', 'rgb(245 158 11)', 'rgb(34 197 94)'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const handleClearFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const formatDueDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="mdi:view-dashboard" className="h-6 w-6 text-slate-600" aria-hidden />
              Dashboard
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-slate-600" htmlFor="dashboard-date-from">
                Dari
              </label>
              <Input
                id="dashboard-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40 rounded-lg border-slate-300"
                aria-label="Filter dari tanggal"
              />
              <label className="text-sm font-medium text-slate-600" htmlFor="dashboard-date-to">
                Sampai
              </label>
              <Input
                id="dashboard-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40 rounded-lg border-slate-300"
                aria-label="Filter sampai tanggal"
              />
              <Button variant="outline" size="sm" onClick={handleClearFilter} aria-label="Hapus filter tanggal">
                <Icon icon="mdi:filter-off" className="h-4 w-4" aria-hidden />
                Reset Filter
              </Button>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700 flex items-center gap-2" role="alert">
            <Icon icon="mdi:alert-circle" className="h-5 w-5 shrink-0" aria-hidden />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Icon icon="mdi:loading" className="h-6 w-6 animate-spin" aria-hidden />
            <span>Memuat...</span>
          </div>
        ) : (
          <>
            {/* 3 cards: To Do, In Progress, Done */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-slate-200 bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      <Icon icon="mdi:clipboard-outline" className="h-7 w-7 text-slate-600" aria-hidden />
                    </div>
                    <p className="text-2xl font-bold text-slate-800" aria-live="polite">{countByStatus[1]}</p>
                  </div>
                  <p className="mt-3 text-sm font-medium uppercase tracking-wide text-slate-500">To Do</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200/60 bg-amber-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                      <Icon icon="mdi:clock-outline" className="h-7 w-7 text-amber-700" aria-hidden />
                    </div>
                    <p className="text-2xl font-bold text-amber-800" aria-live="polite">{countByStatus[2]}</p>
                  </div>
                  <p className="mt-3 text-sm font-medium uppercase tracking-wide text-amber-700">In Progress</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200/60 bg-emerald-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                      <Icon icon="mdi:check-circle-outline" className="h-7 w-7 text-emerald-700" aria-hidden />
                    </div>
                    <p className="text-2xl font-bold text-emerald-800" aria-live="polite">{countByStatus[3]}</p>
                  </div>
                  <p className="mt-3 text-sm font-medium uppercase tracking-wide text-emerald-700">Done</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="mdi:chart-bar" className="h-5 w-5 text-slate-600" aria-hidden />
                  Grafik Tiket per Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="h-64">
                    <Bar data={chartBarData} options={chartOptions} />
                  </div>
                  <div className="h-64">
                    <Doughnut data={chartDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two tables: approaching due (warning) | overdue (error) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-amber-200/80 bg-amber-50/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                      <Icon icon="mdi:calendar-alert" className="h-5 w-5 text-amber-700" aria-hidden />
                    </div>
                    Mendekati Due Date (3 hari)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approachingDue.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-500 py-6">
                            Tidak ada data
                          </TableCell>
                        </TableRow>
                      ) : (
                        approachingDue.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.title}</TableCell>
                            <TableCell>
                              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                                {STATUS_LABELS[t.status] ?? t.status}
                              </span>
                            </TableCell>
                            <TableCell>{formatDueDate(t.dueDate)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-red-200/80 bg-red-50/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                      <Icon icon="mdi:alert-circle" className="h-5 w-5 text-red-600" aria-hidden />
                    </div>
                    Melewati Due Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdue.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-500 py-6">
                            Tidak ada data
                          </TableCell>
                        </TableRow>
                      ) : (
                        overdue.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.title}</TableCell>
                            <TableCell>
                              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                                {STATUS_LABELS[t.status] ?? t.status}
                              </span>
                            </TableCell>
                            <TableCell>{formatDueDate(t.dueDate)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
