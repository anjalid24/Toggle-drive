import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { formatBytes, fileIcon } from '../utils/format.js';

// Public page for a shared file link. No authentication required.
export default function SharedFile() {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getShared(token)
      .then(setFile)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="auth-wrap">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <div className="brand" style={{ justifyContent: 'center' }}>
          📁 Toggle Drive
        </div>

        {error ? (
          <p className="error">{error}</p>
        ) : !file ? (
          <p className="sub">Loading…</p>
        ) : (
          <>
            <div style={{ fontSize: '3rem', margin: '1rem 0' }}>
              {fileIcon(file.mimeType)}
            </div>
            <h1 style={{ fontSize: '1.2rem', wordBreak: 'break-word' }}>{file.name}</h1>
            <p className="sub">{formatBytes(file.size)}</p>
            <a href={file.url}>
              <button style={{ width: '100%' }}>⬇️ Download</button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
