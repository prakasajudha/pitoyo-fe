import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Icon } from '@iconify/react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';
import { exportTasksExcel } from '../api/client';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 1, label: 'To Do' },
  { value: 2, label: 'In Progress' },
  { value: 3, label: 'Done' },
];

const getDateStr = (d) => d.toISOString().slice(0, 10);

const PRESETS = [
  { label: 'Hari ini', getRange: () => { const t = new Date(); return { dateFrom: getDateStr(t), dateTo: getDateStr(t) }; } },
  { label: '7 hari terakhir', getRange: () => { const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - 6); return { dateFrom: getDateStr(start), dateTo: getDateStr(end) }; } },
  { label: '30 hari terakhir', getRange: () => { const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - 29); return { dateFrom: getDateStr(start), dateTo: getDateStr(end) }; } },
  { label: 'Bulan ini', getRange: () => { const t = new Date(); const first = new Date(t.getFullYear(), t.getMonth(), 1); return { dateFrom: getDateStr(first), dateTo: getDateStr(t) }; } },
  { label: 'Semua tanggal', getRange: () => ({ dateFrom: '', dateTo: '' }) },
];

export const ExportExcelModal = ({ open, onClose }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statuses, setStatuses] = useState([1, 2, 3]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const today = getDateStr(new Date());
      setDateFrom(today);
      setDateTo(today);
      setStatuses([1, 2, 3]);
    }
  }, [open]);

  const handlePreset = (preset) => {
    const { dateFrom: from, dateTo: to } = preset.getRange();
    setDateFrom(from);
    setDateTo(to);
  };

  const handleStatusToggle = (value) => {
    setStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value].sort()
    );
  };

  const handleSelectAllStatus = () => setStatuses([1, 2, 3]);
  const handleClearStatus = () => setStatuses([]);

  const handleExport = async () => {
    if (statuses.length === 0) {
      toast.error('Pilih minimal satu status');
      return;
    }
    setLoading(true);
    try {
      const blob = await exportTasksExcel({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: statuses,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-export-${getDateStr(new Date())}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel berhasil diunduh');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Icon icon="mdi:file-excel" className="h-7 w-7 text-emerald-600" aria-hidden />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-slate-900">
                      Export Excel
                    </Dialog.Title>
                    <p className="text-sm text-slate-500">
                      Filter task berdasarkan tanggal & status
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  aria-label="Tutup"
                >
                  <Icon icon="mdi:close" className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <Label className="mb-2 block">Rentang tanggal (created at)</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handlePreset(p)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Dari</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                        aria-label="Tanggal dari"
                      />
                    </div>
                    <span className="pt-5 text-gray-400">–</span>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Sampai</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                        aria-label="Tanggal sampai"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Status</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllStatus}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Pilih semua
                      </button>
                      <button
                        type="button"
                        onClick={handleClearStatus}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                    {STATUS_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={statuses.includes(opt.value)}
                          onCheckedChange={() => handleStatusToggle(opt.value)}
                          aria-label={opt.label}
                        />
                        <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  variant="success"
                  onClick={handleExport}
                  disabled={loading || statuses.length === 0}
                  className="flex-1"
                >
                  <Icon icon="mdi:file-excel" className="h-5 w-5" aria-hidden />
                  {loading ? 'Mengekspor...' : 'Unduh Excel'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Batal
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
