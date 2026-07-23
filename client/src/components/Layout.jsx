import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { formatBytes } from '../utils/format.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    api.storage().then(setStorage).catch(() => {});
  }, []);

  const pct = storage
    ? Math.min(100, Math.round((storage.storageUsed / storage.storageQuota) * 100))
    : 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">📁 Toggle Drive</div>
        <NavLink to="/" end className="nav-link">
          🗂️ My Drive
        </NavLink>
        <NavLink to="/dashboard" className="nav-link">
          📊 Storage
        </NavLink>

        <div className="spacer" />

        {storage && (
          <div className="storage-mini">
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            {formatBytes(storage.storageUsed)} of {formatBytes(storage.storageQuota)} used
          </div>
        )}

        <div className="storage-mini">Signed in as {user?.name}</div>
        <button
          className="secondary"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Log out
        </button>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
