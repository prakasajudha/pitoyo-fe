const BASE = import.meta.env.VITE_API_BASE_URL || '';

const getToken = () => localStorage.getItem('token');

export const api = {
  async request(path, options = {}) {
    const url = `${BASE}${path}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || res.statusText || 'Request failed');
    return body;
  },
  get(path) {
    return this.request(path, { method: 'GET' });
  },
  post(path, data) {
    return this.request(path, { method: 'POST', body: JSON.stringify(data) });
  },
  put(path, data) {
    return this.request(path, { method: 'PUT', body: JSON.stringify(data) });
  },
  patch(path, data) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete(path) {
    return this.request(path, { method: 'DELETE' });
  },
};

export const uploadEvidence = async (taskId, file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('evidence', file);
  const res = await fetch(`${BASE}/api/evidence/${taskId}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Upload failed');
  return body;
};

export const exportTasksExcel = async (filters) => {
  const token = getToken();
  const res = await fetch(`${BASE}/api/tasks/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(filters),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Export gagal');
  }
  return res.blob();
};
