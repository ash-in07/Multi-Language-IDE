import React, { useState, useEffect } from 'react';
import { Bookmark, FileCode, Trash2, Clock, Play } from 'lucide-react';
import { programAPI } from '../services/api';

export default function SavedPrograms({ onOpenProgram }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const res = await programAPI.list();
      setPrograms(res.data.programs || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved program?')) {
      try {
        await programAPI.delete(id);
        loadPrograms();
      } catch (err) {
        alert('Failed to delete program');
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      color: 'var(--text-main)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Bookmark size={15} color="#818cf8" />
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)' }}>
          My Saved Programs
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            Loading programs...
          </div>
        ) : programs.length > 0 ? (
          programs.map((prog) => (
            <div
              key={prog.id}
              onClick={() => onOpenProgram(prog)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '8px',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                transition: 'border-color 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#ffffff' }}>
                  {prog.title}
                </span>
                <button
                  onClick={(e) => handleDelete(e, prog.id)}
                  title="Delete"
                  style={{ background: 'transparent', color: 'var(--text-dim)', padding: '2px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {prog.language}
                </span>
                <span>{prog.updated_at ? new Date(prog.updated_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.5 }}>
            No saved programs yet.<br />Click "Save" in the editor to keep programs across sessions.
          </div>
        )}
      </div>
    </div>
  );
}

