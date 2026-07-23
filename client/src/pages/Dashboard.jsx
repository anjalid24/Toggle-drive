import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formatBytes } from '../utils/format.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.storage().then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <div className="spinner">Loading…</div>;

  const pct = Math.min(100, Math.round((stats.storageUsed / stats.storageQuota) * 100));

  return (
    <div>
      <div className="topbar">
        <h2>Storage usage</h2>
      </div>

      <div className="stats">
        <div className="card stat">
          <div className="value">{formatBytes(stats.storageUsed)}</div>
          <div className="label">Used of {formatBytes(stats.storageQuota)}</div>
          <div className="bar" style={{ marginTop: '0.75rem' }}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="label" style={{ marginTop: '0.4rem' }}>
            {pct}% full · {formatBytes(stats.storageQuota - stats.storageUsed)} free
          </div>
        </div>
        <div className="card stat">
          <div className="value">{stats.fileCount}</div>
          <div className="label">Files</div>
        </div>
        <div className="card stat">
          <div className="value">{stats.folderCount}</div>
          <div className="label">Folders</div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginTop: 0 }}>By file type</h3>
        {stats.byType.length === 0 ? (
          <p className="sub">No files yet.</p>
        ) : (
          stats.byType.map((t) => (
            <div className="type-row" key={t.type}>
              <span style={{ textTransform: 'capitalize' }}>{t.type}</span>
              <span className="label">
                {t.count} file{t.count === 1 ? '' : 's'} · {formatBytes(t.size)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
