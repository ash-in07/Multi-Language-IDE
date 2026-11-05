import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  FileSpreadsheet, 
  Plus, 
  FolderPlus, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Download, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import { fileAPI } from '../services/api';

export default function FileExplorer({ 
  files, 
  onOpenFile, 
  onRefresh, 
  activeFile 
}) {
  const [openFolders, setOpenFolders] = useState({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const fileInputRef = useRef(null);

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      return;
    }

    try {
      if (isCreatingFile) {
        await fileAPI.create(newItemName.trim(), false, '');
      } else if (isCreatingFolder) {
        await fileAPI.create(newItemName.trim(), true, '');
      }
      setNewItemName('');
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      onRefresh();
    } catch (err) {
      alert('Error creating item: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (e, path) => {
    e.stopPropagation();
    if (window.confirm(`Delete '${path}' from workspace?`)) {
      try {
        await fileAPI.delete(path);
        onRefresh();
      } catch (err) {
        alert('Failed to delete file: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleRename = async (e, oldPath) => {
    e.stopPropagation();
    const newName = window.prompt('Rename to:', oldPath);
    if (newName && newName !== oldPath) {
      try {
        await fileAPI.rename(oldPath, newName);
        onRefresh();
      } catch (err) {
        alert('Failed to rename: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await fileAPI.upload(formData);
      onRefresh();
    } catch (err) {
      alert('Failed to upload file: ' + (err.response?.data?.error || err.message));
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pig', 'java', 'py', 'c', 'cpp', 'js', 'html', 'sql', 'r', 'go'].includes(ext)) {
      return <FileCode size={15} color="#818cf8" />;
    }
    if (['csv', 'tsv', 'xlsx'].includes(ext)) {
      return <FileSpreadsheet size={15} color="#34d399" />;
    }
    return <FileText size={15} color="var(--text-muted)" />;
  };

  const renderTree = (items, depth = 0) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const isOpen = !!openFolders[item.path];
        return (
          <div key={item.id}>
            <div
              onClick={() => toggleFolder(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                paddingLeft: `${depth * 14 + 8}px`,
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '13px',
                color: 'var(--text-main)',
                userSelect: 'none'
              }}
              className="tree-row"
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isOpen ? <FolderOpen size={16} color="#fbbf24" /> : <Folder size={16} color="#fbbf24" />}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </div>
            {isOpen && item.children && renderTree(item.children, depth + 1)}
          </div>
        );
      }

      const isActive = activeFile === item.path;
      return (
        <div
          key={item.id}
          onClick={() => onOpenFile(item.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            paddingLeft: `${depth * 14 + 16}px`,
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '13px',
            backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
            color: isActive ? '#ffffff' : 'var(--text-muted)',
            fontWeight: isActive ? '600' : '400',
            userSelect: 'none',
            borderLeft: isActive ? '2px solid #818cf8' : '2px solid transparent'
          }}
          className="tree-row"
        >
          {getFileIcon(item.name)}
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>

          {/* Quick Actions on Hover / Active */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={(e) => handleRename(e, item.path)}
              title="Rename"
              style={{ background: 'transparent', padding: '2px', color: 'var(--text-dim)' }}
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={(e) => handleDelete(e, item.path)}
              title="Delete"
              style={{ background: 'transparent', padding: '2px', color: 'var(--text-dim)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)' }}>
          Workspace Explorer
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => { setIsCreatingFile(true); setIsCreatingFolder(false); }}
            title="New File"
            style={{ background: 'transparent', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => { setIsCreatingFolder(true); setIsCreatingFile(false); }}
            title="New Folder"
            style={{ background: 'transparent', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }}
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload File"
            style={{ background: 'transparent', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }}
          >
            <Upload size={14} />
          </button>
          <button
            onClick={onRefresh}
            title="Refresh Files"
            style={{ background: 'transparent', padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }}
          >
            <RefreshCw size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Inline Create Input */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleCreateSubmit} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)' }}>
          <input
            type="text"
            autoFocus
            placeholder={isCreatingFile ? 'filename.pig, main.py...' : 'folder name...'}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onBlur={() => { if (!newItemName) { setIsCreatingFile(false); setIsCreatingFolder(false); } }}
            style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
          />
        </form>
      )}

      {/* File Tree List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {files && files.length > 0 ? (
          renderTree(files)
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            No files in workspace.<br />Click + to create one.
          </div>
        )}
      </div>

      {/* Workspace Note Footer */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '11px',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ color: '#38bdf8' }}>●</span> Shared with Linux Terminal
      </div>
    </div>
  );
}

