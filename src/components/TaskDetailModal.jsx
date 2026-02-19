import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const STATUS_LABELS = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
const TYPE_LABELS = { 1: 'Incidental', 2: 'Recurring' };

export const TaskDetailModal = ({ task, open, onClose }) => {
  if (!task) return null;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
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
            <Dialog.Panel className="mx-auto w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {task.title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Tutup"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {task.description && (
                    <div>
                      <span className="font-medium text-gray-500">Deskripsi</span>
                      <p className="mt-0.5 text-gray-900">{task.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-500">Tipe</span>
                      <p className="mt-0.5 text-gray-900">{TYPE_LABELS[task.type] ?? 'Incidental'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Lokasi</span>
                      <p className="mt-0.5 text-gray-900">
                        {[task.location, task.subLocation].filter(Boolean).join(' / ') || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Status</span>
                      <p className="mt-0.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            task.status === 3
                              ? 'bg-green-100 text-green-800'
                              : task.status === 2
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[task.status] ?? task.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Start Date</span>
                      <p className="mt-0.5 text-gray-900">{formatDate(task.startDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Due Date</span>
                      <p className="mt-0.5 text-gray-900">{formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                  {task.evidenceUrl && (
                    <div>
                      <span className="font-medium text-gray-500">Bukti</span>
                      <a
                        href={task.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block rounded-lg border border-gray-200 bg-gray-50 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                        aria-label="Lihat bukti dalam ukuran penuh"
                      >
                        <img
                          src={task.evidenceUrl}
                          alt="Bukti task"
                          className="max-h-80 w-full rounded-md object-contain"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
