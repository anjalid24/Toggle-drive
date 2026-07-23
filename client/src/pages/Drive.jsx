import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api/client.js';
import Modal from '../components/Modal.jsx';
import { formatBytes, formatDate, fileIcon } from '../utils/format.js';

export default function Drive() {
  // Breadcrumb trail of folders; last entry is the current folder (null = root).
  const [trail, setTrail] = useState([{ id: null, name: 'My Drive' }]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [shareState, setShareState] = useState(null); // { file, token, url }
  const fileInput = useRef();

  const currentFolder = trail[trail.length - 1].id;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const trimmed = search.trim();
      if (trimmed) {
        // Search spans the whole drive; folders are hidden while searching.
        const { files } = await api.listFiles({ search: trimmed });
        setFolders([]);
        setFiles(files);
      } else {
        const [{ folders }, { files }] = await Promise.all([
          api.listFolders(currentFolder),
          api.listFiles({ folder: currentFolder }),
        ]);
        setFolders(folders);
        setFiles(files);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search input.
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function handleUpload(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setError('');
    try {
      for (const file of selected) {
        await api.uploadFile(file, currentFolder);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      await api.createFolder(newFolderName.trim(), currentFolder);
      setNewFolderName('');
      setShowNewFolder(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function download(file) {
    try {
      const { url } = await api.downloadFile(file._id);
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeFile(file) {
    if (!confirm(`Delete "${file.name}"?`)) return;
    try {
      await api.deleteFile(file._id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeFolder(folder) {
    if (!confirm(`Delete folder "${folder.name}" and all its contents?`)) return;
    try {
      await api.deleteFolder(folder._id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function openShare(file) {
    try {
      const { shareToken } = await api.shareFile(file._id);
      const url = `${window.location.origin}/share/${shareToken}`;
      setShareState({ file, url });
    } catch (err) {
      setError(err.message);
    }
  }

  async function revokeShare() {
    try {
      await api.revokeShare(shareState.file._id);
      setShareState(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function openFolder(folder) {
    setSearchInput('');
    setSearch('');
    setTrail((t) => [...t, { id: folder._id, name: folder.name }]);
  }

  function goToCrumb(index) {
    setSearchInput('');
    setSearch('');
    setTrail((t) => t.slice(0, index + 1));
  }

  return (
    <div>
      <div className="topbar">
        <h2>My Drive</h2>
        <input
          className="search"
          placeholder="Search files…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="toolbar">
        <button onClick={() => fileInput.current.click()}>⬆️ Upload</button>
        <button className="secondary" onClick={() => setShowNewFolder(true)}>
          📁 New folder
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={handleUpload}
        />
      </div>

      {!search && (
        <div className="breadcrumb">
          {trail.map((crumb, i) => (
            <span key={i}>
              {i > 0 && ' / '}
              <button onClick={() => goToCrumb(i)}>{crumb.name}</button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="spinner">Loading…</div>
      ) : folders.length === 0 && files.length === 0 ? (
        <div className="empty">
          {search ? 'No files match your search.' : 'This folder is empty. Upload a file to get started.'}
        </div>
      ) : (
        <div className="grid">
          {folders.map((folder) => (
            <div
              key={folder._id}
              className="card item folder"
              onDoubleClick={() => openFolder(folder)}
            >
              <div className="icon">📁</div>
              <div className="name" onClick={() => openFolder(folder)}>
                {folder.name}
              </div>
              <div className="meta">Folder</div>
              <div className="actions">
                <button className="ghost" onClick={() => openFolder(folder)}>
                  Open
                </button>
                <button className="ghost" onClick={() => removeFolder(folder)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {files.map((file) => (
            <div key={file._id} className="card item">
              <div className="icon">{fileIcon(file.mimeType)}</div>
              <div className="name">{file.name}</div>
              <div className="meta">
                {formatBytes(file.size)} · {formatDate(file.createdAt)}
              </div>
              <div className="actions">
                <button className="ghost" onClick={() => download(file)}>
                  ⬇️
                </button>
                <button className="ghost" onClick={() => openShare(file)}>
                  🔗
                </button>
                <button className="ghost" onClick={() => removeFile(file)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewFolder && (
        <Modal title="New folder" onClose={() => setShowNewFolder(false)}>
          <input
            autoFocus
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createFolder()}
          />
          <div className="row">
            <button className="secondary" onClick={() => setShowNewFolder(false)}>
              Cancel
            </button>
            <button onClick={createFolder}>Create</button>
          </div>
        </Modal>
      )}

      {shareState && (
        <Modal title={`Share "${shareState.file.name}"`} onClose={() => setShareState(null)}>
          <p className="sub">Anyone with this link can download the file.</p>
          <div className="share-link">
            <input readOnly value={shareState.url} onFocus={(e) => e.target.select()} />
            <button onClick={() => navigator.clipboard?.writeText(shareState.url)}>
              Copy
            </button>
          </div>
          <div className="row">
            <button className="danger" onClick={revokeShare}>
              Revoke link
            </button>
            <button className="secondary" onClick={() => setShareState(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
