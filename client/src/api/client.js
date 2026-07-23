const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('td_token');
}

// Thin fetch wrapper that attaches the auth token and unwraps JSON / errors.
async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const opts = { method, headers: { ...headers } };

  if (auth) {
    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    opts.body = body; // Let the browser set the multipart boundary.
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Auth
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  // Files
  listFiles: ({ folder, search } = {}) => {
    const params = new URLSearchParams();
    if (folder) params.set('folder', folder);
    if (search) params.set('search', search);
    return request(`/files?${params.toString()}`);
  },
  uploadFile: (file, folder) => {
    const form = new FormData();
    form.append('file', file);
    if (folder) form.append('folder', folder);
    return request('/files', { method: 'POST', body: form });
  },
  downloadFile: (id) => request(`/files/${id}/download`),
  deleteFile: (id) => request(`/files/${id}`, { method: 'DELETE' }),
  shareFile: (id, expiresInHours) =>
    request(`/files/${id}/share`, { method: 'POST', body: { expiresInHours } }),
  revokeShare: (id) => request(`/files/${id}/share`, { method: 'DELETE' }),
  getShared: (token) => request(`/share/${token}`, { auth: false }),

  // Folders
  listFolders: (parent) => request(`/folders?${parent ? `parent=${parent}` : ''}`),
  createFolder: (name, parent) =>
    request('/folders', { method: 'POST', body: { name, parent } }),
  deleteFolder: (id) => request(`/folders/${id}`, { method: 'DELETE' }),

  // Storage
  storage: () => request('/files/storage'),
};

export { getToken };
