import React, { useState, useEffect, useRef } from 'react';
import { 
  HardDrive, 
  Folder, 
  FolderPlus, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  Check, 
  FileText,
  Server
} from 'lucide-react';
import { hdfsAPI } from '../services/api';

export default function HdfsExplorer() {
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewFile, setPreviewFile] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [showNewDirModal, setShowNewDirModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHdfsDir(currentPath);
  }, [currentPath]);

  const loadHdfsDir = async (path) => {
    setLoading(true);
    try {
      const res = await hdfsAPI.ls(path);
      setItems(res.data.items || []);
    } catch (e) {
      alert('Failed to load HDFS directory: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const upPath = '/' + parts.join('/');
    setCurrentPath(upPath || '/');
  };

  const handleCreateDirectory = async (e) => {
    e.preventDefault();
    if (!newDirName.trim()) return;
    const target = `${currentPath}/${newDirName.trim()}`.replace('//', '/');
    try {
      await hdfsAPI.mkdir(target);
      setNewDirName('');
      setShowNewDirModal(false);
      loadHdfsDir(currentPath);
    } catch (err) {
      alert('Error creating directory: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);
    try {
      await hdfsAPI.upload(formData);
      loadHdfsDir(currentPath);
    } catch (err) {
      alert('HDFS Upload Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewContent = async (itemPath) => {
    try {
      const res = await hdfsAPI.cat(itemPath);
      setPreviewFile(itemPath);
      setPreviewContent(res.data.content);
    } catch (err) {
      alert('Failed to read file: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (itemPath) => {
    if (window.confirm(`Delete '${itemPath}' from HDFS?`)) {
      try {
        await hdfsAPI.rm(itemPath);
        loadHdfsDir(currentPath);
      } catch (err) {
        alert('Delete failed: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-main)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden'
    }}>
      {/* HDFS Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8'
          }}>
            <Server size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>
              Hadoop Distributed File System (HDFS)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              hdfs://namenode:9000{currentPath}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentPath !== '/' && (
            <button
              onClick={handleNavigateUp}
              title="Go Up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                fontSize: '12px'
              }}
            >
              <ArrowLeft size={13} />
              <span>Up</span>
            </button>
          )}

          <button
            onClick={() => setShowNewDirModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              fontSize: '12px'
            }}
          >
            <FolderPlus size={13} color="#fbbf24" />
            <span>New HDFS Dir</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '6px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Upload size={13} />
            <span>Put File (Upload)</span>
          </button>

          <button
            onClick={() => loadHdfsDir(currentPath)}
            style={{
              background: 'var(--bg-tertiary)',
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--text-muted)'
            }}
          >
            <RefreshCw size={13} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadFile}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Directory Modal */}
      {showNewDirModal && (
        <form onSubmit={handleCreateDirectory} style={{
          padding: '10px 16px',
          backgroundColor: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            autoFocus
            placeholder="Directory name e.g. input_datasets..."
            value={newDirName}
            onChange={(e) => setNewDirName(e.target.value)}
            style={{ flex: 1, padding: '6px 10px', fontSize: '12px' }}
          />
          <button
            type="submit"
            style={{ background: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowNewDirModal(false)}
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Table Listing */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12.5px',
          fontFamily: 'var(--font-mono)'
        }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', color: 'var(--text-dim)' }}>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Permissions</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Owner</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Group</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Size</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Replication</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Block Size</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Modified</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>Name</th>
              <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr 
                key={idx} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                }}
              >
                <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{item.permissions}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.owner}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{item.group}</td>
                <td style={{ padding: '10px 12px' }}>{item.is_directory ? '-' : `${item.size} B`}</td>
                <td style={{ padding: '10px 12px' }}>{item.replication}</td>
                <td style={{ padding: '10px 12px' }}>{item.block_size}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{item.modified}</td>
                <td style={{ padding: '10px 12px' }}>
                  {item.is_directory ? (
                    <span
                      onClick={() => handleNavigate(item.path)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', cursor: 'pointer', fontWeight: '600' }}
                    >
                      <Folder size={14} />
                      {item.name}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}>
                      <FileText size={14} />
                      {item.name}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {!item.is_directory && (
                      <button
                        onClick={() => handleViewContent(item.path)}
                        title="View File Contents"
                        style={{ background: 'transparent', color: '#38bdf8', padding: '4px' }}
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.path)}
                      title="Delete from HDFS"
                      style={{ background: 'transparent', color: '#ef4444', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* File Preview Modal / Sheet */}
      {previewContent !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '700px',
            maxHeight: '80vh',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: '600'
            }}>
              <span>HDFS Cat: {previewFile}</span>
              <button onClick={() => setPreviewContent(null)} style={{ background: 'transparent', color: '#fff', fontSize: '14px' }}>✕</button>
            </div>
            <pre style={{
              flex: 1,
              padding: '16px',
              overflow: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              color: '#e2e8f0',
              lineHeight: 1.5
            }}>
              {previewContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

